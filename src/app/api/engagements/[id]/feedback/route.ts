import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementById,
  getFeedback,
  saveFeedback,
  resolveFeedback,
  recordAudit
} from '@/lib/engagementStore';
import { VersionFeedback } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get('versionId') || undefined;

    const feedback = await getFeedback(id, versionId);
    return NextResponse.json({ success: true, count: feedback.length, feedback });
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

    if (!body.versionId || !body.comment) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'versionId and comment are required.' }
      }, { status: 400 });
    }

    const engagement = await getEngagementById(id);
    if (!engagement) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Engagement with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    const feedbackItem: VersionFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      engagementId: id,
      versionId: body.versionId,
      authorId: body.authorId || engagement.brandId,
      authorName: body.authorName || engagement.brandName,
      authorRole: body.authorRole || 'brand',
      timestampOffset: body.timestampOffset !== undefined ? Number(body.timestampOffset) : undefined,
      coordinates: body.coordinates || undefined,
      comment: body.comment.trim(),
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveFeedback(feedbackItem);

    await recordAudit(
      'FEEDBACK_SUBMITTED',
      feedbackItem.authorId,
      feedbackItem.authorName,
      feedbackItem.authorRole,
      {
        versionId: feedbackItem.versionId,
        comment: feedbackItem.comment,
        timestampOffset: feedbackItem.timestampOffset,
      },
      id,
      engagement.briefId
    );

    return NextResponse.json({
      success: true,
      feedback: saved,
      message: 'Version feedback submitted successfully.',
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!body.feedbackId) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'feedbackId is required.' }
      }, { status: 400 });
    }

    const resolved = await resolveFeedback(body.feedbackId, body.resolvedInVersion);

    await recordAudit(
      'FEEDBACK_RESOLVED',
      body.actorId || 'user-creator',
      body.actorName || 'Creator',
      body.actorRole || 'creator',
      {
        feedbackId: body.feedbackId,
        resolvedInVersion: body.resolvedInVersion,
      },
      id
    );

    return NextResponse.json({
      success: true,
      feedback: resolved,
      message: 'Feedback item marked as resolved.',
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
