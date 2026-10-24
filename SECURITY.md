# GenCraft — Security Policy & Reporting

## 1. Security Architecture & Trust Boundaries

GenCraft enforces multiple defense-in-depth security layers to protect brand intellectual property and creator portfolio assets:

- **Server-Side Authorization**: Every state transition, profile update, and portfolio mutation is strictly verified server-side via [serverAuth.ts](src/lib/serverAuth.ts). Client-side role claims are never trusted blindly.
- **Broken Object-Level Authorization (BOLA) Prevention**: Profile updates and portfolio deletions verify that the authenticated user ID strictly matches the owner ID of the target resource.
- **Media Upload Inspection**: Binary magic-byte headers are inspected to prevent MIME-type spoofing or disguised executable uploads.
- **Asset Privacy Enforcement**: Creator portfolio projects marked as `private` are stripped at the database query layer and never sent over the network to public clients. Direct contact emails are withheld from unauthorized viewers.
- **Immutable Revision Ledger**: Deliverable drafts and version histories are cryptographically fingerprinted with SHA-256 checksums and cannot be overwritten or altered.

---

## 2. Supported Versions

| Version | Supported |
| :--- | :--- |
| `2.x` / Current | Yes |
| `< 2.0` | No |

---

## 3. Reporting a Vulnerability

If you discover a potential security vulnerability within GenCraft:

1. **Do NOT open a public GitHub issue.**
2. Send a detailed report describing the vulnerability, affected endpoints or files, and reproducible steps to the repository maintainers via private security advisory on GitHub or via email to `security@gencraft.ai` (or repository maintainer contact).
3. Include:
   - Type of issue (e.g., authorization bypass, injection, data exposure).
   - Proof-of-concept steps or payload.
   - Any proposed mitigations.
4. Maintainers will acknowledge receipt within 48 hours and coordinate remediation before public disclosure.
