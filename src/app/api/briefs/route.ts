import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BRIEFS } from '../../../data/mockData';
import { Brief } from '../../../types';

let briefsCache: Brief[] = [...INITIAL_BRIEFS];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    count: briefsCache.length,
    briefs: briefsCache,
  });
}

export async function POST(req: NextRequest) {
  try {
    const newBrief: Brief = await req.json();

    if (!newBrief.title || !newBrief.description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const briefToSave: Brief = {
      ...newBrief,
      id: newBrief.id || `brief-${Date.now()}`,
      status: 'Open',
      createdAt: 'Just now',
      applicantsCount: 0,
    };

    briefsCache = [briefToSave, ...briefsCache];

    return NextResponse.json({
      success: true,
      brief: briefToSave,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
