# CreateAI — Data Model Specification

## 1. Domain Models Overview

The database uses MongoDB with Mongoose schemas and strict TypeScript interfaces defined in `src/types/index.ts` and `src/lib/models/`.

---

## 2. Creator Model (`src/lib/models/Creator.ts`)

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `String` | Yes | Unique creator identifier (e.g. `creator-1`) |
| `name` | `String` | Yes | Full display name |
| `handle` | `String` | Yes | Creator handle (e.g. `@karthik_director.ai`) |
| `avatar` | `String` | Yes | Avatar image URL |
| `coverImage` | `String` | No | Banner image URL |
| `specialization` | `String` | Yes | Core domain (e.g. `AI Commercial Director`) |
| `bio` | `String` | Yes | Directing bio |
| `location` | `String` | Yes | City & Region |
| `skills` | `[String]` | Yes | Array of skills |
| `tools` | `[String]` | Yes | Generative AI models & software (`Veo`, `Kling`, `Sora`, `Flux.1`) |
| `hourlyRate` | `Number` | Yes | Rate in INR |
| `isVerified` | `Boolean` | Yes | Platform verification status |
| `verification` | `Object` | Yes | Trust signals (certified pipeline, audit date, safety score, rights guaranteed) |
| `rating` | `Number` | Yes | Average rating (0 - 5.0) |
| `reviewCount` | `Number` | Yes | Total brand reviews |
| `completedProjects` | `Number` | Yes | Total completed brand campaigns |
| `portfolio` | `[PortfolioItem]` | Yes | Sub-document array of portfolio items |

---

## 3. Portfolio Item Sub-Schema

| Field | Type | Description |
|---|---|---|
| `id` | `String` | Unique item ID |
| `title` | `String` | Project title |
| `type` | `String` | Enum: `video`, `image`, `audio` |
| `mediaUrl` | `String` | Showcase media URL |
| `specificModel` | `String` | Models used (`Veo + Kling + ElevenLabs`) |
| `workflowDescription` | `String` | 3-stage generation pipeline summary |
| `aspectRatio` | `String` | Format (`16:9`, `9:16`, `1:1`, `4:5`) |
| `duration` | `String` | Duration (e.g. `0:30`) |
| `client` | `String` | Client name |
| `verificationStatus` | `String` | Enum: `Verified`, `Pending`, `Self-Reported` |
| `steps` | `[WorkflowStep]` | Itemized generation steps with phases and descriptions |

---

## 4. Brief Model (`src/lib/models/Brief.ts`)

| Field | Type | Description |
|---|---|---|
| `id` | `String` | Unique brief ID |
| `brandName` | `String` | Brand/Agency name |
| `title` | `String` | Campaign title |
| `rawIdea` | `String` | Original prompt entered into AI Brief Builder |
| `description` | `String` | Full production brief description |
| `contentType` | `String` | Target content type (`AI Commercial Video`, `Photorealistic Packshots`) |
| `style` | `String` | Visual style (`Cinematic Hyperrealism`) |
| `aspectRatio` | `String` | Enum: `16:9`, `9:16`, `1:1`, `4:5` |
| `budget` | `String` | Budget in INR (e.g. `₹6,50,000`) |
| `deadline` | `String` | Delivery timeline (`3 Days`) |
| `commercialUse` | `String` | Enum: `Full Buyout`, `Licensed` |
| `requiredTools` | `[String]` | Required AI tools |
| `requiredSkills` | `[String]` | Required skills |
| `status` | `String` | Enum: `Open`, `In Review`, `In Production` |

---

## 5. Match Result Model (`src/lib/models/MatchResult.ts`)

| Field | Type | Description |
|---|---|---|
| `briefId` | `String` | Referenced brief ID |
| `creatorId` | `String` | Referenced creator ID |
| `semanticScore` | `Number` | Intent similarity score (0-100) |
| `skillScore` | `Number` | Skills match score (0-100) |
| `toolScore` | `Number` | Tool stack match score (0-100) |
| `contentTypeScore` | `Number` | Content-type match score (0-100) |
| `formatScore` | `Number` | Aspect ratio match score (0-100) |
| `commercialScore` | `Number` | Buyout rights compatibility (0-100) |
| `experienceScore` | `Number` | Track record score (0-100) |
| `finalScore` | `Number` | Weighted total score (0-100) |
| `reasons` | `[String]` | Itemized explainability reasons |

---

## 6. Engagement Model (`src/lib/models/Engagement.ts`)

| Field | Type | Description |
|---|---|---|
| `id` | `String` | Unique proposal ID |
| `briefId` | `String` | Optional brief ID |
| `brandName` | `String` | Brand name |
| `creatorId` | `String` | Target creator ID |
| `creatorName` | `String` | Target creator name |
| `projectTitle` | `String` | Campaign title |
| `proposedBudget` | `String` | Offered budget |
| `status` | `String` | Enum: `Pending`, `Accepted`, `In Production`, `Completed`, `Declined` |
| `message` | `String` | Proposal message to creator |
