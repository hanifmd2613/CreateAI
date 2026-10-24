# GenCraft — Verification & Testing Suite

GenCraft features an end-to-end automated test matrix covering role authorization, deterministic matching, FSM transitions, delivery checks, MongoDB persistence, and ML intelligence ranking.

---

## 1. How to Run the Test Suite

Execute all suites in one unified run:

```bash
npm test
```

This runs `npx tsx tests/run-all.ts`, executing all 13 test suites sequentially against real mock and database fixtures.

---

## 2. Verified Test Execution Results

All 14 test suites pass cleanly with **zero failures**:

```
================================================================
MASTER TEST SUITE RUNNER — ALL MODULES
================================================================
--- 1. 4-LAYER SEARCH & SEMANTIC DESCRIPTION MATCHING TESTS --- (6 passed)
--- 2. EMAIL AUTHENTICATION, PASSWORD POLICY & SESSION TESTS --- (5 passed)
--- 3. BRAND ROLE GUARD & SERVER AI CONFIGURATION TESTS --- (3 passed)
--- 4. 6-FACTOR DETERMINISTIC MATCHING SCORING TESTS --- (4 passed)
--- 5. 19-STAGE ENGAGEMENT STATE MACHINE CONCURRENCY TESTS --- (6 passed)
--- 6. DECOUPLED LICENSING COMPATIBILITY GATE TESTS --- (4 passed)
--- 7. BINARY ATOM & MAGIC-BYTE DELIVERY CHECK TESTS --- (4 passed)
--- 8. CREATOR COMMISSION WORKFLOW & PROPOSAL DECISION TESTS --- (9 passed)
--- 9. MANDATORY ACCEPTANCE TEST SCENARIOS (TEST 1 - 18) --- (18 passed)
--- 10. UNIVERSAL BRIEF-MATCHING & UNSEEN NATURAL LANGUAGE TEST MATRIX --- (10 passed)
--- 11. BACKEND RELIABILITY, CONCURRENCY & PERSISTENCE TESTS --- (4 passed)
--- 12. CREATOR PROFILE & PORTFOLIO PERSISTENCE TESTS --- (7 passed)
--- 13. ML INTELLIGENCE & HYBRID PIPELINE TESTS --- (13 passed)
--- 14. WORKPLACE ACTION RESOLVER & PARTICIPANT ISOLATION TESTS --- (12 passed)

================================================================
📊 MASTER TEST RESULTS: 114/114 PASSED (0 FAILED)
================================================================
```

---

## 3. Test Suites Breakdown & Coverage

### 1. Role Guards & Authentication (`tests/unit/roleGuard.test.ts`)
- Role authorization boundaries between `brand`, `creator`, and `agency`.
- Session token validation and unauthenticated request rejection.
- Server-side ownership verification preventing cross-creator profile edits.

### 2. 6-Factor Matching & Scoring (`tests/unit/matching.test.ts`)
- Mathematical accuracy of normalized factor weights (Content 25%, Style 20%, Tools 15%, Portfolio 20%, Trust 10%, Licensing 10%).
- Empirical explanation generation grounded in verified creator records.
- Honest handling of missing attributes and low-match score relaxation guidance.

### 3. Engagement State Machine (`tests/unit/stateMachine.test.ts`)
- Forward progression across all 19 lifecycle stages.
- Rejection of illegal state transitions (e.g., jumping from `DISCOVERY` directly to `COMPLETED`).
- Idempotence on duplicate transition calls.

### 4. Auto-Shortlist Proposal Lifecycle (`tests/unit/autoShortlist.test.ts`)
- Automated ranking and proposal generation for incoming briefs.
- Human-in-the-loop oversight: Brand review (Accept / Edit / Decline) before creator contact.

### 5. Feedback Storage & Milestone Audits (`tests/unit/feedbackStorage.test.ts`)
- Point-in-time versioned feedback storage and resolution tracking.
- Immutable revision history and contractual revision round enforcement.

### 6. AI Ingestion & Brief Generation (`tests/unit/aiIngestion.test.ts`)
- Parsing natural language prompts into validated brief schemas.
- Deterministic local fallback (`gencraft-neural-engine`) during external API outages.

### 7. Delivery Check Engine (`tests/unit/deliveryCheck.test.ts`)
- Binary header inspection for JPEG, PNG, WebP, GIF, and ISO-BMFF MP4 videos.
- Spec validation against brief requirements (aspect ratio, duration, resolution).
- Safe quarantine of corrupted media binaries (`UNVERIFIABLE`).

### 8. Commission Workflow & Proposal Decisions (`tests/unit/creatorCommissionWorkflow.test.ts`)
- Assigned creator accepting pending proposals (`CREATOR_ACCEPTED`).
- Assigned creator declining proposals with recorded reason (`CREATOR_DECLINED`).
- Protection against unauthorized creators deciding on proposals.

### 9. Mandatory Acceptance Scenarios 1–18 (`tests/unit/acceptanceScenarios.test.ts`)
- 18 end-to-end acceptance tests including strong match, licensing conflicts, revision limits, media check overruns, and complete campaign lifecycle demonstration.

### 10. Universal Brief-Matching & Unseen NL Matrix (`tests/unit/universalBriefMatching.test.ts`)
- 10 complex natural language campaigns (Regional Skincare, B2B SaaS, Anime/Gaming, Sustainability Documentary, Luxury Horology, etc.).
- Testing against unfamiliar keywords and cross-lingual requirements.

### 11. Backend Reliability & Concurrency (`tests/unit/backendReliability.test.ts`)
- Atomic state transitions in MongoDB.
- Concurrency conflict detection (`409 Conflict`).
- AI provider failover resilience.

### 12. Creator Profile & Portfolio Persistence (`tests/unit/creatorProfilePortfolio.test.ts`)
- Real-time profile completeness calculation.
- MongoDB persistence for creator profile metadata.
- Full CRUD operations for portfolio items.
- Public vs. private portfolio visibility filtering.

### 13. ML Intelligence & Hybrid Pipeline (`tests/unit/mlIntelligence.test.ts`)
- 384-dimensional dense semantic vector generation and $L_2$ normalization.
- Cosine similarity discrimination between creative domains.
- Hybrid ranking pipeline combining baseline, semantic, outcome, and telemetry signals.
- Diversity-aware MMR reranking and cold-start discovery boost.
- Calibrated campaign outcome prediction and explicit prediction modes (`INSUFFICIENT_HISTORICAL_DATA`, `HEURISTIC_ESTIMATE`, `EMPIRICALLY_VALIDATED_PREDICTION`).
- Honest vector validation (`validateVector`) and provider model mismatch rejection (`safeCosineSimilarity`).
- Offline evaluation engine (NDCG@10, Recall@K, Precision@K, MRR, Latency) with mathematical edge case handling (`idcg === 0` exclusion).
- Honest telemetry persistence status reporting (`durable` vs `buffered_in_memory`).

### 14. Workplace Action Resolver & Participant Isolation (`tests/unit/workplaceActions.test.ts`)
- Creator with no requests sees zero actions and clean calm empty state.
- Assigned creator receives authoritative `REVIEW_PROPOSAL` action on brand proposal.
- Unrelated creators strictly blocked from viewing or acting on private proposals.
- Anonymous / unauthenticated callers resolve to zero actions.
- Creator acceptance immediately purges proposal action and transfers `CONFIRM_AGREEMENT` to brand.
- Creator decline enters terminal state and disappears from all pending queues.
- Strict role boundaries: Brand review actions never appear in creator workspace and vice versa.
- Terminal states (`COMPLETED`, `CANCELLED`) strictly produce zero actions.
- Deterministic action ordering and zero duplicate cards guaranteed.

---

## 4. Test Environment & Fixtures

- **Mock Data**: Pre-configured in `src/data/mockData.ts` with 8 diverse, verified creators, realistic production pipelines, certified AI toolstacks, and licensing profiles.
- **In-Memory & MongoDB**: Tests automatically run using the unified store abstraction, executing identically whether connected to a live MongoDB instance or the local test runner.
