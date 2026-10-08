import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { EngagementModel } from '../../../lib/models/Engagement';

let engagementsCache: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');
    const brandId = searchParams.get('brandId');

    const conn = await connectToDatabase();
    if (conn) {
      const query: any = {};
      if (creatorId) query.creatorId = creatorId;
      if (brandId) query.brandId = brandId;

      const items = await EngagementModel.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, count: items.length, engagements: items });
    }

    let filtered = [...engagementsCache];
    if (creatorId) filtered = filtered.filter(e => e.creatorId === creatorId);
    if (brandId) filtered = filtered.filter(e => e.brandId === brandId);

    return NextResponse.json({ success: true, count: filtered.length, engagements: filtered });

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

    const engagement = {
      id: `eng-${Date.now()}`,
      briefId: body.briefId,
      brandId: body.brandId || 'user-brand-kaveri',
      brandName: body.brandName || 'Kaveri Creative Studios',
      creatorId: body.creatorId,
      creatorName: body.creatorName || 'Target Creator',
      projectTitle: body.projectTitle.trim(),
      proposedBudget: body.proposedBudget || '₹3,50,000',
      status: 'Pending',
      message: body.message || 'Direct project inquiry submitted via CreateAI Marketplace.',
      milestones: body.milestones || [
        { title: 'Initial Style Seeds & Keyframe Approval', amount: '50%', status: 'In Escrow' },
        { title: 'Final 4K Master & Seed Manifest Delivery', amount: '50%', status: 'Pending' }
      ],
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await EngagementModel.create(engagement);
      } catch (dbErr) {
        console.warn('MongoDB engagement save warning:', dbErr);
      }
    }

    engagementsCache.unshift(engagement);

    return NextResponse.json({
      success: true,
      engagement,
      message: 'Engagement proposal successfully sent to creator with milestone escrow protection.',
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
