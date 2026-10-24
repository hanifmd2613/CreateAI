# 12 — Licensing and Commercial Use

## 1. Decoupled Compatibility Gate

Licensing is treated as an independent legal gate, strictly decoupled from creative match score. A creator with a 99% creative fit who only permits "Organic India Social" is legally incompatible with a brand requiring "Worldwide Paid Advertising".

```
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│       Brand Brief Requested Terms    │       │       Creator Permitted Terms        │
├──────────────────────────────────────┤       ├──────────────────────────────────────┤
│ - Usage: Commercial / Paid Ads       │       │ - Usage: Organic Social Only         │
│ - Territory: Worldwide               │  VS   │ - Territory: India Only              │
│ - Duration: 12 Months                │       │ - Duration: 3 Months                 │
│ - Derivative Rights: Allowed         │       │ - Derivative Rights: Prohibited      │
└──────────────────────────────────────┘       └──────────────────────────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │     Licensing Evaluator Result    │
                │         Status: MISMATCH          │
                │                                   │
                │ Conflicts:                        │
                │ 1. Territory: Worldwide vs India  │
                │ 2. Media: Paid Ads vs Organic     │
                │ 3. Duration: 12mo vs 3mo          │
                └───────────────────────────────────┘
```

---

## 2. Licensing Compatibility States

1. **`COMPATIBLE`**: All requested brand terms are strictly within the creator's declared permissions.
2. **`MISMATCH`**: One or more mandatory terms conflict directly (e.g. territory or paid ad rights). Blocks final licensing clearance.
3. **`UNKNOWN`**: Creator profile lacks explicit declarations for one or more requested parameters. Displayed as `NEEDS_REVIEW`; cannot be assumed compatible.
4. **`NEEDS_REVIEW`**: Special terms (e.g., perpetual global broadcast or AI model training rights) require legal human sign-off.

---

## 3. Mandatory Commercial Parameters Evaluated

| Parameter | Permitted Options | Conflict Trigger |
|---|---|---|
| **Commercial Scope** | Full Buyout, Commercial Licensed, Editorial Only | Brand requests Buyout, Creator only grants Editorial. |
| **Media Channels** | Organic Social, Paid Ads, Web, Broadcast, All Media | Brand requires Paid Ads, Creator only permits Organic. |
| **Territory** | Domestic (India), Regional (APAC), Worldwide | Brand requires Worldwide, Creator permits Domestic only. |
| **Duration** | 3 Months, 6 Months, 12 Months, Perpetual | Brand requires 12 Months, Creator allows max 3 Months. |
| **Exclusivity** | Non-Exclusive, Category Exclusive, Total Exclusive | Brand requires Category Exclusivity, Creator refuses. |
| **Derivative / Editing** | Allowed, Minor Cuts Only, No Derivatives | Brand requires cutdowns, Creator prohibits editing. |

---

## 4. Enforcement in Engagement Lifecycle
Before an engagement can transition from `LICENSING_REVIEW` to `AGREEMENT_CONFIRMED`, the agreed terms document must be explicitly saved with:
- Stored agreed terms JSON.
- Both brand and creator confirmation timestamps.
- Zero unresolved `MISMATCH` blockers.
