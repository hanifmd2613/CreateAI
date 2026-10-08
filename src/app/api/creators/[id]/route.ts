import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { CreatorModel } from '../../../../lib/models/Creator';
import { MOCK_CREATORS } from '../../../../data/mockData';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Creator ID parameter is required.' }
      }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const creator = await CreatorModel.findOne({ id }).lean();
      if (creator) {
        return NextResponse.json({ success: true, creator });
      }
    }

    const mockMatch = MOCK_CREATORS.find(c => c.id === id);
    if (mockMatch) {
      return NextResponse.json({ success: true, creator: mockMatch });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Creator with ID "${id}" not found.` }
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
        error: { code: 'VALIDATION_ERROR', message: 'Creator ID parameter is required.' }
      }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const updated = await CreatorModel.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (updated) {
        return NextResponse.json({ success: true, creator: updated });
      }
    }

    return NextResponse.json({
      success: true,
      creatorId: id,
      updatedFields: Object.keys(updates),
      message: 'Creator profile updated successfully.'
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}
