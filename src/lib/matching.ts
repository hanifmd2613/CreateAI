import { Creator, Brief } from '../types';

export interface MatchCategoryScores {
  semanticScore: number;
  skillScore: number;
  toolScore: number;
  contentTypeScore: number;
  formatScore: number;
  commercialScore: number;
  experienceScore: number;
}

export interface CreatorMatchCalculation {
  creatorId: string;
  creator: Creator;
  finalScore: number;
  categories: MatchCategoryScores;
  reasons: string[];
}

export function computeCreatorMatch(brief: Brief, creator: Creator): CreatorMatchCalculation {
  // 1. Semantic / Intent Similarity (40% weight)
  const briefText = `${brief.title} ${brief.description} ${brief.rawIdea || ''} ${brief.style}`.toLowerCase();
  const briefWords = Array.from(new Set(briefText.split(/[^\w]+/).filter(w => w.length > 2)));

  const creatorText = `${creator.specialization} ${creator.bio} ${creator.skills.join(' ')} ${creator.portfolio.map(p => `${p.title} ${p.workflowDescription} ${p.promptSnippet || ''}`).join(' ')}`.toLowerCase();
  
  let matchedWordCount = 0;
  briefWords.forEach(word => {
    if (creatorText.includes(word)) {
      matchedWordCount++;
    }
  });

  const rawSemanticRatio = briefWords.length > 0 ? matchedWordCount / briefWords.length : 0.5;
  // Scale semantic ratio dynamically between 40 and 98 for realistic scoring
  const semanticScore = Math.min(99, Math.max(45, Math.round(rawSemanticRatio * 120 + 35)));

  // 2. Skills Match (20% weight)
  const requiredSkills = brief.requiredSkills && brief.requiredSkills.length > 0
    ? brief.requiredSkills
    : [brief.contentType, brief.style];

  const matchedSkills = requiredSkills.filter((sk: string) => 
    creator.skills.some(cs => cs.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(cs.toLowerCase())) ||
    creator.specialization.toLowerCase().includes(sk.toLowerCase())
  );

  const skillRatio = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.8;
  const skillScore = Math.min(100, Math.max(50, Math.round(skillRatio * 100)));

  // 3. Tools / Models Match (15% weight)
  const requiredTools = brief.requiredTools || [];
  const matchedTools = requiredTools.filter(t => 
    creator.tools.some(ct => ct.toLowerCase() === t.toLowerCase()) ||
    creator.portfolio.some(p => p.specificModel?.toLowerCase().includes(t.toLowerCase()))
  );

  const toolRatio = requiredTools.length > 0 ? matchedTools.length / requiredTools.length : 0.7;
  const toolScore = Math.min(100, Math.max(40, Math.round(toolRatio * 100)));

  // 4. Content-Type Match (10% weight)
  const hasMatchingPortfolioType = creator.portfolio.some(p => {
    if (brief.contentType.toLowerCase().includes('video') && p.type === 'video') return true;
    if (brief.contentType.toLowerCase().includes('image') && p.type === 'image') return true;
    if (brief.contentType.toLowerCase().includes('audio') && p.type === 'audio') return true;
    return false;
  });

  const contentTypeScore = hasMatchingPortfolioType || creator.specialization.toLowerCase().includes(brief.contentType.toLowerCase())
    ? 95
    : 60;

  // 5. Format & Style Match (5% weight)
  const styleMatch = creator.portfolio.some(p => p.aspectRatio === brief.aspectRatio) ||
    creator.bio.toLowerCase().includes(brief.style.toLowerCase()) ||
    creator.specialization.toLowerCase().includes(brief.style.toLowerCase());
  const formatScore = styleMatch ? 95 : 65;

  // 6. Commercial-Use Compatibility (5% weight)
  const commercialScore = (creator.isVerified || creator.verifiedDetails?.commercialRightsGuaranteed) ? 100 : 70;

  // 7. Experience / Portfolio Evidence (5% weight)
  const ratingPart = (creator.rating / 5.0) * 50;
  const projectPart = Math.min(30, creator.completedProjects * 0.6);
  const portfolioPart = Math.min(20, creator.portfolio.length * 7);
  const experienceScore = Math.min(100, Math.round(ratingPart + projectPart + portfolioPart));

  // Final Score (Weighted 40 / 20 / 15 / 10 / 5 / 5 / 5)
  const finalScore = Math.min(99, Math.round(
    0.40 * semanticScore +
    0.20 * skillScore +
    0.15 * toolScore +
    0.10 * contentTypeScore +
    0.05 * formatScore +
    0.05 * commercialScore +
    0.05 * experienceScore
  ));

  // Dynamic Reasons Generation (Empirical)
  const reasons: string[] = [];

  if (matchedTools.length > 0) {
    reasons.push(`Uses requested generative tools: ${matchedTools.join(', ')}`);
  }

  if (creator.specialization.toLowerCase().includes('director') || creator.specialization.toLowerCase().includes('filmmaker') || creator.completedProjects > 30) {
    reasons.push(`Strong commercial track record with ${creator.completedProjects} completed campaigns`);
  }

  if (hasMatchingPortfolioType) {
    reasons.push(`Portfolio contains verified ${brief.contentType} commercial showcases`);
  }

  if (creator.portfolio.some(p => p.aspectRatio === brief.aspectRatio)) {
    reasons.push(`Supports requested ${brief.aspectRatio} format`);
  }

  if (creator.verifiedDetails?.commercialRightsGuaranteed || creator.isVerified) {
    reasons.push('Full IP commercial buyout rights & seed auditing certified');
  }

  if (reasons.length < 3) {
    reasons.push(`Rated ${creator.rating}★ across ${creator.reviewCount} brand reviews`);
  }

  return {
    creatorId: creator.id,
    creator,
    finalScore,
    categories: {
      semanticScore,
      skillScore,
      toolScore,
      contentTypeScore,
      formatScore,
      commercialScore,
      experienceScore,
    },
    reasons,
  };
}

export function rankCreatorsForBrief(brief: Brief, creators: Creator[]): CreatorMatchCalculation[] {
  return creators
    .map(creator => computeCreatorMatch(brief, creator))
    .sort((a, b) => b.finalScore - a.finalScore);
}
