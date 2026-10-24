import { NextRequest, NextResponse } from 'next/server';
import { generateAutoShortlistProposal } from '../../../../lib/autoShortlist';
import { getShortlistProposals, saveShortlistProposal, recordAudit } from '../../../../lib/engagementStore';
import { BriefModel } from '../../../../lib/models/Brief';
import { CreatorModel } from '../../../../lib/models/Creator';
import { INITIAL_BRIEFS, MOCK_CREATORS } from '../../../../data/mockData';
import { Brief, Creator } from '../../../../types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const briefId = searchParams.get('briefId') || undefined;

    const proposals = await getShortlistProposals(briefId);
    return NextResponse.json({ success: true, count: proposals.length, proposals });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { briefId, brief, maxCandidates } = body;

    if (!brief && briefId) {
      try {
        brief = await BriefModel.findOne({ id: briefId }).lean();
      } catch (e) {}
      if (!brief) brief = INITIAL_BRIEFS.find(b => b.id === briefId) || null;
    }

    if (!brief) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid briefId or brief payload is required.' }
      }, { status: 400 });
    }

    // Retrieve real platform creators from database
    let creators: Creator[] = [];
    try {
      const dbCreators = await CreatorModel.find({}).lean();
      if (dbCreators && dbCreators.length > 0) {
        creators = dbCreators as any[];
      }
    } catch (e) {}

    if (creators.length === 0) {
      creators = MOCK_CREATORS;
    }

    const proposal = generateAutoShortlistProposal({
      brief: brief as Brief,
      creators,
      maxCandidates: maxCandidates || 3,
    });

    const saved = await saveShortlistProposal(proposal);

    await recordAudit(
      'AUTO_SHORTLIST_PROPOSAL_GENERATED',
      body.actorId || 'agent-auto-shortlist',
      'Auto-Shortlist Agent',
      'agent',
      {
        briefId: brief.id,
        briefTitle: brief.title,
        candidatesCount: proposal.shortlist.length,
        excludedCount: proposal.excludedCandidates.length,
      },
      undefined,
      brief.id
    );

    return NextResponse.json({
      success: true,
      proposal: saved,
      message: `Auto-Shortlist Agent successfully evaluated ${creators.length} creators and generated ${proposal.shortlist.length} candidate recommendations.`,
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
