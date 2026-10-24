# 20 — Error Handling and Recovery

## 1. Centralized Error Strategy

The platform implements unified error handling across both client and server boundaries:

```
[ Error Occurs in Route / Service ]
                 │
                 ▼
       [ Error Classifier ]
                 │
  ┌──────────────┼──────────────┬──────────────┐
  ▼              ▼              ▼              ▼
[Validation]  [Auth/Guard]  [External AI]  [DB / Storage]
  400 Bad Req   403 / 409     Fallback Eng    Cache Mirror
                 │
                 ▼
   Uniform Standard Response:
   {
     "success": false,
     "error": {
       "code": "SPECIFIC_ERROR_CODE",
       "message": "User-friendly context",
       "details": {}
     }
   }
```

---

## 2. Handled Failure Scenarios

| Failure Scenario | Error Code | System Recovery Behavior |
|---|---|---|
| Incompatible Brief Requirements | `CONFLICTING_BRIEF_REQUIREMENTS` | Returns explicit conflict details with suggested parameter fixes. |
| No Suitable Creators Found | `NO_STRONG_MATCH` | Returns 200 with `status: NO_STRONG_MATCH` and parameter relaxation tips. |
| Licensing Mismatch Detected | `LICENSING_MISMATCH` | Flags specific conflicting terms; disables Agreement Confirmation button. |
| Invalid FSM Transition | `INVALID_STATE_TRANSITION` | Returns current state, attempted state, and list of required prerequisites. |
| AI Inference Service Outage | `AI_PROVIDER_UNAVAILABLE` | Seamlessly triggers local deterministic generator with zero data loss. |
| Corrupt Uploaded Media | `CORRUPT_MEDIA_STREAM` | Flags delivery check as `UNVERIFIABLE`; prompts creator to re-upload. |
| Concurrent Version Conflict | `CONCURRENT_UPDATE_CONFLICT` | Rejects mutation; instructs client to refresh workspace state. |
