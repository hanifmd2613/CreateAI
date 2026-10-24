# 17 — Authentication and Authorization

## 1. Authentication Layer

The platform utilizes a hybrid authentication approach:
1. **Firebase Authentication SDK**: Handles client registration, email/password, and token management (`src/lib/auth.ts`, `src/lib/firebase.ts`).
2. **Local Session Fallback**: Persists authenticated state and role selections in `localStorage` (`gencraft_is_authenticated`, `gencraft_current_user`) for offline and sandbox resilience.
3. **Role Segregation**: Users exist as either `brand` or `creator`.

---

## 2. Server-Side Role-Based Access Control (RBAC)

Authorization rules are enforced at the API route layer before modifying resources:

| Action | Allowed Role | Authorization Guard |
|---|---|---|
| Create / Edit Brief | `brand` | User ID must match brief `brandId`. |
| Accept / Decline Inquiry | `creator` | User ID must match engagement `creatorId`. |
| Confirm Scope & Licensing | Both | Both parties must submit valid signature terms. |
| Submit Draft Version | `creator` | Only the assigned creator can upload drafts. |
| Submit Version Feedback | `brand` | Only the owning brand can submit critique. |
| Request Revisions | `brand` | State must be `DRAFT_SUBMITTED`. |
| Final Delivery Approval | `brand` | State must be `FINAL_REVIEW`; delivery checks reviewed. |
| View Engagement | Authorized Participants | User ID must equal `brandId` OR `creatorId` OR `admin`. |

---

## 3. Data Protection
- Creators cannot inspect private briefs of other creators.
- Brands cannot access unapproved work-in-progress drafts before formal submission.
- Escrow and financial payout fields are shielded from unauthorized API enumeration.
