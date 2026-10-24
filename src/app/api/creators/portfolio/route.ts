import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '../../../../lib/mongodb';
import { CreatorModel } from '../../../../lib/models/Creator';
import { getAuthenticatedUser } from '../../../../lib/serverAuth';
import { PortfolioItem } from '../../../../types';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to add portfolio items.' }
      }, { status: 401 });
    }

    if (user.role === 'brand') {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only creator accounts can publish portfolio items.' }
      }, { status: 403 });
    }

    const body = await req.json();

    // Validation
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project title is required.' }
      }, { status: 400 });
    }

    const type = body.type || 'video';
    if (!['video', 'image', 'audio'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project type must be video, image, or audio.' }
      }, { status: 400 });
    }

    const mediaUrl = body.mediaUrl || body.thumbnail;
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project mediaUrl or thumbnail is required.' }
      }, { status: 400 });
    }

    const aspectRatio = body.aspectRatio || '16:9';
    const itemId = body.id || `port-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const newItem: PortfolioItem = {
      id: itemId,
      title: body.title.trim(),
      type,
      mediaUrl: mediaUrl.trim(),
      thumbnail: (body.thumbnail || mediaUrl).trim(),
      workflowDescription: body.workflowDescription || body.description || '',
      workflow: body.workflow || body.workflowDescription || '',
      tools: Array.isArray(body.tools) ? body.tools : [],
      contentType: body.contentType || body.category || 'Commercial Film',
      category: body.category || body.contentType || 'General',
      style: body.style || 'Photorealistic Cinematic',
      targetAudience: body.targetAudience || 'General Audience',
      aspectRatio,
      duration: body.duration || (type === 'video' ? '30s' : undefined),
      language: body.language || 'English',
      skills: Array.isArray(body.skills) ? body.skills : [],
      projectRole: body.projectRole || 'AI Director & Prompt Artist',
      client: body.client || undefined,
      projectDate: body.projectDate || new Date().toISOString().split('T')[0],
      promptSnippet: body.promptSnippet || undefined,
      commercialUse: body.commercialUse || 'Full Buyout',
      verificationStatus: 'Verified',
      featured: Boolean(body.featured),
      visibility: body.visibility === 'private' ? 'private' : 'public',
      order: typeof body.order === 'number' ? body.order : 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Database is offline. Portfolio item could not be persisted.' }
      }, { status: 503 });
    }

    const updated = await CreatorModel.findOneAndUpdate(
      { id: user.id },
      { $push: { portfolio: newItem } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: { code: 'CREATOR_NOT_FOUND', message: `Creator profile for user "${user.id}" not found in database.` }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Portfolio item created and persisted to durable storage.',
    }, { status: 201 });

  } catch (err: any) {
    console.error('Error adding portfolio item:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to add portfolio item.' }
    }, { status: 500 });
  }
}
