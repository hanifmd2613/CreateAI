import { atomicTransitionEngagement, getEngagementById, saveEngagement } from '../../src/lib/engagementStore';
import { generateText, generateStructuredBrief } from '../../src/lib/ai/provider';
import { EngagementRecord } from '../../src/types';

export async function runBackendReliabilityTests(): Promise<void> {
  console.log('\n--- 11. BACKEND RELIABILITY, CONCURRENCY & PERSISTENCE TESTS ---');

  // TEST 1: Atomic Transition and State Machine Update on isolated proposal
  const testId = `eng-atomic-test-${Date.now()}`;
  const now = new Date().toISOString();
  const testEngagement: EngagementRecord = {
    id: testId,
    briefId: 'brief-atomic-test',
    brandId: 'brand-test',
    brandName: 'Test Brand Studios',
    creatorId: 'creator-1',
    creatorName: 'Karthik Subramanian',
    projectTitle: 'Atomic Concurrency Verification Spot',
    proposedBudget: '₹4,00,000',
    status: 'CONTACTED',
    licensingStatus: 'COMPATIBLE',
    message: 'Testing atomic conditional database updates.',
    milestones: [],
    currentVersionNumber: 0,
    maxRevisions: 2,
    revisionsUsed: 0,
    createdAt: now,
    updatedAt: now,
  };

  await saveEngagement(testEngagement);

  {
    // Atomic transition from CONTACTED to CREATOR_ACCEPTED
    const res = await atomicTransitionEngagement(testId, 'CONTACTED', 'CREATOR_ACCEPTED', {
      message: 'Automated atomic transition test'
    });

    if (!res.success || res.engagement?.status !== 'CREATOR_ACCEPTED') {
      throw new Error(`Test 1 Failed: Expected atomic transition to CREATOR_ACCEPTED, got: ${JSON.stringify(res)}`);
    }

    // Verify persisted state
    const after = await getEngagementById(testId);
    if (after?.status !== 'CREATOR_ACCEPTED') {
      throw new Error(`Test 1 Failed: Persisted engagement status is "${after?.status}", expected "CREATOR_ACCEPTED".`);
    }
    console.log('  ✅ [PASS] Atomic State Transition: State updated atomically to CREATOR_ACCEPTED and verified.');
  }

  // TEST 2: Optimistic Concurrency Conflict Detection
  {
    // Attempting transition expecting 'CONTACTED' when the engagement is already in 'CREATOR_ACCEPTED'
    const conflictRes = await atomicTransitionEngagement(testId, 'CONTACTED', 'CREATOR_DECLINED');
    if (conflictRes.success) {
      throw new Error('Test 2 Failed: Stale transition with invalid expectedStatus was falsely permitted!');
    }
    if (!conflictRes.error?.includes('Concurrency conflict')) {
      throw new Error(`Test 2 Failed: Expected Concurrency conflict error, got: ${conflictRes.error}`);
    }
    console.log('  ✅ [PASS] Concurrency Protection: Stale conditional transition was strictly rejected with conflict error.');
  }

  // TEST 3: AI Provider Layer Fallback & Outage Resilience
  {
    // Calling generateStructuredBrief without external keys triggers the local deterministic engine cleanly
    const result = await generateStructuredBrief({
      prompt: '30-second vertical neon cybersecurity commercial for fintech app',
      provider: 'fallback',
    });

    if (!result.success || !result.brief || !result.brief.title) {
      throw new Error('Test 3 Failed: AI provider fallback returned invalid structure.');
    }
    if (result.provider !== 'gencraft-neural-engine') {
      throw new Error(`Test 3 Failed: Expected provider "gencraft-neural-engine", got "${result.provider}"`);
    }
    console.log(`  ✅ [PASS] AI Provider Resilience: Graceful synthesis via "${result.provider}" with title "${result.brief.title}".`);
  }

  // TEST 4: Text Generation Timeout Guard
  {
    const textRes = await generateText('Hello world', { timeoutMs: 5000 });
    if (!textRes.text) {
      throw new Error('Test 4 Failed: generateText returned empty string.');
    }
    console.log(`  ✅ [PASS] AI Text Generation: Succeeded via provider "${textRes.provider}".`);
  }
}
