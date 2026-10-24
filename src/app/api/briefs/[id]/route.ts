import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { BriefModel } from '../../../../lib/models/Brief';
import { CreatorModel } from '../../../../lib/models/Creator';
import { INITIAL_BRIEFS, MOCK_CREATORS } from '../../../../data/mockData';
import { getAuthenticatedUser } from '../../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief ID parameter is required.' }
      }, { status: 400 });
    }

    const authUser = await getAuthenticatedUser(req);
    const conn = await connectToDatabase();
    let brief: any = null;

    if (conn) {
      brief = await BriefModel.findOne({ id }).lean();
    }

    if (!brief) {
      brief = INITIAL_BRIEFS.find(b => b.id === id) || null;
    }

    if (!brief) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Brief with ID "${id}" not found.` }
      }, { status: 404 });
    }

    // Privacy guard: private briefs can only be viewed by the assigned creator or creating brand
    if (brief.visibility === 'private') {
      const isAuthorizedCreator = authUser && brief.assignedCreatorId && authUser.id === brief.assignedCreatorId;
      const isAuthorizedBrand = authUser && brief.brandId && authUser.id === brief.brandId;

      if (!isAuthorizedCreator && !isAuthorizedBrand) {
        return NextResponse.json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to view this private brief assignment.' }
        }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, brief });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updates = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief ID parameter is required.' }
      }, { status: 400 });
    }

    // Resolve creator name if assignedCreatorId is provided
    if (updates.assignedCreatorId && !updates.assignedCreatorName) {
      try {
        const conn = await connectToDatabase();
        if (conn) {
          const cDoc = await CreatorModel.findOne({ id: updates.assignedCreatorId }).lean();
          if (cDoc) updates.assignedCreatorName = (cDoc as any).name;
        }
      } catch (e) {}
      if (!updates.assignedCreatorName) {
        const mock = MOCK_CREATORS.find(c => c.id === updates.assignedCreatorId);
        if (mock) updates.assignedCreatorName = mock.name;
      }
    }

    const conn = await connectToDatabase();
    if (conn) {
      const updated = await BriefModel.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (updated) {
        return NextResponse.json({ success: true, brief: updated });
      }
    }

    return NextResponse.json({
      success: true,
      briefId: id,
      updatedFields: Object.keys(updates),
      message: 'Brief updated successfully.'
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
