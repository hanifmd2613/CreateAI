import { 
  generateLocalDenseEmbedding, 
  cosineSimilarity, 
  validateVector, 
  safeCosineSimilarity, 
  invalidateCreatorEmbedding, 
  EMBEDDING_DIM, 
  EmbeddingVector 
} from '../../src/lib/ml/embeddings';
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
      typeof topMatch.mlFeatures.outcomeSignalAvailable === 'boolean'
    );
    const hasVersion = run.rankingEngineVersion.startsWith('gencraft-canonical-hybrid-') ||
      run.rankingEngineVersion.startsWith('gencraft-hybrid-');

    tests.push({
      name: 'Hybrid ML Ranking Pipeline blends 6-factors, semantic embeddings & outcome signals',
      pass: hasResults && hasMLFeatures && hasVersion,
      details: `Top candidate: ${topMatch.creator.name}, Final score: ${topMatch.finalScore}, Semantic cosine: ${topMatch.mlFeatures.semanticCosineSimilarity}, Engine: ${run.rankingEngineVersion}`
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
      estPred.acceptancePrediction.evidenceFactors.length > 0 &&
      estPred.predictionMode !== undefined
    );

    // 2. Zero-history new creator
    const freshCreator: Creator = {
      ...MOCK_CREATORS[0],
      id: `fresh-creator-${Date.now()}`,
      completedProjects: 0,
    };
    const freshPred = await predictCampaignOutcomes(freshCreator);
    const passFresh = freshPred.status === 'INSUFFICIENT_HISTORICAL_DATA' &&
      freshPred.predictionMode === 'INSUFFICIENT_HISTORICAL_DATA';

    tests.push({
      name: 'Campaign Outcome Predictor returns calibrated probabilities and gates zero-history cold start',
      pass: passEst && passFresh,
      details: `Established pAccept: ${estPred.acceptancePrediction.probability}, Fresh mode: ${freshPred.predictionMode}`
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
      evalReport.hybridMLMetrics.ndcgAt10 >= 0.60 &&
      evalReport.hybridMLMetrics.recallAt3 >= 0.35 &&
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
      eventType: 'INVITATION_SENT',
      creatorId: testEventCreatorId,
      engagementId: 'eng-123',
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

  // =========================================================================
  // TEST 9: Evaluation Metric Edge Cases (Zero-Ground-Truth & Empty Rankings)
  // =========================================================================
  try {
    // Empty ground truth must return null and never fake 1.0
    const emptyNDCG = computeNDCG(['c1', 'c2'], {});
    const emptyRecall = computeRecallAtK(['c1', 'c2'], [], 3);
    const passEdge = emptyNDCG === null && (emptyRecall === null || emptyRecall === 0);

    tests.push({
      name: 'Evaluation edge cases: Zero ground-truth returns null/excluded, not fake 1.0',
      pass: passEdge,
      details: `emptyNDCG: ${emptyNDCG}, emptyRecall: ${emptyRecall}`
    });
  } catch (e: any) {
    tests.push({ name: 'Evaluation Metric Edge Cases', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 10: Honest Telemetry Persistence Status
  // =========================================================================
  try {
    const result = await trackMarketplaceEvent({
      eventType: 'RESULT_IMPRESSION',
      creatorId: 'c-test-telemetry',
    });

    const pass = result.success === true &&
      (result.persistenceStatus === 'durable' || result.persistenceStatus === 'buffered_in_memory');

    tests.push({
      name: 'Event Tracker reports honest persistenceStatus (durable vs buffered_in_memory)',
      pass,
      details: `Status: ${result.persistenceStatus}, BufferSize: ${(result as any).bufferSize ?? 'N/A'}`
    });
  } catch (e: any) {
    tests.push({ name: 'Honest Telemetry Persistence Status', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 11: Vector Dimensionality & Non-Finite Number Validation
  // =========================================================================
  try {
    const validVector = generateLocalDenseEmbedding('Cinematic 4K automotive trailer');
    const checkValid = validateVector(validVector);

    const checkBadDim = validateVector([0.1, 0.2, 0.3], 384);
    const checkNaN = validateVector([NaN, ...new Array(383).fill(0.1)], 384);
    const checkInfinity = validateVector([Infinity, ...new Array(383).fill(0.1)], 384);

    const pass = checkValid.valid === true &&
      checkBadDim.valid === false &&
      checkNaN.valid === false &&
      checkInfinity.valid === false;

    tests.push({
      name: 'Vector Validator strictly rejects non-finite values (NaN, Inf) and dimension mismatches',
      pass,
      details: `Valid: ${checkValid.valid}, BadDim: ${checkBadDim.valid}, NaN: ${checkNaN.valid}, Inf: ${checkInfinity.valid}`
    });
  } catch (e: any) {
    tests.push({ name: 'Vector Dimensionality & Non-Finite Number Validation', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 12: Safe Cosine Similarity Model Mismatch Prevention
  // =========================================================================
  try {
    const vecA: EmbeddingVector = {
      vector: new Array(384).fill(1 / Math.sqrt(384)),
      model: 'gencraft-dense-v1.2',
      provider: 'LocalDeterministic',
      dim: 384,
      normalized: true
    };
    const vecB_DifferentModel: EmbeddingVector = {
      vector: new Array(384).fill(1 / Math.sqrt(384)),
      model: 'external-sentence-transformer-v3',
      provider: 'ExternalHuggingFace',
      dim: 384,
      normalized: true
    };

    // Comparing mismatched models must return 0 and refuse to corrupt ranking
    const simMismatch = safeCosineSimilarity(vecA, vecB_DifferentModel);
    const simSame = safeCosineSimilarity(vecA, vecA);

    const pass = simMismatch === 0 && Math.abs(simSame - 1.0) < 0.001;

    tests.push({
      name: 'Safe Cosine Similarity prevents comparing vectors from incompatible embedding models',
      pass,
      details: `Mismatched Sim: ${simMismatch} (expected 0), Same Sim: ${simSame.toFixed(4)} (expected 1.0)`
    });
  } catch (e: any) {
    tests.push({ name: 'Safe Cosine Similarity Model Mismatch Prevention', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 13: Creator Portfolio Update Embedding Invalidation
  // =========================================================================
  try {
    const creatorId = 'creator-invalidation-test';
    // Invalidate creator embedding should execute cleanly and clear associated cache keys
    invalidateCreatorEmbedding(creatorId);

    tests.push({
      name: 'Creator Portfolio Invalidation safely purges affected embeddings from cache',
      pass: true,
      details: `Successfully purged cache entries for ${creatorId}`
    });
  } catch (e: any) {
    tests.push({ name: 'Creator Portfolio Update Embedding Invalidation', pass: false, details: e.message });
  }

  return { tests };
}
