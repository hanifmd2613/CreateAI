import { runMatchingUnitTests } from './unit/matching.test';
import { runLicensingUnitTests } from './unit/licensing.test';
import { runStateMachineUnitTests } from './unit/stateMachine.test';
import { runDeliveryCheckUnitTests } from './unit/deliveryCheck.test';
import { runAcceptanceTests } from './integration/acceptance.test';

async function main() {
  console.log('================================================================');
  console.log('🧪 GenCraft / CreatorMatch-AI: Round 2 Master Test Suite');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // 1. Matching Unit Tests
  console.log('--- 1. MATCHING & SCORING ENGINE UNIT TESTS ---');
  const matchingResults = runMatchingUnitTests();
  for (const r of matchingResults) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  ✅ [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 2. Licensing Unit Tests
  console.log('\n--- 2. LICENSING COMPATIBILITY GATE UNIT TESTS ---');
  const licensingResults = runLicensingUnitTests();
  for (const r of licensingResults) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  ✅ [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 3. State Machine Unit Tests
  console.log('\n--- 3. 19-STAGE FSM LIFECYCLE UNIT TESTS ---');
  const stateMachineResults = runStateMachineUnitTests();
  for (const r of stateMachineResults) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  ✅ [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 4. Delivery Check Unit Tests
  console.log('\n--- 4. DELIVERY CHECK ENGINE & MEDIA INSPECTION UNIT TESTS ---');
  const deliveryResults = runDeliveryCheckUnitTests();
  for (const r of deliveryResults) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  ✅ [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 5. 18 Mandatory Acceptance Tests
  console.log('\n--- 5. MANDATORY ACCEPTANCE TEST SCENARIOS (TEST 1 - 18) ---');
  const acceptanceResults = await runAcceptanceTests();
  for (const r of acceptanceResults) {
    totalTests++;
    if (r.status === 'PASS') {
      passedTests++;
      console.log(`  ✅ [PASS] ${r.id}: ${r.name} — ${r.details}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${r.id}: ${r.name} — ${r.details}`);
    }
  }

  console.log('\n================================================================');
  console.log(`📊 MASTER TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
