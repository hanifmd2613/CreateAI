import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CreatorModel } from '@/lib/models/Creator';
import { MOCK_CREATORS } from '@/data/mockData';
import { runOfflineModelEvaluation } from '@/lib/ml/evaluation';
import { Creator } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let allCreators: Creator[] = [];
    const conn = await connectToDatabase();
    if (conn) {
      allCreators = await CreatorModel.find({}).lean() as any[];
    }

    if (!allCreators || allCreators.length === 0) {
      allCreators = [...MOCK_CREATORS];
    }

    const report = await runOfflineModelEvaluation(allCreators);

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (err: any) {
    console.error('Error running offline evaluation:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
