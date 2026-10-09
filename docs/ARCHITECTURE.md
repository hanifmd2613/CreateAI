# Architecture Summary

See full architecture documentation at [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Core Data Pipeline

1. **Brand Brief Creation**: Brand enters raw idea -> `POST /api/ai/generate-brief` -> Structured Brief object.
2. **Matching Engine**: `POST /api/matching` evaluates weighted 7-factor formula -> `finalScore`, `categoryScores`, `reasons`.
3. **Creator Discovery**: `GET /api/creators` filters by tool, specialization, rate, style, verification.
4. **Verification Signals**: `VerificationPanel.tsx` displays audited pipeline evidence.
5. **Engagement Lifecycle**: `POST /api/engagements` stores proposal status in MongoDB.
