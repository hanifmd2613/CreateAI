# CreateAI — Hackathon Smoke Test Suite

This document defines the 13-step smoke test procedure to verify end-to-end functionality before judging.

---

## Pre-requisites Check

1. Run `npx tsc --noEmit` -> Expected: `0 errors`
2. Run `npm run build` -> Expected: `✓ Compiled successfully`
3. Run `npm run seed` -> Expected: `🎉 Database seeding completed cleanly!`

---

## 13-Step Verification Trajectory

| Step | Action | Endpoint / Component | Expected Outcome | Status |
|---|---|---|---|---|
| **1** | Start application server | `npm run dev` | Server starts cleanly on `http://localhost:3000` | PASS |
| **2** | Load Home Page | `/` | UI renders obsidian dark theme, camera cursor active | PASS |
| **3** | Filter Creators | `GET /api/creators?tool=Veo` | Creator grid updates to display Veo creators | PASS |
| **4** | Zero Results Filter Test | Filter `Tool=NonExistent` | UI displays "No creators matched these requirements" with reset button | PASS |
| **5** | Reset Filters | Click "Reset Filters" | Full creator directory restores | PASS |
| **6** | Open AI Brief Builder | `BriefBuilder.tsx` | Form renders with template prompt chips | PASS |
| **7** | Generate AI Brief | `POST /api/ai/generate-brief` | Returns structured brief with provider badge (`groq`/`gemini`/`fallback`) | PASS |
| **8** | Save Brief to Database | `POST /api/briefs` | Brief persisted to MongoDB and added to Briefs Feed | PASS |
| **9** | Compute Creator Match | `POST /api/matching` | Returns ranked matches sorted by `finalScore` | PASS |
| **10** | Explainable Match Modal | `ExplainableMatchModal.tsx` | Displays category radar breakdown and itemized reasons | PASS |
| **11** | Creator Profile Inspection | `CreatorProfile.tsx` | Shows creator rates, tools, bio, and reviews | PASS |
| **12** | Verification Signals Panel | `VerificationPanel.tsx` | Displays 5-point trust signals breakdown & safety score | PASS |
| **13** | Send Engagement Proposal | `POST /api/engagements` | Proposal created and success toast displayed | PASS |
