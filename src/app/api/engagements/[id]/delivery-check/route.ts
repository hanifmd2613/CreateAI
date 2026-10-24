import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementById,
  getDeliveryChecks,
  saveDeliveryCheck,
  recordAudit
} from '@/lib/engagementStore';
import { inspectBinaryBuffer, runDeliveryCheck } from '@/lib/deliveryCheck';
import { BriefModel } from '@/lib/models/Brief';
import { INITIAL_BRIEFS } from '@/data/mockData';
import { Brief } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get('versionId') || undefined;

    const checks = await getDeliveryChecks(id, versionId);
    return NextResponse.json({ success: true, count: checks.length, deliveryChecks: checks });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const engagement = await getEngagementById(id);
    if (!engagement) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Engagement with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    let brief: any = null;
    if (engagement.briefId) {
      try {
        brief = await BriefModel.findOne({ id: engagement.briefId }).lean();
      } catch (e) {}
      if (!brief) brief = INITIAL_BRIEFS.find((b: Brief) => b.id === engagement.briefId) || null;
    }

    if (!brief) {
      brief = {
        id: 'default-brief',
        title: engagement.projectTitle,
        aspectRatio: '9:16',
        duration: '0:15',
        contentType: 'AI Commercial Video',
      };
    }

    const versionId = body.versionId || `ver-${id}-v${engagement.currentVersionNumber || 1}`;

    let metadata: any = null;
    if (body.fileBufferBase64) {
      const buf = Buffer.from(body.fileBufferBase64, 'base64');
      metadata = inspectBinaryBuffer(buf);
    } else if (body.metadata) {
      metadata = body.metadata;
    } else {
      metadata = {
        format: body.format || 'mp4',
        width: body.width || 1080,
        height: body.height || 1920,
        aspectRatio: body.aspectRatio || '9:16',
        durationSeconds: body.durationSeconds !== undefined ? body.durationSeconds : 15,
        fileSizeBytes: body.fileSizeBytes || (12 * 1024 * 1024),
        isDecodable: body.isDecodable !== undefined ? body.isDecodable : true,
      };
    }

    const checkResult = runDeliveryCheck(brief, metadata, versionId, id);
    const saved = await saveDeliveryCheck(checkResult);

    await recordAudit(
      'DELIVERY_CHECK_EXECUTED',
      body.actorId || 'system',
      body.actorName || 'Delivery Check Engine',
      'system',
      {
        versionId,
        overallStatus: checkResult.overallStatus,
        failCount: checkResult.checks.filter((c: any) => c.status === 'FAIL').length,
      },
      id,
      engagement.briefId
    );

    return NextResponse.json({
      success: true,
      deliveryCheck: saved,
      message: `Delivery check completed with status: ${checkResult.overallStatus}.`,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
