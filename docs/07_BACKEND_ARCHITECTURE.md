# 07 — Backend Architecture

## 1. REST API Architecture

The backend routes in `src/app/api/` operate as stateless serverless endpoints running in Node.js runtime environments:

```
src/app/api/
├── briefs/
│   ├── route.ts                 # GET / POST briefs
│   └── [id]/route.ts            # GET / PATCH / DELETE specific brief
├── creators/
│   ├── route.ts                 # GET / POST creators with filtering
│   └── [id]/route.ts            # GET / PATCH creator profile
├── matching/
│   └── route.ts                 # POST calculate matches / GET precomputed
├── shortlists/
│   ├── route.ts                 # GET / POST shortlists
│   └── [id]/route.ts            # PATCH manage shortlist items
├── engagements/
│   ├── route.ts                 # GET / POST engagements
│   └── [id]/
│       ├── route.ts             # GET engagement details
│       ├── transition/route.ts  # POST state machine transition
│       ├── agreements/route.ts  # POST confirm scope & licensing
│       ├── versions/route.ts    # GET / POST draft versions
│       ├── feedback/route.ts    # GET / POST version feedback
│       └── delivery-check/route.ts # POST execute asset file inspection
├── agent/
│   └── shortlist/route.ts       # POST run auto-shortlist agent
└── audit/
    └── route.ts                 # GET engagement audit trail
```

---

## 2. Server-Side Validation & Security

- **Payload Validation**: Every endpoint verifies mandatory fields before passing to domain services.
- **Authorization Enforcement**: Route handlers verify caller identity and role. Creators cannot approve deliverables or transition brand states; brands cannot upload creator drafts.
- **Uniform Error Representation**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR | UNAUTHORIZED | INVALID_STATE_TRANSITION | NOT_FOUND",
      "message": "Human-readable explanation of error.",
      "details": {}
    }
  }
  ```

---

## 3. Database Resilience & Hybrid Fallback

- The connection utility `src/lib/mongodb.ts` caches Mongoose connections across serverless invocations.
- If MongoDB is unreachable (e.g., local development without local daemon), endpoints gracefully fall back to an in-memory/runtime cache initialized with seed data, ensuring uninterrupted development and testing.
