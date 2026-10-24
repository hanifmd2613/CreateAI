import { Creator } from '../../types';
import { 
  executeUniversalBriefMatching, 
  buildCreatorSearchDocument, 
  UniversalMatchResult, 
  UniversalMatchRun 
} from '../universalMatching';
import { generateLocalDenseEmbedding, cosineSimilarity } from './embeddings';
import { predictCampaignOutcomes } from './outcomePrediction';
import { getCreatorEventStats } from './eventTracking';
import { applyDiversityAndPersonalization, BrandProfileContext, PersonalizedMatchResult } from './personalization';

export const RANKING_ENGINE_VERSION = 'gencraft-canonical-hybrid-v2.2';

export interface MLRankingOptions {
  brandContext?: BrandProfileContext;
  modelMode?: 'baseline' | 'hybrid_ml' | 'supervised_auto';
  enableDiversity?: boolean;
  filterIneligible?: boolean; // Default true: exclude legal/licensing mismatches from top recommendations
}

export interface HybridRankedCandidate extends PersonalizedMatchResult {
  isEligible: boolean;
  ineligibleReason?: string;
  mlFeatures: {
    semanticCosineSimilarity: number;
    lexicalScore: number;
    baselineSixFactorScore: number;
    predictedAcceptanceRate?: number;
    predictedQualityPassRate?: number;
    conversionSignal: number;
    outcomeSignalAvailable: boolean;
  };
  rankingEngineVersion: string;
}

export interface HybridRankingRun {
  query: string;
  totalEvaluated: number;
  totalEligible: number;
  hasStrongMatch: boolean;
  status: 'STRONG_MATCHES_FOUND' | 'NO_STRONG_MATCH' | 'CONFLICTING_BRIEF';
  statusExplanation: string;
  relaxationSuggestions: string[];
  rankingEngineVersion: string;
  matches: HybridRankedCandidate[];
}

/**
 * Production Canonical Hybrid ML Ranking Engine (v2.2)
 * 
 * Formula:
 * FinalScore = 0.55 * Baseline + 0.25 * Semantic + 0.15 * Outcome + 0.05 * Conversion
 * 
 * When historical outcome data is insufficient:
 * Renormalized: FinalScore = 0.65 * Baseline + 0.30 * Semantic + 0.05 * Conversion
 * 
 * Hard Constraints:
 * Candidates with mandatory licensing conflicts (licensingStatus === 'MISMATCH')
 * are strictly marked isEligible: false and cannot override legal incompatibility.
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
      totalEligible: 0,
      hasStrongMatch: baselineRun.hasStrongMatch,
      status: baselineRun.status,
      statusExplanation: baselineRun.statusExplanation,
      relaxationSuggestions: baselineRun.relaxationSuggestions,
      rankingEngineVersion: RANKING_ENGINE_VERSION,
      matches: baselineRun.matches.map(m => ({
        ...m,
        isEligible: m.licensingStatus !== 'MISMATCH',
        ineligibleReason: m.licensingStatus === 'MISMATCH' ? 'Licensing conflict with campaign brief.' : undefined,
        personalizationBoost: 0,
        personalizationReasons: [],
        isColdStartExploration: false,
        baselineRank: m.rank,
        mlFeatures: {
          semanticCosineSimilarity: 0,
          lexicalScore: m.factorScores?.contentFit || 0,
          baselineSixFactorScore: m.finalScore,
          conversionSignal: 0,
          outcomeSignalAvailable: false,
        },
        rankingEngineVersion: RANKING_ENGINE_VERSION
      }))
    };
  }

  // 2. Generate Dense Semantic Embedding for Query Brief
  const queryVector = generateLocalDenseEmbedding(rawQuery);

  // 3. Compute Canonical Hybrid Features for each candidate
  const candidates: HybridRankedCandidate[] = [];

  for (const match of baselineRun.matches) {
    const creator = match.creator;
    const creatorDoc = buildCreatorSearchDocument(creator);
    const creatorVector = generateLocalDenseEmbedding(creatorDoc);

    // Dense cosine similarity normalized to [0, 1]
    const rawSim = cosineSimilarity(queryVector, creatorVector);
    const semanticNormalized = Math.max(0, Math.min(1, (rawSim + 1) / 2));
    const semanticScore = Math.round(semanticNormalized * 100);

    // Historical outcome signals
    const predictions = await predictCampaignOutcomes(creator, {
      budget: baselineRun.extractedCriteria.budgetMax,
      deadlineDays: baselineRun.extractedCriteria.deadlineDays,
    });

    const stats = await getCreatorEventStats(creator.id);
    const totalImpressions = stats.impressions || 0;
    const conversionSignal = totalImpressions >= 5
      ? Math.min(100, Math.round((stats.acceptances / Math.max(1, stats.invitations)) * 100))
      : 50; // Neutral prior for sparse telemetry

    const outcomeAvailable = predictions.status === 'PREDICTION_AVAILABLE';
    const pAccept = outcomeAvailable ? predictions.acceptancePrediction.probability : undefined;
    const pQuality = outcomeAvailable ? predictions.qualityPassPrediction.probability : undefined;
    const compositeOutcomeScore = outcomeAvailable ? Math.round(((pAccept! + pQuality!) / 2) * 100) : 0;

    // Canonical Ensemble Blending:
    // With outcome: 55% Baseline + 25% Semantic + 15% Outcome + 5% Conversion
    // Without outcome (cold start): 65% Baseline + 30% Semantic + 5% Conversion
    let blendedScore: number;
    if (outcomeAvailable) {
      blendedScore = Math.round(
        0.55 * match.finalScore +
        0.25 * semanticScore +
        0.15 * compositeOutcomeScore +
        0.05 * conversionSignal
      );
    } else {
      blendedScore = Math.round(
        0.65 * match.finalScore +
        0.30 * semanticScore +
        0.05 * conversionSignal
      );
    }

    // Hard Legal Constraints:
    const isLicensingConflict = match.licensingStatus === 'MISMATCH';
    const isBudgetDisqualified = !match.budgetCompatible && baselineRun.extractedCriteria.isHardBudget;
    const isEligible = !isLicensingConflict && !isBudgetDisqualified;

    let ineligibleReason: string | undefined;
    if (isLicensingConflict) {
      ineligibleReason = 'Legal terms conflict with creator licensing rights.';
      blendedScore = Math.min(25, blendedScore);
    } else if (isBudgetDisqualified) {
      ineligibleReason = 'Creator rate strictly exceeds hard campaign budget.';
      blendedScore = Math.min(30, blendedScore);
    }

    candidates.push({
      ...match,
      finalScore: blendedScore,
      isEligible,
      ineligibleReason,
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
        conversionSignal,
        outcomeSignalAvailable: outcomeAvailable,
      },
      rankingEngineVersion: RANKING_ENGINE_VERSION
    });
  }

  // 4. Separate Eligible vs Ineligible: Ineligible candidates never outrank eligible ones
  const eligibleCandidates = candidates.filter(c => c.isEligible);
  const ineligibleCandidates = candidates.filter(c => !c.isEligible);

  // Sort eligible candidates by blended score descending
  eligibleCandidates.sort((a, b) => b.finalScore - a.finalScore);
  ineligibleCandidates.sort((a, b) => b.finalScore - a.finalScore);

  // 5. Apply Diversity-Aware MMR & Brand Personalization to Eligible Candidates
  let rerankedEligible: HybridRankedCandidate[] = eligibleCandidates;
  if (options?.enableDiversity !== false && eligibleCandidates.length > 1) {
    const personalized = applyDiversityAndPersonalization(eligibleCandidates, options?.brandContext);
    rerankedEligible = personalized.map((p, idx) => ({
      ...p,
      isEligible: true,
      rank: idx + 1,
      mlFeatures: (p as any).mlFeatures,
      rankingEngineVersion: RANKING_ENGINE_VERSION
    }));
  } else {
    rerankedEligible.forEach((m, idx) => { m.rank = idx + 1; });
  }

  // Ineligible candidates are positioned at the bottom with explicit ranking and flags
  const finalMatches: HybridRankedCandidate[] = [
    ...rerankedEligible,
    ...ineligibleCandidates.map((c, idx) => ({
      ...c,
      rank: rerankedEligible.length + idx + 1
    }))
  ];

  const topEligible = rerankedEligible[0];
  const hasStrong = topEligible ? topEligible.finalScore >= 65 : false;

  return {
    query: baselineRun.query,
    totalEvaluated: creators.length,
    totalEligible: eligibleCandidates.length,
    hasStrongMatch: hasStrong,
    status: hasStrong ? 'STRONG_MATCHES_FOUND' : 'NO_STRONG_MATCH',
    statusExplanation: hasStrong 
      ? `Found ${eligibleCandidates.length} eligible creator match(es) ranked via the Canonical Hybrid ML Pipeline.` 
      : (eligibleCandidates.length === 0 
          ? `No creator can satisfy mandatory campaign constraints. See feedback for adjustments.` 
          : `No creator meets the strong match threshold (>= 65%). Returning nearest candidates.`),
    relaxationSuggestions: baselineRun.relaxationSuggestions,
    rankingEngineVersion: RANKING_ENGINE_VERSION,
    matches: finalMatches
  };
}
