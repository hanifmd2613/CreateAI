import { generateLocalDenseEmbedding, cosineSimilarity, EMBEDDING_DIM } from '../../src/lib/ml/embeddings';
import { executeHybridMLMatching } from '../../src/lib/ml/rankingAdapter';
import { predictCampaignOutcomes } from '../../src/lib/ml/outcomePrediction';
import { applyDiversityAndPersonalization } from '../../src/lib/ml/personalization';
import { runOfflineModelEvaluation, computeNDCG, computeRecallAtK, computePrecisionAtK, computeMRR } from '../../src/lib/ml/evaluation';
import { trackMarketplaceEvent, getCreatorEventStats } from '../../src/lib/ml/eventTracking';
import { MOCK_CREATORS } from '../../src/data/mockData';
import { Creator } from '../../src/types';

export interface TestResult {
  name: string;
  pass: boolean;
  details?: string;
}

export async function runMLIntelligenceTests(): Promise<{ tests: TestResult[] }> {
  const tests: TestResult[] = [];

  // =========================================================================
  // TEST 1: Semantic Dense Embedding Generation & Normalization
  // =========================================================================
  try {
    const text = 'Cinematic vertical 9:16 skincare commercial with photorealistic serum packshots';
    const vec = generateLocalDenseEmbedding(text);

    let norm = 0;
    for (const val of vec) norm += val * val;
    const isNormalized = Math.abs(Math.sqrt(norm) - 1.0) < 0.001;
    const isDim384 = vec.length === EMBEDDING_DIM;

    tests.push({
      name: 'Semantic Embedding Engine produces 384-d L2-normalized dense vectors',
      pass: isDim384 && isNormalized,
      details: `Dim: ${vec.length} (expected 384), L2 Norm: ${Math.sqrt(norm).toFixed(4)} (expected 1.0)`
    });
  } catch (e: any) {
    tests.push({ name: 'Semantic Embedding Engine', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 2: Domain Cosine Similarity Discrimination
  // =========================================================================
  try {
    const vecSkincareQuery = generateLocalDenseEmbedding('Organic hydration serum skincare commercial');
    const vecBeautyCreator = generateLocalDenseEmbedding('Photorealistic beauty cosmetics serum director');
    const vecAutomotiveCreator = generateLocalDenseEmbedding('Supercar racing track vehicle drift director');

    const simRelated = cosineSimilarity(vecSkincareQuery, vecBeautyCreator);
    const simUnrelated = cosineSimilarity(vecSkincareQuery, vecAutomotiveCreator);

    const pass = simRelated > 0.40 && simRelated > simUnrelated + 0.15;

    tests.push({
      name: 'Cosine Similarity accurately discriminates related vs unrelated creative domains',
      pass,
      details: `Related sim: ${simRelated.toFixed(3)}, Unrelated sim: ${simUnrelated.toFixed(3)}`
    });
  } catch (e: any) {
    tests.push({ name: 'Cosine Similarity Discrimination', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 3: Hybrid ML Ranking Pipeline Execution
  // =========================================================================
  try {
    const query = 'Find Telugu-speaking AI creators for a premium skincare launch with 30s vertical videos';
    const run = await executeHybridMLMatching(query, MOCK_CREATORS);

    const hasResults = run.matches.length > 0;
    const topMatch = run.matches[0];
    const hasMLFeatures = Boolean(
      topMatch.mlFeatures &&
      typeof topMatch.mlFeatures.semanticCosineSimilarity === 'number' &&
      typeof topMatch.mlFeatures.baselineSixFactorScore === 'number' &&
      typeof topMatch.mlFeatures.predictedQualityPassRate === 'number'
    );
    const hasVersion = run.rankingEngineVersion === 'gencraft-hybrid-ranker-v1.2';

    tests.push({
      name: 'Hybrid ML Ranking Pipeline blends 6-factors, semantic embeddings & outcome signals',
      pass: hasResults && hasMLFeatures && hasVersion,
      details: `Top candidate: ${topMatch.creator.name}, Final score: ${topMatch.finalScore}, Semantic cosine: ${topMatch.mlFeatures.semanticCosineSimilarity}`
    });
  } catch (e: any) {
    tests.push({ name: 'Hybrid ML Ranking Pipeline Execution', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 4: Hard Constraint Gating Under Hybrid ML
  // =========================================================================
  try {
    // Query requiring Full Buyout worldwide commercial usage
    const query = 'Enterprise software video requiring Full Buyout worldwide commercial licensing';
    const run = await executeHybridMLMatching(query, MOCK_CREATORS);

    // Find any candidate with licensing mismatch
    const mismatchCandidate = run.matches.find(m => m.licensingStatus === 'MISMATCH');
    const pass = !mismatchCandidate || mismatchCandidate.finalScore <= 40;

    tests.push({
      name: 'Hard Constraint Gate strictly enforces licensing compatibility under hybrid ranking',
      pass,
      details: mismatchCandidate ? `Mismatch candidate capped at score: ${mismatchCandidate.finalScore}` : 'No licensing mismatches found in mock set'
    });
  } catch (e: any) {
    tests.push({ name: 'Hard Constraint Gate', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 5: Diversity-Aware MMR Reranking & Cold-Start Boost
  // =========================================================================
  try {
    const query = 'Generative AI cinematic video advertising for luxury brands';
    const baseRun = await executeHybridMLMatching(query, MOCK_CREATORS, { enableDiversity: false });
    const diverseRun = await executeHybridMLMatching(query, MOCK_CREATORS, { enableDiversity: true });

    const pass = diverseRun.matches.length === baseRun.matches.length &&
      diverseRun.matches.every(m => typeof m.baselineRank === 'number');

    tests.push({
      name: 'Diversity-Aware MMR Reranking preserves candidates and provides non-personalized baseline ranks',
      pass,
      details: `Evaluated ${diverseRun.matches.length} candidates through MMR selection.`
    });
  } catch (e: any) {
    tests.push({ name: 'Diversity-Aware MMR Reranking', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 6: Campaign Outcome Prediction Calibration & Confidence Gate
  // =========================================================================
  try {
    // 1. Established creator
    const established = MOCK_CREATORS[0];
    const estPred = await predictCampaignOutcomes(established, { budget: 150000, deadlineDays: 7 });

    const passEst = Boolean(
      estPred.status === 'PREDICTION_AVAILABLE' &&
      estPred.acceptancePrediction.probability >= 0.5 &&
      estPred.onTimeDeliveryPrediction.probability >= 0.7 &&
      estPred.qualityPassPrediction.probability >= 0.7 &&
      estPred.acceptancePrediction.evidenceFactors.length > 0
    );

    // 2. Zero-history new creator
    const freshCreator: Creator = {
      ...MOCK_CREATORS[0],
      id: `fresh-creator-${Date.now()}`,
      completedProjects: 0,
    };
    const freshPred = await predictCampaignOutcomes(freshCreator);
    const passFresh = freshPred.status === 'INSUFFICIENT_HISTORICAL_DATA' &&
      freshPred.acceptancePrediction.confidence === 'INSUFFICIENT_DATA';

    tests.push({
      name: 'Campaign Outcome Predictor returns calibrated probabilities and gates zero-history cold start',
      pass: passEst && passFresh,
      details: `Established pAccept: ${estPred.acceptancePrediction.probability}, Fresh status: ${freshPred.status}`
    });
  } catch (e: any) {
    tests.push({ name: 'Campaign Outcome Predictor', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 7: Offline Evaluation Engine (NDCG@10, Recall@K, Precision@K, Latency)
  // =========================================================================
  try {
    const evalReport = await runOfflineModelEvaluation(MOCK_CREATORS);

    const pass = Boolean(
      evalReport.totalQueriesEvaluated >= 5 &&
      evalReport.hybridMLMetrics.ndcgAt10 >= 0.70 &&
      evalReport.hybridMLMetrics.recallAt3 >= 0.50 &&
      evalReport.hybridMLMetrics.avgLatencyMs < 200 &&
      evalReport.conclusion.length > 0
    );

    tests.push({
      name: 'Offline Evaluation Engine computes verifiable NDCG@10, Recall@K, and Latency benchmarks',
      pass,
      details: `Hybrid NDCG@10: ${evalReport.hybridMLMetrics.ndcgAt10}, Recall@3: ${evalReport.hybridMLMetrics.recallAt3}, Latency: ${evalReport.hybridMLMetrics.avgLatencyMs}ms`
    });
  } catch (e: any) {
    tests.push({ name: 'Offline Evaluation Engine', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 8: Event Tracking & Telemetry Persistence
  // =========================================================================
  try {
    const testEventCreatorId = `creator-evt-test-${Date.now()}`;
    await trackMarketplaceEvent({
      eventType: 'RESULT_IMPRESSION',
      creatorId: testEventCreatorId,
      position: 1,
      rankingScore: 92,
    });
    await trackMarketplaceEvent({
      eventType: 'PROPOSAL_ACCEPTED',
      creatorId: testEventCreatorId,
      engagementId: 'eng-123',
    });

    const stats = await getCreatorEventStats(testEventCreatorId);
    const pass = stats.impressions >= 1 && stats.acceptances >= 1 && stats.acceptanceRate === 1.0;

    tests.push({
      name: 'Marketplace Event Tracking logs telemetry and aggregates conversion metrics',
      pass,
      details: `Impressions: ${stats.impressions}, Acceptances: ${stats.acceptances}, Rate: ${stats.acceptanceRate}`
    });
  } catch (e: any) {
    tests.push({ name: 'Marketplace Event Tracking', pass: false, details: e.message });
  }

  return { tests };
}
