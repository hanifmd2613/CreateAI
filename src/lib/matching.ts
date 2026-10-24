import { Creator, Brief, LicensingStatus } from '../types';
import { evaluateLicensingCompatibility } from './licensing';

export interface FactorScoreBreakdown {
  contentFit: number;           // 25%
  styleAndFormat: number;       // 20%
  skillsAndTools: number;       // 15%
  portfolioEvidence: number;    // 20%
  trustSignals: number;         // 10%
  commercialCompatibility: number; // 10%
}

// Backward-compatible category interface for Round 1 consumers
export interface MatchCategoryScores {
  semanticScore: number;
  skillScore: number;
  toolScore: number;
  contentTypeScore: number;
  formatScore: number;
  commercialScore: number;
  experienceScore: number;
  // Round 2 factors:
  contentFit?: number;
  styleAndFormat?: number;
  skillsAndTools?: number;
  portfolioEvidence?: number;
  trustSignals?: number;
  commercialCompatibility?: number;
}

export interface CreatorMatchCalculation {
  creatorId: string;
  creator: Creator;
  rank?: number;
  finalScore: number;
  factors: FactorScoreBreakdown;
  categories: MatchCategoryScores;
  reasons: string[];
  positiveEvidence: string[];
  missingMatches: string[];
  matchedTools: string[];
  matchedSkills: string[];
  matchedPortfolioIds: string[];
  licensingStatus: LicensingStatus;
  licensingSummary: string;
  trustEvidence: string[];
  recommendedNextAction: string;
}

export interface MatchRunResult {
  briefId: string;
  briefTitle: string;
  totalEvaluated: number;
  hasStrongMatch: boolean;
  status: 'STRONG_MATCHES_FOUND' | 'NO_STRONG_MATCH' | 'CONFLICTING_BRIEF';
  statusExplanation?: string;
  relaxationSuggestions?: string[];
  matches: CreatorMatchCalculation[];
}

export const MATCH_WEIGHTS = {
  contentFit: 0.25,
  styleAndFormat: 0.20,
  skillsAndTools: 0.15,
  portfolioEvidence: 0.20,
  trustSignals: 0.10,
  commercialCompatibility: 0.10,
};

export const MATCHING_WEIGHTS = MATCH_WEIGHTS;

export function computeCreatorMatch(brief: Brief, creator: Creator): CreatorMatchCalculation {
  const reasons: string[] = [];
  const positiveEvidence: string[] = [];
  const missingMatches: string[] = [];
  const matchedTools: string[] = [];
  const matchedSkills: string[] = [];
  const matchedPortfolioIds: string[] = [];
  const trustEvidence: string[] = [];

  // ==========================================================================
  // FACTOR 1: CONTENT FIT (25%)
  // Medium, Specialization, Industry, Output Type
  // ==========================================================================
  let contentFitScore = 50; // Neutral baseline
  const briefContent = (brief.contentType || '').toLowerCase();
  const spec = (creator.specialization || '').toLowerCase();
  const bio = (creator.bio || '').toLowerCase();

  const isVideoBrief = briefContent.includes('video') || briefContent.includes('film') || briefContent.includes('commercial');
  const isImageBrief = briefContent.includes('image') || briefContent.includes('photo') || briefContent.includes('packshot');
  const isAudioBrief = briefContent.includes('audio') || briefContent.includes('voice') || briefContent.includes('sonic');

  const hasMatchingPortfolioMedium = creator.portfolio.some(p => {
    if (isVideoBrief && p.type === 'video') return true;
    if (isImageBrief && p.type === 'image') return true;
    if (isAudioBrief && p.type === 'audio') return true;
    return false;
  });

  if (hasMatchingPortfolioMedium) {
    contentFitScore += 30;
    positiveEvidence.push(`Portfolio contains verified ${brief.contentType} commercial showcases.`);
  } else {
    missingMatches.push(`No exact ${brief.contentType} media assets in active portfolio.`);
  }

  if (spec.includes(briefContent) || (isVideoBrief && (spec.includes('filmmaker') || spec.includes('director')))) {
    contentFitScore += 20;
    positiveEvidence.push(`Specialization "${creator.specialization}" directly targets ${brief.contentType}.`);
  } else if (bio.includes(briefContent)) {
    contentFitScore += 10;
  }
  contentFitScore = Math.min(100, Math.max(25, contentFitScore));

  // ==========================================================================
  // FACTOR 2: STYLE AND FORMAT (20%)
  // Aspect ratio, Orientation, Duration, Aesthetic
  // ==========================================================================
  let styleAndFormatScore = 50;
  const targetRatio = brief.aspectRatio || '16:9';
  const targetStyle = (brief.style || '').toLowerCase();

  const hasExactRatioWork = creator.portfolio.some(p => p.aspectRatio === targetRatio);
  if (hasExactRatioWork) {
    styleAndFormatScore += 30;
    positiveEvidence.push(`Demonstrated proficiency in requested ${targetRatio} format.`);
  } else {
    missingMatches.push(`Lacks verified portfolio samples in target ${targetRatio} aspect ratio.`);
  }

  const styleWords = targetStyle.split(/[^\w]+/).filter(w => w.length > 3);
  let styleOverlap = 0;
  creator.portfolio.forEach(p => {
    const desc = `${p.title} ${p.workflowDescription || ''} ${p.style || ''}`.toLowerCase();
    styleWords.forEach(sw => {
      if (desc.includes(sw)) styleOverlap++;
    });
  });

  if (styleOverlap > 0 || bio.includes(targetStyle) || spec.includes(targetStyle)) {
    styleAndFormatScore += 20;
    positiveEvidence.push(`Aesthetic matches requested "${brief.style}" visual style.`);
  }
  styleAndFormatScore = Math.min(100, Math.max(30, styleAndFormatScore));

  // ==========================================================================
  // FACTOR 3: SKILLS AND TOOLS (15%)
  // Required tools, models, verification evidence
  // ==========================================================================
  const reqTools = brief.requiredTools || [];
  reqTools.forEach(rt => {
    const hasTool = creator.tools.some(ct => ct.toLowerCase() === rt.toLowerCase()) ||
      creator.portfolio.some(p => (p.specificModel || '').toLowerCase().includes(rt.toLowerCase()));
    if (hasTool) {
      matchedTools.push(rt);
    } else {
      missingMatches.push(`Missing certified workflow in ${rt}.`);
    }
  });

  const toolRatio = reqTools.length > 0 ? matchedTools.length / reqTools.length : 0.8;
  const reqSkills = brief.requiredSkills && brief.requiredSkills.length > 0
    ? brief.requiredSkills
    : [brief.contentType, brief.style];

  reqSkills.forEach(rs => {
    const hasSkill = creator.skills.some(cs => cs.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs.toLowerCase())) ||
      spec.includes(rs.toLowerCase());
    if (hasSkill) matchedSkills.push(rs);
  });
  const skillRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 0.8;

  const skillsAndToolsScore = Math.min(100, Math.max(30, Math.round(toolRatio * 60 + skillRatio * 40)));
  if (matchedTools.length > 0) {
    positiveEvidence.push(`Proficient in requested AI tools: ${matchedTools.join(', ')}.`);
  }

  // ==========================================================================
  // FACTOR 4: PORTFOLIO EVIDENCE (20%)
  // Similar items, workflow steps, prompt snippets, client track record
  // ==========================================================================
  let portfolioEvidenceScore = 40;
  creator.portfolio.forEach(p => {
    let relevance = 0;
    if (p.aspectRatio === targetRatio) relevance++;
    if (isVideoBrief && p.type === 'video') relevance++;
    if (reqTools.some(t => (p.specificModel || '').toLowerCase().includes(t.toLowerCase()))) relevance++;
    if (p.steps && p.steps.length > 0) relevance++;

    if (relevance >= 2) {
      matchedPortfolioIds.push(p.id);
    }
  });

  if (matchedPortfolioIds.length > 0) {
    portfolioEvidenceScore += Math.min(40, matchedPortfolioIds.length * 20);
    positiveEvidence.push(`${matchedPortfolioIds.length} directly comparable portfolio campaign(s) on file.`);
  }

  const projectReputation = Math.min(20, Math.round((creator.completedProjects / 40) * 20));
  portfolioEvidenceScore = Math.min(100, portfolioEvidenceScore + projectReputation);

  // ==========================================================================
  // FACTOR 5: TRUST SIGNALS & VERIFICATION (10%)
  // Audited pipeline, safety score, platform verification
  // ==========================================================================
  let trustSignalsScore = 40;
  if (creator.isVerified) {
    trustSignalsScore += 25;
    trustEvidence.push('Platform Identity Verified');
  }
  if (creator.verification?.certifiedPipeline || creator.verifiedDetails?.certifiedPipeline) {
    trustSignalsScore += 25;
    trustEvidence.push('Audited Pipeline Checkpoints Certified');
  }
  if (creator.verification?.commercialRightsGuaranteed || creator.verifiedDetails?.commercialRightsGuaranteed) {
    trustSignalsScore += 10;
    trustEvidence.push('Commercial IP Indemnity Guarantee');
  }
  trustSignalsScore = Math.min(100, trustSignalsScore);

  // ==========================================================================
  // FACTOR 6: COMMERCIAL-USE COMPATIBILITY (10%)
  // Rights evaluation via decoupled licensing engine
  // ==========================================================================
  const licensingEval = evaluateLicensingCompatibility(brief, creator);
  let commercialScore = 50;
  if (licensingEval.status === 'COMPATIBLE') {
    commercialScore = 100;
    positiveEvidence.push('Full commercial licensing alignment (Territory & Channels).');
  } else if (licensingEval.status === 'NEEDS_REVIEW' || licensingEval.status === 'UNKNOWN') {
    commercialScore = 65;
    missingMatches.push('Licensing details incomplete; manual review required.');
  } else {
    commercialScore = 30;
    missingMatches.push(`Licensing conflict: ${licensingEval.conflicts.join(', ')}`);
  }

  // ==========================================================================
  // FINAL SCORE COMPUTATION (Normalized sum of weights)
  // ==========================================================================
  const finalScore = Math.min(99, Math.max(35, Math.round(
    MATCH_WEIGHTS.contentFit * contentFitScore +
    MATCH_WEIGHTS.styleAndFormat * styleAndFormatScore +
    MATCH_WEIGHTS.skillsAndTools * skillsAndToolsScore +
    MATCH_WEIGHTS.portfolioEvidence * portfolioEvidenceScore +
    MATCH_WEIGHTS.trustSignals * trustSignalsScore +
    MATCH_WEIGHTS.commercialCompatibility * commercialScore
  )));

  // Synthesis of top empirical reasons
  reasons.push(...positiveEvidence.slice(0, 3));
  if (reasons.length < 3 && creator.completedProjects > 20) {
    reasons.push(`Commercial track record of ${creator.completedProjects} campaigns rated ${creator.rating}★.`);
  }

  let recommendedNextAction = 'Add creator to shortlist for commercial review.';
  if (finalScore >= 85 && licensingEval.compatible) {
    recommendedNextAction = 'Top recommendation: initiate direct commission proposal.';
  } else if (!licensingEval.compatible) {
    recommendedNextAction = 'Resolve licensing territory/channel differences before commissioning.';
  } else if (finalScore < 70) {
    recommendedNextAction = 'Review portfolio steps or request custom visual sample.';
  }

  return {
    creatorId: creator.id,
    creator,
    finalScore,
    factors: {
      contentFit: contentFitScore,
      styleAndFormat: styleAndFormatScore,
      skillsAndTools: skillsAndToolsScore,
      portfolioEvidence: portfolioEvidenceScore,
      trustSignals: trustSignalsScore,
      commercialCompatibility: commercialScore,
    },
    // Backward compatibility for existing UI modal
    categories: {
      semanticScore: contentFitScore,
      skillScore: skillsAndToolsScore,
      toolScore: skillsAndToolsScore,
      contentTypeScore: contentFitScore,
      formatScore: styleAndFormatScore,
      commercialScore,
      experienceScore: portfolioEvidenceScore,
      contentFit: contentFitScore,
      styleAndFormat: styleAndFormatScore,
      skillsAndTools: skillsAndToolsScore,
      portfolioEvidence: portfolioEvidenceScore,
      trustSignals: trustSignalsScore,
      commercialCompatibility: commercialScore,
    },
    reasons,
    positiveEvidence,
    missingMatches,
    matchedTools,
    matchedSkills,
    matchedPortfolioIds,
    licensingStatus: licensingEval.status,
    licensingSummary: licensingEval.summary,
    trustEvidence,
    recommendedNextAction,
  };
}

export function rankCreatorsForBrief(brief: Brief, creators: Creator[]): CreatorMatchCalculation[] {
  return creators
    .map(creator => computeCreatorMatch(brief, creator))
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((m, index) => ({ ...m, rank: index + 1 }));
}

export function evaluateBriefMatchingRun(brief: Brief, creators: Creator[]): MatchRunResult {
  // Check for internal brief contradictions
  if (brief.aspectRatio === '9:16' && brief.deliverables?.some(d => d.toLowerCase().includes('landscape'))) {
    return {
      briefId: brief.id,
      briefTitle: brief.title,
      totalEvaluated: creators.length,
      hasStrongMatch: false,
      status: 'CONFLICTING_BRIEF',
      statusExplanation: 'Brief requires conflicting aspect ratios (Vertical 9:16 target with Landscape deliverables). Clarify master orientation.',
      relaxationSuggestions: [
        'Unify deliverables to vertical 9:16 format.',
        'Request dual master cuts (vertical reels + horizontal broadcast).'
      ],
      matches: []
    };
  }

  const ranked = rankCreatorsForBrief(brief, creators);
  const strongMatches = ranked.filter(m => m.finalScore >= 70);

  if (strongMatches.length === 0) {
    return {
      briefId: brief.id,
      briefTitle: brief.title,
      totalEvaluated: creators.length,
      hasStrongMatch: false,
      status: 'NO_STRONG_MATCH',
      statusExplanation: 'No creator achieved a strong matching threshold (>=70%) with all mandatory tools and format criteria.',
      relaxationSuggestions: [
        `Broaden tool requirements beyond "${brief.requiredTools?.join(', ')}".`,
        `Allow flexible aspect ratios or adapt from 16:9 master keyframes.`,
        `Extend delivery timeline to allow specialized pipeline calibration.`
      ],
      matches: ranked
    };
  }

  return {
    briefId: brief.id,
    briefTitle: brief.title,
    totalEvaluated: creators.length,
    hasStrongMatch: true,
    status: 'STRONG_MATCHES_FOUND',
    statusExplanation: `${strongMatches.length} creator(s) satisfy technical and creative compatibility standards.`,
    matches: ranked
  };
}
