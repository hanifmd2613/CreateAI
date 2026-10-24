# 28 — Known Limitations

## 1. Documented System Boundaries

1. **Semantic Content Inspection**: The Delivery Check Engine verifies physical asset properties (container format, magic bytes, dimensions, aspect ratio, duration, bitrate, decodability). It does **not** inspect subjective aesthetic content (e.g., artistic tone, brand emotion, or comedic pacing), which remains the purview of the human brand reviewer.
2. **Legal Advice Disclaimer**: The Licensing Compatibility Gate checks contractual parameter alignment between parties. It is a technical compatibility gate, not a substitute for formal legal counsel.
3. **External AI Service Latency**: When Groq or Gemini API keys are configured, responses depend on external network latency; deterministic fallbacks resolve immediately.
4. **Browser-Based Local Storage**: In pure client demo mode without a live MongoDB instance, state is stored in memory and `localStorage`.
