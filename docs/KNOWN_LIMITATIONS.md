# GenCraft — Known Limitations & Scope Boundaries

## 1. Hackathon Scope Clarifications

`GenCraft` was built during the 16-hour AI Content Creator Marketplace Hackathon. To ensure maximum stability and reliability during live evaluation, specific complex enterprise features are simplified with graceful fallbacks:

---

## 2. Technical Limitations

### A. Authentication
- Role switching (`brand` vs `creator`) is managed via local session context (`AuthGate.tsx`).
- Production JWT/OAuth authentication tokens and password hashing are deferred for post-hackathon deployment.

### B. Real-Time Chat
- The messaging modal (`ChatModal.tsx`) provides interactive real-time messaging using client state.
- WebSocket / Socket.io server-side persistence for chat logs is not included in the hackathon scope.

### C. Financial Payments & Escrow
- Proposal creation (`POST /api/engagements`) tracks budget offers and milestone statuses in MongoDB.
- Real-world Stripe/Razorpay payment gateway integrations are simulated.

### D. External AI Provider Rate Limits
- Groq Cloud and Google Gemini APIs are called server-side when API keys are configured via environment variables or modal settings.
- If an external API key is invalid, missing, or rate-limited, the system automatically falls back to `generateBriefWithFallback` without crashing.
