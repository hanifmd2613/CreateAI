# 03 — Product User Flows

## 1. End-to-End Golden Path Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Brand
    participant UI as Web Client
    participant API as Backend API
    participant Engine as Matching & Licensing Engine
    participant Agent as Auto-Shortlist Agent
    actor Creator
    participant Checker as Delivery Checker Engine

    Brand->>UI: 1. Create or Select Campaign Brief
    UI->>API: POST /api/briefs
    API->>Engine: Run Matching & Licensing Gate
    Engine-->>API: Ranked Candidates + Licensing Status
    API->>Agent: Generate Shortlist Proposal
    Agent-->>UI: Display Ranked Recommendations & Explanations

    Brand->>UI: 2. Review Recommendations & Select Creator
    Brand->>UI: 3. Initiate Engagement (Contact Creator)
    UI->>API: POST /api/engagements (State: CONTACTED)
    
    Creator->>UI: 4. Review Inquiry & Terms
    Creator->>UI: 5. Accept Engagement
    UI->>API: PATCH /api/engagements/{id}/transition (State: CREATOR_ACCEPTED)

    Brand->>UI: 6. Confirm Scope & Licensing Terms
    UI->>API: POST /api/engagements/{id}/agreements
    API-->>UI: State: AGREEMENT_CONFIRMED -> IN_PRODUCTION

    Creator->>UI: 7. Upload Draft V1 Asset
    UI->>API: POST /api/engagements/{id}/versions
    API->>Checker: Run Automated Delivery Inspection
    Checker-->>UI: Media Spec Check Results (Dimensions, Ratio, Duration)
    API-->>UI: State: DRAFT_SUBMITTED

    Brand->>UI: 8. Review V1 & Submit Version-Specific Feedback
    UI->>API: POST /api/engagements/{id}/feedback
    UI->>API: Request Revision (State: REVISION_REQUESTED)

    Creator->>UI: 9. Upload Revised Draft V2 Asset
    UI->>API: POST /api/engagements/{id}/versions
    API->>Checker: Re-run Delivery Inspection
    Checker-->>UI: Spec Check PASS
    API-->>UI: State: FINAL_REVIEW

    Brand->>UI: 10. Brand Accepts Final Deliverable
    UI->>API: PATCH /api/engagements/{id}/transition (State: DELIVERY_APPROVED)
    API-->>UI: State: COMPLETED (Audit Log Sealed)
```

---

## 2. Brand User Journeys

### Journey 1: Brief Creation to Candidate Shortlist
1. Brand navigates to Brief Builder or selects an active brief from the marketplace feed.
2. The brand inputs technical specs: Aspect ratio (`9:16`), Content type (`Video`), Duration (`0:15`), Commercial rights (`Full Buyout`, Worldwide, Paid Ads).
3. The Matching Engine returns ranked candidates.
4. If licensing terms conflict, the system flags `MISMATCH` with detailed conflict points.
5. Brand adds compatible candidates to their active Shortlist.

### Journey 2: Contract Formalization & Revision Review
1. Brand selects a shortlisted creator and reviews the proposed engagement terms.
2. Both parties confirm scope, delivery dates, and licensing rights.
3. Creator submits Draft V1.
4. Brand inspects the delivery check output (e.g., verifying if the video is vertical 9:16 and under 15 seconds).
5. Brand adds frame-anchored feedback requesting audio tweak or motion adjustment.
6. Creator uploads V2; brand reviews and triggers final delivery approval.

---

## 3. Creator User Journeys

### Journey 1: Receiving & Responding to Inquiries
1. Creator logs into their Creator Studio and views Incoming Opportunities.
2. Inquiries display requested budget, brief details, and requested licensing scope.
3. Creator can **Accept**, **Decline** (with reason), or request clarification.
4. Once accepted, engagement transitions to Scope Confirmation.

### Journey 2: Draft Submission & Feedback Resolution
1. Under active production, creator uploads draft files with detailed generation notes (models, prompts, tools).
2. The platform performs an instant file delivery check, warning the creator if aspect ratio or resolution does not match the brief.
3. Creator resolves version-anchored feedback items as they are addressed.
4. Creator submits the final revised master deliverable.
