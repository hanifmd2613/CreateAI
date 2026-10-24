# Contributing to GenCraft

Thank you for your interest in contributing to GenCraft! Please review the guidelines below to ensure quality and consistency across the codebase.

---

## 1. Development Principles

1. **Safety & Grounding First**: Never fabricate creator statistics, benchmark scores, or AI match explanations. All recommendations must be traceable to verified creator records.
2. **Server-Side Enforcement**: All authorization, state machine guards, and licensing validations must occur server-side.
3. **Immutability of History**: Deliverable draft versions, review comments, and engagement audit logs must never be overwritten.
4. **Preserve Baseline Compatibility**: Keep the explainable 6-factor baseline scoring intact while extending machine learning and search capabilities.

---

## 2. Pull Request Workflow

1. **Fork and Branch**: Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Implement and Test**: Write unit and integration tests for new functionality.
3. **Verify Locally**:
   ```bash
   # Run typecheck
   npx tsc --noEmit

   # Run automated test matrix (97 tests)
   npm test

   # Run production build
   npm run build
   ```
4. **Submit PR**: Open a clear Pull Request detailing the changes, motivation, and verification outcomes.

---

## 3. Code Standards & Tooling

- **TypeScript**: Strict mode enabled. Avoid `any` types; define explicit interfaces in [src/types/index.ts](src/types/index.ts).
- **Styling**: Tailwind CSS with consistent zinc/dark-mode theme palette.
- **API Routes**: App Router syntax with standardized `{ success, data }` or `{ success, error }` envelopes.
- **Tests**: Add unit and integration tests under `tests/unit/` and register them in `tests/run-all.ts`.
