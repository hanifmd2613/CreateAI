# GenCraft — Changelog

All notable changes to the GenCraft platform are documented in this file.

---

## [2.2.0] — ML Intelligence & Recommendation Pipeline Upgrade
### Added
- **384-Dimensional Dense Vector Embeddings (`gencraft-dense-v1.2`)**: Subword character n-gram hashing with 32 domain cluster projections and $L_2$-normalized cosine similarity.
- **Marketplace Interaction Telemetry**: Tracking 12 user and conversion events (`SEARCH_SUBMITTED`, `CREATOR_VIEWED`, `PROPOSAL_ACCEPTED`, etc.) via `MarketplaceEvent` model.
- **Calibrated Campaign Outcome Prediction**: Probabilistic predictions for acceptance, on-time delivery, and quality pass with data sufficiency gating.
- **Diversity-Aware MMR Reranking**: Maximal Marginal Relevance ($\lambda = 0.75$) reranker balancing relevance and creative diversity, plus cold-start exploration boost.
- **Hybrid Recommendation Pipeline**: Blends 6-factor baseline (55%), dense semantic similarity (25%), outcome probability (15%), and conversion rate feedback (5%).
- **Offline Evaluation Suite**: Live metrics reporting NDCG@10, NDCG@5, Recall@K, Precision@K, MRR, and Latency (`GET /api/ml/evaluation`).

---

## [2.1.0] — Creator Profile, Portfolio & Media Storage System
### Added
- **Dedicated Creator Profile Management Studio (`/creator/profile`)**: Live completeness meter, professional headline, tools, production workflows, and rate controls.
- **Public Creator Profile Showcase (`/creators/:id`)**: Server-side privacy-enforcing profile page displaying verified badges and public portfolio items.
- **Full Portfolio Management CRUD**: Add, edit, delete, reorder, and toggle visibility / featured status for portfolio items.
- **Binary Magic-Byte Media Upload Service (`/api/upload`)**: Validates real file signatures for JPEG, PNG, WebP, GIF, and MP4/MOV assets.
- **Universal Brief Grounding**: Portfolio items automatically grounded into matching engine evidence.

---

## [2.0.0] — Full Enterprise Marketplace Platform
### Added
- **Intelligent 6-Factor Matching Engine**: Normalized scoring across Content Fit, Style, Tools, Portfolio, Trust, and Licensing.
- **Decoupled Licensing Compatibility Gate**: Legal terms cross-validation across scope, territory, duration, and exclusivity.
- **19-Stage Finite State Machine**: Deterministic engagement lifecycle with strict server-side role authority.
- **Immutable Revision Ledger**: Version tracking (v1, v2...) with SHA-256 checksums and timestamp-anchored feedback.
- **Binary Media Delivery Checker**: Real file header inspection verifying aspect ratio, dimensions, and video duration against brief specs.
- **Auto-Shortlist Agent**: Autonomous candidate evaluation and shortlist proposal generation with human-in-the-loop oversight.
- **Authentication & RBAC Overhaul**: Removed mock OTP generation; integrated secure email/password and session persistence.

---

## [1.0.0] — Initial Prototype
- Initial hackathon prototype demonstrating basic creator search and static brief builder.
