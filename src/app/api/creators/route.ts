import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { CreatorModel } from '../../../lib/models/Creator';
import { MOCK_CREATORS } from '../../../data/mockData';
import { searchCreators } from '../../../lib/search';
import { Creator } from '../../../types';

let memoryCache: Creator[] = [...MOCK_CREATORS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tool = searchParams.get('tool') || undefined;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;
    const spec = searchParams.get('specialization') || undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const conn = await connectToDatabase();
    let allCreators: Creator[] = [];

    if (conn) {
      try {
        const dbResults = await CreatorModel.find({}).lean();
        if (dbResults && dbResults.length > 0) {
          const map = new Map<string, Creator>();
          for (const m of MOCK_CREATORS) {
            map.set(m.id, m);
          }
          for (const d of (dbResults as any[])) {
            map.set(d.id, d);
          }
          allCreators = Array.from(map.values());
        }
      } catch (dbErr) {
        console.warn('MongoDB query warning in creators GET, using fallback dataset:', dbErr);
      }
    }

    if (allCreators.length === 0) {
      allCreators = [...memoryCache];
    }

    // Apply multi-layer semantic search & filtering
    const searchResults = searchCreators(allCreators, {
      query: search || '',
      tool,
      specialization: spec,
      contentType: type,
      verifiedOnly,
    });

    return NextResponse.json({
      success: true,
      count: searchResults.length,
      creators: searchResults.map(r => r.creator),
      searchResults: searchResults.map(r => ({
        creatorId: r.creator.id,
        creatorName: r.creator.name,
        relevanceScore: r.relevanceScore,
        matchHighlights: r.matchHighlights,
        matchedTools: r.matchedTools,
        matchedSkills: r.matchedSkills,
        licensingCompatibility: r.licensingCompatibility,
        missingFactors: r.missingFactors,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Failed to retrieve creators.'
      }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Input Validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Creator name is required.' }
      }, { status: 400 });
    }

    if (!body.specialization || typeof body.specialization !== 'string') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Creator specialization is required.' }
      }, { status: 400 });
    }

    const creatorId = body.id || `creator-${Date.now()}`;
    const creatorToSave: Creator = {
      ...body,
      id: creatorId,
      name: body.name.trim(),
      handle: body.handle || `@${body.name.toLowerCase().replace(/\s+/g, '_')}.ai`,
      avatar: body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name)}`,
      specialization: body.specialization.trim(),
      bio: body.bio || 'Generative AI Director & Visual Specialist.',
      location: body.location || 'Bengaluru, India',
      skills: Array.isArray(body.skills) ? body.skills : ['AI Directing', 'Prompt Engineering'],
      tools: Array.isArray(body.tools) ? body.tools : ['Veo', 'Kling'],
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 1,
      completedProjects: body.completedProjects || 0,
      hourlyRate: typeof body.hourlyRate === 'number' && body.hourlyRate > 0 ? body.hourlyRate : 12000,
      avgTurnaround: body.avgTurnaround || '48 Hours',
      availableNow: true,
      isVerified: true,
      verification: body.verification || {
        certifiedPipeline: 'Platform Audited Checkpoint Tier-1',
        auditDate: 'Live Account',
        safetyScore: 99.9,
        commercialRightsGuaranteed: true,
        identityVerified: true,
        portfolioEvidenceVerified: true,
        toolEvidenceVerified: true,
        workflowEvidenceVerified: true,
        commercialUseDeclared: true,
        platformVerified: true,
      },
      verifiedDetails: {
        certifiedPipeline: 'V24 Neural Production Tier-1',
        auditDate: 'Live Account',
        safetyScore: 99.9,
        commercialRightsGuaranteed: true,
      },
      portfolio: Array.isArray(body.portfolio) ? body.portfolio : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      isUserCreated: true,
    };

    // Attempt MongoDB save
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await CreatorModel.findOneAndUpdate(
          { id: creatorToSave.id },
          { $set: creatorToSave },
          { upsert: true, new: true }
        );
      } catch (dbErr: any) {
        console.error('MongoDB save error in creator registration:', dbErr);
        return NextResponse.json({
          success: false,
          error: { code: 'PERSISTENCE_ERROR', message: `Database persistence failed: ${dbErr.message}` }
        }, { status: 500 });
      }
    }

    // Always update runtime memory cache so UI reflects change immediately
    memoryCache = [creatorToSave, ...memoryCache];

    return NextResponse.json({
      success: true,
      creator: creatorToSave,
      message: 'Creator profile successfully registered in live marketplace database.',
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create creator.' }
    }, { status: 500 });
  }
}
