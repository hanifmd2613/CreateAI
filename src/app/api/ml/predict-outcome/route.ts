import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CreatorModel } from '@/lib/models/Creator';
import { MOCK_CREATORS } from '@/data/mockData';
import { predictCampaignOutcomes } from '@/lib/ml/outcomePrediction';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, budget, deadlineDays, requiredTools } = body;

    if (!creatorId || typeof creatorId !== 'string') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'creatorId is required.' }
      }, { status: 400 });
    }

    let creator = null;
    const conn = await connectToDatabase();
    if (conn) {
      creator = await CreatorModel.findOne({ id: creatorId }).lean();
    }

    if (!creator) {
      creator = MOCK_CREATORS.find(c => c.id === creatorId);
    }

    if (!creator) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Creator "${creatorId}" not found.` }
      }, { status: 404 });
    }

    const prediction = await predictCampaignOutcomes(creator as any, {
      budget: typeof budget === 'number' ? budget : undefined,
      deadlineDays: typeof deadlineDays === 'number' ? deadlineDays : undefined,
      requiredTools: Array.isArray(requiredTools) ? requiredTools : undefined
    });

    return NextResponse.json({
      success: true,
      prediction,
    });

  } catch (err: any) {
    console.error('Error generating outcome prediction:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Prediction failed.' }
    }, { status: 500 });
  }
}
