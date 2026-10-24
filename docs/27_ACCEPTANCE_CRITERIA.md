# 27 — Acceptance Criteria (18 Mandatory Tests)

## 1. Compliance Matrix

| Test ID | Requirement Description | Verification Method | Expected Outcome |
|---|---|---|---|
| **TEST 1** | Strong Match | Matching Engine on NovaPhone brief | Returns ranked creators with Karthik Subramanian #1; factors normalized. |
| **TEST 2** | Licensing Conflict | Requested Worldwide vs Creator Domestic | Evaluator returns `MISMATCH`; conflict details provided; agreement confirmation blocked. |
| **TEST 3** | Unknown Rights | Incomplete creator rights profile | Status remains `UNKNOWN` or `NEEDS_REVIEW`; not assumed compatible. |
| **TEST 4** | No Strong Match | Incompatible style/tool query | Status returns `NO_STRONG_MATCH` with structured relaxation options. |
| **TEST 5** | Conflicting Brief | Mutually exclusive brief constraints | Platform flags conflicts; requests clarification; never weakens constraints silently. |
| **TEST 6** | Auto-Shortlist Agent | Autonomous agent on database creators | Generates shortlist proposal with explanations; waits for Brand Accept/Edit/Reject. |
| **TEST 7** | Unauthorized Action | Creator attempting Brand approval | Fails with HTTP 403 Forbidden; state remains unchanged. |
| **TEST 8** | Creator Declines | Creator rejects commission inquiry | Engagement transitions to `CREATOR_DECLINED` with reason; terminal state enforced. |
| **TEST 9** | Revision History | V2 uploaded after V1 | V1 file and feedback remain immutable and queryable; V2 is an incremental record. |
| **TEST 10** | Aspect Ratio Failure | 16:9 video submitted for 9:16 brief | Delivery checker flags `FAIL` for aspect ratio violation. |
| **TEST 11** | Duration Failure | 30s video submitted for 15s max brief | Delivery checker flags `FAIL` for duration limit violation. |
| **TEST 12** | Corrupt File | Binary file with truncated container | Delivery checker returns `UNVERIFIABLE` / clear failure; never `PASS`. |
| **TEST 13** | Final Approval | Delivery approved by Brand | Engagement transitions from `FINAL_REVIEW` to `DELIVERY_APPROVED` to `COMPLETED`. |
| **TEST 14** | Concurrent Updates | Conflicting concurrent updates | Optimistic version check prevents silent overwriting; returns HTTP 409. |
| **TEST 15** | AI Failure | AI provider returns malformed JSON / unavailable | Local deterministic fallback preserves user inputs; no crash or bypass. |
| **TEST 16** | Data Persistence | Browser refresh / API re-fetch | Briefs, matches, shortlists, versions, and check results persist in storage. |
| **TEST 17** | Empty Database | App launched with empty DB | Renders clean empty states; allows creating first brief without seeded data. |
| **TEST 18** | Full Demo | UI execution from brief to delivery | Complete lifecycle traversable via frontend without direct DB tampering. |
