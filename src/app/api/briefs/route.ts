import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { BriefModel } from '../../../lib/models/Brief';
import { CreatorModel } from '../../../lib/models/Creator';
import { INITIAL_BRIEFS, MOCK_CREATORS } from '../../../data/mockData';
import { Brief } from '../../../types';
import { getAuthenticatedUser } from '../../../lib/serverAuth';
import { saveEngagement } from '../../../lib/engagementStore';

let memoryCache: Brief[] = [...INITIAL_BRIEFS];

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const brandIdParam = searchParams.get('brandId') || undefined;
    const statusParam = searchParams.get('status') || undefined;
    const visibilityParam = searchParams.get('visibility') || undefined;
    const myBriefs = searchParams.get('myBriefs') === 'true';

    const authUser = await getAuthenticatedUser(req);
    const conn = await connectToDatabase();

    // Build canonical database query
    const dbQuery: any = {};

    if (statusParam) {
      dbQuery.status = statusParam;
    }

    if (visibilityParam) {
      dbQuery.visibility = visibilityParam;
    }

    // Role-based visibility isolation
    if (assignedTo) {
      // Direct query for a specific creator's assignments
      dbQuery.assignedCreatorId = assignedTo;

      // If user is authenticated as an unrelated creator, they can only see public assignments
      if (authUser?.role === 'creator' && authUser.id !== assignedTo) {
        dbQuery.visibility = 'public';
      } else if (!authUser) {
        dbQuery.visibility = 'public';
      }
    } else if (brandIdParam) {
      dbQuery.brandId = brandIdParam;
      if (authUser?.id !== brandIdParam) {
        dbQuery.visibility = 'public';
      }
    } else if (myBriefs && authUser) {
      if (authUser.role === 'creator') {
        dbQuery.assignedCreatorId = authUser.id;
      } else if (authUser.role === 'brand') {
        dbQuery.brandId = authUser.id;
      }
    } else {
      // General marketplace discovery feed
      if (authUser?.role === 'creator') {
        // Creator sees all public opportunities PLUS private briefs assigned to them
        dbQuery.$or = [
          { visibility: 'public' },
          { visibility: { $exists: false } },
          { assignedCreatorId: authUser.id },
        ];
      } else if (authUser?.role === 'brand') {
        // Brand sees all public opportunities PLUS briefs they created
        dbQuery.$or = [
          { visibility: 'public' },
          { visibility: { $exists: false } },
          { brandId: authUser.id },
        ];
      } else {
        // Unauthenticated guest sees only public briefs
        dbQuery.$or = [
          { visibility: 'public' },
          { visibility: { $exists: false } },
        ];
      }
    }

    let results: Brief[] = [];

    if (conn) {
      try {
        const dbBriefs = await BriefModel.find(dbQuery).sort({ createdAt: -1 }).lean();
        if (Array.isArray(dbBriefs)) {
          results = dbBriefs as any[];
        }
      } catch (dbErr) {
        console.warn('MongoDB brief query error, using fallback dataset:', dbErr);
      }
    }

    // In-memory fallback if database query returned no results or is offline
    if (results.length === 0 && !conn) {
      results = memoryCache.filter((b) => {
        if (assignedTo && b.assignedCreatorId !== assignedTo) return false;
        if (brandIdParam && b.brandId !== brandIdParam) return false;
        if (statusParam && b.status !== statusParam) return false;
        if (visibilityParam && b.visibility !== visibilityParam) return false;

        // Visibility rules
        if (b.visibility === 'private') {
          if (authUser?.role === 'creator' && b.assignedCreatorId === authUser.id) return true;
          if (authUser?.role === 'brand' && b.brandId === authUser.id) return true;
          return false;
        }
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      briefs: results,
    });
  } catch (err: any) {
    console.error('Error fetching briefs:', err);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Failed to fetch briefs.'
      }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const body: Partial<Brief> & { [key: string]: any } = await req.json();

    // Input Validation
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief campaign title is required.' }
      }, { status: 400 });
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief creative description is required.' }
      }, { status: 400 });
    }

    // Canonical Brand Identity Resolution
    const resolvedBrandId = authUser?.id || body.brandId || 'user-brand-kaveri';
    const resolvedBrandName = authUser?.companyName || authUser?.name || body.brandName || 'Kaveri Creative Studios';
    const resolvedBrandAvatar = authUser?.avatar || body.brandAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=KaveriStudios';

    const briefId = body.id || `brief-${Date.now()}`;

    // Assigned Creator Resolution
    let assignedCreatorId = body.assignedCreatorId || undefined;
    let assignedCreatorName = body.assignedCreatorName || undefined;

    if (assignedCreatorId && !assignedCreatorName) {
      try {
        const conn = await connectToDatabase();
        if (conn) {
          const creatorDoc = await CreatorModel.findOne({ id: assignedCreatorId }).lean();
          if (creatorDoc) assignedCreatorName = (creatorDoc as any).name;
        }
      } catch (e) {}
      if (!assignedCreatorName) {
        const mock = MOCK_CREATORS.find(c => c.id === assignedCreatorId);
        if (mock) assignedCreatorName = mock.name;
      }
    }

    const visibility: 'public' | 'private' = body.visibility || (assignedCreatorId ? 'private' : 'public');
    const status = body.status || (assignedCreatorId ? 'Assigned' : 'Open');

    const briefToSave: Brief = {
      ...body,
      id: briefId,
      brandId: resolvedBrandId,
      brandName: resolvedBrandName.trim(),
      brandAvatar: resolvedBrandAvatar,
      assignedCreatorId,
      assignedCreatorName,
      visibility,
      title: body.title.trim(),
      description: body.description.trim(),
      contentType: body.contentType || 'AI Commercial Video',
      style: body.style || 'Cinematic Hyperrealism',
      aspectRatio: body.aspectRatio || '16:9',
      commercialUse: body.commercialUse || 'Full Buyout',
      budget: body.budget || '₹3,50,000 - ₹7,00,000',
      deadline: body.deadline || '3-5 Days',
      requiredTools: Array.isArray(body.requiredTools) && body.requiredTools.length > 0
        ? body.requiredTools
        : ['Veo', 'Kling'],
      deliverables: Array.isArray(body.deliverables) ? body.deliverables : ['Master 4K Video', 'Seed Manifest'],
      status,
      createdAt: new Date().toISOString(),
      applicantsCount: 0,
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await BriefModel.create(briefToSave);
      } catch (dbErr: any) {
        console.error('MongoDB brief save failure:', dbErr);
        return NextResponse.json({
          success: false,
          error: { code: 'DATABASE_ERROR', message: `Failed to persist brief to database: ${dbErr.message}` }
        }, { status: 500 });
      }
    }

    // If directly assigned to a creator, automatically initialize an Engagement in CONTACTED status
    if (assignedCreatorId) {
      try {
        const engagementId = `eng-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await saveEngagement({
          id: engagementId,
          briefId: briefToSave.id,
          brandId: resolvedBrandId,
          brandName: resolvedBrandName,
          brandAvatar: resolvedBrandAvatar,
          creatorId: assignedCreatorId,
          creatorName: assignedCreatorName || 'Target Creator',
          projectTitle: briefToSave.title,
          proposedBudget: briefToSave.budget,
          status: 'CONTACTED',
          licensingStatus: 'COMPATIBLE',
          message: `Direct campaign brief "${briefToSave.title}" assigned by ${resolvedBrandName}.`,
          milestones: [
            { title: 'Draft V1 Generation & Seed Checkpoints', amount: '50%', status: 'In Escrow' },
            { title: 'Final 4K Master & IP Buyout Delivery', amount: '50%', status: 'Pending' }
          ],
          currentVersionNumber: 0,
          maxRevisions: 2,
          revisionsUsed: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (engErr) {
        console.warn('Auto-engagement initialization error during brief assignment:', engErr);
      }
    }

    memoryCache = [briefToSave, ...memoryCache];

    return NextResponse.json({
      success: true,
      brief: briefToSave,
      message: assignedCreatorId
        ? `Campaign brief published and directly assigned to ${assignedCreatorName || 'creator'}.`
        : 'Campaign brief published successfully to marketplace.',
    }, { status: 201 });

  } catch (err: any) {
    console.error('Error in POST /api/briefs:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create campaign brief.' }
    }, { status: 500 });
  }
}
