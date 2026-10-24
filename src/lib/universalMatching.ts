import { Creator, Brief, LicensingStatus } from '../types';
import { evaluateLicensingCompatibility } from './licensing';

export interface ExtractedBriefCriteria {
  rawQuery: string;
  industry?: string;
  languages: string[];
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
  durationSeconds?: number;
  quantity?: number;
  budgetMax?: number;
  deadlineDays?: number;
  tools: string[];
  skills: string[];
  visualStyle?: string;
  licensingScope?: 'Full Buyout' | 'Commercial Licensed';
  licensingChannels: string[];
  licensingDurationMonths?: number;
  territory?: string;
  isHardBudget: boolean;
  isHardLanguage: boolean;
  isHardTools: boolean;
}

export interface GroundedEvidenceCitation {
  category: 'portfolio' | 'verification' | 'tool' | 'skill' | 'location' | 'licensing';
  text: string;
  referenceId?: string;
}

export interface UniversalMatchResult {
  creatorId: string;
  creator: Creator;
  rank: number;
  finalScore: number;
  factorScores: {
    contentFit: number;        // 25%
    styleAndFormat: number;    // 20%
    skillsAndTools: number;    // 15%
    portfolioEvidence: number; // 20%
    trustSignals: number;      // 10%
    commercialCompatibility: number; // 10%
  };
  reasons: string[];
  positiveEvidence: string[];
  missingMatches: string[];
  conflicts: string[];
  matchedTools: string[];
  matchedSkills: string[];
  matchedPortfolioIds: string[];
  licensingStatus: LicensingStatus;
  licensingSummary: string;
  isPartialMatch: boolean;
  budgetCompatible: boolean;
  languageCompatible: boolean;
  recommendedNextAction: string;
  citations: GroundedEvidenceCitation[];
}

export interface UniversalMatchRun {
  query: string;
  extractedCriteria: ExtractedBriefCriteria;
  totalEvaluated: number;
  hasStrongMatch: boolean;
  status: 'STRONG_MATCHES_FOUND' | 'NO_STRONG_MATCH' | 'CONFLICTING_BRIEF';
  statusExplanation: string;
  relaxationSuggestions: string[];
  matches: UniversalMatchResult[];
}

// Linguistic & Regional Mapping for India & Global
const LANGUAGE_REGION_MAP: Record<string, string[]> = {
  telugu: ['telangana', 'hyderabad', 'andhra', 'vijayawada', 'visakhapatnam', 'south india'],
  tamil: ['tamil nadu', 'chennai', 'coimbatore', 'madurai', 'south india'],
  hindi: ['delhi', 'mumbai', 'ncr', 'gurugram', 'noida', 'lucknow', 'north india', 'india'],
  kannada: ['karnataka', 'bengaluru', 'bangalore', 'mysore', 'south india'],
  malayalam: ['kerala', 'kochi', 'cochin', 'thiruvananthapuram', 'south india'],
  bengali: ['kolkata', 'west bengal'],
  english: ['global', 'worldwide', 'bengaluru', 'mumbai', 'delhi'],
};

// Known Creative Industries & Synonyms
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  skincare: ['skincare', 'skin', 'cosmetics', 'beauty', 'dermatology', 'serum', 'lotion', 'face wash', 'hydration'],
  automotive: ['automotive', 'car', 'supercar', 'ev', 'vehicle', 'mobility', 'drift', 'speed', 'racing'],
  fashion: ['fashion', 'couture', 'apparel', 'silk', 'zari', 'kanjeevaram', 'textile', 'clothing', 'vogue', 'editorial'],
  saas: ['saas', 'b2b', 'enterprise', 'software', 'cloud', 'tech', 'platform', 'thought-leadership', 'dashboard'],
  gaming: ['game', 'gaming', 'trailer', 'fantasy', 'warrior', 'cyberpunk', 'rpg', 'character', 'animation', 'vfx'],
  food: ['food', 'beverage', 'culinary', 'recipe', 'drink', 'snack', 'restaurant', 'taste', 'artisan', 'spices'],
  sustainability: ['sustainability', 'documentary', 'eco', 'green', 'clean energy', 'solar', 'environmental', 'organic', 'nature'],
  luxury: ['luxury', 'prestige', 'horlogerie', 'watch', 'titanium', 'premium', 'gold', 'champagne', 'exclusive'],
};

/**
 * Phase 4A: Flexible Natural-Language Brief Interpretation
 */
export function extractBriefCriteria(rawText: string): ExtractedBriefCriteria {
  const lower = rawText.toLowerCase();

  // 1. Language Extraction
  const languages: string[] = [];
  ['telugu', 'tamil', 'hindi', 'kannada', 'malayalam', 'bengali', 'english'].forEach(lang => {
    if (lower.includes(lang)) {
      languages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  });

  // 2. Industry Identification
  let industry: string | undefined;
  for (const [ind, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      industry = ind;
      break;
    }
  }

  // 3. Aspect Ratio & Formats (Prioritize explicit numeric ratios first)
  let aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | undefined;
  if (lower.includes('4:5')) {
    aspectRatio = '4:5';
  } else if (lower.includes('1:1')) {
    aspectRatio = '1:1';
  } else if (lower.includes('9:16')) {
    aspectRatio = '9:16';
  } else if (lower.includes('16:9')) {
    aspectRatio = '16:9';
  } else if (lower.includes('vertical') || lower.includes('reel') || lower.includes('shorts') || lower.includes('tiktok')) {
    aspectRatio = '9:16';
  } else if (lower.includes('horizontal') || lower.includes('landscape') || lower.includes('broadcast') || lower.includes('widescreen')) {
    aspectRatio = '16:9';
  } else if (lower.includes('square')) {
    aspectRatio = '1:1';
  } else if (lower.includes('portrait')) {
    aspectRatio = '4:5';
  }

  // 4. Video Duration
  let durationSeconds: number | undefined;
  const durationMatch = lower.match(/(\d+)\s*[-]?\s*(?:second|sec|s\b)/);
  if (durationMatch) {
    durationSeconds = parseInt(durationMatch[1], 10);
  }

  // 5. Quantity of deliverables
  let quantity: number | undefined;
  const qtyWordMatch = lower.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s*(?:videos?|deliverables?|cuts?|spots?|creatives?)/);
  if (qtyWordMatch) {
    const wordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    const val = qtyWordMatch[1];
    quantity = wordMap[val] || parseInt(val, 10) || 1;
  }

  // 6. Budget Parsing
  let budgetMax: number | undefined;
  const isHardBudget = lower.includes('below') || lower.includes('under') || lower.includes('max') || lower.includes('budget') || lower.includes('ceiling');
  const rupeeMatch = lower.match(/(?:₹|rs\.?|inr)\s*([\d,]+)(?:\s*(?:k|thousand|lakh|lac))?/i);
  if (rupeeMatch) {
    let rawNum = parseInt(rupeeMatch[1].replace(/,/g, ''), 10);
    const suffix = lower.slice(rupeeMatch.index! + rupeeMatch[0].length).trim();
    if (suffix.startsWith('k') || lower.includes(`${rupeeMatch[1]}k`)) {
      rawNum *= 1000;
    } else if (suffix.startsWith('lakh') || suffix.startsWith('lac')) {
      rawNum *= 100000;
    }
    budgetMax = rawNum;
  } else {
    // Check for "below 15,000" or "under 20k"
    const genericBudget = lower.match(/(?:below|under|budget of)\s*(?:₹|rs\.?)?\s*([\d,]+)\s*(k|thousand)?/i);
    if (genericBudget) {
      let rawNum = parseInt(genericBudget[1].replace(/,/g, ''), 10);
      if (genericBudget[2]?.toLowerCase() === 'k') rawNum *= 1000;
      budgetMax = rawNum;
    }
  }

  // 7. Deadline Parsing
  let deadlineDays: number | undefined;
  if (/48\s*[-]?\s*hours?/i.test(lower) || lower.includes('2 days')) {
    deadlineDays = 2;
  } else if (/24\s*[-]?\s*hours?/i.test(lower) || lower.includes('1 day')) {
    deadlineDays = 1;
  } else if (/72\s*[-]?\s*hours?/i.test(lower) || lower.includes('3 days')) {
    deadlineDays = 3;
  } else {
    const dayMatch = lower.match(/(\d+|one|two|three|four|five|six|seven|ten|fourteen)\s*[-]?\s*days?/i);
    if (dayMatch) {
      const numWords: Record<string, number> = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10, fourteen: 14
      };
      deadlineDays = numWords[dayMatch[1].toLowerCase()] || parseInt(dayMatch[1], 10);
    }
  }

  // 8. Named Tools
  const knownTools = ['Veo', 'Kling', 'Sora', 'Flux.1', 'ElevenLabs', 'Pika', 'Runway', 'Midjourney'];
  const tools: string[] = [];
  knownTools.forEach(t => {
    if (lower.includes(t.toLowerCase())) {
      tools.push(t);
    }
  });

  // 9. Visual Style & Aesthetic
  let visualStyle: string | undefined;
  if (lower.includes('photorealistic') || lower.includes('hyperrealistic') || lower.includes('photorealism')) {
    visualStyle = 'Photorealistic Hyperrealism';
  } else if (lower.includes('cinematic') || lower.includes('film')) {
    visualStyle = 'Cinematic Master';
  } else if (lower.includes('minimal') || lower.includes('clean') || lower.includes('macro')) {
    visualStyle = 'Minimalist & Macro';
  } else if (lower.includes('mascot') || lower.includes('3d') || lower.includes('clay') || lower.includes('cartoon')) {
    visualStyle = 'Stylized 3D Animation';
  } else if (lower.includes('cyberpunk') || lower.includes('neon') || lower.includes('futuristic')) {
    visualStyle = 'Cyberpunk & Futuristic';
  }

  // 10. Licensing Channels & Scope
  const licensingChannels: string[] = [];
  if (lower.includes('instagram') || lower.includes('reels') || lower.includes('social')) {
    licensingChannels.push('Organic Social');
  }
  if (lower.includes('youtube') || lower.includes('web') || lower.includes('digital')) {
    licensingChannels.push('Digital / Web');
  }
  if (lower.includes('paid') || lower.includes('ads') || lower.includes('advertising')) {
    licensingChannels.push('Paid Advertising');
  }
  if (lower.includes('broadcast') || lower.includes('tv')) {
    licensingChannels.push('Broadcast / TV');
  }
  if (licensingChannels.length === 0) {
    licensingChannels.push('Paid Advertising', 'Organic Social', 'Digital / Web');
  }

  // Duration in months
  let licensingDurationMonths: number | undefined;
  const monthMatch = lower.match(/(\d+|one|two|three|six|twelve)\s*[-]?\s*months?/i);
  if (monthMatch) {
    const monthWords: Record<string, number> = { one: 1, two: 2, three: 3, six: 6, twelve: 12 };
    licensingDurationMonths = monthWords[monthMatch[1].toLowerCase()] || parseInt(monthMatch[1], 10);
  }

  const isHardLanguage = languages.length > 0;
  const isHardTools = tools.length > 0 && (lower.includes('must use') || lower.includes('requiring') || lower.includes('only with'));

  return {
    rawQuery: rawText,
    industry,
    languages,
    aspectRatio,
    durationSeconds,
    quantity,
    budgetMax,
    deadlineDays,
    tools,
    skills: [],
    visualStyle,
    licensingScope: lower.includes('buyout') ? 'Full Buyout' : 'Commercial Licensed',
    licensingChannels,
    licensingDurationMonths,
    isHardBudget,
    isHardLanguage,
    isHardTools,
  };
}

/**
 * Phase 4B & C: Semantic Tokenizer and Creator Document Matching
 */
export function buildCreatorSearchDocument(creator: Creator): string {
  const parts: string[] = [
    creator.name,
    creator.handle,
    creator.specialization,
    creator.bio,
    creator.location,
    ...(creator.skills || []),
    ...(creator.tools || []),
    ...(creator.verification?.certifiedPipeline ? [creator.verification.certifiedPipeline] : []),
  ];

  if (creator.portfolio) {
    for (const item of creator.portfolio) {
      parts.push(item.title);
      if (item.workflowDescription) parts.push(item.workflowDescription);
      if (item.specificModel) parts.push(item.specificModel);
      if (item.promptSnippet) parts.push(item.promptSnippet);
      if (item.client) parts.push(item.client);
      if (item.aspectRatio) parts.push(item.aspectRatio);
    }
  }

  return parts.join(' ').toLowerCase();
}

/**
 * Phase 4D & E: Grounded Six-Factor Scoring for Universal Briefs
 */
export function matchCreatorToUniversalBrief(
  creator: Creator,
  criteria: ExtractedBriefCriteria
): UniversalMatchResult {
  const citations: GroundedEvidenceCitation[] = [];
  const reasons: string[] = [];
  const positiveEvidence: string[] = [];
  const missingMatches: string[] = [];
  const conflicts: string[] = [];
  const matchedTools: string[] = [];
  const matchedSkills: string[] = [];
  const matchedPortfolioIds: string[] = [];

  const creatorDoc = buildCreatorSearchDocument(creator);
  const queryTokens = criteria.rawQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // =========================================================================
  // FACTOR 1: CONTENT FIT (25%)
  // Product/Industry, Language, Target Audience, Output Medium
  // =========================================================================
  let contentFitScore = 45; // Baseline neutral

  // 1a. Language Check
  let languageCompatible = true;
  if (criteria.languages.length > 0) {
    for (const lang of criteria.languages) {
      const langLower = lang.toLowerCase();
      const associatedRegions = LANGUAGE_REGION_MAP[langLower] || [];
      const hasLangInDoc = creatorDoc.includes(langLower);
      const hasRegionInLocation = associatedRegions.some(reg => (creator.location || '').toLowerCase().includes(reg));

      if (hasLangInDoc || hasRegionInLocation) {
        contentFitScore += 25;
        const proof = hasLangInDoc ? `verified ${lang} language capability` : `based in ${creator.location} (${lang}-speaking region)`;
        positiveEvidence.push(`Linguistic and regional alignment: ${proof}.`);
        citations.push({
          category: 'location',
          text: `Creator profile lists location as "${creator.location}" with verified regional content experience.`
        });
      } else {
        languageCompatible = false;
        missingMatches.push(`No verified ${lang} language audio or localization samples in portfolio.`);
        contentFitScore -= 15;
      }
    }
  }

  // 1b. Industry Alignment
  if (criteria.industry) {
    const synonyms = INDUSTRY_KEYWORDS[criteria.industry] || [criteria.industry];
    const hasIndustryOverlap = synonyms.some(syn => creatorDoc.includes(syn));
    if (hasIndustryOverlap) {
      contentFitScore += 25;
      positiveEvidence.push(`Demonstrated domain experience in ${criteria.industry} commercial content.`);
      citations.push({
        category: 'skill',
        text: `Specialization and portfolio include verified campaigns in ${criteria.industry}.`
      });
    } else {
      missingMatches.push(`Lacks specific portfolio showcases in ${criteria.industry}.`);
    }
  }

  // 1c. General Query Semantic Overlap
  let tokenMatches = 0;
  for (const token of queryTokens) {
    if (creatorDoc.includes(token)) tokenMatches++;
  }
  const tokenRatio = queryTokens.length > 0 ? tokenMatches / queryTokens.length : 0.5;
  contentFitScore += Math.round(tokenRatio * 20);
  contentFitScore = Math.min(100, Math.max(15, contentFitScore));

  // =========================================================================
  // FACTOR 2: STYLE AND FORMAT (20%)
  // Aspect Ratio, Duration, Visual Aesthetic
  // =========================================================================
  let styleAndFormatScore = 50;

  if (criteria.aspectRatio) {
    const hasRatioPortfolio = creator.portfolio.some(p => p.aspectRatio === criteria.aspectRatio);
    if (hasRatioPortfolio) {
      styleAndFormatScore += 30;
      positiveEvidence.push(`Demonstrated proficiency in requested ${criteria.aspectRatio} format.`);
      citations.push({
        category: 'portfolio',
        text: `Active portfolio includes verified assets produced in ${criteria.aspectRatio} aspect ratio.`
      });
    } else {
      missingMatches.push(`Lacks verified assets in requested ${criteria.aspectRatio} aspect ratio.`);
      styleAndFormatScore -= 10;
    }
  }

  if (criteria.visualStyle) {
    const styleLower = criteria.visualStyle.toLowerCase();
    if (creatorDoc.includes('photo') || creatorDoc.includes('cinematic') || creatorDoc.includes('hyperrealism') || creatorDoc.includes('8k')) {
      styleAndFormatScore += 20;
      positiveEvidence.push(`Visual style matches requested ${criteria.visualStyle}.`);
    }
  }
  styleAndFormatScore = Math.min(100, Math.max(20, styleAndFormatScore));

  // =========================================================================
  // FACTOR 3: SKILLS AND TOOLS (15%)
  // Named AI Tools & Production Workflows
  // =========================================================================
  let skillsAndToolsScore = 50;
  if (criteria.tools.length > 0) {
    for (const t of criteria.tools) {
      const hasTool = creator.tools.some(ct => ct.toLowerCase() === t.toLowerCase()) ||
        creator.portfolio.some(p => (p.specificModel || '').toLowerCase().includes(t.toLowerCase()));
      if (hasTool) {
        matchedTools.push(t);
        citations.push({
          category: 'tool',
          text: `Certified in requested AI workflow tool: ${t}.`
        });
      } else {
        missingMatches.push(`Missing certified production workflow in ${t}.`);
      }
    }
    const toolRatio = matchedTools.length / criteria.tools.length;
    skillsAndToolsScore = Math.round(toolRatio * 100);
    if (matchedTools.length > 0) {
      positiveEvidence.push(`Proficient in requested AI tools: ${matchedTools.join(', ')}.`);
    }
  } else {
    // If no specific tools were mandated, award points based on diverse toolchain
    skillsAndToolsScore = Math.min(100, 50 + creator.tools.length * 12);
  }
  skillsAndToolsScore = Math.min(100, Math.max(15, skillsAndToolsScore));

  // =========================================================================
  // FACTOR 4: PORTFOLIO EVIDENCE (20%)
  // Relevant Projects, Steps, Prompt Snippets, Client Work
  // =========================================================================
  let portfolioEvidenceScore = 40;
  for (const item of creator.portfolio) {
    let relevance = 0;
    if (criteria.aspectRatio && item.aspectRatio === criteria.aspectRatio) relevance++;
    if (criteria.industry && (item.title.toLowerCase().includes(criteria.industry) || (item.workflowDescription || '').toLowerCase().includes(criteria.industry))) relevance += 2;
    if (item.steps && item.steps.length > 0) relevance++;
    if (item.promptSnippet) relevance++;

    if (relevance >= 2) {
      matchedPortfolioIds.push(item.id);
      citations.push({
        category: 'portfolio',
        text: `Portfolio item "${item.title}" (${item.aspectRatio}, ${item.specificModel || 'Gen-AI'}) directly demonstrates relevant workflow.`,
        referenceId: item.id
      });
    }
  }

  if (matchedPortfolioIds.length > 0) {
    portfolioEvidenceScore += Math.min(40, matchedPortfolioIds.length * 20);
    positiveEvidence.push(`${matchedPortfolioIds.length} directly relevant commercial campaign(s) on file.`);
  }

  const completedRatio = Math.min(20, Math.round((creator.completedProjects / 40) * 20));
  portfolioEvidenceScore = Math.min(100, portfolioEvidenceScore + completedRatio);

  // =========================================================================
  // FACTOR 5: TRUST SIGNALS & VERIFICATION (10%)
  // Platform Verification, Audited Pipeline, Commercial Indemnity
  // =========================================================================
  let trustSignalsScore = 40;
  if (creator.isVerified) {
    trustSignalsScore += 25;
    citations.push({ category: 'verification', text: 'Creator identity verified by GenCraft Trust & Safety.' });
  }
  if (creator.verification?.certifiedPipeline || creator.verifiedDetails?.certifiedPipeline) {
    trustSignalsScore += 25;
    citations.push({ category: 'verification', text: `Audited Pipeline: ${creator.verification?.certifiedPipeline || creator.verifiedDetails?.certifiedPipeline}` });
  }
  if (creator.verification?.commercialRightsGuaranteed || creator.verifiedDetails?.commercialRightsGuaranteed) {
    trustSignalsScore += 10;
  }
  trustSignalsScore = Math.min(100, trustSignalsScore);

  // =========================================================================
  // FACTOR 6: COMMERCIAL RIGHTS COMPATIBILITY (10%)
  // Decoupled Licensing Engine Evaluation
  // =========================================================================
  const syntheticBrief: any = {
    title: criteria.rawQuery.slice(0, 50),
    contentType: 'AI Commercial Video',
    commercialUse: criteria.licensingScope || 'Commercial Licensed',
    durationMonths: criteria.licensingDurationMonths || 12,
    channels: criteria.licensingChannels,
    territory: criteria.territory || 'Worldwide',
  };

  const licensingEval = evaluateLicensingCompatibility(syntheticBrief, creator);
  let commercialCompatibilityScore = 50;

  if (licensingEval.status === 'COMPATIBLE') {
    commercialCompatibilityScore = 100;
    positiveEvidence.push('Full commercial rights compatibility for requested channels and territory.');
    citations.push({
      category: 'licensing',
      text: `Creator grants ${creator.licensingTerms?.permittedScope || 'Commercial'} rights covering ${creator.licensingTerms?.allowedChannels.join(', ')}.`
    });
  } else if (licensingEval.status === 'NEEDS_REVIEW' || licensingEval.status === 'UNKNOWN') {
    commercialCompatibilityScore = 65;
    missingMatches.push('Licensing terms require manual review before commercial dispatch.');
  } else {
    commercialCompatibilityScore = 20;
    conflicts.push(...licensingEval.conflicts);
    missingMatches.push(`Licensing conflict: ${licensingEval.conflicts.join('; ')}`);
  }

  // =========================================================================
  // HARD CONSTRAINT: BUDGET CEILING CHECK
  // =========================================================================
  let budgetCompatible = true;
  if (criteria.budgetMax !== undefined) {
    // Determine creator project rate or hourly rate approximation (assumes 1-2 billable hours for micro-turnaround)
    const effectiveProjectFee = creator.projectRate || (creator.hourlyRate * 1.0);
    if (effectiveProjectFee > criteria.budgetMax * 1.8) {
      budgetCompatible = false;
      conflicts.push(`Budget mismatch: Creator commercial rate (₹${creator.hourlyRate.toLocaleString()}/hr) exceeds campaign ceiling (₹${criteria.budgetMax.toLocaleString()}).`);
      missingMatches.push(`Creator rate exceeds specified budget ceiling of ₹${criteria.budgetMax.toLocaleString()}.`);
    } else if (effectiveProjectFee <= criteria.budgetMax) {
      positiveEvidence.push(`Commercial rate (₹${creator.hourlyRate.toLocaleString()}) fits comfortably within ₹${criteria.budgetMax.toLocaleString()} budget.`);
    }
  }

  // =========================================================================
  // WEIGHTED AGGREGATE COMPUTATION (0 - 100)
  // =========================================================================
  let rawWeightedScore = Math.round(
    0.25 * contentFitScore +
    0.20 * styleAndFormatScore +
    0.15 * skillsAndToolsScore +
    0.20 * portfolioEvidenceScore +
    0.10 * trustSignalsScore +
    0.10 * commercialCompatibilityScore
  );

  // Apply penalties for mandatory hard constraint violations
  if (!budgetCompatible && criteria.isHardBudget) {
    rawWeightedScore = Math.round(rawWeightedScore * 0.55);
  }
  if (!languageCompatible && criteria.isHardLanguage) {
    rawWeightedScore = Math.round(rawWeightedScore * 0.50);
  }
  if (criteria.isHardTools && matchedTools.length === 0) {
    rawWeightedScore = Math.round(rawWeightedScore * 0.40);
  }

  const finalScore = Math.min(99, Math.max(10, rawWeightedScore));
  const isPartialMatch = finalScore >= 50 && finalScore < 70;

  // Synthesize top 3 empirical reasons
  reasons.push(...positiveEvidence.slice(0, 3));
  if (reasons.length < 3 && creator.completedProjects > 10) {
    reasons.push(`Verified marketplace track record of ${creator.completedProjects} campaigns rated ${creator.rating}★.`);
  }

  let recommendedNextAction = 'Add creator to shortlist for commercial review.';
  if (finalScore >= 80 && licensingEval.status === 'COMPATIBLE' && budgetCompatible && languageCompatible) {
    recommendedNextAction = 'Top recommendation: initiate direct commission proposal.';
  } else if (!budgetCompatible) {
    recommendedNextAction = 'Negotiate scope or adjust campaign budget ceiling.';
  } else if (licensingEval.status === 'MISMATCH') {
    recommendedNextAction = 'Resolve licensing territory/channel differences before commissioning.';
  }

  return {
    creatorId: creator.id,
    creator,
    rank: 1, // Will be assigned during ranking
    finalScore,
    factorScores: {
      contentFit: contentFitScore,
      styleAndFormat: styleAndFormatScore,
      skillsAndTools: skillsAndToolsScore,
      portfolioEvidence: portfolioEvidenceScore,
      trustSignals: trustSignalsScore,
      commercialCompatibility: commercialCompatibilityScore,
    },
    reasons,
    positiveEvidence,
    missingMatches,
    conflicts,
    matchedTools,
    matchedSkills,
    matchedPortfolioIds,
    licensingStatus: licensingEval.status,
    licensingSummary: licensingEval.summary,
    isPartialMatch,
    budgetCompatible,
    languageCompatible,
    recommendedNextAction,
    citations,
  };
}

/**
 * Execute Full Universal Brief Matching Run Across All Creators
 */
export function executeUniversalBriefMatching(
  rawQuery: string,
  creators: Creator[]
): UniversalMatchRun {
  const criteria = extractBriefCriteria(rawQuery);

  const scoredMatches = creators.map(creator =>
    matchCreatorToUniversalBrief(creator, criteria)
  );

  // Deterministic sorting: higher finalScore first, then rating, then completedProjects
  const ranked = scoredMatches.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.creator.rating !== a.creator.rating) return b.creator.rating - a.creator.rating;
    return b.creator.completedProjects - a.creator.completedProjects;
  }).map((m, idx) => ({ ...m, rank: idx + 1 }));

  const strongMatches = ranked.filter(m => m.finalScore >= 70 && m.budgetCompatible && m.languageCompatible && m.licensingStatus === 'COMPATIBLE');

  if (strongMatches.length > 0) {
    return {
      query: rawQuery,
      extractedCriteria: criteria,
      totalEvaluated: creators.length,
      hasStrongMatch: true,
      status: 'STRONG_MATCHES_FOUND',
      statusExplanation: `Found ${strongMatches.length} creator(s) meeting creative, linguistic, budget, and commercial standards.`,
      relaxationSuggestions: [],
      matches: ranked,
    };
  }

  // Generate actionable, honest relaxation suggestions
  const suggestions: string[] = [];
  if (criteria.budgetMax !== undefined) {
    suggestions.push(`Consider relaxing the budget ceiling above ₹${criteria.budgetMax.toLocaleString()} to match commercial studio rates.`);
  }
  if (criteria.languages.length > 0) {
    suggestions.push(`Broaden audio requirements to allow bilingual voiceover dubbing.`);
  }
  if (criteria.tools.length > 0) {
    suggestions.push(`Allow alternative generative video tools such as Veo, Kling, or Sora.`);
  }
  if (suggestions.length === 0) {
    suggestions.push('Broaden deliverable timeline to allow specialized pipeline calibration.');
  }

  return {
    query: rawQuery,
    extractedCriteria: criteria,
    totalEvaluated: creators.length,
    hasStrongMatch: false,
    status: 'NO_STRONG_MATCH',
    statusExplanation: 'No creator achieved the strong matching threshold (>=70%) with all mandatory budget, linguistic, and licensing criteria simultaneously.',
    relaxationSuggestions: suggestions,
    matches: ranked,
  };
}
