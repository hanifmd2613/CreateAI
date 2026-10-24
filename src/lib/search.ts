import { Creator, LicensingStatus } from '../types';
import { evaluateLicensingCompatibility } from './licensing';

export interface SearchResult {
  creator: Creator;
  relevanceScore: number; // 0 - 100
  matchHighlights: string[];
  matchedTools: string[];
  matchedSkills: string[];
  matchedAspectRatios: string[];
  licensingCompatibility: LicensingStatus;
  licensingNote?: string;
  missingFactors: string[];
}

export interface SearchFilters {
  query: string;
  tool?: string; // e.g. "All Tools" | "Veo" | "Kling"
  specialization?: string; // e.g. "All Specializations"
  contentType?: string; // e.g. "All Types" | "video" | "image"
  verifiedOnly?: boolean;
}

// Stop-words to remove during query normalization
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'from',
  'by', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'can', 'who', 'that',
  'this', 'these', 'those', 'find', 'me', 'make', 'create', 'need', 'want',
  'looking', 'hire', 'get', 'give', 'using', 'some', 'any', 'please', 'output'
]);

// Domain-specific concept ontology for semantic expansion
interface ConceptGroup {
  keywords: string[];
  tools: string[];
  skills: string[];
  aspectRatios?: string[];
  licensingHints?: { scope?: string; territory?: string; channel?: string };
}

const DOMAIN_CONCEPTS: Record<string, ConceptGroup> = {
  smartphone_tech: {
    keywords: ['smartphone', 'phone', 'mobile', 'electronics', 'gadget', 'hardware', 'device', 'futuristic', 'tech', 'cyber'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    skills: ['Product Packshots', 'Studio Lighting', 'CAD', 'Automotive & Speed Direction', 'Photorealistic Product Visualist'],
  },
  luxury_commercial: {
    keywords: ['luxury', 'premium', 'high-end', 'commercial', 'prestige', 'packshot', 'perfume', 'cosmetics', 'watch', 'editorial'],
    tools: ['Flux.1', 'Kling', 'Veo'],
    skills: ['Studio Lighting', 'Color Grading', 'Photorealistic Product Visualist', 'Commercial Prompting'],
  },
  generative_video: {
    keywords: ['video', 'generative video', 'motion', 'cinematic', 'film', 'filmmaker', 'director', 'footage', 'animation', 'render', 'turntable', 'camera path'],
    tools: ['Veo', 'Kling', 'Sora', 'Pika', 'Runway'],
    skills: ['Cinematic Prompting', 'Camera Motion Paths', 'Latent Motion Synthesis', 'Automotive & Speed Direction', 'Character Motion'],
  },
  lighting_visual: {
    keywords: ['lighting', 'cinematic lighting', 'rim light', 'strobe', 'reflections', 'photorealistic', 'photorealism', 'hyperrealistic', 'anamorphic', '8k', 'imax'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    skills: ['Studio Lighting', 'Cinematic Prompting', 'Color Calibration', 'Latent Upscaling'],
  },
  aspect_ratio_vertical: {
    keywords: ['vertical', '9:16', 'reels', 'tiktok', 'shorts', 'stories'],
    tools: [],
    skills: [],
    aspectRatios: ['9:16'],
  },
  aspect_ratio_horizontal: {
    keywords: ['horizontal', '16:9', 'landscape', 'broadcast', 'youtube', 'tv', 'widescreen'],
    tools: [],
    skills: [],
    aspectRatios: ['16:9'],
  },
  licensing_commercial: {
    keywords: ['commercial', 'commercial usage', 'worldwide', 'buyout', 'advertising', 'paid ads', 'rights', 'licensing'],
    tools: [],
    skills: [],
    licensingHints: { scope: 'Full Buyout', territory: 'Worldwide', channel: 'Paid Advertising' },
  },
  sonic_audio: {
    keywords: ['voice', 'voiceover', 'voice actor', 'sonic', 'audio', 'sound', 'dubbing', 'multilingual', 'narration', 'music', 'soundscape'],
    tools: ['ElevenLabs'],
    skills: ['ElevenLabs Voice Design', 'Multilingual Dubbing', 'Spatial Sound FX', 'Sonic Branding', 'Audio Foley'],
  },
  animation_mascot: {
    keywords: ['animation', 'animator', 'mascot', '3d mascot', 'claymation', 'cartoon', 'character', 'anime'],
    tools: ['Kling', 'Sora', 'Pika'],
    skills: ['3D Mascots & Character Animation', 'Character Consistency', 'Pika Animation'],
  },
};

/**
 * Layer 1: Query Normalization & Token Extraction
 */
export function normalizeSearchQuery(rawQuery: string): {
  normalized: string;
  tokens: string[];
  phrases: string[];
} {
  if (!rawQuery) return { normalized: '', tokens: [], phrases: [] };

  const cleaned = rawQuery
    .toLowerCase()
    .replace(/[^\w\s:.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract key multi-word phrases (e.g., "smartphone launch", "commercial usage", "cinematic lighting", "9:16")
  const keyPhrases: string[] = [];
  const knownPhrases = [
    'smartphone launch',
    'product launch',
    'generative video',
    'video tools',
    'cinematic lighting',
    'vertical 9:16',
    '9:16 output',
    '9:16',
    '16:9',
    'commercial usage',
    'worldwide commercial',
    'commercial rights',
    'full buyout',
    'paid advertising',
    'luxury product',
    'product packshot',
    'product packshots',
    'voice over',
    'voice actor',
    'character animation',
  ];

  for (const kp of knownPhrases) {
    if (cleaned.includes(kp)) {
      keyPhrases.push(kp);
    }
  }

  // Tokenize & filter out stop words
  const words = cleaned.split(' ').filter(w => w.length > 1);
  const tokens = words.filter(w => !STOP_WORDS.has(w));

  return {
    normalized: cleaned,
    tokens: tokens.length > 0 ? tokens : words,
    phrases: keyPhrases,
  };
}

/**
 * Layer 2 & 3: Multi-Layer Semantic & Lexical Scoring
 */
export function scoreCreatorSearch(
  creator: Creator,
  query: string,
  normalizedQuery: { normalized: string; tokens: string[]; phrases: string[] }
): SearchResult {
  const { normalized, tokens, phrases } = normalizedQuery;

  if (!normalized) {
    return {
      creator,
      relevanceScore: 100,
      matchHighlights: ['Browse active creator profile in marketplace.'],
      matchedTools: [],
      matchedSkills: [],
      matchedAspectRatios: [],
      licensingCompatibility: 'COMPATIBLE',
      missingFactors: [],
    };
  }

  const matchHighlights: string[] = [];
  const matchedTools = new Set<string>();
  const matchedSkills = new Set<string>();
  const matchedAspectRatios = new Set<string>();
  const missingFactors: string[] = [];

  let lexicalScore = 0;
  let semanticScore = 0;
  let licensingScore = 50;

  // 1. Direct Name / Handle Exact or Partial Match (High priority)
  const nameLower = creator.name.toLowerCase();
  const handleLower = creator.handle.toLowerCase();
  if (nameLower.includes(normalized) || handleLower.includes(normalized)) {
    lexicalScore += 45;
    matchHighlights.push(`Direct creator profile match: ${creator.name} (${creator.handle})`);
  } else {
    for (const token of tokens) {
      if (nameLower.includes(token)) {
        lexicalScore += 25;
        matchHighlights.push(`Creator name match on "${token}"`);
      }
    }
  }

  // 2. Structured Tools Matching
  const creatorToolsLower = creator.tools.map(t => t.toLowerCase());
  for (const t of creator.tools) {
    const tl = t.toLowerCase();
    if (normalized.includes(tl)) {
      lexicalScore += 20;
      matchedTools.add(t);
      matchHighlights.push(`Verified specialist in required tool: ${t}`);
    }
  }

  // 3. Specialization & Skills Matching
  const specLower = creator.specialization.toLowerCase();
  const bioLower = creator.bio.toLowerCase();

  for (const phrase of phrases) {
    if (specLower.includes(phrase) || bioLower.includes(phrase)) {
      lexicalScore += 20;
      matchHighlights.push(`Creative domain alignment: "${phrase}" represented in creator credentials.`);
    }
  }

  for (const skill of creator.skills) {
    const skl = skill.toLowerCase();
    for (const token of tokens) {
      if (skl.includes(token)) {
        lexicalScore += 10;
        matchedSkills.add(skill);
      }
    }
  }

  // 4. Portfolio Projects & Workflow Inspection
  for (const item of creator.portfolio) {
    const titleLower = item.title.toLowerCase();
    const workflowLower = (item.workflowDescription || '').toLowerCase();
    const modelLower = (item.specificModel || '').toLowerCase();
    const promptLower = (item.promptSnippet || '').toLowerCase();
    const clientLower = (item.client || '').toLowerCase();

    // Aspect ratio check
    if (item.aspectRatio) {
      if (normalized.includes(item.aspectRatio) || (item.aspectRatio === '9:16' && (normalized.includes('vertical') || normalized.includes('reels')))) {
        matchedAspectRatios.add(item.aspectRatio);
        lexicalScore += 15;
        matchHighlights.push(`Demonstrated ${item.aspectRatio} portfolio project: "${item.title}"`);
      }
    }

    // Workflow / Prompt check
    for (const phrase of phrases) {
      if (titleLower.includes(phrase) || workflowLower.includes(phrase) || promptLower.includes(phrase) || modelLower.includes(phrase)) {
        lexicalScore += 15;
        matchHighlights.push(`Portfolio proof: "${item.title}" demonstrates ${phrase} workflow.`);
      }
    }
  }

  // 5. Layer 3: Semantic Concept Retrieval
  for (const [conceptKey, concept] of Object.entries(DOMAIN_CONCEPTS)) {
    const matchedConceptKeywords = concept.keywords.filter(kw => normalized.includes(kw));

    if (matchedConceptKeywords.length > 0) {
      // Check if creator demonstrates tools or skills corresponding to this concept
      const hasTools = concept.tools.some(ct => creatorToolsLower.includes(ct.toLowerCase()));
      const hasSkills = concept.skills.some(cs => creator.skills.some(s => s.toLowerCase().includes(cs.toLowerCase())));
      const hasSpec = concept.skills.some(cs => specLower.includes(cs.toLowerCase()));

      if (hasTools || hasSkills || hasSpec) {
        semanticScore += 25;
        const conceptLabel = conceptKey.replace(/_/g, ' ');
        matchHighlights.push(`Semantic concept relevance: Demonstrated expertise in ${conceptLabel}.`);
        
        // Add specific tools
        for (const ct of concept.tools) {
          if (creatorToolsLower.includes(ct.toLowerCase())) {
            matchedTools.add(ct);
          }
        }
      }
    }
  }

  // 6. Licensing Evaluation
  let licensingStatus: LicensingStatus = 'COMPATIBLE';
  let licensingNote: string | undefined;

  const requiresWorldwide = normalized.includes('worldwide');
  const requiresCommercial = normalized.includes('commercial') || normalized.includes('buyout') || normalized.includes('advertising');

  if (creator.licensingTerms) {
    if (requiresWorldwide && !creator.licensingTerms.allowedTerritories.includes('Worldwide')) {
      licensingStatus = 'MISMATCH';
      licensingNote = `Creator restricts territory to: ${creator.licensingTerms.allowedTerritories.join(', ')}`;
      missingFactors.push('Does not offer Worldwide territory clearance (restricted to domestic).');
      licensingScore = 15;
    } else if (requiresCommercial && creator.licensingTerms.permittedScope === 'Editorial Only') {
      licensingStatus = 'MISMATCH';
      licensingNote = 'Creator offers Editorial Only rights; commercial buyout prohibited.';
      missingFactors.push('Editorial Only rights conflict with commercial campaign requirement.');
      licensingScore = 10;
    } else {
      licensingStatus = 'COMPATIBLE';
      licensingScore = 100;
      if (requiresCommercial) {
        matchHighlights.push(`Full commercial licensing guaranteed: ${creator.licensingTerms.permittedScope} (${creator.licensingTerms.allowedTerritories.join(', ')}).`);
      }
    }
  } else {
    licensingStatus = 'UNKNOWN';
    licensingNote = 'Creator has not declared licensing terms.';
    missingFactors.push('Licensing terms undeclared; requires confirmation.');
    licensingScore = 40;
  }

  // Format Aspect Ratio check
  if (normalized.includes('9:16') || normalized.includes('vertical')) {
    const hasVertical = creator.portfolio.some(p => p.aspectRatio === '9:16');
    if (hasVertical) {
      semanticScore += 15;
    } else {
      missingFactors.push('No verified 9:16 vertical video assets in active portfolio.');
    }
  }

  // Compute Final Hybrid Score (0 - 100)
  // Normalized components: Lexical (35%), Semantic (40%), Licensing (15%), Reputation (10%)
  const repScore = Math.min(100, Math.round((creator.rating / 5) * 80 + (creator.completedProjects > 30 ? 20 : 10)));
  const normalizedLexical = Math.min(100, lexicalScore);
  const normalizedSemantic = Math.min(100, semanticScore);

  let rawTotal = (normalizedLexical * 0.35) + (normalizedSemantic * 0.40) + (licensingScore * 0.15) + (repScore * 0.10);

  // Severe penalty if licensing is a hard mismatch
  if (licensingStatus === 'MISMATCH') {
    rawTotal = Math.min(48, rawTotal * 0.55);
  }

  const finalScore = Math.max(0, Math.min(99, Math.round(rawTotal)));

  // Deduplicate and filter highlights
  const uniqueHighlights = Array.from(new Set(matchHighlights)).slice(0, 4);

  return {
    creator,
    relevanceScore: finalScore,
    matchHighlights: uniqueHighlights.length > 0 ? uniqueHighlights : ['Candidate profile fits broad generative search criteria.'],
    matchedTools: Array.from(matchedTools),
    matchedSkills: Array.from(matchedSkills),
    matchedAspectRatios: Array.from(matchedAspectRatios),
    licensingCompatibility: licensingStatus,
    licensingNote,
    missingFactors,
  };
}

/**
 * Layer 4: Multi-Layer Creator Search Engine
 * Combines Lexical, Semantic Concept Expansion, Structured Filtering, and Deterministic Ranking
 */
export function searchCreators(
  creators: Creator[],
  filters: SearchFilters
): SearchResult[] {
  const { query, tool, specialization, contentType, verifiedOnly } = filters;
  const normalizedQuery = normalizeSearchQuery(query);

  let candidatePool = [...creators];

  // 1. Structured Tool Filter
  if (tool && tool !== 'All Tools') {
    candidatePool = candidatePool.filter(c =>
      c.tools.some(t => t.toLowerCase() === tool.toLowerCase())
    );
  }

  // 2. Structured Specialization Filter
  if (specialization && specialization !== 'All Specializations') {
    candidatePool = candidatePool.filter(c =>
      c.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  }

  // 3. Structured Content Type Filter
  if (contentType && contentType !== 'All Types') {
    candidatePool = candidatePool.filter(c =>
      c.portfolio.some(p => p.type.toLowerCase() === contentType.toLowerCase())
    );
  }

  // 4. Verified Filter
  if (verifiedOnly) {
    candidatePool = candidatePool.filter(c => c.isVerified);
  }

  // If query is empty, return pool with default ranking
  if (!normalizedQuery.normalized) {
    return candidatePool.map(creator => ({
      creator,
      relevanceScore: Math.round((creator.rating / 5) * 100),
      matchHighlights: [`Verified ${creator.specialization}`],
      matchedTools: creator.tools,
      matchedSkills: creator.skills.slice(0, 3),
      matchedAspectRatios: [],
      licensingCompatibility: creator.licensingTerms ? 'COMPATIBLE' : 'UNKNOWN',
      missingFactors: [],
    }));
  }

  // Score all candidates
  const scoredResults = candidatePool.map(creator =>
    scoreCreatorSearch(creator, query, normalizedQuery)
  );

  // Filter out completely irrelevant creators (score < 25) unless pool would be empty
  const relevantResults = scoredResults.filter(r => r.relevanceScore >= 25);
  const finalResults = relevantResults.length > 0 ? relevantResults : scoredResults;

  // Deterministic sorting: higher relevanceScore first; tiebreaker by rating and completedProjects
  return finalResults.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    if (b.creator.rating !== a.creator.rating) {
      return b.creator.rating - a.creator.rating;
    }
    return b.creator.completedProjects - a.creator.completedProjects;
  });
}
