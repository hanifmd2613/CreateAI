import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementById,
  getVersions,
  getFeedback,
  getDeliveryChecks,
  getAuditLogs
} from '@/lib/engagementStore';
import { connectToDatabase } from '@/lib/mongodb';
import { BriefModel } from '@/lib/models/Brief';
import { INITIAL_BRIEFS } from '@/data/mockData';
import { verifyServerAuth } from '@/lib/serverAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const engagement = await getEngagementById(id);

    if (!engagement) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Engagement with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    // Participant Authorization: verify caller is brand or creator participant
    const authResult = await verifyServerAuth(req);
    if (authResult.isAuthenticated && authResult.user) {
      const isBrand = engagement.brandId === authResult.user.id;
      const isCreator = engagement.creatorId === authResult.user.id || engagement.creatorId === (authResult.user as any).creatorProfileId;
      if (!isBrand && !isCreator) {
        return NextResponse.json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Forbidden: You are not an authorized participant in this engagement.' }
        }, { status: 403 });
      }
    }

    let brief = null;
    if (engagement.briefId) {
      try {
        const conn = await connectToDatabase();
        if (conn) {
          brief = await BriefModel.findOne({ id: engagement.briefId }).lean();
        }
      } catch (e) {}
      if (!brief) {
        brief = INITIAL_BRIEFS.find(b => b.id === engagement.briefId) || null;
      }
    }

    const [versions, feedback, deliveryChecks, auditLogs] = await Promise.all([
      getVersions(id),
      getFeedback(id),
      getDeliveryChecks(id),
      getAuditLogs(id)
    ]);

    return NextResponse.json({
      success: true,
      engagement,
      brief,
      versions,
      feedback,
      deliveryChecks,
      auditLogs
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
