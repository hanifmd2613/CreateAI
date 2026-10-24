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
