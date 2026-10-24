import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '../../../lib/engagementStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId') || undefined;
    const briefId = searchParams.get('briefId') || undefined;

    const logs = await getAuditLogs(engagementId, briefId);
    return NextResponse.json({ success: true, count: logs.length, auditLogs: logs });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
