# CreatorMatch-AI (GenCraft) — AI Content Creator Marketplace (Round 2)

[![Hackathon Submission](https://img.shields.io/badge/kampus.VC-Round%202%20Submission-purple.svg)](docs/32_FINAL_VERIFICATION_REPORT.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.9-green.svg)](src/lib/mongodb.ts)

CreatorMatch-AI is an enterprise-grade AI Content Creator Marketplace connecting leading brands and creative agencies with elite, vetted Generative AI directors and artists.

Built on **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **MongoDB / Mongoose**, and **Multi-Engine AI Integration** (Groq Llama-3.3 70B & Google Gemini 1.5).

---

## ⚡ Round 2 Objectives & Capabilities

> **Central Mission**: Match the right AI creator to a brand brief and manage the complete engagement lifecycle through revisions, licensing verification, physical media inspection, and final delivery.

### 1. Intelligent Creator Matching Engine (Module A)
- **6 Normalized Weighted Factors**:
  - Content Fit (25%)
  - Style & Format (20%)
  - Skills & Tools (15%)
  - Portfolio Evidence (20%)
  - Trust & Verification Signals (10%)
  - Commercial Rights Compatibility (10%)
- **Deterministic & Grounded**: Mathematical scoring with empirical evidence extracted directly from verified creator records.
- **`NO_STRONG_MATCH` Handling**: Actionable parameter relaxation guidance when criteria are unmet.

### 2. Decoupled Licensing Compatibility Gate (Module D)
- **Independent Legal Gate**: Evaluates commercial scope, channels (paid ads vs. organic), territory (Worldwide vs. India), duration, and exclusivity.
- **States**: `COMPATIBLE`, `MISMATCH`, `UNKNOWN`, `NEEDS_REVIEW`.
- **Hard Enforcement**: Prevents marking engagements as licensing-cleared until conflicts are formally resolved.

### 3. Engagement Lifecycle Management (Module B)
- **19-Stage State Machine**:
  `DISCOVERY` → `SHORTLISTED` → `CONTACT_PENDING` → `CONTACTED` → `CREATOR_RESPONDED` → `CREATOR_ACCEPTED` / `CREATOR_DECLINED` → `SCOPE_CONFIRMATION` → `LICENSING_REVIEW` → `AGREEMENT_CONFIRMED` → `IN_PRODUCTION` → `DRAFT_SUBMITTED` → `REVISION_REQUESTED` → `REVISION_IN_PROGRESS` → `FINAL_REVIEW` → `DELIVERY_APPROVED` → `COMPLETED` (plus `ON_HOLD`, `CANCELLED`).
- **Server-Side Authorization**: Enforces role permissions (Brand vs. Creator) on every state transition.

### 4. Immutable Revision & Version History (Module C)
- **Zero Overwrite Policy**: Every draft creates an immutable version record (`v1`, `v2`, `v3`...) with binary checksums and creator generation notes.
- **Version-Specific Feedback**: Review comments anchor to specific versions with timestamp offsets, spatial notes, and resolution statuses.
- **Revision Round Tracking**: Enforces contractual limits on revision rounds.

### 5. Actual File Delivery Checker Engine (Bonus B)
- **Real File Byte Inspection**: Parses binary headers to verify:
  - Images: Width, height, aspect ratio, format, size, and decodability.
  - Videos: ISO-BMFF container, width, height, aspect ratio, duration, bitrate, and integrity.
- **Spec Validation**: Compares media metadata against brief requirements (e.g. 9:16 vertical, 15s max, 1080x1920).
- **Human Authority**: Automated checks return `PASS`, `FAIL`, or `UNVERIFIABLE`; final delivery sign-off strictly requires human brand approval.

### 6. Auto-Shortlist Agent (Bonus A)
- Evaluates briefs against real database creators, filters hard constraints, ranks candidates, and formulates an inspectable shortlist proposal.
- Brand retains full control to Accept, Edit, or Reject agent proposals before any creator outreach occurs.

---

## 📚 Complete Technical Documentation (`/docs`)

| Doc # | Title | Description |
|---|---|---|
| [`00`](docs/00_PROJECT_OVERVIEW.md) | Project Overview | Mission, personas, and Round 2 objective |
| [`01`](docs/01_ROUND1_AUDIT.md) | Round 1 Audit | Preservation of Round 1 assets & identified gaps |
| [`02`](docs/02_ROUND2_REQUIREMENTS.md) | Round 2 Requirements | Full requirements traceability matrix |
| [`03`](docs/03_PRODUCT_USER_FLOWS.md) | Product User Flows | End-to-end golden path and sequence diagrams |
| [`04`](docs/04_SYSTEM_ARCHITECTURE.md) | System Architecture | Subsystem decomposition and architecture diagrams |
| [`05`](docs/05_EXISTING_CODEBASE_MAP.md) | Existing Codebase Map | Directory tree and component responsibilities |
| [`06`](docs/06_FRONTEND_ARCHITECTURE.md) | Frontend Architecture | View hierarchy, modal overlays, and reactive state |
| [`07`](docs/07_BACKEND_ARCHITECTURE.md) | Backend Architecture | REST API routes, error models, and DB caching |
| [`08`](docs/08_AI_MATCHING_ENGINE.md) | AI Matching Engine | 6-factor normalized formulas and hybrid methodology |
| [`09`](docs/09_MATCH_SCORING_AND_EXPLANATIONS.md) | Match Scoring & Explanations | Factor calculations and empirical explanation rules |
| [`10`](docs/10_ENGAGEMENT_STATE_MACHINE.md) | Engagement State Machine | 19-stage state diagram, transition guards, and RBAC |
| [`11`](docs/11_REVISION_AND_VERSION_HISTORY.md) | Revision & Version History | Immutable draft versioning and feedback resolution |
| [`12`](docs/12_LICENSING_AND_COMMERCIAL_USE.md) | Licensing & Commercial Use | Decoupled IP gates, terms comparison, and conflicts |
| [`13`](docs/13_DELIVERY_CHECK_ENGINE.md) | Delivery Check Engine | Real binary file inspection for image & video specs |
| [`14`](docs/14_AUTO_SHORTLIST_AGENT.md) | Auto-Shortlist Agent | Autonomous proposal pipeline and human oversight |
| [`15`](docs/15_DATABASE_SCHEMA.md) | Database Schema | MongoDB models, Mongoose schemas, and indexes |
| [`16`](docs/16_API_SPECIFICATION.md) | API Specification | Complete REST endpoint contracts and payloads |
| [`17`](docs/17_AUTHENTICATION_AND_AUTHORIZATION.md) | Authentication & Authorization | Role-based permissions, guards, and session state |
| [`18`](docs/18_FILE_STORAGE_AND_ASSETS.md) | File Storage & Assets | Storage providers, magic byte validation, and hashes |
| [`19`](docs/19_AI_GUARDRAILS.md) | AI Guardrails | Containment, grounding, and fallback deterministic safety |
| [`20`](docs/20_ERROR_HANDLING_AND_RECOVERY.md) | Error Handling & Recovery | Centralized error codes and self-healing behaviors |
| [`21`](docs/21_SECURITY_AND_PRIVACY.md) | Security & Privacy | Threat modeling, BOLA mitigations, and data privacy |
| [`22`](docs/22_TESTING_AND_QA_STRATEGY.md) | Testing & QA Strategy | Unit, integration, and E2E test execution strategy |
| [`23`](docs/23_ENVIRONMENT_VARIABLES.md) | Environment Variables | Configuration reference and zero-secret guarantee |
| [`24`](docs/24_EXTERNAL_INTEGRATIONS.md) | External Integrations | Groq, Gemini, and Firebase integration specifications |
| [`25`](docs/25_DEPLOYMENT_AND_OPERATIONS.md) | Deployment & Operations | Setup, production builds, and health checks |
| [`26`](docs/26_DEMO_SCENARIOS.md) | Demo Scenarios | Step-by-step golden demo and edge case walkthroughs |
| [`27`](docs/27_ACCEPTANCE_CRITERIA.md) | Acceptance Criteria | Matrix of 18 mandatory acceptance criteria |
| [`28`](docs/28_KNOWN_LIMITATIONS.md) | Known Limitations | Technical boundaries and non-goals |
| [`29`](docs/29_TROUBLESHOOTING.md) | Troubleshooting | Diagnostic guide for common issues |
| [`30`](docs/30_DEVELOPER_GUIDE.md) | Developer Guide | Contribution standards and extension instructions |
| [`31`](docs/31_CHANGELOG.md) | Changelog | Version 2.0.0 release notes |
| [`32`](docs/32_FINAL_VERIFICATION_REPORT.md) | Final Verification Report | Test results, build artifacts, and signed verification |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- npm 9+

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Populate realistic seed data
npm run seed

# 3. Start development server
npm run dev

# 4. Run automated test suite (Unit, Integration, E2E Acceptance)
npm test
```

Access the application in your browser at `http://localhost:3000`.
