# 09 — Match Scoring and Explanations

## 1. Scoring Normalization Details

Each factor score $S_i$ is mapped to a strictly normalized range $[0, 100]$:

### 1. Content Fit ($S_1$)
- **Base Score**: 50.
- **Direct Medium Match**: +35 if creator portfolio contains verified items in the requested format (e.g. video for video brief).
- **Specialization Match**: +15 if creator's primary discipline covers the brief focus (e.g. AI Commercial Filmmaker).
- **Max**: 100, **Min**: 30.

### 2. Style & Format ($S_2$)
- **Aspect Ratio Match**: +50 if creator portfolio contains items in exact target aspect ratio (`9:16`, `16:9`, `1:1`, `4:5`).
- **Aesthetic Keyword Overlap**: Up to +50 based on style keywords (e.g. "cinematic", "photorealistic", "macro").

### 3. Skills & Tools ($S_3$)
- Ratio of matched required tools: $(\text{Matched Tools} / \text{Required Tools}) \times 100$.
- Fallback to general AI proficiency if no specific tools were mandated.

### 4. Portfolio Evidence ($S_4$)
- Score based on quantity, view volume, client ratings, and presence of documented multi-step generation workflows.

### 5. Trust Signals & Verification ($S_5$)
- **Platform Verified**: +30
- **Audited Pipeline / Checkpoints**: +30
- **Identity Verified**: +20
- **Safety Score >= 99%**: +20

### 6. Commercial Compatibility ($S_6$)
- Baseline commercial rights availability: 100 if commercial buyout declared; 70 if restricted.

---

## 2. No-Strong-Match Thresholds & Handling

When no candidate achieves an overall score $\ge 70$, or when key mandatory parameters (e.g. required tool `Veo` or format `9:16`) have zero matches:
- Return status: `NO_STRONG_MATCH`.
- Include structured relaxation recommendations:
  1. *Broaden tool requirements* (e.g. allow Kling or Sora in place of Veo).
  2. *Adjust aspect ratio constraints* (e.g. accept 16:9 masters cropped to vertical).
  3. *Extend delivery timeline* to allow creator tool onboarding.

---

## 3. Explanation Generation Engine

Explanations are generated via template-driven empirical logic referencing real fields:
- `matchedTools`: "Specializes in requested generative pipeline: Veo, Kling, ElevenLabs."
- `verifiedPortfolio`: "Portfolio item 'Project Kaveri' showcases 9:16 vertical motion for commercial automotive."
- `missingPoints`: "Creator has not yet verified Sora character sync on the platform."
