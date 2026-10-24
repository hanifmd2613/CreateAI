# 02 — Round 2 Requirements & Traceability

## 1. System Requirements

### Module A: Intelligent Creator Matching Engine
- **REQ-A1**: Evaluate briefs across 6 normalized factors:
  1. Content Fit (25%)
  2. Style & Format (20%)
  3. Skills & Tools (15%)
  4. Portfolio Evidence (20%)
  5. Trust & Verification Signals (10%)
  6. Commercial-Use Compatibility (10%)
- **REQ-A2**: Normalized factor scores from 0 to 100 with strict weight sum = 1.0.
- **REQ-A3**: Deterministic output: Identical briefs and creator datasets yield identical rankings and scores.
- **REQ-A4**: Empirical explanations referencing verified portfolio assets, audited workflows, and tools.
- **REQ-A5**: `NO_STRONG_MATCH` handling with constructive parameter adjustments when criteria are unmet.

### Module B: Licensing Compatibility Gate
- **REQ-B1**: Decoupled gate with 4 states: `COMPATIBLE`, `MISMATCH`, `UNKNOWN`, `NEEDS_REVIEW`.
- **REQ-B2**: Multi-parameter verification: Usage type (Commercial vs. Editorial), Territory (e.g. India vs. Worldwide), Duration (months/years), Channels (Organic social, Paid advertising, Broadcast), Exclusivity, Derivative/Editing rights.
- **REQ-B3**: Hard stop on mismatches: An engagement cannot be marked `LICENSING_CLEARED` while unresolved conflicts exist.
- **REQ-B4**: Explicit recording of agreed terms in database before production starts.

### Module C: Engagement Lifecycle & State Machine
- **REQ-C1**: 19 discrete lifecycle states with server-side validation on transitions.
- **REQ-C2**: Role-based access control preventing creators from acting on brand transitions and vice versa.
- **REQ-C3**: Optimistic concurrency or version tracking to prevent race conditions during status updates.
- **REQ-C4**: Comprehensive audit logging for all state changes with actor ID, timestamp, and metadata.

### Module D: Revision History & Version-Specific Feedback
- **REQ-D1**: Draft submissions must generate immutable version records (`v1`, `v2`, `v3`).
- **REQ-D2**: Zero overwrites: Previous file references, checksums, and creator notes remain permanently accessible.
- **REQ-D3**: Feedback records must anchor directly to a specific version ID and support timestamp/frame/region notes.
- **REQ-D4**: Tracking of revision allowances against agreed contract limits.

### Bonus A: Auto-Shortlist Agent
- **REQ-BA1**: Autonomous evaluation of incoming briefs against database creators.
- **REQ-BA2**: Hard constraint filtering (disqualifies ineligible creators).
- **REQ-BA3**: Generates a structured proposal with ranked recommendations, exclusion reasons, and suggested next steps.
- **REQ-BA4**: Human-in-the-loop review: Brand can accept, edit (add/remove), or reject the proposal.
- **REQ-BA5**: Complete audit trail of agent evaluations and brand interventions.

### Bonus B: Actual File Delivery Checker Engine
- **REQ-BB1**: Inspects actual uploaded binary files (not superficial file extensions).
- **REQ-BB2**: Image checks: Dimensions (width, height), aspect ratio, file format, size, decodability.
- **REQ-BB3**: Video checks: Container, dimensions, aspect ratio, duration, size, decodability.
- **REQ-BB4**: Comparison against brief specifications; output statuses: `PASS`, `FAIL`, `WARNING`, `UNVERIFIABLE`.
- **REQ-BB5**: Actionable feedback on failures; prevents automated final sign-off (human brand approval required).
