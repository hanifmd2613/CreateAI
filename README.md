# CreateAI — Generative AI Content Creator Marketplace & Studio

CreateAI is a high-fidelity, interactive web application connecting enterprise brands with vetted Generative AI directors and creators. Built with **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**, and **Lucide React**.

---

## ⚡ Core Features & Capabilities

### 1. Creator Discovery & Search
- **Instant Search**: Search creators by name, skill, or AI model.
- **Strict Production Stack**: Curated filters strictly limited to the top commercial generative models:
  - **Veo** (Google DeepMind)
  - **Kling** (Kling AI)
  - **Sora** (OpenAI)
  - **Flux.1** (Black Forest Labs)
  - **ElevenLabs** (Generative Audio & Spatial Foley)
  - **Pika** (Pika Labs)
- **Indian Rupee Currency (`₹` / INR)**: All hourly rates and project budgets are standardized in INR with locale-aware formatting.
- **Verified Workflow Seals**: Visual trust indicator certifying that creators utilize audited commercial pipelines with safe training datasets and full IP buyout rights.

### 2. Dual Theme Engine (Dark & Light Mode)
- **One-Click Theme Toggle**: Accessible via the top navbar and mobile drawer.
- **High-Contrast Styling**: Sleek obsidian dark mode and crisp Apple/Linear-inspired light mode (`#FAFAFA` backdrop, clean `#FFFFFF` surfaces, `#E4E4E7` borders).
- **Persistent Preference**: Stores user preference seamlessly in `localStorage`.

### 3. Hollywood-Grade UX & Motion
- **Sleek Camera Viewfinder Cursor**: Custom 14px camera symbol cursor with interactive expanding viewfinder ring and live theme color adaptation.
- **Section Spotlight Illumination**: Interactive mouse-tracking white light glow that follows the cursor across cards and sections.
- **Staggered Fade-In Motion**: Fluid entry transitions on section loads.

### 4. Creator Profile & Portfolio Inspection
- Detailed creator profile featuring past commercial clients, verified pipeline metrics, and technical compute specs.
- **Interactive Portfolio Inspection**: Click or hover any portfolio showcase to inspect the exact model used, 3-stage generation workflow, aspect ratios, and seed parameters.

### 5. AI-Assisted Campaign Brief Builder (`/api/ai/generate-brief`)
- Convert rough creative concepts (e.g., *"electric supercar in rainy cyberpunk city"*) into structured production parameters in seconds.
- **Multi-Engine AI Inference**:
  - **Groq Cloud**: Real-time ultra-fast inference with `llama-3.3-70b-versatile`.
  - **Google Gemini**: Integration with Gemini 1.5 Flash.
  - **Built-in Neural Engine**: Deterministic fallback engine when offline or testing without API keys.

### 6. Role-Based Onboarding & Studio Profiles
- **Brand Accounts**: Post commercial briefs, manage escrow, commission verified creators.
- **Creator Accounts**: Set hourly rates (₹/hr), select supported tools, upload portfolio pieces, and publish live to the marketplace immediately.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Inference**: Groq SDK / Google Gemini API / Custom Neural Parser

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd createai-marketplace

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build the production bundle
npm run build

# Start the production server
npm run start
```

---

## 📁 Project Architecture

```
createai-marketplace/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/generate-brief/  # Live AI brief generation route (Groq / Gemini)
│   │   │   ├── briefs/             # REST endpoint for campaign briefs
│   │   │   ├── creators/           # REST endpoint for creator directory
│   │   │   └── live-sync/          # Live real-person creator sync
│   │   ├── globals.css             # Theme definitions, glows & animations
│   │   ├── layout.tsx              # Root HTML layout with CameraCursor
│   │   └── page.tsx                # Main marketplace view controller
│   ├── components/
│   │   ├── ApiConfigModal.tsx      # Groq / Gemini API key configuration
│   │   ├── AuthModal.tsx           # Role-based login & creator registration
│   │   ├── BriefBuilder.tsx        # AI Brief Co-Pilot generator
│   │   ├── BriefsFeed.tsx          # Open brand campaign briefs board
│   │   ├── CameraCursor.tsx        # Custom adaptive camera viewfinder cursor
│   │   ├── CreatorCard.tsx         # Creator showcase card with INR rates
│   │   ├── CreatorProfile.tsx      # Comprehensive creator studio & portfolio view
│   │   ├── FadeInSection.tsx       # Smooth entrance motion component
│   │   ├── HireModal.tsx           # Direct hiring & commission proposal modal
│   │   ├── Navbar.tsx              # Top navigation with Theme toggle & live sync
│   │   ├── PortfolioModal.tsx      # Click-to-inspect portfolio modal
│   │   └── SavedModal.tsx          # Shortlisted creators drawer
│   ├── data/
│   │   └── mockData.ts             # Curated creators and briefs dataset
│   └── types/
│       └── index.ts                # TypeScript interfaces & domain models
├── public/                         # Static assets
├── tailwind.config.js              # Tailwind styling configuration
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## 📄 License
MIT License. Free for commercial and educational use.
