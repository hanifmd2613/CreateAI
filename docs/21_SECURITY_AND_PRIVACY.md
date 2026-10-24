# 21 — Security and Privacy

## 1. Threat Modeling & Protections

| Vulnerability Threat | Mitigation in CreatorMatch-AI |
|---|---|
| **Broken Object-Level Authorization (BOLA)** | Every engagement and version operation validates caller ownership against record `brandId` or `creatorId`. |
| **Malicious File Uploads** | Byte-level magic-number validation inspects file headers; prevents executable script upload masquerading as images/videos. |
| **Path Traversal & Injection** | Upload file paths are generated server-side using secure UUIDs; user filenames are sanitized and never used directly as disk paths. |
| **CORS / XSS Attacks** | Strict Content Security Policy headers, removal of wildcard `Access-Control-Allow-Origin: *`, and React JSX context escaping. |
| **Credential Leakage** | API keys (Groq, Gemini, Firebase Admin) are server-only environment variables; never exposed in public client bundles. |

---

## 2. Privacy & Data Minimization
- Creators disclose only relevant professional portfolios, tools, and rates.
- Private communication between brands and creators remains encrypted in transit (TLS 1.3) and restricted to engagement participants.
- IP seed checkpoints and proprietary prompts are shared only within active, signed engagements.
