import { Creator } from '../../types';
import { UniversalMatchResult } from '../universalMatching';

export interface BrandProfileContext {
  brandId?: string;
  preferredNiches?: string[];
  preferredTools?: string[];
  completedEngagementsWithCreators?: string[]; // creatorIds
}

export interface PersonalizedMatchResult extends UniversalMatchResult {
  personalizationBoost: number;
  personalizationReasons: string[];
  isColdStartExploration: boolean;
  baselineRank: number;
}

/**
 * Calculates domain similarity between two creators based on skills and tools.
 * Used for Maximal Marginal Relevance (MMR) diversification.
 */
function calculateCreatorSimilarity(c1: Creator, c2: Creator): number {
  if (c1.id === c2.id) return 1.0;

  const tools1 = new Set((c1.tools || []).map(t => t.toLowerCase()));
  const tools2 = new Set((c2.tools || []).map(t => t.toLowerCase()));
  let toolOverlap = 0;
  tools1.forEach(t => { if (tools2.has(t)) toolOverlap++; });
  const toolSim = (tools1.size + tools2.size) > 0 ? (2 * toolOverlap) / (tools1.size + tools2.size) : 0;

  const specSim = c1.specialization.toLowerCase() === c2.specialization.toLowerCase() ? 0.5 : 0;
  return toolSim * 0.7 + specSim * 0.3;
}

/**
 * Applies Diversity-Aware Maximal Marginal Relevance (MMR) and Brand Affinity Reranking.
 * Ensures marketplace discovery is diverse and provides cold-start opportunities for new creators.
 */
export function applyDiversityAndPersonalization(
  matches: UniversalMatchResult[],
  brandContext?: BrandProfileContext,
  lambdaDiversity: number = 0.75 // 0.75 weight on relevance, 0.25 on diversification
): PersonalizedMatchResult[] {
  if (!matches || matches.length === 0) return [];

  const candidates: PersonalizedMatchResult[] = matches.map((m, idx) => {
    let boost = 0;
    const reasons: string[] = [];
    let isColdStart = false;

    // 1. Legitimate Brand Prior Interaction Affinity
    if (brandContext?.completedEngagementsWithCreators?.includes(m.creatorId)) {
      boost += 5;
      reasons.push('Prior successful campaign completed with your brand.');
    }

    // 2. Brand Stated Preferred Niche Alignment
    if (brandContext?.preferredNiches && brandContext.preferredNiches.length > 0) {
      const nicheMatch = brandContext.preferredNiches.some(n => 
        m.creator.specialization.toLowerCase().includes(n.toLowerCase()) ||
        (m.creator.categories || []).some(c => c.toLowerCase().includes(n.toLowerCase()))
      );
      if (nicheMatch) {
        boost += 3;
        reasons.push('Aligns with your brand channel specialization history.');
      }
    }

    // 3. Fair Cold-Start Discovery Opportunity for New Creators
    // If a new creator has strong portfolio evidence (factor 4 >= 70) but < 3 completed projects
    const completed = m.creator.completedProjects || 0;
    if (completed <= 2 && m.factorScores.portfolioEvidence >= 65) {
      boost += 4;
      isColdStart = true;
      reasons.push('Emerging creator spotlight: Verified portfolio evidence matches campaign specs.');
    }

    return {
      ...m,
      personalizationBoost: boost,
      personalizationReasons: reasons,
      isColdStartExploration: isColdStart,
      baselineRank: idx + 1,
    };
  });

  // 4. Maximal Marginal Relevance (MMR) Selection
  const selected: PersonalizedMatchResult[] = [];
  const remaining = [...candidates];

  while (remaining.length > 0) {
    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      // Adjusted score = base finalScore + personalization boost
      const relevance = (candidate.finalScore + candidate.personalizationBoost) / 100.0;

      // Calculate max similarity to already selected creators
      let maxSimToSelected = 0;
      for (const sel of selected) {
        const sim = calculateCreatorSimilarity(candidate.creator, sel.creator);
        if (sim > maxSimToSelected) maxSimToSelected = sim;
      }

      // MMR formulation
      const mmrScore = lambdaDiversity * relevance - (1 - lambdaDiversity) * maxSimToSelected;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }

    if (bestIndex >= 0) {
      const chosen = remaining.splice(bestIndex, 1)[0];
      chosen.rank = selected.length + 1;
      selected.push(chosen);
    } else {
      break;
    }
  }

  return selected;
}
