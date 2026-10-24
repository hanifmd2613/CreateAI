# 29 — Troubleshooting

## 1. Common Diagnostics & Solutions

### Issue: "MongoDB connection warning: MONGODB_URI not found or server unreachable"
- **Cause**: Local MongoDB daemon is not running.
- **Resolution**: No action required. The platform automatically switches to the in-memory runtime cache mirror, preserving all application features.

### Issue: "Delivery Checker returns UNVERIFIABLE"
- **Cause**: Uploaded file header is corrupt, truncated, or an unsupported container type.
- **Resolution**: Ensure the asset is a valid MP4 (with `ftyp` box) or standard image format (PNG, JPEG, WebP). Check file size does not exceed limits.

### Issue: "Agreement Confirmation button is disabled"
- **Cause**: Licensing status is `MISMATCH` or `UNKNOWN`, or revision rounds exceed agreed terms.
- **Resolution**: Click "Review Licensing Conflicts" to inspect terms. Align requested duration, territory, or advertising rights with creator permissions.

### Issue: "Build fails on type check"
- **Resolution**: Run `npx tsc --noEmit` to identify mismatched interface fields between `types/index.ts` and UI components.
