import { NextRequest, NextResponse } from 'next/server';
import { getShortlistProposals, saveShortlistProposal, recordAudit } from '@/lib/engagementStore';
import { AutoShortlistProposal } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const action: 'ACCEPTED' | 'EDITED' | 'REJECTED' = body.action;
    if (!action || !['ACCEPTED', 'EDITED', 'REJECTED'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'action must be ACCEPTED, EDITED, or REJECTED.' }
      }, { status: 400 });
    }

    const proposals = await getShortlistProposals();
    const proposal = proposals.find((p: AutoShortlistProposal) => p.id === id);

    if (!proposal) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Proposal with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    proposal.status = action;
    proposal.decidedAt = new Date().toISOString();
    if (body.decisionNotes) {
      proposal.brandDecisionNotes = body.decisionNotes;
    }
    if (action === 'EDITED' && body.updatedShortlist) {
      proposal.shortlist = body.updatedShortlist;
    }

    const saved = await saveShortlistProposal(proposal);

    await recordAudit(
      `SHORTLIST_PROPOSAL_${action}`,
      body.actorId || 'brand-user',
      body.actorName || 'Brand Director',
      'brand',
      {
        proposalId: id,
        action,
        decisionNotes: body.decisionNotes,
      },
      undefined,
      proposal.briefId
    );

    return NextResponse.json({
      success: true,
      proposal: saved,
      message: `Shortlist proposal has been ${action}.`,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
