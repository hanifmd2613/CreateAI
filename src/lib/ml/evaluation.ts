import { Creator } from '../../types';
import { executeUniversalBriefMatching } from '../universalMatching';
import { executeHybridMLMatching } from './rankingAdapter';

export interface EvaluationQueryCase {
  query: string;
  category: string;
  groundTruthRelevance: Record<string, number>; // creatorId -> relevance grade (0 - 3)
}

export interface ModelMetricsSummary {
  modelName: string;
  ndcgAt10: number;
  ndcgAt5: number;
  recallAt3: number;
  precisionAt3: number;
  meanReciprocalRank: number;
  catalogCoveragePercent: number;
  avgLatencyMs: number;
}

export interface OfflineEvaluationReport {
  timestamp: string;
  totalQueriesEvaluated: number;
  totalCreatorsCatalog: number;
  baselineMetrics: ModelMetricsSummary;
  hybridMLMetrics: ModelMetricsSummary;
  ndcgImprovementPercent: number;
  winner: string;
  conclusion: string;
}

/**
 * Computes Discounted Cumulative Gain (DCG@K)
 */
function computeDCG(rankedIds: string[], relMap: Record<string, number>, k: number): number {
  let dcg = 0;
  const limit = Math.min(k, rankedIds.length);
  for (let i = 0; i < limit; i++) {
    const id = rankedIds[i];
    const rel = relMap[id] || 0;
    dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
  }
  return dcg;
}

/**
 * Computes Normalized Discounted Cumulative Gain (NDCG@K)
 */
export function computeNDCG(rankedIds: string[], relMap: Record<string, number>, k: number = 10): number {
  const dcg = computeDCG(rankedIds, relMap, k);

  // Compute Ideal DCG (IDCG) by sorting ground-truth relevance descending
  const idealRels = Object.values(relMap).sort((a, b) => b - a);
  let idcg = 0;
  const limit = Math.min(k, idealRels.length);
  for (let i = 0; i < limit; i++) {
    idcg += (Math.pow(2, idealRels[i]) - 1) / Math.log2(i + 2);
  }

  if (idcg === 0) return dcg > 0 ? 1.0 : 1.0; // If no positive ground truth, perfect score
  return Math.min(1.0, Math.max(0.0, dcg / idcg));
}

/**
 * Computes Recall@K
 */
export function computeRecallAtK(rankedIds: string[], relevantIds: Set<string>, k: number = 3): number {
  if (relevantIds.size === 0) return 1.0;
  const topK = rankedIds.slice(0, k);
  let hits = 0;
  for (const id of topK) {
    if (relevantIds.has(id)) hits++;
  }
  return hits / relevantIds.size;
}

/**
 * Computes Precision@K
 */
export function computePrecisionAtK(rankedIds: string[], relevantIds: Set<string>, k: number = 3): number {
  const limit = Math.min(k, rankedIds.length);
  if (limit === 0) return 0;
  let hits = 0;
  for (let i = 0; i < limit; i++) {
    if (relevantIds.has(rankedIds[i])) hits++;
  }
  return hits / limit;
}

/**
 * Computes Mean Reciprocal Rank (MRR)
 */
export function computeMRR(rankedIds: string[], relevantIds: Set<string>): number {
  for (let i = 0; i < rankedIds.length; i++) {
    if (relevantIds.has(rankedIds[i])) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

// 5 Benchmark Validation Queries with verified relevance judgments
export const BENCHMARK_EVAL_CASES: EvaluationQueryCase[] = [
  {
    query: 'Find Telugu-speaking AI creators for a premium skincare launch with 30s vertical 9:16 videos in Hyderabad.',
    category: 'Skincare Regional',
    groundTruthRelevance: { 'creator-6': 3, 'creator-8': 2, 'creator-1': 1, 'creator-2': 0 }
  },
  {
    query: 'B2B enterprise SaaS software cloud platform product commercial video in 16:9.',
    category: 'Enterprise SaaS',
    groundTruthRelevance: { 'creator-1': 3, 'creator-5': 2, 'creator-3': 1 }
  },
  {
    query: 'Generative-AI fantasy RPG game trailer with warrior characters and cinematic photorealistic visuals.',
    category: 'Gaming VFX',
    groundTruthRelevance: { 'creator-3': 3, 'creator-1': 2, 'creator-7': 1 }
  },
  {
    query: 'Luxury horlogerie titanium watch macro photography and product video in 1:1 aspect ratio.',
    category: 'Luxury Product',
    groundTruthRelevance: { 'creator-2': 3, 'creator-7': 2, 'creator-1': 1 }
  },
  {
    query: 'Sustainability documentary campaign on clean solar energy and environmental nature.',
    category: 'Sustainability',
    groundTruthRelevance: { 'creator-1': 3, 'creator-5': 2, 'creator-4': 1 }
  }
];

/**
 * Executes full offline benchmark evaluation comparing Baseline 6-Factor vs Hybrid ML Pipeline.
 */
export async function runOfflineModelEvaluation(
  creators: Creator[],
  cases: EvaluationQueryCase[] = BENCHMARK_EVAL_CASES
): Promise<OfflineEvaluationReport> {
  let baselineTotalNDCG10 = 0;
  let baselineTotalNDCG5 = 0;
  let baselineTotalRecall3 = 0;
  let baselineTotalPrec3 = 0;
  let baselineTotalMRR = 0;
  let baselineLatencySum = 0;
  const baselineSurfacedCreators = new Set<string>();

  let hybridTotalNDCG10 = 0;
  let hybridTotalNDCG5 = 0;
  let hybridTotalRecall3 = 0;
  let hybridTotalPrec3 = 0;
  let hybridTotalMRR = 0;
  let hybridLatencySum = 0;
  const hybridSurfacedCreators = new Set<string>();

  for (const c of cases) {
    const relevantSet = new Set(
      Object.entries(c.groundTruthRelevance)
        .filter(([_, rel]) => rel >= 2)
        .map(([id]) => id)
    );

    // 1. Evaluate Baseline Six-Factor Model
    const t0 = performance.now();
    const baselineRun = executeUniversalBriefMatching(c.query, creators);
    const t1 = performance.now();
    baselineLatencySum += (t1 - t0);

    const baselineIds = baselineRun.matches.map(m => m.creatorId);
    baselineIds.slice(0, 3).forEach(id => baselineSurfacedCreators.add(id));

    baselineTotalNDCG10 += computeNDCG(baselineIds, c.groundTruthRelevance, 10);
    baselineTotalNDCG5 += computeNDCG(baselineIds, c.groundTruthRelevance, 5);
    baselineTotalRecall3 += computeRecallAtK(baselineIds, relevantSet, 3);
    baselineTotalPrec3 += computePrecisionAtK(baselineIds, relevantSet, 3);
    baselineTotalMRR += computeMRR(baselineIds, relevantSet);

    // 2. Evaluate Hybrid ML Pipeline
    const t2 = performance.now();
    const hybridRun = await executeHybridMLMatching(c.query, creators);
    const t3 = performance.now();
    hybridLatencySum += (t3 - t2);

    const hybridIds = hybridRun.matches.map(m => m.creatorId);
    hybridIds.slice(0, 3).forEach(id => hybridSurfacedCreators.add(id));

    hybridTotalNDCG10 += computeNDCG(hybridIds, c.groundTruthRelevance, 10);
    hybridTotalNDCG5 += computeNDCG(hybridIds, c.groundTruthRelevance, 5);
    hybridTotalRecall3 += computeRecallAtK(hybridIds, relevantSet, 3);
    hybridTotalPrec3 += computePrecisionAtK(hybridIds, relevantSet, 3);
    hybridTotalMRR += computeMRR(hybridIds, relevantSet);
  }

  const n = cases.length;
  const totalCatalog = creators.length || 1;

  const baselineSummary: ModelMetricsSummary = {
    modelName: 'baseline-6factor-v2.1',
    ndcgAt10: Number((baselineTotalNDCG10 / n).toFixed(4)),
    ndcgAt5: Number((baselineTotalNDCG5 / n).toFixed(4)),
    recallAt3: Number((baselineTotalRecall3 / n).toFixed(4)),
    precisionAt3: Number((baselineTotalPrec3 / n).toFixed(4)),
    meanReciprocalRank: Number((baselineTotalMRR / n).toFixed(4)),
    catalogCoveragePercent: Number(((baselineSurfacedCreators.size / totalCatalog) * 100).toFixed(1)),
    avgLatencyMs: Number((baselineLatencySum / n).toFixed(2)),
  };

  const hybridSummary: ModelMetricsSummary = {
    modelName: 'gencraft-hybrid-ranker-v1.2',
    ndcgAt10: Number((hybridTotalNDCG10 / n).toFixed(4)),
    ndcgAt5: Number((hybridTotalNDCG5 / n).toFixed(4)),
    recallAt3: Number((hybridTotalRecall3 / n).toFixed(4)),
    precisionAt3: Number((hybridTotalPrec3 / n).toFixed(4)),
    meanReciprocalRank: Number((hybridTotalMRR / n).toFixed(4)),
    catalogCoveragePercent: Number(((hybridSurfacedCreators.size / totalCatalog) * 100).toFixed(1)),
    avgLatencyMs: Number((hybridLatencySum / n).toFixed(2)),
  };

  const ndcgDiff = hybridSummary.ndcgAt10 - baselineSummary.ndcgAt10;
  const improvement = baselineSummary.ndcgAt10 > 0 ? (ndcgDiff / baselineSummary.ndcgAt10) * 100 : 0;

  return {
    timestamp: new Date().toISOString(),
    totalQueriesEvaluated: n,
    totalCreatorsCatalog: totalCatalog,
    baselineMetrics: baselineSummary,
    hybridMLMetrics: hybridSummary,
    ndcgImprovementPercent: Number(improvement.toFixed(2)),
    winner: hybridSummary.ndcgAt10 >= baselineSummary.ndcgAt10 ? hybridSummary.modelName : baselineSummary.modelName,
    conclusion: `Hybrid ML model achieved NDCG@10 of ${hybridSummary.ndcgAt10} (vs ${baselineSummary.ndcgAt10} baseline) with average latency of ${hybridSummary.avgLatencyMs}ms.`
  };
}
