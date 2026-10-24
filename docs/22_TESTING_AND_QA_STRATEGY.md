# 22 — Testing and QA Strategy

## 1. Multi-Tier Testing Pyramid

The testing strategy validates the entire application from pure functions to full end-to-end user journeys:

```
                  ┌────────────────────────┐
                  │    End-to-End Tests    │  (18 Mandatory Acceptance Scenarios)
                  ├────────────────────────┤
                  │   Integration Tests    │  (API Routes, Database, Lifecycle FSM)
                  ├────────────────────────┤
                  │       Unit Tests       │  (Scoring, Normalization, Media Parser)
                  └────────────────────────┘
```

---

## 2. Test Execution Architecture

Tests are executed using `tsx` runner with direct assertion libraries and zero mocking of core business rules:
- **No Mocking of Matching**: Tests evaluate real brief and creator objects through `src/lib/matching.ts`.
- **No Mocking of State Machine**: Tests execute real transition rules through `src/lib/stateMachine.ts`.
- **No Mocking of Delivery Checks**: Tests inspect real binary image buffers and MP4 video containers through `src/lib/deliveryCheck.ts`.

---

## 3. Test Suites Overview
1. **Unit Tests**:
   - `tests/unit/matching.test.ts`: Scoring weights, factor calculations, ranking determinism, missing data handling.
   - `tests/unit/stateMachine.test.ts`: 19-state transitions, role permissions, invalid transitions.
   - `tests/unit/licensing.test.ts`: Compatibility evaluations, territory/duration conflict detection.
   - `tests/unit/deliveryCheck.test.ts`: Real file inspection for PNG, JPEG, MP4 (aspect ratio, duration, corrupt headers).
2. **Integration Tests**:
   - `tests/integration/api.test.ts`: Brief creation, matching endpoint, engagement lifecycle, versioning, feedback resolution.
3. **E2E Acceptance Test Suite**:
   - `tests/e2e/acceptance.test.ts`: Executes all 18 required challenge scenarios sequentially.
