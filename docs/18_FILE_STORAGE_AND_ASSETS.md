# 18 — File Storage and Assets

## 1. Storage Architecture

Managing Generative AI media assets (4K video masters, 8K stills, audio stems) requires secure, scalable asset handling:

```
Media Upload Trigger (Client)
         │
         ▼
Next.js Upload API Route (/api/uploads)
         │
         ├─► Binary Inspection Buffer (Memory / Temp Disk)
         │     - Verifies Magic Bytes (PNG, JPEG, WebP, MP4)
         │     - Extracts Width, Height, Duration, Bitrate
         │     - Generates SHA-256 Checksum
         │
         ├─► Cloud Storage Provider (Firebase Storage / S3 / Local Disk)
         │     - Stores under: /engagements/{engagementId}/versions/{versionId}/
         │     - Generates Immutable Download URL
         │
         ▼
Persist Asset Metadata in DeliverableVersion Document
```

---

## 2. File Verification & Upload Limits
- **Max File Size**: 100MB for local sandbox / demo; 1GB for production cloud buckets.
- **Supported Mime Types**:
  - Video: `video/mp4`, `video/webm`, `video/quicktime`
  - Image: `image/png`, `image/jpeg`, `image/webp`
  - Audio: `audio/mpeg`, `audio/wav`
- **Integrity Validation**: Computes and stores the cryptographic hash (SHA-256) upon upload to prevent unauthorized file mutation or asset substitution.
