# 16 — API Specification

## 1. RESTful API Routes Overview

All API endpoints return standard JSON response structures:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## 2. Endpoint Index

### Campaign Briefs
- `GET /api/briefs`: List campaign briefs with filtering.
- `POST /api/briefs`: Create a new campaign brief.
- `GET /api/briefs/[id]`: Retrieve brief details.
- `PATCH /api/briefs/[id]`: Update brief parameters.

### Creator Directory & Matching
- `GET /api/creators`: List creators with composable tool, discipline, and verification filters.
- `GET /api/creators/[id]`: Retrieve full creator profile, tools, and portfolio items.
- `POST /api/matching`: Calculate 6-factor deterministic matches for a brief.
- `GET /api/matching?briefId={id}`: Retrieve precomputed matches.

### Shortlist Management
- `GET /api/shortlists`: List active shortlists.
- `POST /api/shortlists`: Create or update a creator shortlist.
- `POST /api/agent/shortlist`: Run Auto-Shortlist Agent to generate proposals.
- `POST /api/agent/shortlist/[id]/action`: Accept, edit, or reject agent proposal.

### Engagement Lifecycle & State Machine
- `GET /api/engagements`: List engagements (filtered by `brandId` or `creatorId`).
- `POST /api/engagements`: Create an engagement inquiry (Transitions: `DISCOVERY` -> `CONTACTED`).
- `GET /api/engagements/[id]`: Fetch complete engagement workspace record.
- `POST /api/engagements/[id]/transition`: Advance FSM state with server-side validation.
- `POST /api/engagements/[id]/agreements`: Confirm scope, timeline, and licensing terms.

### Versions & Draft Submissions
- `GET /api/engagements/[id]/versions`: List immutable draft versions.
- `POST /api/engagements/[id]/versions`: Upload a new draft version.

### Version-Specific Feedback
- `GET /api/engagements/[id]/feedback?versionId={id}`: List feedback for a specific version.
- `POST /api/engagements/[id]/feedback`: Submit anchored feedback comment.
- `PATCH /api/engagements/[id]/feedback/[fbId]`: Mark feedback item as resolved.

### Delivery Checks & File Verification
- `POST /api/engagements/[id]/delivery-check`: Run media inspection against uploaded file.
- `GET /api/engagements/[id]/delivery-check?versionId={id}`: Retrieve check results.

### Audit & Observability
- `GET /api/audit?engagementId={id}`: Retrieve chronological audit trail.
