import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { CreatorModel } from '../../../../lib/models/Creator';
import { MOCK_CREATORS } from '../../../../data/mockData';
import { getAuthenticatedUser, verifyCreatorOwnership } from '../../../../lib/serverAuth';
import { calculateProfileCompleteness } from '../../../../lib/profileCompleteness';
import { Creator } from '../../../../types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Creator ID parameter is required.' }
      }, { status: 400 });
    }

    const viewer = await getAuthenticatedUser(req);
    const isOwner = viewer?.id === id;

    let creator: Creator | null = null;
    const conn = await connectToDatabase();
    if (conn) {
      const dbCreator = await CreatorModel.findOne({ id }).lean();
      if (dbCreator) {
        creator = dbCreator as any;
      }
    }

    if (!creator) {
      const mockMatch = MOCK_CREATORS.find(c => c.id === id);
      if (mockMatch) {
        creator = { ...mockMatch };
      }
    }

    if (!creator) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Creator with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    // Privacy & Visibility enforcement:
    // If not the profile owner, filter out private portfolio items and sensitive contact details
    let publicCreator: any = { ...creator };
    if (!isOwner) {
      if (Array.isArray(publicCreator.portfolio)) {
        publicCreator.portfolio = publicCreator.portfolio.filter((item: any) => item.visibility !== 'private');
      }
      delete publicCreator.contactEmail;
    }

    const completeness = calculateProfileCompleteness(publicCreator);
    publicCreator.completeness = completeness.score;

    return NextResponse.json({
      success: true,
      creator: publicCreator,
      isOwner,
      completeness: isOwner ? completeness : undefined,
    });

  } catch (err: any) {
    console.error(`Error fetching creator ${params.id}:`, err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to retrieve creator.' }
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Creator ID parameter is required.' }
      }, { status: 400 });
    }

    // Enforce ownership: only the creator owner can mutate their profile
    const authCheck = await verifyCreatorOwnership(req, id);
    if (!authCheck.authorized) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: authCheck.error || 'You are not authorized to update this creator profile.' }
      }, { status: 403 });
    }

    const updates = await req.json();

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Database is offline. Update could not be persisted.' }
      }, { status: 503 });
    }

    const updated = await CreatorModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Creator with ID "${id}" was not found in database.` }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      creator: updated,
      message: 'Creator profile updated successfully.'
    });

  } catch (err: any) {
    console.error(`Error updating creator ${params.id}:`, err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update creator profile.' }
    }, { status: 500 });
  }
}
