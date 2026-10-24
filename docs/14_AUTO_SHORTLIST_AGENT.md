# 14 — Auto-Shortlist Agent

## 1. Autonomous Agent Pipeline & Governance

The Auto-Shortlist Agent runs upon brand request or immediately following brief publication. It operates as an inspectable, human-governed advisory agent.

```
Brand Brief Published / Updated
               │
               ▼
1. Validate Brief Parameters & Requirements
               │
               ▼
2. Query Database Creators (Real Database Records Only)
               │
               ▼
3. Evaluate Hard Constraints (Eliminate Inactive / Mismatched)
               │
               ▼
4. Run Deterministic 6-Factor Matching Engine
               │
               ▼
5. Evaluate Licensing Compatibility Gates
               │
               ▼
6. Formulate Proposed Shortlist (Top 3 Candidates + Explanations)
               │
               ▼
7. Record Excluded Candidates & Specific Disqualification Reasons
               │
               ▼
8. Present Proposed Shortlist to Brand User for Decision
               │
      ┌────────┴────────┬───────────────────┐
      ▼                 ▼                   ▼
  [Accept]           [Edit]              [Reject]
      │                 │                   │
Persist Shortlist   Add/Remove Items     Discard
      │                 │                   │
      └────────┬────────┴───────────────────┘
               │
9. Record Immutable Audit Event (Timestamp, User Decisions, Actions)
```

---

## 2. Guardrails Against Autonomous Actions
1. **No Cold Contact Without Authorization**: The agent **never** dispatches live inquiries or contracts to creators autonomously without explicit human brand sign-off.
2. **Real Platform Data Only**: The agent queries only existing verified database creators; it never fabricates synthetic candidate profiles to populate a shortlist.
3. **Inspectable Audit Trail**: Every shortlist proposal stores the full list of candidates evaluated, reason codes for rejected candidates, and brand edits.
