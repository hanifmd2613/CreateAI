import { NextRequest, NextResponse } from 'next/server';
import { getEngagementById, updateEngagement, recordAudit } from '@/lib/engagementStore';
import { validateEngagementTransition } from '@/lib/stateMachine';
import { EngagementStatus, UserRole } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const targetState: EngagementStatus = body.targetState;
    const actorRole: UserRole | 'system' = body.actorRole || 'brand';
    const actorId: string = body.actorId || 'user-default';
    const actorName: string = body.actorName || 'Authorized User';

    if (!targetState) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'targetState is required.' }
      }, { status: 400 });
    }

    const engagement = await getEngagementById(id);
    if (!engagement) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Engagement with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    // Role-based authorization guard check:
    if (actorRole === 'creator' && actorId !== 'user-default' && actorId !== engagement.creatorId) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Forbidden: You are not the assigned creator for this engagement.' }
      }, { status: 403 });
    }

    if (actorRole === 'brand' && actorId !== 'user-default' && actorId !== engagement.brandId) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Forbidden: You are not the owning brand for this engagement.' }
      }, { status: 403 });
    }

    const validation = validateEngagementTransition(engagement, targetState, actorRole, body);
    if (!validation.allowed) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: validation.error || `Invalid state transition to ${targetState}.`
        }
      }, { status: 409 });
    }

    const updates: Partial<typeof engagement> = {
      status: targetState,
    };

    if (body.declineReason) {
      updates.declineReason = body.declineReason;
    }

    if (targetState === 'REVISION_REQUESTED') {
      updates.revisionsUsed = (engagement.revisionsUsed || 0) + 1;
    }

    const updated = await updateEngagement(id, updates);

    await recordAudit(
      `TRANSITION_TO_${targetState}`,
      actorId,
      actorName,
      actorRole,
      {
        previousState: engagement.status,
        targetState,
        declineReason: body.declineReason,
        notes: body.notes,
      },
      id,
      engagement.briefId
    );

    return NextResponse.json({
      success: true,
      engagement: updated,
      message: `Engagement successfully transitioned from ${engagement.status} to ${targetState}.`,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
