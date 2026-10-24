import { Brief, Creator, AutoShortlistProposal, ShortlistCandidate, ExcludedCandidate, AuditLogEntry } from '../types';
import { rankCreatorsForBrief } from './matching';
import { evaluateLicensingCompatibility } from './licensing';

export interface GenerateShortlistOptions {
  brief: Brief;
  creators: Creator[];
  maxCandidates?: number;
}

export function generateAutoShortlistProposal({
  brief,
  creators,
  maxCandidates = 3,
}: GenerateShortlistOptions): AutoShortlistProposal {
  const proposalId = `prop-${Date.now()}`;
  const excludedCandidates: ExcludedCandidate[] = [];
  const eligibleCreators: Creator[] = [];

  // 1. Hard Eligibility Filter
  creators.forEach(c => {
    // Check 1: Inactive / unavailable
    if (c.availability === false && c.availableNow === false) {
      excludedCandidates.push({
        creatorId: c.id,
        creatorName: c.name,
        reason: 'Creator status marked as currently unavailable for new campaign commissions.'
      });
      return;
    }

    // Check 2: Content type mismatch (e.g. video creator requested, but creator only does audio)
    const isVideoBrief = brief.contentType.toLowerCase().includes('video');
    const isImageBrief = brief.contentType.toLowerCase().includes('image');
    const isAudioBrief = brief.contentType.toLowerCase().includes('audio');

    const hasMatchingPortfolio = c.portfolio.some(p => {
      if (isVideoBrief && p.type === 'video') return true;
      if (isImageBrief && p.type === 'image') return true;
      if (isAudioBrief && p.type === 'audio') return true;
      return false;
    });

    const specMatches = c.specialization.toLowerCase().includes(brief.contentType.toLowerCase());
    if (!hasMatchingPortfolio && !specMatches) {
      excludedCandidates.push({
        creatorId: c.id,
        creatorName: c.name,
        reason: `Lacks verified portfolio samples or specialization in requested medium (${brief.contentType}).`
      });
      return;
    }

    eligibleCreators.push(c);
  });

  // 2. Run deterministic matching on eligible pool
  const ranked = rankCreatorsForBrief(brief, eligibleCreators);

  // 3. Select top candidates and attach licensing analysis
  const shortlist: ShortlistCandidate[] = ranked.slice(0, maxCandidates).map(m => {
    const licensingEval = evaluateLicensingCompatibility(brief, m.creator);

    let nextAction = 'Review portfolio steps and dispatch formal commission proposal.';
    if (licensingEval.status === 'MISMATCH') {
      nextAction = 'Resolve licensing territory / duration rider before confirming scope.';
    } else if (licensingEval.status === 'UNKNOWN') {
      nextAction = 'Request explicit commercial declaration from creator.';
    }

    return {
      creatorId: m.creatorId,
      creator: m.creator,
      matchScore: m.finalScore,
      licensingStatus: licensingEval.status,
      positiveEvidence: m.positiveEvidence,
      missingFactors: m.missingMatches,
      recommendedNextAction: nextAction,
    };
  });

  // 4. Record any creators ranked below cutoff as excluded
  ranked.slice(maxCandidates).forEach(m => {
    excludedCandidates.push({
      creatorId: m.creatorId,
      creatorName: m.creator.name,
      reason: `Ranked below top ${maxCandidates} threshold with match score ${m.finalScore}%.`
    });
  });

  return {
    id: proposalId,
    briefId: brief.id,
    briefTitle: brief.title,
    evaluatedCandidatesCount: creators.length,
    shortlist,
    excludedCandidates,
    status: 'PROPOSED',
    createdAt: new Date().toISOString(),
  };
}

export function createAuditLog(
  action: string,
  actorId: string,
  actorName: string,
  actorRole: 'brand' | 'creator' | 'system' | 'agent',
  details: Record<string, any>,
  engagementId?: string,
  briefId?: string
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    engagementId,
    briefId,
    action,
    actorId,
    actorName,
    actorRole,
    timestamp: new Date().toISOString(),
    details,
  };
}

const memoryProposals: Map<string, AutoShortlistProposal> = new Map();

export function generateAutonomousShortlistProposal(
  brief: Brief,
  creators: Creator[],
  maxCandidates: number = 3
): AutoShortlistProposal {
  const proposal = generateAutoShortlistProposal({ brief, creators, maxCandidates });
  memoryProposals.set(proposal.id, proposal);
  return proposal;
}

export function decideOnShortlistProposal(
  proposalId: string,
  decision: 'ACCEPTED' | 'REJECTED' | 'EDITED',
  notes?: string
): AutoShortlistProposal {
  let proposal = memoryProposals.get(proposalId);
  if (!proposal) {
    proposal = {
      id: proposalId,
      briefId: 'brief-unknown',
      briefTitle: 'Campaign Brief',
      evaluatedCandidatesCount: 0,
      shortlist: [],
      excludedCandidates: [],
      status: 'PROPOSED',
      createdAt: new Date().toISOString(),
    };
    memoryProposals.set(proposalId, proposal);
  }

  proposal.status = decision;
  proposal.decidedAt = new Date().toISOString();
  proposal.brandDecisionNotes = notes;
  return proposal;
}

