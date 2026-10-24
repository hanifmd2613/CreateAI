import { getPendingActionsForUser } from '../../src/lib/actionResolver';
import { saveEngagement, getEngagements, getEngagementById, updateEngagement } from '../../src/lib/engagementStore';
import { validateEngagementTransition } from '../../src/lib/stateMachine';
import { EngagementRecord } from '../../src/types';

export interface TestResult {
  name: string;
  pass: boolean;
  details?: string;
}

export async function runWorkplaceActionsTests(): Promise<{ tests: TestResult[] }> {
  const tests: TestResult[] = [];

  const brandId = `test-brand-${Date.now()}`;
  const creatorId = `test-creator-${Date.now()}`;
  const unrelatedCreatorId = `test-creator-unrelated-${Date.now()}`;

  // =========================================================================
  // TEST 1: Brand sends no requests: creator sees zero actions
  // =========================================================================
  try {
    const actionsResult = await getPendingActionsForUser(creatorId, 'creator');
    const pass = actionsResult.totalPendingCount === 0 && actionsResult.actions.length === 0;

    tests.push({
      name: 'Creator with no incoming requests sees zero pending actions and empty state',
      pass,
      details: `Count: ${actionsResult.totalPendingCount}, Actions: ${actionsResult.actions.length}`
    });
  } catch (e: any) {
    tests.push({ name: 'Empty workplace actions test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 2: Brand sends genuine proposal: assigned creator sees REVIEW_PROPOSAL
  // =========================================================================
  let createdEngagementId = '';
  try {
    createdEngagementId = `eng-wp-test-${Date.now()}`;
    const newEng: EngagementRecord = {
      id: createdEngagementId,
      brandId,
      brandName: 'Acme Media Labs',
      creatorId,
      creatorName: 'Target Creator',
      projectTitle: 'Automated Skincare Ad Campaign',
      proposedBudget: '₹45,000',
      status: 'CONTACTED',
      licensingStatus: 'COMPATIBLE',
      currentVersionNumber: 0,
      maxRevisions: 2,
      revisionsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveEngagement(newEng);

    const actionsResult = await getPendingActionsForUser(creatorId, 'creator');
    const action = actionsResult.actions.find(a => a.engagementId === createdEngagementId);

    const pass = actionsResult.totalPendingCount >= 1 &&
      action !== undefined &&
      action.actionType === 'REVIEW_PROPOSAL' &&
      action.counterpartyId === brandId &&
      action.authorizedRole === 'creator';

    tests.push({
      name: 'Assigned creator receives authoritative REVIEW_PROPOSAL action for incoming proposal',
      pass,
      details: action ? `Action ID: ${action.id}, Title: ${action.actionTitle}` : 'Action not found'
    });
  } catch (e: any) {
    tests.push({ name: 'Assigned creator proposal test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 3: Unrelated creator does NOT see the proposal
  // =========================================================================
  try {
    const actionsResult = await getPendingActionsForUser(unrelatedCreatorId, 'creator');
    const leak = actionsResult.actions.find(a => a.engagementId === createdEngagementId);

    tests.push({
      name: 'Unrelated creator cannot view or access private action assigned to another creator',
      pass: leak === undefined,
      details: leak ? 'LEAK DETECTED: Action visible to unrelated creator' : 'Strict creator isolation enforced'
    });
  } catch (e: any) {
    tests.push({ name: 'Creator isolation test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 4: Anonymous / unauthenticated caller gets zero actions
  // =========================================================================
  try {
    const actionsResult = await getPendingActionsForUser('', 'creator');
    const pass = actionsResult.totalPendingCount === 0 && actionsResult.actions.length === 0;

    tests.push({
      name: 'Unauthenticated or empty user ID safely resolves to zero actions',
      pass,
      details: `Count: ${actionsResult.totalPendingCount}`
    });
  } catch (e: any) {
    tests.push({ name: 'Unauthenticated visitor test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 5: Creator accepts proposal: proposal decision disappears, brand action emerges
  // =========================================================================
  try {
    const eng = await getEngagementById(createdEngagementId);
    if (!eng) throw new Error('Target engagement not found');

    // Creator validates and transitions to CREATOR_ACCEPTED
    const validation = validateEngagementTransition(eng, 'CREATOR_ACCEPTED', 'creator');
    if (!validation.allowed) throw new Error(validation.error);

    await updateEngagement(createdEngagementId, { status: 'CREATOR_ACCEPTED' });

    // Check creator actions: REVIEW_PROPOSAL must be GONE
    const creatorActions = await getPendingActionsForUser(creatorId, 'creator');
    const proposalActionStillPresent = creatorActions.actions.some(a => a.actionType === 'REVIEW_PROPOSAL');

    // Check brand actions: Brand now has CONFIRM_AGREEMENT action!
    const brandActions = await getPendingActionsForUser(brandId, 'brand');
    const brandAgreementAction = brandActions.actions.find(a =>
      a.engagementId === createdEngagementId && a.actionType === 'CONFIRM_AGREEMENT'
    );

    const pass = !proposalActionStillPresent && brandAgreementAction !== undefined;

    tests.push({
      name: 'Creator acceptance immediately removes decision action and assigns CONFIRM_AGREEMENT to brand',
      pass,
      details: `ProposalActionGone: ${!proposalActionStillPresent}, BrandAgreementAssigned: ${Boolean(brandAgreementAction)}`
    });
  } catch (e: any) {
    tests.push({ name: 'Creator accept action transition', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 6: Creator declines proposal: disappears from all active actions
  // =========================================================================
  try {
    const declinedEngId = `eng-declined-${Date.now()}`;
    const declinedEng: EngagementRecord = {
      id: declinedEngId,
      brandId,
      brandName: 'Acme Media Labs',
      creatorId,
      creatorName: 'Target Creator',
      projectTitle: 'Declined Project',
      proposedBudget: '₹20,000',
      status: 'CONTACTED',
      licensingStatus: 'COMPATIBLE',
      currentVersionNumber: 0,
      maxRevisions: 2,
      revisionsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveEngagement(declinedEng);

    // Validate decline and transition
    const validation = validateEngagementTransition(declinedEng, 'CREATOR_DECLINED', 'creator');
    if (!validation.allowed) throw new Error(validation.error);

    await updateEngagement(declinedEngId, {
      status: 'CREATOR_DECLINED',
      declineReason: 'Budget mismatch for required deliverables'
    });

    const creatorActions = await getPendingActionsForUser(creatorId, 'creator');
    const brandActions = await getPendingActionsForUser(brandId, 'brand');

    const inCreator = creatorActions.actions.some(a => a.engagementId === declinedEngId);
    const inBrand = brandActions.actions.some(a => a.engagementId === declinedEngId);

    tests.push({
      name: 'Declined request enters terminal state and never appears in any pending action queue',
      pass: !inCreator && !inBrand,
      details: `Present in creator: ${inCreator}, Present in brand: ${inBrand}`
    });
  } catch (e: any) {
    tests.push({ name: 'Creator decline action test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 7: Role boundary: Brand cannot see creator-specific actions and vice versa
  // =========================================================================
  try {
    // Create an engagement in DRAFT_SUBMITTED stage (waiting for brand review)
    const reviewEngId = `eng-review-${Date.now()}`;
    const reviewEng: EngagementRecord = {
      id: reviewEngId,
      brandId,
      brandName: 'Acme Media Labs',
      creatorId,
      creatorName: 'Target Creator',
      projectTitle: 'Draft Review Test',
      proposedBudget: '₹30,000',
      status: 'DRAFT_SUBMITTED',
      licensingStatus: 'COMPATIBLE',
      currentVersionNumber: 1,
      maxRevisions: 2,
      revisionsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveEngagement(reviewEng);

    const brandActions = await getPendingActionsForUser(brandId, 'brand');
    const creatorActions = await getPendingActionsForUser(creatorId, 'creator');

    const brandAction = brandActions.actions.find(a => a.engagementId === reviewEngId && a.actionType === 'REVIEW_DRAFT');
    const creatorSeesReview = creatorActions.actions.some(a => a.engagementId === reviewEngId && a.actionType === 'REVIEW_DRAFT');

    const pass = brandAction !== undefined && !creatorSeesReview;

    tests.push({
      name: 'Strict Role Guard: Brand action (REVIEW_DRAFT) never appears in creator pending queue',
      pass,
      details: `Brand has action: ${Boolean(brandAction)}, Creator sees action: ${creatorSeesReview}`
    });
  } catch (e: any) {
    tests.push({ name: 'Role boundary test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 8: Terminal states (COMPLETED, CANCELLED) produce zero actions
  // =========================================================================
  try {
    const completedEngId = `eng-completed-${Date.now()}`;
    const completedEng: EngagementRecord = {
      id: completedEngId,
      brandId,
      brandName: 'Acme Media Labs',
      creatorId,
      creatorName: 'Target Creator',
      projectTitle: 'Completed Project',
      proposedBudget: '₹50,000',
      status: 'COMPLETED',
      licensingStatus: 'COMPATIBLE',
      currentVersionNumber: 2,
      maxRevisions: 2,
      revisionsUsed: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveEngagement(completedEng);

    const brandActions = await getPendingActionsForUser(brandId, 'brand');
    const creatorActions = await getPendingActionsForUser(creatorId, 'creator');

    const inBrand = brandActions.actions.some(a => a.engagementId === completedEngId);
    const inCreator = creatorActions.actions.some(a => a.engagementId === completedEngId);

    tests.push({
      name: 'Completed engagements strictly produce zero actions for both participants',
      pass: !inBrand && !inCreator,
      details: `In brand: ${inBrand}, In creator: ${inCreator}`
    });
  } catch (e: any) {
    tests.push({ name: 'Terminal state test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 9: Refreshing or repeatedly querying preserves deterministic consistency
  // =========================================================================
  try {
    const run1 = await getPendingActionsForUser(brandId, 'brand');
    const run2 = await getPendingActionsForUser(brandId, 'brand');

    const pass = run1.totalPendingCount === run2.totalPendingCount &&
      run1.actions.length === run2.actions.length &&
      run1.actions.every((a, idx) => a.id === run2.actions[idx].id);

    tests.push({
      name: 'Workplace pending actions resolution is deterministic and stable across page refreshes',
      pass,
      details: `Run 1: ${run1.totalPendingCount} actions, Run 2: ${run2.totalPendingCount} actions`
    });
  } catch (e: any) {
    tests.push({ name: 'Deterministic consistency test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 10: Deduplication: No duplicate cards for the same canonical entity & action
  // =========================================================================
  try {
    const brandActions = await getPendingActionsForUser(brandId, 'brand');
    const actionIds = brandActions.actions.map(a => a.id);
    const uniqueIds = new Set(actionIds);

    const pass = actionIds.length === uniqueIds.size;

    tests.push({
      name: 'Action resolver guarantees zero duplicate action items in pending queue',
      pass,
      details: `Total items: ${actionIds.length}, Unique IDs: ${uniqueIds.size}`
    });
  } catch (e: any) {
    tests.push({ name: 'Action deduplication test', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 11: Concurrent / Repeated Proposal Decision Protection
  // =========================================================================
  try {
    const doubleEngId = `eng-double-${Date.now()}`;
    const doubleEng: EngagementRecord = {
      id: doubleEngId,
      brandId,
      brandName: 'Acme Media Labs',
      creatorId,
      creatorName: 'Target Creator',
      projectTitle: 'Double Accept Test',
      proposedBudget: '₹25,000',
      status: 'CONTACTED',
      licensingStatus: 'COMPATIBLE',
      currentVersionNumber: 0,
      maxRevisions: 2,
      revisionsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveEngagement(doubleEng);

    // First transition: ACCEPT
    const val1 = validateEngagementTransition(doubleEng, 'CREATOR_ACCEPTED', 'creator');
    await updateEngagement(doubleEngId, { status: 'CREATOR_ACCEPTED' });

    // Second transition attempt: DECLINE on already accepted engagement
    const updatedEng = (await getEngagementById(doubleEngId))!;
    const val2 = validateEngagementTransition(updatedEng, 'CREATOR_DECLINED', 'creator');

    // val2 must be rejected because once accepted, it cannot be declined
    const pass = val1.allowed === true && val2.allowed === false;

    tests.push({
      name: 'Concurrent / conflicting decisions cannot resolve the same request inconsistently',
      pass,
      details: `First Accept allowed: ${val1.allowed}, Subsequent Decline blocked: ${!val2.allowed}`
    });
  } catch (e: any) {
    tests.push({ name: 'Concurrent / Repeated Proposal Decision Protection', pass: false, details: e.message });
  }

  // =========================================================================
  // TEST 12: Database Error & Missing Record Resilience
  // =========================================================================
  try {
    // Non-existent user query
    const ghostRes = await getPendingActionsForUser('ghost-user-9999', 'creator');
    const pass = ghostRes.totalPendingCount === 0 && ghostRes.actions.length === 0;

    tests.push({
      name: 'Database resilience: Missing or empty user records produce clean zero actions and never fabricate cards',
      pass,
      details: `Count: ${ghostRes.totalPendingCount}`
    });
  } catch (e: any) {
    tests.push({ name: 'Database Error & Missing Record Resilience', pass: false, details: e.message });
  }

  return { tests };
}
