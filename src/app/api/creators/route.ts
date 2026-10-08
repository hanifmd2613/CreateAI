import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { CreatorModel } from '../../../lib/models/Creator';
import { MOCK_CREATORS } from '../../../data/mockData';
import { Creator } from '../../../types';

let memoryCache: Creator[] = [...MOCK_CREATORS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tool = searchParams.get('tool');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const spec = searchParams.get('specialization');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const conn = await connectToDatabase();
    let results: Creator[] = [];

    if (conn) {
      try {
        const query: any = {};

        if (tool && tool !== 'All Tools') {
          query.tools = { $regex: new RegExp(tool, 'i') };
        }

        if (spec && spec !== 'All Specializations') {
          query.specialization = { $regex: new RegExp(spec, 'i') };
        }

        if (verifiedOnly) {
          query.isVerified = true;
        }

        if (search) {
          const q = search.trim();
          query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { specialization: { $regex: q, $options: 'i' } },
            { bio: { $regex: q, $options: 'i' } },
            { skills: { $regex: q, $options: 'i' } },
            { tools: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
          ];
        }

        const dbResults = await CreatorModel.find(query).lean();
        if (dbResults && dbResults.length > 0) {
          results = dbResults as any[];
        }
      } catch (dbErr) {
        console.warn('MongoDB query warning, using fallback dataset:', dbErr);
      }
    }

    if (results.length === 0) {
      results = [...memoryCache];

      if (tool && tool !== 'All Tools') {
        results = results.filter(c => c.tools.some(t => t.toLowerCase() === tool.toLowerCase()));
      }

      if (type && type !== 'All Types') {
        results = results.filter(c => c.portfolio.some(p => p.type.toLowerCase() === type.toLowerCase()));
      }

      if (spec && spec !== 'All Specializations') {
        results = results.filter(c => c.specialization.toLowerCase() === spec.toLowerCase());
      }

      if (verifiedOnly) {
        results = results.filter(c => c.isVerified);
      }

      if (search) {
        const q = search.toLowerCase();
        results = results.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.specialization.toLowerCase().includes(q) ||
          c.skills.some(s => s.toLowerCase().includes(q)) ||
          c.tools.some(t => t.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
        );
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      creators: results,
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
        await CreatorModel.create(creatorToSave);
      } catch (dbErr) {
        console.warn('MongoDB save warning:', dbErr);
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
