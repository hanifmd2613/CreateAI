# 04 — System Architecture

## 1. High-Level Architecture Overview

CreatorMatch-AI adopts a modular, service-oriented architecture built on Next.js 14 App Router, TypeScript, and hybrid persistence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (React 18)                     │
│  - Discovery Grid & Filters       - Explainable Match Modal           │
│  - Brief Builder & Co-Pilot       - Shortlist & Proposal Manager       │
│  - Creator Profile & Portfolio    - Comprehensive Engagement Workspace │
│  - Version Reviewer & Diff        - Real File Delivery Inspector       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP / REST / JSON
┌────────────────────────────────────▼───────────────────────────────────┐
│                     Next.js API Layer (Server Routes)                  │
│  - /api/briefs                    - /api/matching                      │
│  - /api/shortlists                - /api/engagements                   │
│  - /api/licensing                 - /api/versions                      │
│  - /api/feedback                  - /api/delivery-checks               │
│  - /api/agent/shortlist           - /api/audit                         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  AI & Matching Core  │  │ Lifecycle & State    │  │ File & Media Engine  │
│ - 6-Factor Scorer    │  │ - 19-Stage Machine   │  │ - Binary Inspector   │
│ - Licensing Gate     │  │ - Role Auth Guards   │  │ - Image/Video Specs  │
│ - Explanation Gen    │  │ - Version Tracker    │  │ - Storage Provider   │
│ - Auto-Shortlist     │  │ - Audit Logger       │  │ - Checksum & Validate│
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                      Persistence & Data Services                       │
│  - Primary: MongoDB (Mongoose models with index optimization)          │
│  - Fallback / Mirror: In-Memory / Cloud Firestore                      │
│  - Assets: Local Uploads / Firebase Cloud Storage                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architectural Subsystems

### Subsystem 1: Matching & Licensing Subsystem
- **Deterministic 6-Factor Scorer**: Evaluates mathematical alignment between brief requirements and creator capabilities.
- **Licensing Compatibility Gate**: Independent verification service that isolates legal rights (geography, duration, advertising rights) from artistic fit.
- **Natural Language Explanation Generator**: Translates empirical scoring factors into transparent reasoning.

### Subsystem 2: Engagement State Machine & Workspace Subsystem
- **Finite State Machine**: Manages 19 discrete states with transition validation and permission checks.
- **Version & Feedback Ledger**: Immutable storage of submitted drafts, binary checksums, and point-in-time review comments.
- **Milestone & Terms Repository**: Stores the binding legal and commercial terms agreed upon by both parties.

### Subsystem 3: Media Inspection & Delivery Subsystem
- **Real File Delivery Checker**: Parses binary image headers (PNG, JPEG, WebP) and ISO-BMFF MP4 video atoms (`ftyp`, `mvhd`, `tkhd`) to extract actual dimensions, aspect ratio, duration, and decodability.
- **Specification Comparator**: Evaluates extracted file properties against structured brief deliverables.
- **Audit Logging Service**: Records an immutable trail of system actions, user decisions, state transitions, and verification checks.
