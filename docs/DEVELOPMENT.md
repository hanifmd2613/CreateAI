# GenCraft — Developer Onboarding & Local Development Guide

This guide covers everything required to set up, run, seed, test, and contribute to the GenCraft codebase.

---

## 1. Prerequisites & Runtime Requirements

- **Node.js**: `v18.17.0+` or `v20.x` (Recommended: Node 20 LTS)
- **Package Manager**: `npm v9+` (or `pnpm v9+`)
- **Database**:
  - **MongoDB**: Local Community Server `v6.0+` or MongoDB Atlas URI (Recommended for durable persistence).
  - *Note on Persistence*: GenCraft includes an in-memory cache fallback to permit immediate testing if MongoDB is not yet running. **In-memory cache data resets whenever the Node process restarts.** For durable, multi-session persistence, a real MongoDB instance is required.
- **Operating System**: macOS, Linux, or Windows (PowerShell / WSL2).

---

## 2. Environment Setup

Copy `.env.example` to `.env.local` or `.env`:

```bash
cp .env.example .env.local
```

### Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/gencraft-marketplace` |
| `NEXT_PUBLIC_APP_URL` | Base URL of the web application | `http://localhost:3000` |
| `GROQ_API_KEY` | (Optional) Groq API key for Llama-3.3 70B inference | Cloud AI inference key |
| `GOOGLE_GEMINI_API_KEY` | (Optional) Google Gemini API key for failover | Cloud AI inference key |
| `NEXT_PUBLIC_FIREBASE_*` | (Optional) Firebase client credentials | Used for Firebase Auth / Storage mirror |

> [!NOTE]
> GenCraft operates completely offline out-of-the-box using the deterministic platform engine (`gencraft-neural-engine`) and local dense vector embeddings. External AI API keys are optional.

---

## 3. Installation & Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Seed the Database
Seed realistic creators, verified audit checkpoints, active engagements, and portfolio items:
```bash
npm run seed
```

> [!IMPORTANT]
> Seeding writes directly to MongoDB if `MONGODB_URI` is connected, establishing indexed creator profiles with verified pipelines and rich portfolio evidence.

### Step 3: Start the Development Server
```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```

### Step 4: Run the Automated Test Suite
```bash
npm test
```
Executes all 13 unit, integration, authorization, state machine, delivery check, and ML ranking test suites (`97/97 tests`).

---

## 4. Key Workflows & Routes

- **Brand Brief Studio**: Navigate to `/` -> Click **Create Brief** to generate AI-assisted campaign briefs.
- **Creator Discovery**: Filter by AI tool (`Veo`, `Kling`, `Sora`, `Flux.1`), rate, verification, or natural language query.
- **Matching & Shortlisting**: Run semantic matching to view 6-factor scores, empirical reasons, and licensing compatibility.
- **Creator Profile Studio**: Navigate to `/creator/profile` to update your creator headline, skills, tools, production workflows, and portfolio items.
- **Public Profile View**: Navigate to `/creators/:id` (e.g., `/creators/creator-1`) to review public showcase assets.
- **Engagement Workspace**: Manage drafts, revision rounds, versioned feedback, and media delivery checks.

---

## 5. Troubleshooting & Common Issues

### Issue 1: MongoDB Connection Error (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause**: Local MongoDB service is stopped.
- **Solution**: Start MongoDB via `mongod` or your system service:
  ```powershell
  # Windows PowerShell
  Start-Service MongoDB
  ```
  *Fallback*: If MongoDB cannot be started, GenCraft falls back to in-memory caching during the session. Note that in-memory cache data does not persist across server restarts.

### Issue 2: Next.js Port 3000 Already in Use
- **Cause**: Another process or background server is bound to port 3000.
- **Solution**: Identify and terminate the blocking process:
  ```powershell
  # Windows PowerShell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```

### Issue 3: Media Upload Rejected (`400 Bad Request`)
- **Cause**: File signature does not match supported binary magic bytes, or file exceeds size limits (15MB for images, 50MB for videos).
- **Solution**: Ensure assets are valid JPEG, PNG, WebP, GIF, or MP4/MOV files with proper headers.

---

## 6. Build & Lint Validation

Before committing code, ensure static typing and production build pass cleanly:

```bash
# Typecheck
npx tsc --noEmit

# Next.js Production Build
npm run build
```
