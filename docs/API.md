# CreateAI — REST API Documentation

All API routes return standardized JSON envelopes:

### Success Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR",
    "message": "Detailed error message"
  }
}
```

---

## Endpoints Summary

### 1. Creators API

#### `GET /api/creators`
Returns a list of creators matching filter criteria.

**Query Parameters:**
- `tool` (optional): Filter by AI tool (`Veo`, `Kling`, `Sora`, `Flux.1`, `ElevenLabs`)
- `specialization` (optional): Filter by specialization
- `search` (optional): Search string for name, bio, skills, tools, location
- `verifiedOnly` (optional): Set to `true` to return verified creators only

#### `POST /api/creators`
Registers a new creator profile in the marketplace database.

**Request Body:**
```json
{
  "name": "Karthik Subramanian",
  "specialization": "AI Director",
  "bio": "Cinematic AI filmmaking specialist.",
  "hourlyRate": 12500,
  "tools": ["Veo", "Kling", "Sora"],
  "skills": ["AI Filmmaking", "Camera Motion"]
}
```

#### `GET /api/creators/:id`
Retrieves a specific creator by ID.

#### `PATCH /api/creators/:id`
Updates fields on an existing creator profile.

---

### 2. Campaign Briefs API

#### `GET /api/briefs`
Returns all active campaign briefs.

#### `POST /api/briefs`
Creates and saves a campaign brief.

**Request Body:**
```json
{
  "title": "NovaPhone 9:16 Launch Film",
  "brandName": "NovaPhone Global",
  "contentType": "AI Commercial Video",
  "style": "Cinematic Hyperrealism",
  "aspectRatio": "9:16",
  "budget": "₹6,50,000",
  "deadline": "3 Days",
  "commercialUse": "Full Buyout",
  "description": "Futuristic smartphone 30s film",
  "requiredTools": ["Veo", "Kling"]
}
```

#### `GET /api/briefs/:id`
Retrieves brief details by ID.

#### `PATCH /api/briefs/:id`
Updates brief status or attributes.

---

### 3. AI Brief Builder API

#### `POST /api/ai/generate-brief`
Converts raw creative ideas into a structured production brief.

**Request Body:**
```json
{
  "prompt": "Futuristic 30-second smartphone launch film with holographic assembly and vertical 9:16 aspect ratio"
}
```

**Response:**
```json
{
  "success": true,
  "provider": "groq",
  "brief": {
    "title": "Futuristic Holographic Smartphone Launch Film",
    "contentType": "AI Commercial Video",
    "style": "Cinematic Hyperrealism",
    "aspectRatio": "9:16",
    "commercialUse": "Full Buyout",
    "budget": "₹6,50,000",
    "deadline": "3 Days",
    "tools": ["Veo", "Kling", "ElevenLabs"],
    "description": "Full production description...",
    "deliverables": ["30s Vertical 4K", "15s Teaser Cut"]
  }
}
```

---

### 4. Creator Matching Engine API

#### `POST /api/matching`
Calculates explainable weighted matching scores for creators against a target brief.

**Request Body:**
```json
{
  "briefId": "brief-novaphone-demo"
}
```

**Response:**
```json
{
  "success": true,
  "briefId": "brief-novaphone-demo",
  "briefTitle": "NovaPhone Launch Film",
  "matches": [
    {
      "creatorId": "creator-1",
      "finalScore": 96,
      "categoryScores": {
        "semanticScore": 95,
        "skillScore": 98,
        "toolScore": 100,
        "contentTypeScore": 95,
        "formatScore": 95,
        "commercialScore": 100,
        "experienceScore": 92
      },
      "reasons": [
        "Uses requested generative tools: Veo, Kling, ElevenLabs",
        "Strong commercial track record with 52 completed campaigns",
        "Portfolio contains verified AI Commercial Video commercial showcases",
        "Supports requested 9:16 format",
        "Full IP commercial buyout rights & seed auditing certified"
      ]
    }
  ]
}
```

#### `GET /api/matching?briefId=...`
Retrieves matching scores for a specified brief.

---

### 5. Engagements API

#### `POST /api/engagements`
Submits an engagement proposal to a creator.

#### `GET /api/engagements`
Lists proposals sent or received.
