# 26 — Demo Scenarios

## 1. Primary End-to-End Golden Demo Scenario

### Persona: Brand Manager at Kaveri Creative Studios
- **Goal**: Launch a 15-second vertical (9:16) launch film for the "NovaPhone Holographic Series".

### Step-by-Step Script:
1. **View Campaign Brief**: Inspect the seeded NovaPhone brief (`brief-novaphone-demo`) requiring `9:16`, `Veo` & `Kling`, `Full Buyout` (Worldwide, Paid Ads), max 15s.
2. **Execute Matching**: The matching engine evaluates 4 creators.
   - `Karthik Subramanian` ranks #1 (Score: ~94%) with verified 9:16 Veo portfolio work and compatible buyout rights.
   - A licensing conflict case is highlighted (e.g. India-only rights vs. Worldwide request).
3. **Auto-Shortlist Agent Proposal**: Review the agent's proposed shortlist with itemized exclusion reasons. Accept the proposal.
4. **Initiate Engagement**: Commission Karthik Subramanian. Engagement state advances to `CONTACTED`.
5. **Creator Acceptance**: Switch to Creator role (or accept via UI). State advances to `CREATOR_ACCEPTED`.
6. **Confirm Scope & Licensing**: Formalize ₹6,50,000 budget, 2 revision rounds, and Worldwide Commercial Buyout. State advances to `AGREEMENT_CONFIRMED` -> `IN_PRODUCTION`.
7. **Draft V1 Upload & Delivery Check Failure**: Upload Draft V1 (with a deliberate spec violation: 30s duration instead of 15s). The Delivery Checker flags **FAIL** with duration warning.
8. **Version-Specific Feedback**: Brand adds frame-anchored feedback requesting 15s trim. State advances to `REVISION_REQUESTED`.
9. **Draft V2 Upload & Delivery Check Pass**: Creator uploads V2 conforming to 9:16 and 15s. Delivery Checker returns **PASS**.
10. **Final Approval & Completion**: Brand reviews V2, confirms technical check results, and approves final delivery. Engagement completes and audit log seals.

---

## 2. Edge Case Demo Scenarios
1. **Scenario 2: Licensing Mismatch Gate**: Brand requests Worldwide Broadcast; creator only permits Domestic Social. System flags `MISMATCH` and disables agreement confirmation.
2. **Scenario 3: No Strong Match**: Brief demands impossible combinations (e.g., Claymation with unreleased tool). Engine returns `NO_STRONG_MATCH` with parameter adjustment guidance.
