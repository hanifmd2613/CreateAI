# 00 — Project Overview: kampus.VC AI Content Creator Marketplace (Round 2)

## 1. Executive Summary

The **CreatorMatch-AI** (GenCraft) platform connects enterprise brands and creative agencies with elite, vetted Generative AI content creators.

In **Round 1**, the foundation was established:
- Comprehensive creator profiles with AI-specific tools (Veo, Sora, Kling, Flux.1, ElevenLabs).
- Step-by-step workflow evidence with seed checkpoints and audited prompts.
- Structured brand brief builder with AI Co-Pilot inference (Groq / Gemini / deterministic fallback).
- Baseline hybrid matching algorithm and explainable candidate modal.
- Dual-persistence layer (MongoDB Mongoose + Cloud Firestore fallback).
- Role-based authentication gate (Brand vs. Creator).

In **Round 2**, the objective expands from candidate discovery into full end-to-end commercial lifecycle management:
> **"Match the right creator to a brand brief and manage the engagement through revision, licensing verification, and final delivery."**

---

## 2. Round 2 Core Value Proposition

Traditional creator platforms fail for Generative AI because:
1. **Unpredictable Deliverable Formats**: AI models output arbitrary aspect ratios and resolutions (e.g., 16:9 landscape vs. 9:16 vertical reels).
2. **IP & Licensing Traps**: Commercial usage, territory boundaries, and derivative rights cannot be conflated with visual quality.
3. **Iterative Drift**: Without immutable versioning, revisions lose prompt context and seed continuity.
4. **Unverified Claims**: Unchecked claims about commercial safety scores and model certifications lead to brand risk.

CreatorMatch-AI Round 2 solves these challenges with a deterministic, evidence-grounded lifecycle:
```
Brand Brief
  │
  ▼
Matching Engine (6-Factor Normalized Scoring)
  │
  ├─► Licensing Gate (COMPATIBLE | MISMATCH | UNKNOWN | NEEDS_REVIEW)
  │
  ▼
Shortlist & Engagement Initialization
  │
  ▼
Creator Response (Accept / Decline)
  │
  ▼
Scope & Licensing Terms Confirmation
  │
  ▼
In Production → Draft V1 Upload
  │
  ├─► Delivery Checker Engine (Inspects Real Dimensions, Duration, Codec, Aspect Ratio)
  │
  ▼
Brand Version-Specific Feedback
  │
  ▼
Immutable Revision Rounds (V2, V3...)
  │
  ▼
Licensing Cleared + Brand Acceptance
  │
  ▼
Engagement Completed & Audit Trail Sealed
```

---

## 3. Product Roles & Personas

### Brand / Creative Agency
- Defines campaign briefs with strict delivery constraints (duration, aspect ratio, frame rate, resolution, commercial buyout).
- Evaluates ranked creator recommendations backed by empirical evidence.
- Accepts or edits agent-generated shortlists.
- Commissions creators and locks in agreed licensing terms.
- Reviews submitted draft media with timeline-anchored feedback.
- Approves final delivery after automated delivery verification.

### AI Creator / Director
- Maintains profile, multi-model tool stack, and audited workflow portfolios.
- Declares permitted commercial rights, geographic territories, and usage windows.
- Reviews incoming inquiries, accepting or declining with custom timeline feedback.
- Uploads immutable draft versions with workflow generation notes.
- Resolves revision requests and verifies technical compliance before final handover.

---

## 4. Key Guiding Principles
- **No Hallucinated Scores**: Match scores are strictly computed via mathematical formula against verified database records.
- **Licensing as a Separate Gate**: High creative fit never overrides an intellectual property conflict.
- **Immutable Versioning**: Draft iterations are strictly additive; previous versions and feedback are never overwritten.
- **Physical Asset Inspection**: The delivery checker measures actual byte streams and container headers, not file extensions.
- **Human-in-the-Loop Authority**: Automated agents propose actions; authorized human users retain final sign-off authority.
