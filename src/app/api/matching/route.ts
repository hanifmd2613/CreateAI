import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { BriefModel } from '../../../lib/models/Brief';
import { CreatorModel } from '../../../lib/models/Creator';
import { rankCreatorsForBrief, computeCreatorMatch } from '../../../lib/matching';
import { INITIAL_BRIEFS, MOCK_CREATORS } from '../../../data/mockData';
import { Brief, Creator } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { brief, briefId } = body;

    // Connect to DB if available
    const conn = await connectToDatabase();

    // 1. Fetch target brief
    if (!brief && briefId) {
      if (conn) {
        const foundBrief = await BriefModel.findOne({ id: briefId }).lean();
        if (foundBrief) {
          brief = foundBrief;
        }
      }
      if (!brief) {
        brief = INITIAL_BRIEFS.find(b => b.id === briefId);
      }
    }

    if (!brief || !brief.title) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid brief or briefId is required to calculate creator matching scores.'
        }
      }, { status: 400 });
    }

    // 2. Fetch creators list
    let creatorsList: Creator[] = [];
    if (conn) {
      const dbCreators = await CreatorModel.find({}).lean();
      if (dbCreators && dbCreators.length > 0) {
        creatorsList = dbCreators as any[];
      }
    }

    if (creatorsList.length === 0) {
      creatorsList = MOCK_CREATORS;
    }

    // 3. Compute ranked matches using deterministic hybrid scoring algorithm
    const rankedMatches = rankCreatorsForBrief(brief, creatorsList);

    return NextResponse.json({
      success: true,
      briefId: brief.id || 'custom-brief',
      briefTitle: brief.title,
      totalCreatorsEvaluated: creatorsList.length,
      matches: rankedMatches.map(m => ({
        creatorId: m.creatorId,
        creator: {
          id: m.creator.id,
          name: m.creator.name,
          avatar: m.creator.avatar,
          handle: m.creator.handle,
          specialization: m.creator.specialization,
          tools: m.creator.tools,
          skills: m.creator.skills,
          hourlyRate: m.creator.hourlyRate,
          rating: m.creator.rating,
          completedProjects: m.creator.completedProjects,
          isVerified: m.creator.isVerified,
          verification: m.creator.verification,
          portfolio: m.creator.portfolio.slice(0, 2),
        },
        finalScore: m.finalScore,
        categoryScores: m.categories,
        reasons: m.reasons,
      }))
    });

  } catch (err: any) {
    console.error('Error in matching API:', err);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred during matching.'
      }
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const briefId = searchParams.get('briefId');

    if (!briefId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter ?briefId=... is required.'
        }
      }, { status: 400 });
    }

    const conn = await connectToDatabase();
    let brief: Brief | null = null;
    let creatorsList: Creator[] = [];

    if (conn) {
      const foundBrief = await BriefModel.findOne({ id: briefId }).lean();
      if (foundBrief) brief = foundBrief as any;

      const dbCreators = await CreatorModel.find({}).lean();
      if (dbCreators && dbCreators.length > 0) creatorsList = dbCreators as any[];
    }

    if (!brief) {
      brief = INITIAL_BRIEFS.find(b => b.id === briefId) || null;
    }

    if (creatorsList.length === 0) {
      creatorsList = MOCK_CREATORS;
    }

    if (!brief) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Brief with ID "${briefId}" not found.`
        }
      }, { status: 404 });
    }

    const rankedMatches = rankCreatorsForBrief(brief, creatorsList);

    return NextResponse.json({
      success: true,
      briefId,
      briefTitle: brief.title,
      matches: rankedMatches.map(m => ({
        creatorId: m.creatorId,
        creatorName: m.creator.name,
        finalScore: m.finalScore,
        categoryScores: m.categories,
        reasons: m.reasons,
      }))
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Error processing GET request for matching.'
      }
    }, { status: 500 });
  }
}
