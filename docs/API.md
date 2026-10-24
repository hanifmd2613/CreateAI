# GenCraft — REST API Specification

All GenCraft API routes use standardized JSON response envelopes.

### Standard Response Envelope

#### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | UNAUTHORIZED | FORBIDDEN | CONFLICT | INTERNAL_ERROR",
    "message": "Clear explanation of the error",
    "details": { ... }
  }
}
```

---

## 1. Authentication & Session APIs

### `POST /api/auth/register`
Creates a new user account with role selection and optional creator profile association.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Arjun Mehta",
    "email": "arjun@example.com",
    "password": "StrongPassword123!",
    "role": "creator",
    "specialization": "VFX & 3D Synthesis",
    "tools": ["Veo", "Kling"]
  }
  ```
- **Response**: `201 Created` with created user record and session cookie.

### `POST /api/auth/login`
Authenticates existing users via email/password credentials.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "arjun@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response**: `200 OK` with user record and HTTP-only session cookie.

### `GET /api/auth/me`
Retrieves current authenticated session profile.
- **Auth**: Cookie / Bearer Token / Session Header
- **Response**: `200 OK` with active user profile.

### `POST /api/auth/logout`
Terminates current session and clears cookies.
- **Auth**: Public
- **Response**: `200 OK`.

---

## 2. Creators, Profiles & Portfolios

### `GET /api/creators`
Queries marketplace creators with optional filtering.
- **Auth**: Public
- **Query Parameters**:
  - `tool`: Filter by AI model (`Veo`, `Kling`, `Sora`, `Flux.1`, `ElevenLabs`)
  - `specialization`: Filter by creative niche
  - `search`: Case-insensitive text search across name, skills, bio, and tools
  - `verifiedOnly`: Boolean flag (`true` / `false`)
- **Response**: `200 OK` with array of matching `Creator` records.

### `GET /api/creators/:id`
Retrieves a public creator profile and showcase portfolio.
- **Auth**: Public
- **Privacy Enforcement**: Portfolio projects marked `private` are excluded from response unless requester is the profile owner. Direct contact email is withheld from unauthorized viewers.
- **Response**: `200 OK` with creator profile and filtered portfolio items.

### `GET /api/creators/profile`
Fetches the authenticated creator's private profile, complete portfolio, and calculated completeness score.
- **Auth**: Authenticated Creator
- **Response**: `200 OK` containing creator document, `completeness` score (`0-100`), and actionable profile improvement suggestions.

### `PUT /api/creators/profile`
Updates profile metadata for the authenticated creator.
- **Auth**: Authenticated Creator (Strict ownership guard)
- **Request Body**:
  ```json
  {
    "headline": "Senior AI Cinematographer",
    "bio": "Specializing in automotive dynamic sequences.",
    "hourlyRate": 15000,
    "tools": ["Veo", "Kling", "ElevenLabs"],
    "skills": ["Camera Motion", "Color Grading"],
    "categories": ["Commercials", "Automotive"],
    "languages": ["English", "Hindi"],
    "yearsOfExperience": 5
  }
  ```
- **Response**: `200 OK` with updated creator record.

### `POST /api/creators/portfolio`
Adds a new portfolio asset to the authenticated creator's showcase.
- **Auth**: Authenticated Creator
- **Request Body**:
  ```json
  {
    "title": "Hyperdrive EV Commercial",
    "description": "High-speed night racing visual sequence.",
    "mediaUrl": "/uploads/hyperdrive.mp4",
    "thumbnailUrl": "/uploads/hyperdrive-thumb.jpg",
    "mediaType": "video",
    "category": "Automotive",
    "style": "Cinematic",
    "skills": ["Veo", "Camera Motion"],
    "visibility": "public",
    "featured": true
  }
  ```
- **Response**: `201 Created` with created portfolio item.

### `PUT /api/creators/portfolio/:itemId`
Updates an existing portfolio asset.
- **Auth**: Authenticated Creator (Item ownership verified)
- **Response**: `200 OK` with updated item.

### `DELETE /api/creators/portfolio/:itemId`
Permanently removes a portfolio project from the creator profile.
- **Auth**: Authenticated Creator (Item ownership verified)
- **Response**: `200 OK`.

---

## 3. Media Upload Service

### `POST /api/upload`
Uploads raw media files with binary magic-byte validation and storage in `public/uploads/`.
- **Auth**: Authenticated User
- **Content-Type**: `multipart/form-data`
- **Validation**:
  - Image files: Verified signatures for JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), WebP (`RIFF....WEBP`), and GIF (`47 49 46 38`). Max 15 MB.
  - Video files: Verified ISO-BMFF `ftyp` box header (`isom`, `mp42`, `qt  `). Max 50 MB.
- **Response**: `200 OK` with accessible relative URL (e.g., `/uploads/asset-179284.mp4`).

---

## 4. Campaign Briefs & AI Generation

### `POST /api/briefs`
Creates a new structured campaign brief.
- **Auth**: Authenticated Brand
- **Request Body**:
  ```json
  {
    "title": "Telugu Skincare Product Launch",
    "brandName": "Aura Glow",
    "contentType": "Short Video",
    "aspectRatio": "9:16",
    "duration": "15s",
    "budget": 25000,
    "timeline": "7 days",
    "targetAudience": "Gen Z Skincare Consumers",
    "requiredTools": ["Veo", "Kling"],
    "requiredLicensing": {
      "usage": "Paid Advertising",
      "territory": "India",
      "duration": "6 months",
      "exclusivity": "Category Exclusive"
    }
  }
  ```
- **Response**: `201 Created` with brief record.

### `POST /api/ai/generate-brief`
Uses generative AI (Groq Llama-3.3 70B with Gemini failover and platform fallback) to transform unstructured product notes into a validated brief object.
- **Auth**: Public / Authenticated Brand
- **Request Body**:
  ```json
  {
    "rawPrompt": "Need a 30s vertical video for energy drink launch, cyberpunk aesthetic, budget $2000"
  }
  ```
- **Response**: `200 OK` with structured brief fields.

---

## 5. Matching & ML Intelligence APIs

### `POST /api/matching`
Executes the hybrid recommendation pipeline for a campaign brief against verified creators.
- **Auth**: Public / Authenticated Brand
- **Request Body**: `{ "brief": { ... } }` or `{ "briefId": "brief-1" }`
- **Algorithm**:
  1. Hard Constraint Filter: Licensing and legal requirements.
  2. 6-Factor Baseline Scoring (Content Fit, Style, Skills, Portfolio, Verification, Licensing).
  3. 384-dimensional dense semantic embedding cosine similarity (`gencraft-dense-v1.2`).
  4. Probabilistic outcome calibration ($p\text{Accept}$, $p\text{OnTime}$, $p\text{QualityPass}$).
  5. Diversity-aware MMR reranking ($\lambda = 0.75$) with cold-start discovery boost.
- **Response**: `200 OK` with ranked creator matches, final scores, factor breakdowns, empirical explanations, and licensing compatibility status.

### `POST /api/ml/predict-outcome`
Computes calibrated outcome probabilities for a specific creator and brief.
- **Auth**: Authenticated User
- **Request Body**:
  ```json
  {
    "creatorId": "creator-1",
    "brief": {
      "budget": 25000,
      "timeline": "14 days",
      "style": "Cinematic",
      "contentType": "Video"
    }
  }
  ```
- **Response**: `200 OK` with `acceptancePrediction`, `onTimeDeliveryPrediction`, and `qualityPassPrediction`. If the creator has insufficient historical telemetry, returns `INSUFFICIENT_HISTORICAL_DATA` status.

### `POST /api/ml/events`
Records marketplace telemetry events for model evaluation and conversion rate tracking.
- **Auth**: Public / Authenticated User
- **Request Body**:
  ```json
  {
    "eventType": "CREATOR_VIEWED",
    "creatorId": "creator-1",
    "briefId": "brief-1",
    "metadata": { "source": "discovery_grid" }
  }
  ```
- **Response**: `200 OK`.

### `GET /api/ml/evaluation`
Computes live offline recommendation benchmarks comparing baseline vs. hybrid ML ranking.
- **Auth**: Public
- **Response**: `200 OK` with `ndcgAt10`, `ndcgAt5`, `recallAt3`, `precisionAt3`, `meanReciprocalRank`, `catalogCoveragePercent`, and `avgLatencyMs`.

---

## 6. Engagements & State Machine APIs

### `POST /api/engagements`
Initiates a new campaign engagement proposal from a brand to a creator.
- **Auth**: Authenticated Brand
- **Request Body**:
  ```json
  {
    "briefId": "brief-1",
    "creatorId": "creator-1",
    "budget": 25000,
    "deadline": "2026-11-15",
    "scope": "1x 15s 9:16 Video Deliverable"
  }
  ```
- **Response**: `201 Created` with initial state `CONTACT_PENDING`.

### `POST /api/engagements/:id/transition`
Triggers a deterministic state machine transition.
- **Auth**: Authenticated User (Strict role authority enforced)
- **Request Body**:
  ```json
  {
    "action": "CREATOR_ACCEPTED",
    "reason": "Available and excited to deliver."
  }
  ```
- **Guard Enforcement**:
  - `CREATOR_ACCEPTED` / `CREATOR_DECLINED`: Only the assigned creator can execute.
  - `DELIVERY_APPROVED`: Only the brand can execute.
  - Invalid transitions return `400 Bad Request` or `409 Conflict`.
- **Response**: `200 OK` with updated engagement state and immutable audit entry.

### `POST /api/engagements/:id/versions`
Submits a new deliverable draft version.
- **Auth**: Assigned Creator
- **Request Body**:
  ```json
  {
    "mediaUrl": "/uploads/draft-v1.mp4",
    "mediaType": "video",
    "creatorNotes": "Initial 15s cut with color grade."
  }
  ```
- **Response**: `201 Created` with immutable `DeliverableVersion` record.

### `POST /api/engagements/:id/feedback`
Submits timestamp-anchored review feedback on a draft version.
- **Auth**: Assigned Brand
- **Request Body**:
  ```json
  {
    "versionId": "ver-1",
    "comment": "Adjust pacing between seconds 00:04 and 00:07.",
    "timestampOffset": 4.5,
    "status": "OPEN"
  }
  ```
- **Response**: `201 Created` with feedback entry.

### `POST /api/engagements/:id/delivery-check`
Performs binary header inspection on the submitted deliverable asset.
- **Auth**: Authenticated Participant
- **Request Body**:
  ```json
  {
    "versionId": "ver-1"
  }
  ```
- **Response**: `200 OK` with extracted dimensions, aspect ratio, duration, and compliance check results (`PASS`, `FAIL`, or `WARNING`).

---

## 7. Auto-Shortlist Agent & System Health

### `POST /api/agent/shortlist`
Runs the autonomous agent pipeline to generate a ranked shortlist proposal for a brief.
- **Auth**: Authenticated Brand
- **Response**: `200 OK` with candidate rankings, scoring rationales, and proposal ID.

### `POST /api/agent/shortlist/:id/action`
Accepts, edits, or rejects an agent shortlist proposal.
- **Auth**: Authenticated Brand
- **Response**: `200 OK`.

### `GET /api/health` & `GET /api/ready`
System liveness and readiness probe endpoints.
- **Auth**: Public
- **Response**: `200 OK` with status and database connectivity indicator.

---

## 8. Workplace & ML Intelligence APIs

### `GET /api/workplace/actions`
Authoritative endpoint returning genuine pending actions for the authenticated user based on persisted engagement state machine rules.
- **Auth**: Authenticated User (Cookie, Bearer token, or `x-user-id`)
- **Query Parameters**:
  - `userId` (optional fallback for automated tests)
  - `role` (optional fallback for automated tests: `creator` | `brand`)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "userId": "creator-1",
    "role": "creator",
    "actions": [
      {
        "id": "act-eng-1-REVIEW_PROPOSAL",
        "engagementId": "eng-1",
        "projectTitle": "NovaPhone 15s Launch Spot",
        "counterpartyId": "brand-1",
        "counterpartyName": "Kaveri Studios",
        "counterpartyRole": "brand",
        "engagementStatus": "CONTACTED",
        "actionType": "REVIEW_PROPOSAL",
        "actionTitle": "Commission Proposal Awaiting Your Decision",
        "actionDescription": "Kaveri Studios sent a proposal for ₹5,20,000. Accept or decline to proceed.",
        "deadline": "2026-11-01",
        "budget": "₹5,20,000",
        "urgency": "urgent",
        "ctaLabel": "Review & Decide Proposal",
        "authorizedRole": "creator",
        "createdAt": "2026-10-24T12:00:00.000Z"
      }
    ],
    "timestamp": "2026-10-24T12:00:00.000Z"
  }
  ```

### `POST /api/ml/events`
Tracks marketplace telemetry events with honest persistence status reporting.
- **Auth**: Authenticated User or Internal Service
- **Request Body**:
  ```json
  {
    "eventType": "RESULT_IMPRESSION",
    "creatorId": "creator-1",
    "position": 1,
    "rankingScore": 94
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "persistenceStatus": "durable | buffered_in_memory",
    "eventId": "evt-123",
    "bufferSize": 14
  }
  ```

### `POST /api/ml/predict-outcome`
Predicts campaign turnaround, delivery pass rate, and proposal acceptance using explicit calibration modes.
- **Auth**: Public or Authenticated Brand
- **Request Body**:
  ```json
  {
    "creatorId": "creator-1",
    "budget": 200000,
    "deadlineDays": 7
  }
  ```
- **Response**: `200 OK` with prediction mode (`INSUFFICIENT_HISTORICAL_DATA`, `HEURISTIC_ESTIMATE`, or `EMPIRICALLY_VALIDATED_PREDICTION`), sample count, and grounded evidence.

### `GET /api/ml/evaluation`
Executes the offline recommendation evaluation benchmark (`bench-eval-v2.2`) comparing baseline 6-factor vs. canonical hybrid ML ranking.
- **Auth**: Public or Admin
- **Response**: `200 OK` with NDCG@10, Recall@3, Precision@3, MRR, Latency, and valid/excluded query counts.

