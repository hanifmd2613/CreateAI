import { NextRequest, NextResponse } from 'next/server';
import { getEngagements, saveEngagement, recordAudit } from '../../../lib/engagementStore';
import { evaluateLicensingCompatibility } from '../../../lib/licensing';
import { BriefModel } from '../../../lib/models/Brief';
import { CreatorModel } from '../../../lib/models/Creator';
import { INITIAL_BRIEFS, MOCK_CREATORS } from '../../../data/mockData';
import { EngagementRecord } from '../../../types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId') || undefined;
    const brandId = searchParams.get('brandId') || undefined;

    const items = await getEngagements({ creatorId, brandId });
    return NextResponse.json({ success: true, count: items.length, engagements: items });
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

    if (!body.creatorId || !body.projectTitle) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'creatorId and projectTitle are required.' }
      }, { status: 400 });
    }

    // Attempt to resolve brief and creator to determine initial licensing status
    let brief = null;
    let creator = null;

    if (body.briefId) {
      try {
        brief = await BriefModel.findOne({ id: body.briefId }).lean();
      } catch (e) {}
      if (!brief) brief = INITIAL_BRIEFS.find(b => b.id === body.briefId) || null;
    }

    try {
      creator = await CreatorModel.findOne({ id: body.creatorId }).lean();
    } catch (e) {}
    if (!creator) creator = MOCK_CREATORS.find(c => c.id === body.creatorId) || null;

    let licensingStatus: any = 'UNKNOWN';
    if (brief && creator) {
      const licensingEval = evaluateLicensingCompatibility(brief as any, creator as any);
      licensingStatus = licensingEval.status;
    }

    const engagement: EngagementRecord = {
      id: body.id || `eng-${Date.now()}`,
      briefId: body.briefId || undefined,
      brandId: body.brandId || 'user-brand-kaveri',
      brandName: body.brandName || 'Kaveri Creative Studios',
      brandAvatar: body.brandAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=KaveriStudios',
      creatorId: body.creatorId,
      creatorName: body.creatorName || (creator ? creator.name : 'Target Creator'),
      creatorAvatar: body.creatorAvatar || (creator ? creator.avatar : undefined),
      projectTitle: body.projectTitle.trim(),
      proposedBudget: body.proposedBudget || body.budget || '₹3,50,000',
      status: 'CONTACTED',
      licensingStatus,
      message: body.message || body.initialMessage || 'Direct project inquiry submitted via GenCraft Marketplace.',
      milestones: body.milestones || [
        { title: 'Initial Style Seeds & Keyframe Approval', amount: '50%', status: 'In Escrow' },
        { title: 'Final 4K Master & Seed Manifest Delivery', amount: '50%', status: 'Pending' }
      ],
      currentVersionNumber: 0,
      maxRevisions: body.maxRevisions || 2,
      revisionsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveEngagement(engagement);

    // Record audit event
    await recordAudit(
      'ENGAGEMENT_CREATED',
      engagement.brandId,
      engagement.brandName,
      'brand',
      {
        projectTitle: engagement.projectTitle,
        proposedBudget: engagement.proposedBudget,
        creatorId: engagement.creatorId,
        briefId: engagement.briefId,
        licensingStatus,
      },
      engagement.id,
      engagement.briefId
    );

    return NextResponse.json({
      success: true,
      engagement: saved,
      message: 'Engagement proposal successfully sent to creator with milestone escrow protection.',
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
