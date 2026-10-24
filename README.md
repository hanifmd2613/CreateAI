# GenCraft (CreatorMatch-AI) — AI Creator Marketplace & Studio

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.9-green.svg)](src/lib/mongodb.ts)
[![Tests](https://img.shields.io/badge/Tests-97%20Passed-brightgreen.svg)](docs/TESTING.md)

**GenCraft** is an enterprise-grade AI Content Creator Marketplace connecting leading brands and creative agencies with elite, vetted Generative AI directors and digital artists. The platform provides complete lifecycle management from AI-assisted brief creation and hybrid ML recommendation to legally binding licensing, commission workflows, draft versioning, physical binary media delivery checks, and brand sign-off.

---

## ⚡ Core Capabilities

- **Intelligent Hybrid Recommendation Engine**: Blends an explainable 6-factor baseline (55%), 384-dimensional dense semantic vector embeddings (`gencraft-dense-v1.2`, 25%), calibrated campaign outcome predictions (15%), and conversion telemetry (5%).
- **Decoupled Licensing Compatibility Gate**: Automatically validates commercial rights, territory (Worldwide vs. Domestic), channel exclusivity (Paid Advertising vs. Organic Social), and duration before clearance.
- **19-Stage Engagement State Machine**: Deterministic FSM enforcing strict role authority between brands and creators across every milestone.
- **Creator Profile & Portfolio Management Studio (`/creator/profile`)**: Dynamic completeness meter, rich project showcases, and server-side privacy filtering (`/creators/:id`).
- **Binary Magic-Byte Media Uploads & Delivery Inspection**: Real binary header inspection of JPEG, PNG, WebP, GIF, and ISO-BMFF MP4 video atoms (`ftyp`, `mvhd`) verifying dimensions, aspect ratio (e.g., 9:16 vertical), and duration against brief specifications.
- **Immutable Revision Ledger**: Cryptographically fingerprinted draft versions (V1, V2...) with timestamp-anchored review feedback.
- **Autonomous Auto-Shortlist Agent**: AI agent that scans briefs, filters hard constraints, and formulates candidate shortlists with human-in-the-loop oversight.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2.15 (App Router, Server Components, API Route Handlers)
- **Language**: TypeScript 5.6.3 (Strict mode)
- **Styling**: Tailwind CSS 3.4.14 & Framer Motion
- **Database & Persistence**: MongoDB 6.9+ / Mongoose 8.7+ (with resilient in-memory repository mirror)
- **AI Inference Engine**: Multi-engine integration supporting Groq (Llama-3.3 70B Versatile), Google Gemini 1.5 Flash, and deterministic platform engine (`gencraft-neural-engine`) for 100% offline autonomy.
- **Vector Embeddings**: Custom 384-dimensional $L_2$-normalized dense semantic vectors with cosine similarity.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.17.0+` or `v20.x` LTS
- **Package Manager**: `npm v9+`
- **Database**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI (optional in-memory fallback enabled).

### 1. Installation & Environment Setup
```bash
# Clone repository and install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables
Set your configuration in `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/gencraft-marketplace
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional AI keys (platform functions offline via deterministic engine if omitted)
GROQ_API_KEY=
GOOGLE_GEMINI_API_KEY=
```

### 3. Seed Realistic Baseline Data
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Package Scripts

All commands are verified against `package.json`:

```bash
# Run automated test suite (13 suites, 97 passing tests)
npm test

# Run TypeScript compilation check
npx tsc --noEmit

# Run Next.js production build
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint
```

---

## 📚 Technical Documentation

Explore the consolidated technical documentation in [`docs/`](docs/):

| Document | Purpose |
| :--- | :--- |
| [**Architecture & System Design**](docs/ARCHITECTURE.md) | High-level architecture, 19-stage FSM, subsystem diagrams, and trust boundaries. |
| [**Developer Onboarding & Setup**](docs/DEVELOPMENT.md) | Local development guide, database connectivity, troubleshooting, and seed instructions. |
| [**REST API Specification**](docs/API.md) | Complete contracts for all 35 real API routes, authentication, and error envelopes. |
| [**ML & Recommendation System**](docs/ML-SYSTEM.md) | 384-d dense embeddings, 6-factor baseline, outcome prediction, MMR reranking, and evaluation metrics. |
| [**Data Models & Persistence**](docs/DATA-MODELS.md) | MongoDB/Mongoose models, entity relationships, indexes, and privacy rules. |
| [**Testing & Quality Assurance**](docs/TESTING.md) | Test matrix, 13 test suites breakdown, acceptance scenarios, and reproduction steps. |
| [**Deployment & Operations**](docs/DEPLOYMENT.md) | Production deployment architecture, Docker/standalone setup, and health checks. |
| [**Security Policy**](SECURITY.md) | Security reporting, role authorization, and trust boundaries. |
| [**Contributing Guide**](CONTRIBUTING.md) | Pull request workflow, coding standards, and verification guidelines. |
| [**Changelog**](CHANGELOG.md) | Version history from v1.0.0 to v2.2.0. |

---

## ⚠️ Known Technical Boundaries & Limitations

1. **In-Memory Fallback Ephemerality**: If a live MongoDB instance is not connected, the platform operates using an in-memory cache mirror. Data created during an in-memory session will reset upon server restart.
2. **Ephemeral File Storage in Serverless**: Media uploads written to `public/uploads/` require persistent volume storage or S3/Firebase integration when deploying to serverless environments (e.g., Vercel).
3. **Outcome Prediction Cold-Start**: Outcome calibration ($p\text{Accept}$, $p\text{OnTime}$, $p\text{QualityPass}$) requires historical telemetry. For newly created creators without historical data, the system flags `INSUFFICIENT_HISTORICAL_DATA` and falls back to baseline heuristic indicators.

---

## 📄 License
Private & Proprietary — Developed for Kampus.VC Hackathon.
