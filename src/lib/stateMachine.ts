import { EngagementStatus, UserRole, EngagementRecord, LicensingStatus } from '../types';

export interface TransitionRule {
  from: EngagementStatus[];
  to: EngagementStatus;
  allowedRoles: (UserRole | 'system')[];
  description: string;
  validate?: (engagement: EngagementRecord, payload?: any) => { valid: boolean; error?: string };
}

export const ENGAGEMENT_TRANSITIONS: TransitionRule[] = [
  {
    from: ['DISCOVERY'],
    to: 'SHORTLISTED',
    allowedRoles: ['brand', 'system'],
    description: 'Brand saves creator to active shortlist.'
  },
  {
    from: ['SHORTLISTED', 'DISCOVERY'],
    to: 'CONTACT_PENDING',
    allowedRoles: ['brand'],
    description: 'Brand drafts commission inquiry.'
  },
  {
    from: ['CONTACT_PENDING', 'SHORTLISTED', 'DISCOVERY'],
    to: 'CONTACTED',
    allowedRoles: ['brand', 'system'],
    description: 'Inquiry officially transmitted to creator.'
  },
  {
    from: ['CONTACTED'],
    to: 'CREATOR_RESPONDED',
    allowedRoles: ['creator'],
    description: 'Creator requests clarification or adjusts timeline.'
  },
  {
    from: ['CREATOR_RESPONDED'],
    to: 'CONTACTED',
    allowedRoles: ['brand'],
    description: 'Brand responds to creator query.'
  },
  {
    from: ['CONTACTED', 'CREATOR_RESPONDED'],
    to: 'CREATOR_ACCEPTED',
    allowedRoles: ['creator'],
    description: 'Creator formally accepts commission proposal.'
  },
  {
    from: ['CONTACTED', 'CREATOR_RESPONDED'],
    to: 'CREATOR_DECLINED',
    allowedRoles: ['creator'],
    description: 'Creator declines engagement inquiry with recorded reason.'
  },
  {
    from: ['CREATOR_ACCEPTED'],
    to: 'SCOPE_CONFIRMATION',
    allowedRoles: ['brand', 'creator', 'system'],
    description: 'Participants formalize scope, milestones, and dates.'
  },
  {
    from: ['SCOPE_CONFIRMATION'],
    to: 'LICENSING_REVIEW',
    allowedRoles: ['brand', 'system'],
    description: 'Verification of commercial licensing boundaries and rights.'
  },
  {
    from: ['LICENSING_REVIEW'],
    to: 'AGREEMENT_CONFIRMED',
    allowedRoles: ['brand', 'creator', 'system'],
    description: 'Both parties lock in confirmed scope and licensing terms.',
    validate: (eng) => {
      if (eng.licensingStatus === 'MISMATCH') {
        return {
          valid: false,
          error: 'Cannot confirm agreement while licensing status is MISMATCH. Resolve commercial rights conflicts first.'
        };
      }
      return { valid: true };
    }
  },
  {
    from: ['AGREEMENT_CONFIRMED'],
    to: 'IN_PRODUCTION',
    allowedRoles: ['brand', 'creator', 'system'],
    description: 'Milestone funded; creator commences active generative production.'
  },
  {
    from: ['IN_PRODUCTION', 'REVISION_IN_PROGRESS'],
    to: 'DRAFT_SUBMITTED',
    allowedRoles: ['creator'],
    description: 'Creator submits draft media asset for review.'
  },
  {
    from: ['DRAFT_SUBMITTED'],
    to: 'REVISION_REQUESTED',
    allowedRoles: ['brand'],
    description: 'Brand submits version-specific critique and requests revisions.',
    validate: (eng) => {
      if (eng.revisionsUsed >= eng.maxRevisions) {
        return {
          valid: false,
          error: `Maximum contract revisions (${eng.maxRevisions}) reached. Extra revision rounds require mutual agreement amendment.`
        };
      }
      return { valid: true };
    }
  },
  {
    from: ['REVISION_REQUESTED'],
    to: 'REVISION_IN_PROGRESS',
    allowedRoles: ['creator'],
    description: 'Creator acknowledges feedback and initiates revised generation.'
  },
  {
    from: ['DRAFT_SUBMITTED', 'REVISION_IN_PROGRESS'],
    to: 'FINAL_REVIEW',
    allowedRoles: ['brand'],
    description: 'Brand queues draft for final technical and creative approval.'
  },
  {
    from: ['FINAL_REVIEW', 'DRAFT_SUBMITTED'],
    to: 'DELIVERY_APPROVED',
    allowedRoles: ['brand'],
    description: 'Brand formally accepts deliverable and clears final milestone.'
  },
  {
    from: ['DELIVERY_APPROVED'],
    to: 'COMPLETED',
    allowedRoles: ['brand', 'system'],
    description: 'Engagement completed, escrow disbursed, and audit log sealed.'
  },
  {
    from: ['IN_PRODUCTION', 'DRAFT_SUBMITTED', 'REVISION_IN_PROGRESS'],
    to: 'ON_HOLD',
    allowedRoles: ['brand', 'creator'],
    description: 'Engagement temporarily paused.'
  },
  {
    from: ['ON_HOLD'],
    to: 'IN_PRODUCTION',
    allowedRoles: ['brand', 'creator'],
    description: 'Engagement resumed from hold.'
  },
  {
    from: [
      'DISCOVERY', 'SHORTLISTED', 'CONTACT_PENDING', 'CONTACTED', 
      'CREATOR_RESPONDED', 'CREATOR_ACCEPTED', 'SCOPE_CONFIRMATION', 
      'LICENSING_REVIEW', 'AGREEMENT_CONFIRMED', 'IN_PRODUCTION', 
      'DRAFT_SUBMITTED', 'REVISION_REQUESTED', 'REVISION_IN_PROGRESS', 
      'FINAL_REVIEW', 'ON_HOLD'
    ],
    to: 'CANCELLED',
    allowedRoles: ['brand', 'system'],
    description: 'Engagement formally cancelled with documented reason.'
  }
];

export function normalizeLegacyStatus(status: string): EngagementStatus {
  switch (status) {
    case 'Pending':
      return 'CONTACTED';
    case 'Accepted':
      return 'CREATOR_ACCEPTED';
    case 'In Production':
      return 'IN_PRODUCTION';
    case 'Completed':
      return 'COMPLETED';
    case 'Declined':
      return 'CREATOR_DECLINED';
    default:
      return status as EngagementStatus;
  }
}

export function validateEngagementTransition(
  engagement: EngagementRecord,
  targetState: EngagementStatus,
  actorRole: UserRole | 'system',
  payload?: any
): { allowed: boolean; error?: string } {
  const current = normalizeLegacyStatus(engagement.status);

  // Terminal states cannot transition further
  if (current === 'COMPLETED' || current === 'CREATOR_DECLINED' || current === 'CANCELLED') {
    return {
      allowed: false,
      error: `Engagement is in terminal state "${current}" and cannot transition to "${targetState}".`
    };
  }

  // Idempotent: same state is allowed
  if (current === targetState) {
    return { allowed: true };
  }

  const matchingRule = ENGAGEMENT_TRANSITIONS.find(
    r => r.from.includes(current) && r.to === targetState
  );

  if (!matchingRule) {
    const validNextStates = ENGAGEMENT_TRANSITIONS
      .filter(r => r.from.includes(current))
      .map(r => r.to);
    return {
      allowed: false,
      error: `Invalid state transition from "${current}" to "${targetState}". Valid target states are: ${validNextStates.join(', ') || 'None'}.`
    };
  }

  // Role check
  if (!matchingRule.allowedRoles.includes(actorRole) && actorRole !== 'system') {
    return {
      allowed: false,
      error: `Unauthorized: User role "${actorRole}" is not permitted to advance engagement from "${current}" to "${targetState}". Allowed roles: ${matchingRule.allowedRoles.join(', ')}.`
    };
  }

  // Prerequisite check
  if (matchingRule.validate) {
    const validationRes = matchingRule.validate(engagement, payload);
    if (!validationRes.valid) {
      return { allowed: false, error: validationRes.error };
    }
  }

  return { allowed: true };
}

export function getAllowedNextStates(
  currentState: EngagementStatus,
  role: UserRole | 'system'
): EngagementStatus[] {
  const current = normalizeLegacyStatus(currentState);
  return ENGAGEMENT_TRANSITIONS
    .filter(r => r.from.includes(current) && (r.allowedRoles.includes(role) || role === 'system'))
    .map(r => r.to);
}
