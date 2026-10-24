# 30 — Developer Guide

## 1. Project Organization & Contribution Standards

### Adding a New Matching Factor
1. Define the factor key and weight in `src/lib/matching.ts`.
2. Ensure the sum of all weights $\sum w_i = 1.00$.
3. Implement the pure evaluation function returning a normalized score $[0, 100]$.
4. Update `MatchCategoryScores` in `src/types/index.ts` and `src/lib/models/MatchResult.ts`.
5. Add unit test assertions in `tests/unit/matching.test.ts`.

### Adding an Engagement State Transition
1. Add the state to the `EngagementStatus` union in `src/types/index.ts`.
2. Register the valid transition and authorized role in `src/lib/stateMachine.ts`.
3. Add transition handling in `src/app/api/engagements/[id]/transition/route.ts`.
4. Update UI action buttons in the Engagement Workspace.
5. Add test coverage in `tests/unit/stateMachine.test.ts`.

### Extending the Delivery Check Engine
1. Implement the metadata extractor in `src/lib/deliveryCheck.ts`.
2. Register the comparison rule against the brief schema.
3. Validate with unit tests in `tests/unit/deliveryCheck.test.ts`.
