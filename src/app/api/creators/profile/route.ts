import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CreatorModel } from '@/lib/models/Creator';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { calculateProfileCompleteness } from '@/lib/profileCompleteness';
import { MOCK_CREATORS } from '@/data/mockData';
import { Creator } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to access creator profile.' }
      }, { status: 401 });
    }

    const creatorId = user.id;
    let creator: Creator | null = null;

    const conn = await connectToDatabase();
    if (conn) {
      const dbCreator = await CreatorModel.findOne({ id: creatorId }).lean();
      if (dbCreator) {
        creator = dbCreator as any;
      }
    }

    if (!creator) {
      const mockMatch = MOCK_CREATORS.find((c: Creator) => c.id === creatorId);
      if (mockMatch) {
        creator = { ...mockMatch };
      }
    }

    // If still not found, return an initial skeleton based on user account
    if (!creator) {
      creator = {
        id: user.id,
        name: user.name,
        handle: user.handle || `@${user.name.toLowerCase().replace(/\s+/g, '_')}.ai`,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
        specialization: user.specialization || 'Generative AI Director',
        bio: user.bio || 'AI Video & Visual Specialist creating commercial content with generative models.',
        location: user.location || 'Bengaluru, India',
        languages: ['English'],
        skills: user.skills || ['AI Directing', 'Prompt Engineering'],
        tools: user.tools || ['Veo', 'Kling'],
        hourlyRate: user.hourlyRate || 10000,
        avgTurnaround: '48 Hours',
        availableNow: true,
        isVerified: user.isVerified ?? false,
        rating: 5.0,
        reviewCount: 0,
        completedProjects: 0,
        portfolio: [],
      };
    }

    const completeness = calculateProfileCompleteness(creator);
    creator.completeness = completeness.score;

    return NextResponse.json({
      success: true,
      creator,
      completeness,
    });

  } catch (err: any) {
    console.error('Error fetching creator profile:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch creator profile.' }
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to update profile.' }
      }, { status: 401 });
    }

    if (user.role === 'brand') {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Enterprise client accounts cannot edit creator profiles.' }
      }, { status: 403 });
    }

    const body = await req.json();
    const creatorId = user.id;

    // Field-level sanitization and validation
    const updates: Partial<Creator> = {};
    if (typeof body.name === 'string' && body.name.trim().length > 0) updates.name = body.name.trim();
    if (typeof body.headline === 'string') updates.headline = body.headline.trim();
    if (typeof body.bio === 'string') updates.bio = body.bio.trim();
    if (typeof body.specialization === 'string') updates.specialization = body.specialization.trim();
    if (typeof body.location === 'string') updates.location = body.location.trim();
    if (typeof body.handle === 'string') updates.handle = body.handle.trim();
    if (typeof body.avatar === 'string' && body.avatar.trim().length > 0) updates.avatar = body.avatar.trim();
    if (typeof body.coverImage === 'string') updates.coverImage = body.coverImage.trim();
    if (typeof body.contactEmail === 'string') updates.contactEmail = body.contactEmail.trim();

    if (Array.isArray(body.skills)) updates.skills = body.skills.map((s: any) => String(s).trim()).filter(Boolean);
    if (Array.isArray(body.tools)) updates.tools = body.tools.map((t: any) => String(t).trim()).filter(Boolean);
    if (Array.isArray(body.languages)) updates.languages = body.languages.map((l: any) => String(l).trim()).filter(Boolean);
    if (Array.isArray(body.categories)) updates.categories = body.categories.map((c: any) => String(c).trim()).filter(Boolean);
    if (Array.isArray(body.preferredProjectTypes)) updates.preferredProjectTypes = body.preferredProjectTypes.map((p: any) => String(p).trim()).filter(Boolean);
    if (Array.isArray(body.productionWorkflows)) updates.productionWorkflows = body.productionWorkflows.map((w: any) => String(w).trim()).filter(Boolean);

    if (typeof body.hourlyRate === 'number' && body.hourlyRate >= 0) updates.hourlyRate = body.hourlyRate;
    if (typeof body.projectRate === 'number' && body.projectRate >= 0) updates.projectRate = body.projectRate;
    if (typeof body.pricingModel === 'string') updates.pricingModel = body.pricingModel;
    if (typeof body.avgTurnaround === 'string') updates.avgTurnaround = body.avgTurnaround;
    if (typeof body.availableNow === 'boolean') updates.availableNow = body.availableNow;
    if (typeof body.availability === 'boolean') updates.availability = body.availability;
    if (typeof body.experience === 'string') updates.experience = body.experience;
    if (typeof body.yearsOfExperience === 'string') updates.yearsOfExperience = body.yearsOfExperience;

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Durable persistence is currently offline. Profile update not persisted.' }
      }, { status: 503 });
    }

    const updated = await CreatorModel.findOneAndUpdate(
      { id: creatorId },
      { $set: updates },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: { code: 'PERSISTENCE_FAILED', message: 'Failed to persist creator profile to MongoDB.' }
      }, { status: 500 });
    }

    const completeness = calculateProfileCompleteness(updated as any);

    return NextResponse.json({
      success: true,
      creator: updated,
      completeness,
      message: 'Creator profile successfully updated and persisted.'
    });

  } catch (err: any) {
    console.error('Error updating creator profile:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update profile.' }
    }, { status: 500 });
  }
}
