# GenCraft — Generative AI Content Creator Marketplace & Studio

[![Hackathon Submission](https://img.shields.io/badge/Hackathon-AI%20Creator%20Marketplace-purple.svg)](docs/FINAL_AUDIT_REPORT.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.9-green.svg)](src/lib/mongodb.ts)

GenCraft is an AI-native content creator marketplace connecting enterprise brands with vetted Generative AI directors and digital artists. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB / Mongoose**, **Groq Llama-3.3 70B**, and **Google Gemini 1.5**.

---

## ⚡ Key Capabilities & Hackathon Features

### 1. Creator Profiles & AI Portfolios
- **Rich AI Creator Specs**: Specialization, bio, hourly rate (₹/hr), availability, completed projects, rating, and verified tool stack (`Veo`, `Kling`, `Sora`, `Flux.1`, `ElevenLabs`, `Pika`).
- **Interactive Portfolio Inspection**: Inspect 3-stage generation pipelines, aspect ratios (`16:9`, `9:16`, `1:1`, `4:5`), prompt snippets, and generation seeds.

### 2. Brand / Agency Creative Briefs
- Structured campaign briefs specifying content types, visual styles, aspect ratios, budgets in INR (`₹`), deadlines, deliverables, and commercial buyout terms.

### 3. Composable Creator Discovery & Search
- Multi-attribute discovery filtering by tool, specialization, rate, style, location, and keywords with graceful zero-result empty states.

### 4. AI-Assisted Brief Builder (`/api/ai/generate-brief`)
- Converts raw creative ideas into production-ready briefs via multi-engine AI inference:
  1. **Groq Cloud** (`Llama-3.3-70b-versatile`)
  2. **Google Gemini** (`gemini-1.5-flash`)
  3. **GenCraft Neural Engine** (Local deterministic fallback)
- Every response exposes a clear `provider` origin badge in the UI.

### 5. Deterministic Explainable Creator Matching Engine (`/api/matching`)
- Evaluates creators against briefs using a 7-factor weighted formula:
  - **40%** Semantic / Intent Similarity
  - **20%** Required Skills Match
  - **15%** AI Tools & Models Match
  - **10%** Content-Type Match
  - **5%** Aspect Ratio & Format Match
  - **5%** Commercial Buyout Rights
  - **5%** Track Record & Rating
- Displays match percentages and itemized empirical reasons.

### 6. Transparent Creator Verification Trust Signals
- Audit panel certifying 5 core trust signals:
  - `✓ Platform Verified`
  - `✓ Portfolio Evidence Verified`
  - `✓ Tool & Model Stack Evidence`
  - `✓ Workflow Evidence Provided`
  - `✓ Commercial Rights Declared`

### 7. Full Brand ⇄ Creator Journey
- End-to-end workflow: Create brief → AI synthesis → Rank creators → Inspect portfolio → Audit verification → Submit proposal.

---

## 🛠️ Architecture & Tech Stack

```
GenCraft/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/generate-brief/  # Multi-engine AI brief generation
│   │   │   ├── briefs/             # REST endpoint for campaign briefs
│   │   │   ├── creators/           # REST endpoint for creator directory
│   │   │   ├── matching/           # Explainable creator matching engine
│   │   │   └── engagements/        # Engagement proposals endpoint
│   │   ├── globals.css             # Theme tokens & custom animations
│   │   ├── layout.tsx              # Root layout with CameraCursor
│   │   └── page.tsx                # Main marketplace view controller
│   ├── components/                 # 17 React UI components
│   ├── data/
│   │   └── mockData.ts             # Curated dataset & fallback seeds
│   ├── lib/
│   │   ├── ai/                     # Groq, Gemini, and Fallback providers
│   │   ├── models/                 # Mongoose schemas (Creator, Brief, MatchResult, Engagement)
│   │   ├── matching.ts             # Hybrid matching calculation engine
│   │   └── mongodb.ts              # MongoDB serverless connection caching
│   ├── scripts/
│   │   └── seed.ts                 # Programmatic MongoDB database seeder
│   └── types/
│       └── index.ts                # TypeScript domain interfaces
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- MongoDB instance (local `mongodb://127.0.0.1:27017/gencraft-marketplace` or MongoDB Atlas URI)

### Setup & Execution

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional)
cp .env.example .env.local

# 3. Seed MongoDB database
npm run seed

# 4. Run TypeScript compilation check
npx tsc --noEmit

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📚 Documentation Index

- [docs/EXECUTION_GUIDE.md](docs/EXECUTION_GUIDE.md) — Comprehensive Execution & Deployment Guide
- [docs/FINAL_AUDIT_REPORT.md](docs/FINAL_AUDIT_REPORT.md) — Final Forensic Audit & Verification Report
- [docs/HACKATHON_REQUIREMENTS.md](docs/HACKATHON_REQUIREMENTS.md) — Hackathon Requirement Compliance Matrix
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System Architecture & Component Flowcharts
- [docs/API.md](docs/API.md) — REST API Documentation
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — MongoDB Schemas & Data Model
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — Judge Demo Script (NovaPhone Campaign Scenario)
- [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) — 13-Step Smoke Test Suite
- [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) — Technical Scope & Limitations
- [docs/REPOSITORY_AUDIT.md](docs/REPOSITORY_AUDIT.md) — Complete Codebase Audit

---

## 📄 License

MIT License — free, open-source, perpetual. See [LICENSE](LICENSE) for details.
