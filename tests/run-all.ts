import fs from 'fs';
import path from 'path';

// Load .env variables for testing suite
if (typeof (process as any).loadEnvFile === 'function') {
  try {
    (process as any).loadEnvFile(path.resolve(process.cwd(), '.env'));
  } catch (e) {
    // ignore
  }
}

import { runMatchingUnitTests } from './unit/matching.test';
import { runLicensingUnitTests } from './unit/licensing.test';
import { runStateMachineUnitTests } from './unit/stateMachine.test';
import { runDeliveryCheckUnitTests } from './unit/deliveryCheck.test';
import { runSearchUnitTests } from './unit/search.test';
import { runAuthUnitTests } from './unit/auth.test';
import { runRoleGuardUnitTests } from './unit/roleGuard.test';
import { runCommissionWorkflowTests } from './unit/commissionWorkflow.test';
import { runAcceptanceTests } from './integration/acceptance.test';
import { runUniversalBriefMatchingTests } from './unit/universalBriefMatching.test';
import { runBackendReliabilityTests } from './unit/backendReliability.test';
import { runCreatorProfilePortfolioTests } from './unit/creatorProfilePortfolio.test';
import { runMLIntelligenceTests } from './unit/mlIntelligence.test';
import { runWorkplaceActionsTests } from './unit/workplaceActions.test';
import { runFirebaseBriefAssignmentTests } from './unit/firebaseBriefAssignment.test';

async function main() {
  console.log('================================================================');
  console.log('🧪 GenCraft / CreatorMatch-AI: Master Refactoring & Acceptance Suite');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // 1. Natural-Language Search & Semantic Matching Unit Tests (Priority 4)
  console.log('--- 1. 4-LAYER SEARCH & SEMANTIC DESCRIPTION MATCHING TESTS ---');
  const searchResults = await runSearchUnitTests();
  for (const t of searchResults.tests) {
    totalTests++;
    if (t.pass) {
      passedTests++;
      console.log(`  ✅ [PASS] ${t.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
    }
  }

  // 2. Email-Based Authentication & Session Unit Tests (Priority 2)
  console.log('\n--- 2. EMAIL AUTHENTICATION, PASSWORD POLICY & SESSION TESTS ---');
  const authResults = await runAuthUnitTests();
  for (const t of authResults.tests) {
    totalTests++;
    if (t.pass) {
      passedTests++;
      console.log(`  ✅ [PASS] ${t.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
    }
  }

  // 3. Brand Role Guard & Secure AI Inference Configuration Tests (Priority 3)
  console.log('\n--- 3. BRAND ROLE GUARD & SERVER AI CONFIGURATION TESTS ---');
  const roleGuardResults = await runRoleGuardUnitTests();
  for (const t of roleGuardResults.tests) {
    totalTests++;
    if (t.pass) {
      passedTests++;
      console.log(`  ✅ [PASS] ${t.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
    }
  }

  // 4. Matching & Scoring Engine Unit Tests
  console.log('\n--- 4. MATCHING & SCORING ENGINE UNIT TESTS ---');
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

  // 5. Licensing Unit Tests
  console.log('\n--- 5. LICENSING COMPATIBILITY GATE UNIT TESTS ---');
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

  // 6. State Machine Unit Tests
  console.log('\n--- 6. 19-STAGE FSM LIFECYCLE UNIT TESTS ---');
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

  // 7. Delivery Check Unit Tests
  console.log('\n--- 7. DELIVERY CHECK ENGINE & MEDIA INSPECTION UNIT TESTS ---');
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

  // 8. Creator Commission Workflow & Proposal Decision Unit Tests
  console.log('\n--- 8. CREATOR COMMISSION WORKFLOW & PROPOSAL DECISION TESTS ---');
  const commissionResults = await runCommissionWorkflowTests();
  for (const t of commissionResults.tests) {
    totalTests++;
    if (t.pass) {
      passedTests++;
      console.log(`  ✅ [PASS] ${t.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
    }
  }

  // 9. 18 Mandatory Acceptance Tests
  console.log('\n--- 9. MANDATORY ACCEPTANCE TEST SCENARIOS (TEST 1 - 18) ---');
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

  // 10. Universal Brief-Matching & Unseen Natural Language Brief Matrix (Phase 9)
  try {
    await runUniversalBriefMatchingTests();
    totalTests += 10;
    passedTests += 10;
  } catch (err: any) {
    totalTests += 10;
    failedTests++;
    console.error(`  ❌ [FAIL] Universal Brief Matching Matrix: ${err.message}`);
  }

  // 11. Backend Reliability, Concurrency & Persistence Tests (Phase 2 & 3)
  try {
    await runBackendReliabilityTests();
    totalTests += 4;
    passedTests += 4;
  } catch (err: any) {
    totalTests += 4;
    failedTests++;
    console.error(`  ❌ [FAIL] Backend Reliability: ${err.message}`);
  }

  // 12. Creator Profile & Portfolio System Unit Tests
  console.log('\n--- 12. CREATOR PROFILE & PORTFOLIO PERSISTENCE TESTS ---');
  try {
    const profileRes = await runCreatorProfilePortfolioTests();
    for (const t of profileRes.tests) {
      totalTests++;
      if (t.pass) {
        passedTests++;
        console.log(`  ✅ [PASS] ${t.name}`);
      } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
      }
    }
  } catch (err: any) {
    totalTests++;
    failedTests++;
    console.error(`  ❌ [FAIL] Creator Profile & Portfolio Tests: ${err.message}`);
  }

  // 13. ML Intelligence, Hybrid Embeddings & Outcome Calibration Tests
  console.log('\n--- 13. ML INTELLIGENCE & HYBRID PIPELINE TESTS ---');
  try {
    const mlRes = await runMLIntelligenceTests();
    for (const t of mlRes.tests) {
      totalTests++;
      if (t.pass) {
        passedTests++;
        console.log(`  ✅ [PASS] ${t.name}`);
      } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
      }
    }
  } catch (err: any) {
    totalTests++;
    failedTests++;
    console.error(`  ❌ [FAIL] ML Intelligence Suite: ${err.message}`);
  }

  // 14. Server-Authoritative Workplace Action Resolver Tests
  console.log('\n--- 14. WORKPLACE ACTION RESOLVER & PARTICIPANT ISOLATION TESTS ---');
  try {
    const wpRes = await runWorkplaceActionsTests();
    for (const t of wpRes.tests) {
      totalTests++;
      if (t.pass) {
        passedTests++;
        console.log(`  ✅ [PASS] ${t.name}`);
      } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
      }
    }
  } catch (err: any) {
    totalTests++;
    failedTests++;
    console.error(`  ❌ [FAIL] Workplace Actions Suite: ${err.message}`);
  }

  // 15. Firebase Client & Brand Brief Assignment Tests
  console.log('\n--- 15. FIREBASE CLIENT & BRAND-TO-CREATOR BRIEF ASSIGNMENT TESTS ---');
  try {
    const fbRes = await runFirebaseBriefAssignmentTests();
    for (const t of fbRes.tests) {
      totalTests++;
      if (t.pass) {
        passedTests++;
        console.log(`  ✅ [PASS] ${t.name}`);
      } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${t.name}: ${t.details}`);
      }
    }
  } catch (err: any) {
    totalTests++;
    failedTests++;
    console.error(`  ❌ [FAIL] Firebase Brief Assignment Suite: ${err.message}`);
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
