import { NextRequest, NextResponse } from 'next/server';
import { getPendingActionsForUser } from '@/lib/actionResolver';
import { verifyServerAuth } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authResult = await verifyServerAuth(req);

    // Prefer authenticated user, allow query param if user matches or session exists
    let userId = authResult.isAuthenticated && authResult.user ? authResult.user.id : searchParams.get('userId');
    let role = authResult.isAuthenticated && authResult.user ? authResult.user.role : (searchParams.get('role') as any);

    if (!userId || !role) {
      return NextResponse.json({
        success: true,
        count: 0,
        actions: [],
        message: 'No authenticated user or role provided. Returning empty actionable items.',
      });
    }

    const result = await getPendingActionsForUser(userId, role);

    return NextResponse.json({
      success: true,
      count: result.totalPendingCount,
      userId: result.userId,
      role: result.role,
      actions: result.actions,
      timestamp: result.timestamp,
    });
  } catch (error: any) {
    console.error('Workplace actions resolution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ACTION_RESOLUTION_ERROR',
          message: error.message || 'Failed to resolve workplace pending actions.',
        },
      },
      { status: 500 }
    );
  }
}
