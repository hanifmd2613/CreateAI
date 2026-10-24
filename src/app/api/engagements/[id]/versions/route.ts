import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementById,
  updateEngagement,
  getVersions,
  saveVersion,
  saveDeliveryCheck,
  recordAudit
} from '@/lib/engagementStore';
import { inspectBinaryBuffer, runDeliveryCheck, calculateAspectRatioString } from '@/lib/deliveryCheck';
import { BriefModel } from '@/lib/models/Brief';
import { INITIAL_BRIEFS } from '@/data/mockData';
import { DeliverableVersion, Brief } from '@/types';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const versions = await getVersions(id);
    return NextResponse.json({ success: true, count: versions.length, versions });
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

    // Resolve brief for technical delivery requirements
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

    const nextVersionNumber = (engagement.currentVersionNumber || 0) + 1;
    const versionId = `ver-${id}-v${nextVersionNumber}`;

    let extractedMetadata: any = null;

    if (body.fileBufferBase64) {
      const buf = Buffer.from(body.fileBufferBase64, 'base64');
      extractedMetadata = inspectBinaryBuffer(buf);
    } else {
      const w = body.width || (body.aspectRatio === '9:16' ? 1080 : (body.aspectRatio === '16:9' ? 1920 : 1080));
      const h = body.height || (body.aspectRatio === '9:16' ? 1920 : (body.aspectRatio === '16:9' ? 1080 : 1080));
      extractedMetadata = {
        format: body.format || 'mp4',
        width: w,
        height: h,
        aspectRatio: body.aspectRatio || calculateAspectRatioString(w, h),
        durationSeconds: body.durationSeconds !== undefined ? body.durationSeconds : 15,
        fileSizeBytes: body.fileSizeBytes || (14.2 * 1024 * 1024),
        isDecodable: body.isDecodable !== undefined ? body.isDecodable : true,
        checksumSha256: crypto.createHash('sha256').update(`${versionId}-${Date.now()}`).digest('hex'),
      };
    }

    const checkResult = runDeliveryCheck(brief, extractedMetadata, versionId, id);
    await saveDeliveryCheck(checkResult);

    const versionRecord: DeliverableVersion = {
      id: versionId,
      engagementId: id,
      versionNumber: nextVersionNumber,
      fileUrl: body.fileUrl || `https://storage.gencraft.ai/engagements/${id}/v${nextVersionNumber}_master.mp4`,
      fileName: body.fileName || `${engagement.projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_v${nextVersionNumber}.mp4`,
      fileSize: extractedMetadata.fileSizeBytes || 14500000,
      fileChecksum: extractedMetadata.checksumSha256 || 'sha256-verified',
      uploaderId: body.uploaderId || engagement.creatorId,
      uploaderName: body.uploaderName || engagement.creatorName,
      submittedAt: new Date().toISOString(),
      generationNotes: body.generationNotes || 'Keyframe prompting via Flux.1 -> Camera trajectory via Veo -> Physics motion synthesis in Kling.',
      status: 'UNDER_REVIEW',
      latestCheckResult: checkResult,
    };

    const savedVersion = await saveVersion(versionRecord);

    // Update engagement state to DRAFT_SUBMITTED and increment version number
    await updateEngagement(id, {
      currentVersionNumber: nextVersionNumber,
      status: 'DRAFT_SUBMITTED',
    });

    await recordAudit(
      'DRAFT_VERSION_SUBMITTED',
      versionRecord.uploaderId,
      versionRecord.uploaderName,
      'creator',
      {
        versionNumber: nextVersionNumber,
        versionId,
        fileName: versionRecord.fileName,
        deliveryCheckStatus: checkResult.overallStatus,
        generationNotes: versionRecord.generationNotes,
      },
      id,
      engagement.briefId
    );

    return NextResponse.json({
      success: true,
      version: savedVersion,
      deliveryCheck: checkResult,
      message: `Draft Version ${nextVersionNumber} submitted successfully. Delivery inspection status: ${checkResult.overallStatus}.`,
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
