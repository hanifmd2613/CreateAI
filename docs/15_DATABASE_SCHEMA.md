# 15 — Database Schema

## 1. Schema Extensions & Relationships

The database schema preserves existing Round 1 collections while adding models for versioning, feedback, delivery inspections, and shortlist proposals:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Creator     │       │      Brief      │       │    MatchResult  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ briefId (FK)    │
│ name, handle    │       │ brandName       │       │ creatorId (FK)  │
│ tools, skills   │       │ contentType     │       │ finalScore      │
│ portfolio []    │       │ aspectRatio     │       │ categoryScores  │
│ commercialTerms │       │ commercialTerms │       │ reasons []      │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
         │     ┌───────────────────┘
         ▼     ▼
┌─────────────────────────┐
│       Engagement        │
├─────────────────────────┤
│ id (PK)                 │
│ briefId (FK)            │
│ creatorId (FK)          │
│ brandId (FK)            │
│ status (19 FSM states)  │
│ agreedTerms {}          │
│ licensingStatus         │
│ maxRevisions            │
│ milestones []           │
└────────┬────────────────┘
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│    DeliverableVersion   │               │     DeliveryCheck       │
├─────────────────────────┤               ├─────────────────────────┤
│ id (PK)                 │               │ id (PK)                 │
│ engagementId (FK)       │               │ versionId (FK)          │
│ versionNumber (1, 2...) │               │ status (PASS/FAIL...)   │
│ fileUrl, checksum       │               │ checks []               │
│ generationNotes         │               │ verifiedAt              │
└────────┬────────────────┘               └─────────────────────────┘
         │
         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│     VersionFeedback     │               │     ShortlistProposal   │
├─────────────────────────┤               ├─────────────────────────┤
│ id (PK)                 │               │ id (PK)                 │
│ versionId (FK)          │               │ briefId (FK)            │
│ authorId, authorRole    │               │ recommendedCreators []  │
│ timestampOffset         │               │ status (PENDING/ACCEPTED│
│ comment, resolved       │               │ auditHistory []         │
└─────────────────────────┘               └─────────────────────────┘
```

---

## 2. Collections & Field Specifications

### 1. `Brief` Collection (Preserved & Extended)
- `id`: String (Indexed, Unique)
- `title`, `brandName`, `brandAvatar`, `description`
- `contentType`: String (`AI Commercial Video`, etc.)
- `style`: String (`Cinematic Hyperrealism`, etc.)
- `aspectRatio`: Enum (`16:9`, `9:16`, `1:1`, `4:5`)
- `duration`: String (`0:15`, `0:30`, etc.)
- `budget`: String
- `commercialUse`: Enum (`Full Buyout`, `Licensed`)
- `requiredTools`: String Array (`['Veo', 'Kling']`)
- `requiredSkills`: String Array
- `licensingRequirements`: Object
  - `territory`: String (`Worldwide`, `India`)
  - `channels`: String Array (`['Paid Ads', 'Social']`)
  - `durationMonths`: Number (`12`)
  - `derivativeRights`: Boolean (`true`)

### 2. `Engagement` Collection (Extended)
- `id`: String (PK)
- `briefId`: String (FK)
- `brandId`, `brandName`: String
- `creatorId`, `creatorName`: String
- `projectTitle`, `proposedBudget`: String
- `status`: String (Enum of 19 states)
- `licensingStatus`: Enum (`COMPATIBLE`, `MISMATCH`, `UNKNOWN`, `NEEDS_REVIEW`)
- `agreedTerms`: Object (Confirmed commercial scope)
- `currentVersionNumber`: Number (Default: 0)
- `maxRevisions`: Number (Default: 2)
- `milestones`: Array of `{ title, amount, status }`
- `createdAt`, `updatedAt`: Timestamps

### 3. `DeliverableVersion` Collection (New)
- `id`: String (PK)
- `engagementId`: String (Indexed FK)
- `versionNumber`: Number (1, 2, 3...)
- `fileUrl`: String
- `fileName`: String
- `fileSize`: Number
- `fileChecksum`: String
- `mediaMetadata`: Object (`{ width, height, aspectRatio, duration, format }`)
- `generationNotes`: String
- `submittedBy`: String
- `createdAt`: Date

### 4. `VersionFeedback` Collection (New)
- `id`: String (PK)
- `versionId`: String (Indexed FK)
- `authorId`, `authorRole`: String
- `timestampOffset`: Number (Optional seconds)
- `coordinates`: Object (`{ x, y }`, Optional)
- `comment`: String
- `resolved`: Boolean (Default: false)
- `resolvedAt`: Date
- `createdAt`: Date

### 5. `DeliveryCheckResult` Collection (New)
- `id`: String (PK)
- `versionId`: String (Indexed FK)
- `engagementId`: String (Indexed FK)
- `status`: Enum (`PASS`, `FAIL`, `WARNING`, `UNVERIFIABLE`)
- `checks`: Array of `{ name, required, actual, passed, message }`
- `checkedAt`: Date

### 6. `ShortlistProposal` & `AuditLog` Collections (New)
- Captures automated agent proposals, human interventions, and immutable chronological action trails.
