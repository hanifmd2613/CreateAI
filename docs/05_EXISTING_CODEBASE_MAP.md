# 05 — Existing Codebase Map

## 1. Directory Tree & Component Responsibilities

```
CreatorMatch-AI/
├── package.json                   # Project scripts and dependencies
├── tsconfig.json                  # Strict TypeScript configuration
├── tailwind.config.js             # Styling tokens and color palettes
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root document layout with CameraCursor
│   │   ├── page.tsx               # Main application controller and view switch
│   │   ├── globals.css            # Custom CSS animations and utility classes
│   │   └── api/
│   │       ├── ai/
│   │       │   ├── assistant/     # Floating system assistant endpoint
│   │       │   └── generate-brief/# AI Brief Co-Pilot endpoint
│   │       ├── auth/              # Auth verification endpoints
│   │       ├── briefs/            # CRUD operations for campaign briefs
│   │       ├── creators/          # Creator directory endpoints
│   │       ├── engagements/       # Engagement creation and listing
│   │       ├── live-sync/         # Live creator persona sync
│   │       └── matching/          # Creator matching endpoint
│   ├── components/
│   │   ├── Navbar.tsx             # Main navigation bar with role switcher
│   │   ├── AuthGate.tsx           # Full-screen auth entry portal
│   │   ├── AuthModal.tsx          # Login and registration modal
│   │   ├── BriefBuilder.tsx       # AI-assisted brief creation tool
│   │   ├── BriefsFeed.tsx         # Active campaign briefs marketplace feed
│   │   ├── CreatorCard.tsx        # Creator showcase card
│   │   ├── CreatorProfile.tsx     # Full creator profile and portfolio view
│   │   ├── ExplainableMatchModal.tsx # Match scoring inspection modal
│   │   ├── HireModal.tsx          # Direct inquiry and commission dialog
│   │   ├── PortfolioModal.tsx     # Detailed portfolio item inspection
│   │   ├── SavedModal.tsx         # Brand shortlist drawer
│   │   ├── SystemAssistantModal.tsx # AI helper dialog
│   │   └── VerificationPanel.tsx  # 5-point verification trust indicators
│   ├── data/
│   │   └── mockData.ts            # Curated creator and brief seed dataset
│   ├── lib/
│   │   ├── auth.ts                # Session management and role resolution
│   │   ├── firebase.ts            # Firebase client initialization
│   │   ├── matching.ts            # Core matching calculation algorithms
│   │   ├── mongodb.ts             # Serverless Mongoose connection manager
│   │   ├── verificationStore.ts   # Persistent verification state
│   │   ├── ai/
│   │   │   ├── gemini.ts          # Google Gemini Flash client
│   │   │   ├── groq.ts            # Groq Llama 3 client
│   │   │   ├── fallback.ts        # Local deterministic brief parser
│   │   │   └── provider.ts        # Multi-engine provider orchestrator
│   │   └── models/
│   │       ├── Brief.ts           # Mongoose schema for campaign briefs
│   │       ├── Creator.ts         # Mongoose schema for creators & portfolios
│   │       ├── Engagement.ts      # Mongoose schema for engagements
│   │       └── MatchResult.ts     # Mongoose schema for precomputed matches
│   ├── scripts/
│   │   └── seed.ts                # Database seeding utility
│   ├── types/
│   │   └── index.ts               # Core TypeScript interface definitions
│   └── utils/
│       └── speech.ts              # Web Speech synthesizer for onboarding
└── docs/                          # Architectural and technical documentation
```

---

## 2. Shared Domain Models & Cross-Module Dependencies

1. **`src/types/index.ts`**: The single source of truth for TypeScript types. Used by both frontend UI components and backend API route handlers.
2. **`src/lib/models/Creator.ts`**: Defines the creator schema, portfolio schema, and verification signals.
3. **`src/lib/models/Brief.ts`**: Defines campaign brief fields, deliverable formats, budget, and commercial buyout preferences.
4. **`src/lib/matching.ts`**: Contains pure scoring functions invoked by `/api/matching`, `ExplainableMatchModal`, and seeding routines.
