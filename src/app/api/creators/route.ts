import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CREATORS } from '../../../data/mockData';
import { Creator } from '../../../types';

// In-memory runtime cache for session
let creatorsCache: Creator[] = [...MOCK_CREATORS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tool = searchParams.get('tool');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  let results = [...creatorsCache];

  if (tool && tool !== 'All Tools') {
    results = results.filter(c => c.tools.some(t => t.toLowerCase() === tool.toLowerCase()));
  }

  if (type && type !== 'All Types') {
    results = results.filter(c => c.portfolio.some(p => p.type.toLowerCase() === type.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.specialization.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    creators: results,
  });
}

export async function POST(req: NextRequest) {
  try {
    const newCreator: Creator = await req.json();

    if (!newCreator.name || !newCreator.specialization) {
      return NextResponse.json({ error: 'Name and specialization are required' }, { status: 400 });
    }

    // Assign verified defaults if not provided
    const creatorToSave: Creator = {
      ...newCreator,
      id: newCreator.id || `creator-${Date.now()}`,
      rating: newCreator.rating || 5.0,
      reviewCount: newCreator.reviewCount || 1,
      completedProjects: newCreator.completedProjects || 0,
      availableNow: true,
      isVerified: true,
      isUserCreated: true,
      verifiedDetails: newCreator.verifiedDetails || {
        certifiedPipeline: 'V24 Neural Production Tier-1 (Audited Checkpoints)',
        auditDate: 'Live Account',
        safetyScore: 99.9,
        commercialRightsGuaranteed: true,
      },
      portfolio: newCreator.portfolio || [],
    };

    // Prepend so new creator appears at the top!
    creatorsCache = [creatorToSave, ...creatorsCache];

    return NextResponse.json({
      success: true,
      creator: creatorToSave,
      message: 'Creator profile successfully registered in live marketplace.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
