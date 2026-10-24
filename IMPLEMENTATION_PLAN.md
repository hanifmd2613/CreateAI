# IMPLEMENTATION PLAN: Round 2 — kampus.VC AI Content Creator Marketplace

## Objective
Evolve the existing Round 1 prototype into an enterprise-grade, verified Round 2 AI Content Creator Marketplace platform. The platform must connect brands with AI creators and manage the complete engagement lifecycle:
**Brief Creation → Evaluation → Matching → Explanation → Shortlist → Contact → Acceptance → Scope & Licensing → Draft Versioning → Version-Specific Feedback → Revisions → Media Delivery Inspection → Licensing Clearance → Final Approval & Completion**.

---

## Phase Breakdown

### Phase 0: Forensic Audit & Documentation (Mandatory First Step)
- [x] Inspect existing repository structure, frameworks, routes, models, and build stability.
- [x] Run compilation checks (`tsc --noEmit`, `next build`).
- [ ] Create all 33 required documentation files (`00_PROJECT_OVERVIEW.md` through `32_FINAL_VERIFICATION_REPORT.md`).
- [ ] Update `README.md` and `IMPLEMENTATION_PLAN.md`.

### Phase 1: Data Model & Schema Modernization (Round 1 Backward Compatibility)
- [ ] Extend existing schemas (`Brief`, `Creator`, `Engagement`, `MatchResult`) without breaking existing data.
- [ ] Add explicit licensing models (`LicensingTerms`, `LicensingAgreement`).
- [ ] Add versioning models (`DeliverableVersion`, `VersionFeedback`, `RevisionRound`).
- [ ] Add delivery inspection models (`DeliveryCheckResult`).
- [ ] Add auto-shortlist agent models (`ShortlistProposal`, `AuditLog`).
- [ ] Update Mongoose models and in-memory caches to support seamless offline/local development.

### Phase 2: Creator Matching Engine (Deterministic Baseline + Explanations)
- [ ] Implement normalized 6-factor deterministic scoring:
  - Content Fit (25%)
  - Style & Format (20%)
  - Skills & Tools (15%)
  - Portfolio Evidence (20%)
  - Trust Signals & Verification (10%)
  - Commercial-Use Compatibility (10%)
- [ ] Implement `NO_STRONG_MATCH` logic with constructive suggestions.
- [ ] Implement empirical, ground-truth-backed explanation generation.
- [ ] Handle missing data honestly without score fabrication.

### Phase 3: Licensing Gate & Commercial-Use Compatibility
- [ ] Decouple licensing from creative fit.
- [ ] Implement explicit status evaluation: `COMPATIBLE`, `MISMATCH`, `UNKNOWN`, `NEEDS_REVIEW`.
- [ ] Cross-validate requested terms vs. creator permitted terms (duration, territory, commercial/organic/paid ads, exclusivity, derivative rights).
- [ ] Block final clearance on unresolved licensing conflicts.

### Phase 4: Engagement State Machine & Lifecycle Management
- [ ] Implement 19-stage state machine:
  `DISCOVERY` → `SHORTLISTED` → `CONTACT_PENDING` → `CONTACTED` → `CREATOR_RESPONDED` → `CREATOR_ACCEPTED` / `CREATOR_DECLINED` → `SCOPE_CONFIRMATION` → `LICENSING_REVIEW` → `AGREEMENT_CONFIRMED` → `IN_PRODUCTION` → `DRAFT_SUBMITTED` → `REVISION_REQUESTED` → `REVISION_IN_PROGRESS` → `FINAL_REVIEW` → `DELIVERY_APPROVED` → `COMPLETED` (and `CANCELLED`, `ON_HOLD`).
- [ ] Enforce backend state transition guards, role authorization, and audit logs.

### Phase 5: Draft Versioning & Review System
- [ ] Implement immutable version tracking (V1, V2, V3...).
- [ ] Ensure previous versions and feedback are never overwritten.
- [ ] Implement version-specific feedback with optional timestamps/spatial notes and resolution state.
- [ ] Track revision rounds against agreed allowances.

### Phase 6: Real File Delivery Checker Engine
- [ ] Inspect actual uploaded assets (images and videos).
- [ ] Image inspection: dimensions (width × height), aspect ratio, file format, file size, decodability.
- [ ] Video inspection: container, dimensions, aspect ratio, duration, size, decodability.
- [ ] Compare extracted metadata strictly against brief requirements (e.g. 9:16 vertical, 1080x1920, <=15s).
- [ ] Return status: `PASS`, `FAIL`, `WARNING`, `UNVERIFIABLE`.

### Phase 7: Auto-Shortlist Agent (Inspectable & Safe)
- [ ] Implement the autonomous shortlisting pipeline:
  Brief evaluation → Hard constraint filters → Rank candidates → Licensing scan → Shortlist proposal generation → Brand review (Accept/Edit/Reject) → Persist.
- [ ] Guarantee human-in-the-loop control; no unapproved creator outreach.

### Phase 8: Unified Frontend Experience & Workspace
- [ ] Add dedicated Engagement Workspace screen for Brands and Creators.
- [ ] Add Shortlist Management and Auto-Shortlist proposal reviews.
- [ ] Add Version Review and Media Inspection visualizer.
- [ ] Integrate real-time state updates, clear empty/loading/error states.

### Phase 9: Comprehensive Automated Test Suite
- [ ] Implement unit tests for scoring, state machine, licensing gates, and delivery checks.
- [ ] Implement integration tests for the full workflow API endpoints.
- [ ] Implement end-to-end tests covering all 18 mandatory acceptance scenarios.
- [ ] Add `npm test` script to `package.json`.

### Phase 10: Verification, Demo Seed Data & Final Documentation
- [ ] Enrich demo seed data with realistic test cases (strong match, licensing mismatch, revision round, delivery failure).
- [ ] Complete `docs/32_FINAL_VERIFICATION_REPORT.md` with real test execution results.
- [ ] Validate end-to-end demo execution through browser and API.
