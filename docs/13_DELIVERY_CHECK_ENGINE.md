# 13 — Delivery Check Engine

## 1. Actual File Inspection Methodology

The Delivery Check Engine inspects actual uploaded file byte streams and media container headers. It never relies on superficial file extensions or self-reported creator metadata.

```
Uploaded Media File (e.g. video.mp4 / still.png)
       │
       ▼
Binary Buffer Parser & Header Decoder
       │
       ├─► Image Header (PNG IHDR / JPEG SOF0 / WebP VP8X)
       │     - Width & Height (px)
       │     - Aspect Ratio (Calculated)
       │     - File Size & Format Magic Bytes
       │     - Decodability Verification
       │
       └─► Video Container (ISO-BMFF Box Parser: ftyp, moov, mvhd, tkhd)
             - Container Brand (mp42, isom)
             - Width & Height (from tkhd track header)
             - Aspect Ratio (Calculated)
             - Duration (mvhd timescale & duration calculation)
             - Bitrate & File Size
             - Structural Integrity Check
```

---

## 2. Specification Comparison Logic

The extracted technical metadata is compared strictly against the Brief's Deliverable Requirements:

| Property | Brief Requirement | Extracted Media Property | Outcome | Rationale |
|---|---|---|---|---|
| **Orientation / Ratio** | Vertical `9:16` | $1080 \times 1920$ ($0.5625$) | **PASS** | Exact $9:16$ match. |
| **Orientation / Ratio** | Vertical `9:16` | $1920 \times 1080$ ($1.7778$) | **FAIL** | Submitted horizontal $16:9$ instead of vertical $9:16$. |
| **Duration** | Maximum 15s | $30.0$ seconds | **FAIL** | Exceeds 15s Instagram Reels maximum constraint. |
| **File Format** | MP4 Video | Magic bytes: `0x00 0x00 0x00 ... ftyp` | **PASS** | Valid ISO-BMFF container. |
| **Corrupt File** | Valid Decodable Stream | Missing `moov` / truncated header | **UNVERIFIABLE** | File stream is corrupt or unreadable. |

---

## 3. Inspection Statuses & Human Authority

- **`PASS`**: All measured technical parameters satisfy brief constraints.
- **`FAIL`**: One or more technical parameters violate brief constraints (with specific remediation guidance).
- **`WARNING`**: Non-blocking deviation (e.g., bitrate slightly below recommended threshold).
- **`UNVERIFIABLE`**: File format unsupported or binary stream truncated.

> **CRITICAL RULE**: The Delivery Checker **never** automatically signs off on final project approval. Final deliverable acceptance remains the exclusive authority of the human brand user.
