import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { CreatorModel } from '../../../../../lib/models/Creator';
import { getAuthenticatedUser } from '../../../../../lib/serverAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to update portfolio item.' }
      }, { status: 401 });
    }

    const updates = await req.json();

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Database connection offline.' }
      }, { status: 503 });
    }

    // Build update object for the matched array element
    const updateFields: Record<string, any> = {};
    if (updates.title) updateFields['portfolio.$.title'] = updates.title.trim();
    if (updates.type) updateFields['portfolio.$.type'] = updates.type;
    if (updates.mediaUrl) updateFields['portfolio.$.mediaUrl'] = updates.mediaUrl.trim();
    if (updates.thumbnail) updateFields['portfolio.$.thumbnail'] = updates.thumbnail.trim();
    if (updates.workflowDescription !== undefined) updateFields['portfolio.$.workflowDescription'] = updates.workflowDescription;
    if (updates.category) updateFields['portfolio.$.category'] = updates.category;
    if (updates.contentType) updateFields['portfolio.$.contentType'] = updates.contentType;
    if (updates.style) updateFields['portfolio.$.style'] = updates.style;
    if (updates.targetAudience) updateFields['portfolio.$.targetAudience'] = updates.targetAudience;
    if (updates.aspectRatio) updateFields['portfolio.$.aspectRatio'] = updates.aspectRatio;
    if (updates.duration) updateFields['portfolio.$.duration'] = updates.duration;
    if (updates.language) updateFields['portfolio.$.language'] = updates.language;
    if (updates.client) updateFields['portfolio.$.client'] = updates.client;
    if (updates.projectRole) updateFields['portfolio.$.projectRole'] = updates.projectRole;
    if (updates.tools) updateFields['portfolio.$.tools'] = updates.tools;
    if (updates.skills) updateFields['portfolio.$.skills'] = updates.skills;
    if (updates.commercialUse) updateFields['portfolio.$.commercialUse'] = updates.commercialUse;
    if (updates.visibility !== undefined) updateFields['portfolio.$.visibility'] = updates.visibility;
    if (updates.featured !== undefined) updateFields['portfolio.$.featured'] = updates.featured;
    if (updates.order !== undefined) updateFields['portfolio.$.order'] = updates.order;
    updateFields['portfolio.$.updatedAt'] = new Date();

    const updated = await CreatorModel.findOneAndUpdate(
      { id: user.id, 'portfolio.id': itemId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Portfolio item "${itemId}" not found for creator "${user.id}".` }
      }, { status: 404 });
    }

    const updatedItem = updated.portfolio.find(p => p.id === itemId);

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Portfolio item updated successfully.'
    });

  } catch (err: any) {
    console.error(`Error updating portfolio item ${params.itemId}:`, err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update portfolio item.' }
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to delete portfolio item.' }
      }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Database connection offline.' }
      }, { status: 503 });
    }

    const creator = await CreatorModel.findOne({ id: user.id }).lean();
    if (!creator) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Creator profile "${user.id}" not found.` }
      }, { status: 404 });
    }

    const hasItem = Array.isArray(creator.portfolio) && creator.portfolio.some((p: any) => p.id === itemId);
    if (!hasItem) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Portfolio item "${itemId}" not found in your portfolio.` }
      }, { status: 404 });
    }

    await CreatorModel.findOneAndUpdate(
      { id: user.id },
      { $pull: { portfolio: { id: itemId } } }
    );

    return NextResponse.json({
      success: true,
      message: `Portfolio project "${itemId}" permanently deleted.`
    });

  } catch (err: any) {
    console.error(`Error deleting portfolio item ${params.itemId}:`, err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete portfolio item.' }
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      }, { status: 401 });
    }

    const body = await req.json();
    const updateFields: Record<string, any> = {};

    if (body.featured !== undefined) updateFields['portfolio.$.featured'] = Boolean(body.featured);
    if (body.visibility !== undefined) updateFields['portfolio.$.visibility'] = body.visibility === 'private' ? 'private' : 'public';
    if (typeof body.order === 'number') updateFields['portfolio.$.order'] = body.order;
    updateFields['portfolio.$.updatedAt'] = new Date();

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Database offline.' }
      }, { status: 503 });
    }

    const updated = await CreatorModel.findOneAndUpdate(
      { id: user.id, 'portfolio.id': itemId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Portfolio item "${itemId}" not found for creator "${user.id}".` }
      }, { status: 404 });
    }

    const updatedItem = updated.portfolio.find(p => p.id === itemId);

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Portfolio item status updated.'
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to patch portfolio item.' }
    }, { status: 500 });
  }
}
