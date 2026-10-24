import { EngagementRecord, UserRole } from '../types';
import { getEngagements } from './engagementStore';

export type WorkplaceActionType =
  | 'REVIEW_PROPOSAL'      // Creator: Brand sent a commission inquiry/proposal (CONTACTED / CREATOR_RESPONDED)
  | 'CONFIRM_AGREEMENT'    // Brand/Creator: Scope and licensing agreement pending lock (CREATOR_ACCEPTED / SCOPE_CONFIRMATION / LICENSING_REVIEW)
  | 'SUBMIT_FIRST_DRAFT'   // Creator: Contract active, draft v1 due (IN_PRODUCTION)
  | 'REVIEW_DRAFT'         // Brand: Creator submitted draft, brand must review delivery check & give feedback (DRAFT_SUBMITTED)
  | 'SUBMIT_REVISION'      // Creator: Brand requested revision, new draft required (REVISION_REQUESTED / REVISION_IN_PROGRESS)
  | 'FINAL_APPROVAL'       // Brand: Final review stage, sign off required (FINAL_REVIEW)
  | 'RELEASE_PAYMENT';     // Brand: Deliverable approved, release escrow/mark complete (DELIVERY_APPROVED)

export interface WorkplaceActionItem {
  id: string;                      // Stable action ID e.g. act-eng-123-REVIEW_PROPOSAL
  engagementId: string;            // Canonical engagement reference
  briefId?: string;
  projectTitle: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyRole: 'brand' | 'creator';
  engagementStatus: string;
  actionType: WorkplaceActionType;
  actionTitle: string;
  actionDescription: string;
  deadline?: string;               // Real stored deadline only
  budget?: number | string;
  urgency: 'urgent' | 'normal' | 'low';
  ctaLabel: string;
  authorizedRole: UserRole;
  createdAt: Date;
}

export interface PendingActionsResult {
  userId: string;
  role: UserRole;
  totalPendingCount: number;
  actions: WorkplaceActionItem[];
  timestamp: string;
}

/**
 * Authoritative Server-Side Action Resolver
 * Evaluates persisted engagements against canonical state-machine actor permissions.
 * Excludes resolved, cancelled, expired, or superseded items.
 */
export async function getPendingActionsForUser(
  userId: string,
  role: UserRole
): Promise<PendingActionsResult> {
  const timestamp = new Date().toISOString();

  if (!userId || !role) {
    return {
      userId: userId || 'anonymous',
      role: role || 'brand',
      totalPendingCount: 0,
      actions: [],
      timestamp,
    };
  }

  // 1. Fetch real engagements where the user is an assigned participant
  const filter = role === 'creator' ? { creatorId: userId } : { brandId: userId };
  const engagements: EngagementRecord[] = await getEngagements(filter);

  const actions: WorkplaceActionItem[] = [];

  for (const eng of engagements) {
    const status = eng.status;
    const deadlineStr = (eng as any).deadline ? String((eng as any).deadline) : undefined;

    // Terminal / resolved states have NO pending actions
    if (
      status === 'COMPLETED' ||
      status === 'CREATOR_DECLINED' ||
      status === 'CANCELLED' ||
      status === 'ON_HOLD'
    ) {
      continue;
    }

    // 2. Creator-specific actionable states
    if (role === 'creator' && eng.creatorId === userId) {
      // Action: Review commission inquiry / proposal
      if (status === 'CONTACTED' || status === 'CREATOR_RESPONDED') {
        actions.push({
          id: `act-${eng.id}-REVIEW_PROPOSAL`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle || 'Commercial Commission Proposal',
          counterpartyId: eng.brandId,
          counterpartyName: eng.brandName,
          counterpartyRole: 'brand',
          engagementStatus: status,
          actionType: 'REVIEW_PROPOSAL',
          actionTitle: 'Commission Proposal Awaiting Your Decision',
          actionDescription: `${eng.brandName} sent a commission proposal for ${eng.proposedBudget || 'agreed budget'}. Accept or decline to proceed.`,
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'urgent',
          ctaLabel: 'Review & Decide Proposal',
          authorizedRole: 'creator',
          createdAt: new Date(eng.createdAt || Date.now()),
        });
      }
      // Action: Scope & licensing confirmation (if creator hasn't signed/confirmed)
      else if (status === 'CREATOR_ACCEPTED' || status === 'SCOPE_CONFIRMATION' || status === 'LICENSING_REVIEW') {
        actions.push({
          id: `act-${eng.id}-CONFIRM_AGREEMENT`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.brandId,
          counterpartyName: eng.brandName,
          counterpartyRole: 'brand',
          engagementStatus: status,
          actionType: 'CONFIRM_AGREEMENT',
          actionTitle: 'Confirm Commercial Scope & Licensing Terms',
          actionDescription: 'Lock in milestone deliverables and legal commercial usage before starting production.',
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'normal',
          ctaLabel: 'Review & Lock Agreement',
          authorizedRole: 'creator',
          createdAt: new Date(eng.createdAt || Date.now()),
        });
      }
      // Action: Initial draft submission
      else if (status === 'IN_PRODUCTION' && (!eng.currentVersionNumber || eng.currentVersionNumber === 0)) {
        actions.push({
          id: `act-${eng.id}-SUBMIT_FIRST_DRAFT`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.brandId,
          counterpartyName: eng.brandName,
          counterpartyRole: 'brand',
          engagementStatus: status,
          actionType: 'SUBMIT_FIRST_DRAFT',
          actionTitle: 'Upload Initial Draft Version 1',
          actionDescription: 'Project is active in production. Generate and upload initial draft asset for automated inspection.',
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'normal',
          ctaLabel: 'Submit Draft V1',
          authorizedRole: 'creator',
          createdAt: new Date(eng.updatedAt || eng.createdAt || Date.now()),
        });
      }
      // Action: Revision requested
      else if (status === 'REVISION_REQUESTED' || status === 'REVISION_IN_PROGRESS') {
        actions.push({
          id: `act-${eng.id}-SUBMIT_REVISION`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.brandId,
          counterpartyName: eng.brandName,
          counterpartyRole: 'brand',
          engagementStatus: status,
          actionType: 'SUBMIT_REVISION',
          actionTitle: `Address Revision Feedback (Round ${eng.revisionsUsed + 1} of ${eng.maxRevisions})`,
          actionDescription: `${eng.brandName} submitted revision comments. Address timestamped notes and upload updated version.`,
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'urgent',
          ctaLabel: 'Upload Revised Draft',
          authorizedRole: 'creator',
          createdAt: new Date(eng.updatedAt || eng.createdAt || Date.now()),
        });
      }
    }

    // 3. Brand-specific actionable states
    if (role === 'brand' && eng.brandId === userId) {
      // Action: Confirm scope & licensing
      if (status === 'CREATOR_ACCEPTED' || status === 'SCOPE_CONFIRMATION' || status === 'LICENSING_REVIEW') {
        actions.push({
          id: `act-${eng.id}-CONFIRM_AGREEMENT`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.creatorId,
          counterpartyName: eng.creatorName,
          counterpartyRole: 'creator',
          engagementStatus: status,
          actionType: 'CONFIRM_AGREEMENT',
          actionTitle: 'Creator Accepted! Lock Scope & Licensing Agreement',
          actionDescription: `${eng.creatorName} accepted your commission proposal. Confirm terms to start production.`,
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'urgent',
          ctaLabel: 'Lock Agreement & Start Production',
          authorizedRole: 'brand',
          createdAt: new Date(eng.updatedAt || eng.createdAt || Date.now()),
        });
      }
      // Action: Creator submitted draft, brand must review delivery check and provide feedback
      else if (status === 'DRAFT_SUBMITTED') {
        actions.push({
          id: `act-${eng.id}-REVIEW_DRAFT`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.creatorId,
          counterpartyName: eng.creatorName,
          counterpartyRole: 'creator',
          engagementStatus: status,
          actionType: 'REVIEW_DRAFT',
          actionTitle: `Draft Version ${eng.currentVersionNumber} Awaiting Review`,
          actionDescription: `${eng.creatorName} submitted a new draft cut. Inspect delivery checks and approve or request revisions.`,
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'urgent',
          ctaLabel: 'Inspect Deliverable & Review',
          authorizedRole: 'brand',
          createdAt: new Date(eng.updatedAt || eng.createdAt || Date.now()),
        });
      }
      // Action: Final review
      else if (status === 'FINAL_REVIEW') {
        actions.push({
          id: `act-${eng.id}-FINAL_APPROVAL`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.creatorId,
          counterpartyName: eng.creatorName,
          counterpartyRole: 'creator',
          engagementStatus: status,
          actionType: 'FINAL_APPROVAL',
          actionTitle: 'Final Deliverable Review & Approval',
          actionDescription: 'All revisions resolved. Perform final sign-off to clear media and release escrow.',
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'urgent',
          ctaLabel: 'Approve Final Delivery',
          authorizedRole: 'brand',
          createdAt: new Date(eng.updatedAt || eng.createdAt || Date.now()),
        });
      }
      // Action: Delivery approved, release payment
      else if (status === 'DELIVERY_APPROVED') {
        actions.push({
          id: `act-${eng.id}-RELEASE_PAYMENT`,
          engagementId: eng.id,
          briefId: eng.briefId,
          projectTitle: eng.projectTitle,
          counterpartyId: eng.creatorId,
          counterpartyName: eng.creatorName,
          counterpartyRole: 'creator',
          engagementStatus: status,
          actionType: 'RELEASE_PAYMENT',
          actionTitle: 'Release Payment & Seal Campaign',
          actionDescription: 'Delivery check verified and approved. Release escrow payment to complete engagement.',
          deadline: deadlineStr,
          budget: eng.proposedBudget,
          urgency: 'normal',
          ctaLabel: 'Release Escrow & Complete',
          authorizedRole: 'brand',
          createdAt: new Date(eng.updatedAt || eng.createdAt || Date.now()),
        });
      }
    }
  }

  // 4. Sort actions by urgency (urgent first) then by creation date descending
  actions.sort((a, b) => {
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return {
    userId,
    role,
    totalPendingCount: actions.length,
    actions,
    timestamp,
  };
}
