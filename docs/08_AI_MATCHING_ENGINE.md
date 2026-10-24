# 08 — AI Matching Engine

## 1. Hybrid Architecture & Rationale

Matching an AI creator to an enterprise brand brief requires evaluating both qualitative creative alignment and hard technical constraints.

CreatorMatch-AI employs a **hybrid architecture**:
1. **Deterministic Multi-Factor Scoring**: Calculates mathematical scores (0–100) across structured parameters (tools, aspect ratio, skills, commercial verification).
2. **Semantic Similarity Analysis**: Computes lexical/semantic overlap between brief descriptions, project briefs, and creator portfolios.
3. **Empirical Explanation Generation**: Synthesizes natural language rationale strictly grounded in matched evidence (never hallucinates unverified tools or capabilities).

---

## 2. Six Normalized Factors & Formula

$$\text{MatchScore} = \sum_{i=1}^{6} (w_i \times S_i)$$

Where $\sum w_i = 1.00$:

| Factor | Weight ($w_i$) | Description & Input Signals |
|---|---|---|
| **1. Content Fit** | 0.25 | Alignment with requested medium (Video, Image, Audio) and industry specialization. |
| **2. Style & Format** | 0.20 | Support for requested aspect ratio (e.g., 9:16 vertical), duration, and visual aesthetic. |
| **3. Skills & Tools** | 0.15 | Overlap with required AI tools (Veo, Kling, Sora, Flux.1) and technical prompt skills. |
| **4. Portfolio Evidence**| 0.20 | Verified portfolio items exhibiting matching style, clients, or multi-step workflow seeds. |
| **5. Trust Signals** | 0.10 | Platform verification, audited pipelines, safety scores, and commercial rights seals. |
| **6. Commercial Rights** | 0.10 | Stated ability to provide full commercial buyout and certified copyright compliance. |

---

## 3. Grounded Candidate Evaluation Flow

```
Brand Brief Input
      │
      ▼
Filter Hard Constraints (Disqualify Inactive / Incompatible)
      │
      ▼
Calculate 6 Normalized Factor Scores (0–100)
      │
      ▼
Compute Weighted Sum Final Score (0–100)
      │
      ▼
Extract Matched Evidence & Missing Capabilities
      │
      ▼
Synthesize Empirical Explanation List
      │
      ▼
Return Deterministic Ranked List
```

---

## 4. Grounded Truth Rule
The matching engine never invents capabilities. If a creator has not uploaded a 9:16 portfolio item or has not listed `Veo` in their toolset, the system records a score penalty and explicitly notes the gap in the match evaluation.
