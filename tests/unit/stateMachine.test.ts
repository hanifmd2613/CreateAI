import { validateStateTransition, normalizeEngagementStatus, VALID_TRANSITIONS } from '../../src/lib/stateMachine';
import { EngagementStatus, UserRole } from '../../src/types';

export function runStateMachineUnitTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Subtest 1: Legitimate brand commissioning transitions
  try {
    const t1 = validateStateTransition('DISCOVERY', 'SHORTLISTED', 'brand');
    if (!t1.valid) throw new Error(`DISCOVERY -> SHORTLISTED failed: ${t1.reason}`);

    const t2 = validateStateTransition('SHORTLISTED', 'CONTACTED', 'brand');
    if (!t2.valid) throw new Error(`SHORTLISTED -> CONTACTED failed: ${t2.reason}`);

    results.push({ name: 'Valid engagement state progression succeeds for authorized brand actor', passed: true });
  } catch (err: any) {
    results.push({ name: 'Valid engagement state progression succeeds for authorized brand actor', passed: false, message: err.message });
  }

  // Subtest 2: Creator acceptance and decline
  try {
    const tAccept = validateStateTransition('CONTACTED', 'CREATOR_ACCEPTED', 'creator');
    if (!tAccept.valid) throw new Error(`CONTACTED -> CREATOR_ACCEPTED failed: ${tAccept.reason}`);

    const tDecline = validateStateTransition('CONTACTED', 'CREATOR_DECLINED', 'creator');
    if (!tDecline.valid) throw new Error(`CONTACTED -> CREATOR_DECLINED failed: ${tDecline.reason}`);

    results.push({ name: 'Creator can accept or decline engagement requests when in CONTACTED state', passed: true });
  } catch (err: any) {
    results.push({ name: 'Creator can accept or decline engagement requests when in CONTACTED state', passed: false, message: err.message });
  }

  // Subtest 3: Role guard enforcement
  try {
    // Creator cannot approve delivery
    const invalidActor = validateStateTransition('FINAL_REVIEW', 'DELIVERY_APPROVED', 'creator');
    if (invalidActor.valid) {
      throw new Error('Creator was erroneously allowed to approve final delivery');
    }

    // Brand cannot submit creator draft
    const brandDraft = validateStateTransition('IN_PRODUCTION', 'DRAFT_SUBMITTED', 'brand');
    if (brandDraft.valid) {
      throw new Error('Brand was erroneously allowed to submit draft on behalf of creator');
    }

    results.push({ name: 'Role-based access guard blocks unauthorized actor from triggering restricted transitions', passed: true });
  } catch (err: any) {
    results.push({ name: 'Role-based access guard blocks unauthorized actor from triggering restricted transitions', passed: false, message: err.message });
  }

  // Subtest 4: Illegal state jumps rejected
  try {
    const jump = validateStateTransition('DISCOVERY', 'COMPLETED', 'brand');
    if (jump.valid) {
      throw new Error('Illegal state jump from DISCOVERY straight to COMPLETED was permitted');
    }
    results.push({ name: 'Arbitrary and illegal state skipping is strictly rejected by FSM', passed: true });
  } catch (err: any) {
    results.push({ name: 'Arbitrary and illegal state skipping is strictly rejected by FSM', passed: false, message: err.message });
  }

  return results;
}

if (process.argv[1]?.includes('stateMachine.test.ts')) {
  const res = runStateMachineUnitTests();
  console.table(res);
}
