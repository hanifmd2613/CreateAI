# 19 — AI Guardrails

## 1. Principles of AI Containment

Artificial Intelligence (LLMs and Multimodal Models) is strictly restricted to **advisory and synthesis** roles. AI is never permitted to:
1. Directly determine or overwrite mathematical match scores.
2. Grant legal licensing approval or clear IP conflicts.
3. Advance engagement state machine transitions.
4. Approve deliverables without human brand sign-off.
5. Execute arbitrary external code or shell commands.

---

## 2. Guardrail Enforcement Points

### Input Validation & Sanitization
- Prompt inputs to the AI Brief Co-Pilot are sanitized to prevent prompt injection, escape delimiters, and jailbreak attempts.
- Structured schema validation ensures LLM responses conform to expected JSON interfaces.

### Grounding & Truth Verification
- Match explanations are synthesized using verified portfolio items, documented tools, and audited checkpoint seeds.
- If an LLM response contains tools not present in the creator's verified database record, the backend filter strips the unverified claim before returning the response.

### Fallback Determinism
- If external LLM APIs (Groq, Gemini) experience rate limits, latency, or outages, the platform immediately falls back to local deterministic rule engines (`generateBriefWithFallback`) without interrupting user workflow.
