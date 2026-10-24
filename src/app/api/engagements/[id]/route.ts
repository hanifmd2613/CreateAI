import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementById,
  getVersions,
  getFeedback,
  getDeliveryChecks,
  getAuditLogs
} from '@/lib/engagementStore';

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

    const [versions, feedback, deliveryChecks, auditLogs] = await Promise.all([
      getVersions(id),
      getFeedback(id),
      getDeliveryChecks(id),
      getAuditLogs(id)
    ]);

    return NextResponse.json({
      success: true,
      engagement,
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
