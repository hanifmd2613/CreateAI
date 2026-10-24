import { NextRequest, NextResponse } from 'next/server';
import { trackMarketplaceEvent } from '@/lib/ml/eventTracking';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.eventType || typeof body.eventType !== 'string') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'eventType is required.' }
      }, { status: 400 });
    }

    const result = await trackMarketplaceEvent({
      eventType: body.eventType,
      briefId: body.briefId,
      creatorId: body.creatorId,
      brandId: body.brandId,
      engagementId: body.engagementId,
      position: typeof body.position === 'number' ? body.position : undefined,
      rankingScore: typeof body.rankingScore === 'number' ? body.rankingScore : undefined,
      modelVersion: body.modelVersion,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      message: 'Telemetry event persisted to training pipeline.'
    }, { status: 201 });

  } catch (err: any) {
    console.error('Error logging marketplace event:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
