import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { BriefModel } from '../../../../lib/models/Brief';
import { INITIAL_BRIEFS } from '../../../../data/mockData';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief ID parameter is required.' }
      }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const dbBrief = await BriefModel.findOne({ id }).lean();
      if (dbBrief) {
        return NextResponse.json({ success: true, brief: dbBrief });
      }
    }

    const mockMatch = INITIAL_BRIEFS.find(b => b.id === id);
    if (mockMatch) {
      return NextResponse.json({ success: true, brief: mockMatch });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Brief with ID "${id}" not found.` }
    }, { status: 404 });

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
