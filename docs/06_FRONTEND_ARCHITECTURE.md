# 06 — Frontend Architecture

## 1. UI Architecture & View Hierarchy

The frontend is implemented as a single-page reactive application using Next.js 14 client components, managing view states dynamically:

```
[ Root View Controller: src/app/page.tsx ]
   │
   ├─► [ View 1: 'discovery' ]
   │      - Hero Search & Multi-Filter Bar
   │      - Creator Cards Grid & Empty State
   │      - Quick Discipline Pills
   │
   ├─► [ View 2: 'profile' ]
   │      - Hero Header & Commercial Trust Signals
   │      - Multi-Model Portfolio Grid
   │      - Step-by-Step Workflow Viewer
   │
   ├─► [ View 3: 'brief-builder' ]
   │      - AI Co-Pilot Multi-Model Generation
   │      - Technical Constraints Specifier
   │      - Deliverables & Budgeting Panel
   │
   ├─► [ View 4: 'briefs-feed' ]
   │      - Active Brand Briefs Marketplace
   │      - Explainable Match Modal Trigger
   │
   └─► [ View 5: 'engagement-workspace' ] (Round 2 Core Screen)
          - State Machine Timeline & Badges
          - Scope & Agreed Licensing Terms Card
          - Immutable Version History (V1, V2...)
          - Version-Specific Feedback & Resolution
          - Real File Delivery Inspector Panel
          - Action & Approval Triggers
```

---

## 2. Global Modals & Overlays

1. **`AuthGate.tsx`**: Initial entry portal enforcing login or demo bypass.
2. **`ExplainableMatchModal.tsx`**: Side-by-side candidate comparison with factor score breakdowns and empirical rationale.
3. **`PortfolioModal.tsx`**: Deep inspection of workflow steps, seed checkpoints, and prompt snippets.
4. **`HireModal.tsx`**: Initial engagement proposal submission with milestone escrow definitions.
5. **`SavedModal.tsx`**: Shortlist drawer with one-click engagement dispatch.
6. **`SystemAssistantModal.tsx`**: Floating AI assistant for conversational platform navigation.

---

## 3. State Management & Consistency

- **Persistent Session State**: User accounts, active role (`brand` vs. `creator`), API keys, and theme preferences are synced with `localStorage` and restored on initialization.
- **Optimistic UI Updates**: State changes (such as saving creators, submitting feedback, or approving milestones) provide immediate visual feedback while confirming with the backend.
- **Empty & Loading States**: Every grid, modal, and workspace section implements dedicated loading spinners and contextual empty states with actionable recovery suggestions.
