import { Creator } from '../../types';
import { 
  executeUniversalBriefMatching, 
  buildCreatorSearchDocument, 
  UniversalMatchResult, 
  UniversalMatchRun 
} from '../universalMatching';
import { generateLocalDenseEmbedding, cosineSimilarity } from './embeddings';
import { predictCampaignOutcomes } from './outcomePrediction';
import { applyDiversityAndPersonalization, BrandProfileContext, PersonalizedMatchResult } from './personalization';

export interface MLRankingOptions {
  brandContext?: BrandProfileContext;
  modelMode?: 'baseline' | 'hybrid_ml' | 'supervised_auto';
  enableDiversity?: boolean;
}

export interface HybridRankedCandidate extends PersonalizedMatchResult {
  mlFeatures: {
    semanticCosineSimilarity: number;
    lexicalScore: number;
    baselineSixFactorScore: number;
    predictedAcceptanceRate: number;
    predictedQualityPassRate: number;
  };
  rankingEngineVersion: string;
}

export interface HybridRankingRun {
  query: string;
  totalEvaluated: number;
  hasStrongMatch: boolean;
  status: 'STRONG_MATCHES_FOUND' | 'NO_STRONG_MATCH' | 'CONFLICTING_BRIEF';
  statusExplanation: string;
  relaxationSuggestions: string[];
  rankingEngineVersion: string;
  matches: HybridRankedCandidate[];
}

/**
 * Phase 2 & 7: Production Hybrid ML Ranking Engine
 * Combines grounded 6-factor baseline with dense vector semantic embeddings,
 * historical outcome calibration, and diversity-aware MMR reranking.
 */
export async function executeHybridMLMatching(
  rawQuery: string,
  creators: Creator[],
  options?: MLRankingOptions
): Promise<HybridRankingRun> {
  // 1. Run Canonical Six-Factor Baseline Matching
  const baselineRun: UniversalMatchRun = executeUniversalBriefMatching(rawQuery, creators);

  // If baseline detected a hard conflicting brief or zero candidates, return immediately
  if (baselineRun.status === 'CONFLICTING_BRIEF' || baselineRun.matches.length === 0) {
    return {
      query: baselineRun.query,
      totalEvaluated: baselineRun.totalEvaluated,
      hasStrongMatch: baselineRun.hasStrongMatch,
      status: baselineRun.status,
      statusExplanation: baselineRun.statusExplanation,
      relaxationSuggestions: baselineRun.relaxationSuggestions,
      rankingEngineVersion: 'baseline-6factor-v2.1',
      matches: baselineRun.matches.map(m => ({
        ...m,
        personalizationBoost: 0,
        personalizationReasons: [],
        isColdStartExploration: false,
        baselineRank: m.rank,
        mlFeatures: {
          semanticCosineSimilarity: 0,
          lexicalScore: 0,
          baselineSixFactorScore: m.finalScore,
          predictedAcceptanceRate: 0.85,
          predictedQualityPassRate: 0.90,
        },
        rankingEngineVersion: 'baseline-6factor-v2.1'
      }))
    };
  }

  // 2. Generate Dense Semantic Embedding for Query Brief
  const queryVector = generateLocalDenseEmbedding(rawQuery);

  // 3. Compute ML Feature Vector and Hybrid Score for each candidate
  const hybridCandidates: HybridRankedCandidate[] = [];

  for (const match of baselineRun.matches) {
    const creator = match.creator;
    const creatorDoc = buildCreatorSearchDocument(creator);
    const creatorVector = generateLocalDenseEmbedding(creatorDoc);

    // Cosine similarity in range [0, 1]
    const rawSim = cosineSimilarity(queryVector, creatorVector);
    const semanticScore = Math.max(0, Math.min(100, Math.round(rawSim * 100)));

    // Predict historical outcome signals
    const predictions = await predictCampaignOutcomes(creator, {
      budget: baselineRun.extractedCriteria.budgetMax,
      deadlineDays: baselineRun.extractedCriteria.deadlineDays,
    });

    const pAccept = predictions.acceptancePrediction.probability;
    const pQuality = predictions.qualityPassPrediction.probability;

    // Production Hybrid Ensemble Formula:
    // 55% Canonical Six-Factor + 20% Dense Semantic Similarity + 15% Verified Portfolio Evidence + 10% Historical Reliability
    let blendedScore = Math.round(
      0.55 * match.finalScore +
      0.20 * semanticScore +
      0.15 * match.factorScores.portfolioEvidence +
      0.10 * (pQuality * 100)
    );

    // Hard constraints check:
    // If licensing is MISMATCH or budget is strictly incompatible, cap score strictly
    if (match.licensingStatus === 'MISMATCH') {
      blendedScore = Math.min(35, blendedScore);
    }
    if (!match.budgetCompatible && baselineRun.extractedCriteria.isHardBudget) {
      blendedScore = Math.min(40, blendedScore);
    }

    hybridCandidates.push({
      ...match,
      finalScore: blendedScore,
      personalizationBoost: 0,
      personalizationReasons: [],
      isColdStartExploration: false,
      baselineRank: match.rank,
      mlFeatures: {
        semanticCosineSimilarity: Number(rawSim.toFixed(4)),
        lexicalScore: match.factorScores.contentFit,
        baselineSixFactorScore: match.finalScore,
        predictedAcceptanceRate: pAccept,
        predictedQualityPassRate: pQuality,
      },
      rankingEngineVersion: 'gencraft-hybrid-ranker-v1.2'
    });
  }

  // Sort by hybrid blended score descending
  hybridCandidates.sort((a, b) => b.finalScore - a.finalScore);

  // 4. Apply Diversity-Aware MMR & Brand Personalization
  let finalMatches: HybridRankedCandidate[] = hybridCandidates;
  if (options?.enableDiversity !== false) {
    const personalized = applyDiversityAndPersonalization(hybridCandidates, options?.brandContext);
    finalMatches = personalized.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      mlFeatures: (p as any).mlFeatures,
      rankingEngineVersion: 'gencraft-hybrid-ranker-v1.2'
    }));
  } else {
    finalMatches.forEach((m, idx) => { m.rank = idx + 1; });
  }

  const topScore = finalMatches[0]?.finalScore || 0;
  const hasStrong = topScore >= 65 && finalMatches[0]?.licensingStatus !== 'MISMATCH';

  return {
    query: baselineRun.query,
    totalEvaluated: creators.length,
    hasStrongMatch: hasStrong,
    status: hasStrong ? 'STRONG_MATCHES_FOUND' : 'NO_STRONG_MATCH',
    statusExplanation: hasStrong 
      ? `Found verified creator matches optimized using the Hybrid ML Ranking Pipeline.` 
      : `No creator meets the strict threshold. Returning nearest candidates with relaxation feedback.`,
    relaxationSuggestions: baselineRun.relaxationSuggestions,
    rankingEngineVersion: 'gencraft-hybrid-ranker-v1.2',
    matches: finalMatches
  };
}
