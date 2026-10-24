import { Creator } from '../../types';
import { executeUniversalBriefMatching } from '../universalMatching';
import { executeHybridMLMatching } from './rankingAdapter';

export const BENCHMARK_VERSION = 'bench-eval-v2.2';

export interface EvaluationQueryCase {
  id: string;
  query: string;
  category: string;
  groundTruthRelevance: Record<string, number>; // creatorId -> relevance grade (0 - 3)
  description?: string;
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
  validQueriesCount: number;
  excludedQueriesCount: number;
}

export interface OfflineEvaluationReport {
  timestamp: string;
  benchmarkVersion: string;
  totalQueriesEvaluated: number;
  validQueriesEvaluated: number;
  excludedQueriesCount: number;
  totalCreatorsCatalog: number;
  baselineMetrics: ModelMetricsSummary;
  hybridMLMetrics: ModelMetricsSummary;
  ndcgImprovementPercent: number;
  winner: string;
  conclusion: string;
  measurementConditions: {
    environment: string;
    runsPerQuery: number;
    warmupRuns: number;
  };
}

/**
 * Computes Discounted Cumulative Gain (DCG@K)
 */
export function computeDCG(rankedIds: string[], relMap: Record<string, number>, k: number): number {
  if (!Array.isArray(rankedIds) || rankedIds.length === 0 || k <= 0 || !relMap) {
    return 0;
  }

  let dcg = 0;
  const limit = Math.min(k, rankedIds.length);
  for (let i = 0; i < limit; i++) {
    const id = rankedIds[i];
    const rel = relMap[id] || 0;
    if (typeof rel === 'number' && rel > 0 && Number.isFinite(rel)) {
      dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
    }
  }
  return dcg;
}

/**
 * Computes Normalized Discounted Cumulative Gain (NDCG@K)
 * Policy for empty ground truth:
 * If IDCG === 0 (no positive relevance labels defined for this query),
 * returns null / undefined so the caller can exclude it rather than claiming false perfection (1.0).
 */
export function computeNDCG(rankedIds: string[], relMap: Record<string, number>, k: number = 10): number | null {
  if (!relMap || Object.keys(relMap).length === 0) {
    return null; // Excluded query: no relevance judgments
  }

  // Compute Ideal DCG (IDCG) by sorting positive ground-truth relevance descending
  const idealRels = Object.values(relMap)
    .filter(r => typeof r === 'number' && r > 0 && Number.isFinite(r))
    .sort((a, b) => b - a);

  if (idealRels.length === 0) {
    return null; // Excluded: no positive relevant items exist
  }

  let idcg = 0;
  const limit = Math.min(k, idealRels.length);
  for (let i = 0; i < limit; i++) {
    idcg += (Math.pow(2, idealRels[i]) - 1) / Math.log2(i + 2);
  }

  if (idcg === 0) return null;

  const dcg = computeDCG(rankedIds, relMap, k);
  const ndcg = dcg / idcg;
  return Math.min(1.0, Math.max(0.0, Number.isFinite(ndcg) ? ndcg : 0.0));
}

/**
 * Computes Recall@K
 * If relevantIds is empty, returns null to exclude rather than returning false perfection (1.0).
 */
export function computeRecallAtK(rankedIds: string[], relevantIds: Set<string> | string[], k: number = 3): number | null {
  const relSet = relevantIds instanceof Set ? relevantIds : new Set(relevantIds || []);
  if (!relSet || relSet.size === 0) {
    return null; // Excluded from recall computation
  }
  if (!Array.isArray(rankedIds) || rankedIds.length === 0 || k <= 0) {
    return 0;
  }

  const topK = rankedIds.slice(0, k);
  let hits = 0;
  for (const id of topK) {
    if (relSet.has(id)) hits++;
  }
  return Number((hits / relSet.size).toFixed(4));
}

/**
 * Computes Precision@K
 */
export function computePrecisionAtK(rankedIds: string[], relevantIds: Set<string> | string[], k: number = 3): number {
  const relSet = relevantIds instanceof Set ? relevantIds : new Set(relevantIds || []);
  if (!Array.isArray(rankedIds) || rankedIds.length === 0 || k <= 0 || !relSet || relSet.size === 0) {
    return 0;
  }

  const topK = rankedIds.slice(0, k);
  let hits = 0;
  for (const id of topK) {
    if (relSet.has(id)) hits++;
  }
  return Number((hits / topK.length).toFixed(4));
}

/**
 * Computes Mean Reciprocal Rank (MRR)
 */
export function computeMRR(rankedIds: string[], relevantIds: Set<string>): number {
  if (!Array.isArray(rankedIds) || rankedIds.length === 0 || !relevantIds || relevantIds.size === 0) {
    return 0;
  }

  for (let i = 0; i < rankedIds.length; i++) {
    if (relevantIds.has(rankedIds[i])) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

/**
 * Curated, Multi-Domain Benchmark Queries (v2.2)
 * Includes natural language briefs, regional campaigns, tool requirements,
 * edge-case cold start creators, and licensing constraint checks.
 */
export const EVALUATION_BENCHMARK_SUITE: EvaluationQueryCase[] = [
  {
    id: 'case-1-skincare',
    query: 'Need a vertical 9:16 video creator in Hyderabad/Bengaluru for organic ayurvedic skincare brand launch. Clean pastel aesthetic, female creator preferred, certified pipeline.',
    category: 'Skincare & Cosmetics',
    groundTruthRelevance: {
      'creator-3': 3, // Meera Krishnan (Hyderabad, organic skincare)
      'creator-2': 1, // Ananya Nair (Stylized anime/fantasy, partial)
      'creator-1': 1, // Karthik Subramanian (Automotive/commercials)
    },
    description: 'Regional language and product category alignment.'
  },
  {
    id: 'case-2-saas',
    query: 'B2B enterprise SaaS cloud security commercial. 16:9 widescreen format, high-tech abstract data streams, motion design in Veo or Kling.',
    category: 'Enterprise SaaS',
    groundTruthRelevance: {
      'creator-1': 3, // Karthik Subramanian (Certified Veo/Kling commercial director)
      'creator-4': 2, // Rohan Sharma (3D/VFX photorealism)
      'creator-3': 0,
    },
    description: 'B2B commercial storytelling with certified AI video tools.'
  },
  {
    id: 'case-3-anime',
    query: 'Dark fantasy video game trailer with stylized cel-shaded character motion, mythical beasts, and cinematic battle choreography.',
    category: 'Gaming & Anime',
    groundTruthRelevance: {
      'creator-2': 3, // Ananya Nair (Dark fantasy/mythological anime specialist)
      'creator-1': 1,
      'creator-4': 1,
    },
    description: 'Stylized aesthetic and genre-specific visual effects.'
  },
  {
    id: 'case-4-luxury',
    query: 'Macro horology watch commercial showcasing titanium bezel, sapphire crystal reflections, and precision micro-mechanical movement.',
    category: 'Luxury Goods',
    groundTruthRelevance: {
      'creator-4': 3, // Rohan Sharma (Macro product visualization & horology portfolio)
      'creator-1': 1,
      'creator-2': 0,
    },
    description: 'Macro photorealism and luxury physical material rendering.'
  },
  {
    id: 'case-5-sustainability',
    query: 'Documentary on Western Ghats reforestation and renewable solar microgrids. Cinematic slow motion and authentic color grade.',
    category: 'Sustainability',
    groundTruthRelevance: {
      'creator-1': 3, // Karthik Subramanian (Documentary & narrative pacing)
      'creator-3': 2, // Meera Krishnan (Nature/eco aesthetic)
      'creator-4': 0,
    },
    description: 'Nature documentary realism and color grading.'
  },
  {
    id: 'case-6-unseen-niche',
    query: 'Retro 1980s synthwave laser-grid arcade promotional trailer with CRT phosphor glow and neon wireframes.',
    category: 'Unseen Aesthetic',
    groundTruthRelevance: {
      'creator-2': 2, // Ananya Nair (Cyberpunk/synthwave styling)
      'creator-4': 2, // Rohan Sharma (Neon/VFX)
    },
    description: 'Unseen niche prompt with sparse lexical match.'
  },
  {
    id: 'case-7-licensing-filter',
    query: 'Worldwide commercial TV broadcast campaign requiring Category Exclusive rights and full derivative usage.',
    category: 'Licensing Constraints',
    groundTruthRelevance: {
      'creator-1': 3, // Karthik Subramanian (Worldwide commercial rights)
      'creator-4': 2, // Rohan Sharma
    },
    description: 'Evaluates hard licensing gate compatibility.'
  }
];

/**
 * Runs full offline recommendation evaluation comparing Baseline vs. Hybrid ML Ranker.
 */
export async function runOfflineRecommendationEvaluation(
  creators: Creator[],
  benchmarkSuite: EvaluationQueryCase[] = EVALUATION_BENCHMARK_SUITE
): Promise<OfflineEvaluationReport> {
  const timestamp = new Date().toISOString();

  // Metrics accumulators for Baseline
  const baseNDCG10: number[] = [];
  const baseNDCG5: number[] = [];
  const baseRecall3: number[] = [];
  const basePrec3: number[] = [];
  const baseMRR: number[] = [];
  const baseCovered = new Set<string>();
  let baseTotalLatency = 0;

  // Metrics accumulators for Hybrid ML
  const hybridNDCG10: number[] = [];
  const hybridNDCG5: number[] = [];
  const hybridRecall3: number[] = [];
  const hybridPrec3: number[] = [];
  const hybridMRR: number[] = [];
  const hybridCovered = new Set<string>();
  let hybridTotalLatency = 0;

  let validQueriesCount = 0;
  let excludedQueriesCount = 0;

  for (const testCase of benchmarkSuite) {
    const relMap = testCase.groundTruthRelevance;
    const relevantIds = new Set(
      Object.entries(relMap)
        .filter(([_, rel]) => rel >= 2)
        .map(([id]) => id)
    );

    // 1. Evaluate Baseline Model
    const t0 = performance.now();
    const baseRun = executeUniversalBriefMatching(testCase.query, creators);
    const t1 = performance.now();
    baseTotalLatency += (t1 - t0);

    const baseRankedIds = baseRun.matches.map(m => m.creator.id);
    baseRankedIds.slice(0, 3).forEach(id => baseCovered.add(id));

    // 2. Evaluate Hybrid ML Model
    const t2 = performance.now();
    const hybridRun = await executeHybridMLMatching(testCase.query, creators, { enableDiversity: true });
    const t3 = performance.now();
    hybridTotalLatency += (t3 - t2);

    const hybridRankedIds = hybridRun.matches.map(m => m.creator.id);
    hybridRankedIds.slice(0, 3).forEach(id => hybridCovered.add(id));

    // Compute NDCG
    const bNDCG10 = computeNDCG(baseRankedIds, relMap, 10);
    const hNDCG10 = computeNDCG(hybridRankedIds, relMap, 10);
    const bNDCG5 = computeNDCG(baseRankedIds, relMap, 5);
    const hNDCG5 = computeNDCG(hybridRankedIds, relMap, 5);

    if (bNDCG10 !== null && hNDCG10 !== null) {
      baseNDCG10.push(bNDCG10);
      hybridNDCG10.push(hNDCG10);
      validQueriesCount++;
    } else {
      excludedQueriesCount++;
    }

    if (bNDCG5 !== null && hNDCG5 !== null) {
      baseNDCG5.push(bNDCG5);
      hybridNDCG5.push(hNDCG5);
    }

    // Compute Recall & Precision
    const bRec = computeRecallAtK(baseRankedIds, relevantIds, 3);
    const hRec = computeRecallAtK(hybridRankedIds, relevantIds, 3);
    if (bRec !== null && hRec !== null) {
      baseRecall3.push(bRec);
      hybridRecall3.push(hRec);
    }

    basePrec3.push(computePrecisionAtK(baseRankedIds, relevantIds, 3));
    hybridPrec3.push(computePrecisionAtK(hybridRankedIds, relevantIds, 3));

    // Compute MRR
    baseMRR.push(computeMRR(baseRankedIds, relevantIds));
    hybridMRR.push(computeMRR(hybridRankedIds, relevantIds));
  }

  const avg = (arr: number[]) => arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4)) : 0;

  const totalCatalog = creators.length || 1;

  const baselineSummary: ModelMetricsSummary = {
    modelName: 'baseline-6factor-v2.1',
    ndcgAt10: avg(baseNDCG10),
    ndcgAt5: avg(baseNDCG5),
    recallAt3: avg(baseRecall3),
    precisionAt3: avg(basePrec3),
    meanReciprocalRank: avg(baseMRR),
    catalogCoveragePercent: Number(((baseCovered.size / totalCatalog) * 100).toFixed(1)),
    avgLatencyMs: Number((baseTotalLatency / benchmarkSuite.length).toFixed(2)),
    validQueriesCount,
    excludedQueriesCount,
  };

  const hybridSummary: ModelMetricsSummary = {
    modelName: 'gencraft-canonical-hybrid-v2.2',
    ndcgAt10: avg(hybridNDCG10),
    ndcgAt5: avg(hybridNDCG5),
    recallAt3: avg(hybridRecall3),
    precisionAt3: avg(hybridPrec3),
    meanReciprocalRank: avg(hybridMRR),
    catalogCoveragePercent: Number(((hybridCovered.size / totalCatalog) * 100).toFixed(1)),
    avgLatencyMs: Number((hybridTotalLatency / benchmarkSuite.length).toFixed(2)),
    validQueriesCount,
    excludedQueriesCount,
  };

  const deltaNDCG = baselineSummary.ndcgAt10 > 0
    ? Number((((hybridSummary.ndcgAt10 - baselineSummary.ndcgAt10) / baselineSummary.ndcgAt10) * 100).toFixed(2))
    : 0;

  const winner = hybridSummary.ndcgAt10 >= baselineSummary.ndcgAt10
    ? hybridSummary.modelName
    : baselineSummary.modelName;

  const conclusion = `Evaluated ${benchmarkSuite.length} benchmark queries across ${totalCatalog} creators. Canonical Hybrid ML model achieved NDCG@10 of ${hybridSummary.ndcgAt10} (vs ${baselineSummary.ndcgAt10} baseline) with average latency of ${hybridSummary.avgLatencyMs}ms.`;

  return {
    timestamp,
    benchmarkVersion: BENCHMARK_VERSION,
    totalQueriesEvaluated: benchmarkSuite.length,
    validQueriesEvaluated: validQueriesCount,
    excludedQueriesCount,
    totalCreatorsCatalog: totalCatalog,
    baselineMetrics: baselineSummary,
    hybridMLMetrics: hybridSummary,
    ndcgImprovementPercent: deltaNDCG,
    winner,
    conclusion,
    measurementConditions: {
      environment: typeof process !== 'undefined' ? `${process.platform}-${process.arch}` : 'node-runtime',
      runsPerQuery: 1,
      warmupRuns: 0,
    }
  };
}

/**
  * Backward-compatible alias for existing tests and routes
  */
export const runOfflineModelEvaluation = runOfflineRecommendationEvaluation;

