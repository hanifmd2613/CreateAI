# 11 — Revision and Version History

## 1. Immutable Draft Version Architecture

Every draft submission creates a new, permanently immutable version record. Under no circumstances is an existing version overwritten or mutated.

```
Engagement: eng-1234
  │
  ├── Version 1 (v1) [Immutable]
  │     ├── File: "kaveri_drift_v1.mp4" (SHA-256: 7f3b...e12a)
  │     ├── UploadedBy: creator-1 @ 2026-10-24 10:00:00
  │     ├── GenerationNotes: "Flux.1 keyframes + Veo camera path"
  │     ├── DeliveryCheck: FAIL (Duration 30s > 15s limit)
  │     └── Feedback:
  │           ├── FB-1: "Trim duration to 15s for Instagram Reels" (Status: RESOLVED)
  │           └── FB-2: "Increase tire smoke particles at 0:08" (Status: RESOLVED)
  │
  └── Version 2 (v2) [Immutable]
        ├── File: "kaveri_drift_v2.mp4" (SHA-256: 9a4c...f88b)
        ├── UploadedBy: creator-1 @ 2026-10-24 14:30:00
        ├── GenerationNotes: "Re-rendered in Kling at 15s cut; increased particle density"
        ├── DeliveryCheck: PASS (9:16 vertical, 15s duration, 1080x1920)
        └── Review: APPROVED by brand-kaveri @ 2026-10-24 16:00:00
```

---

## 2. Data Models for Versioning & Feedback

### Version Record
- `id`: Unique identifier (`ver-1729...`)
- `engagementId`: Parent engagement reference
- `versionNumber`: Incremental integer (`1`, `2`, `3`...)
- `fileUrl`: Permanent media asset reference
- `fileName`: Original file name
- `fileSize`: Asset size in bytes
- `fileChecksum`: SHA-256 or MD5 hash of binary
- `uploaderId`: User ID of submitting creator
- `submittedAt`: ISO timestamp
- `notes`: Creator generation parameters and tools used
- `status`: `DRAFT` | `UNDER_REVIEW` | `REVISION_REQUESTED` | `APPROVED` | `SUPERSEDED`

### Feedback Record
- `id`: Unique identifier (`fb-1729...`)
- `versionId`: Target draft version
- `authorId`: User ID of brand reviewer
- `authorRole`: `brand`
- `timestampOffset`: Optional video timestamp in seconds (e.g., `8.5s`)
- `coordinates`: Optional spatial coordinate for images (`{ x: 450, y: 320 }`)
- `comment`: Actionable critique
- `resolved`: Boolean flag updated when addressed in subsequent version
- `resolvedInVersion`: Version number where fix was validated

---

## 3. Revision Allowances & Governance
- Engagements record an agreed `maxRevisions` allowance (default: 2 rounds).
- Attempting to request revisions beyond the allowance triggers a notification to renegotiate scope or milestone budget.
