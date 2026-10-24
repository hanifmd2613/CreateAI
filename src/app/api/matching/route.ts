import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { BriefModel } from '../../../lib/models/Brief';
import { CreatorModel } from '../../../lib/models/Creator';
import { evaluateBriefMatchingRun, rankCreatorsForBrief } from '../../../lib/matching';
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
        try {
          const foundBrief = await BriefModel.findOne({ id: briefId }).lean();
          if (foundBrief) {
            brief = foundBrief;
          }
        } catch (e) {}
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
      try {
        const dbCreators = await CreatorModel.find({}).lean();
        if (dbCreators && dbCreators.length > 0) {
          creatorsList = dbCreators as any[];
        }
      } catch (e) {}
    }

    if (creatorsList.length === 0) {
      creatorsList = MOCK_CREATORS;
    }

    // 3. Evaluate matching run with 6-factor normalized engine and edge case detection
    const runResult = evaluateBriefMatchingRun(brief, creatorsList);

    return NextResponse.json({
      success: true,
      briefId: brief.id || 'custom-brief',
      briefTitle: brief.title,
      totalCreatorsEvaluated: creatorsList.length,
      hasStrongMatch: runResult.hasStrongMatch,
      status: runResult.status,
      statusExplanation: runResult.statusExplanation,
      relaxationSuggestions: runResult.relaxationSuggestions,
      matches: runResult.matches.map(m => ({
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
        rank: m.rank,
        finalScore: m.finalScore,
        factors: m.factors,
        categoryScores: m.categories,
        reasons: m.reasons,
        positiveEvidence: m.positiveEvidence,
        missingMatches: m.missingMatches,
        matchedTools: m.matchedTools,
        matchedSkills: m.matchedSkills,
        matchedPortfolioIds: m.matchedPortfolioIds,
        licensingStatus: m.licensingStatus,
        licensingSummary: m.licensingSummary,
        trustEvidence: m.trustEvidence,
        recommendedNextAction: m.recommendedNextAction,
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
      try {
        const foundBrief = await BriefModel.findOne({ id: briefId }).lean();
        if (foundBrief) brief = foundBrief as any;

        const dbCreators = await CreatorModel.find({}).lean();
        if (dbCreators && dbCreators.length > 0) creatorsList = dbCreators as any[];
      } catch (e) {}
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

    const runResult = evaluateBriefMatchingRun(brief, creatorsList);

    return NextResponse.json({
      success: true,
      briefId,
      briefTitle: brief.title,
      hasStrongMatch: runResult.hasStrongMatch,
      status: runResult.status,
      statusExplanation: runResult.statusExplanation,
      matches: runResult.matches.map(m => ({
        creatorId: m.creatorId,
        creatorName: m.creator.name,
        rank: m.rank,
        finalScore: m.finalScore,
        factors: m.factors,
        categoryScores: m.categories,
        reasons: m.reasons,
        licensingStatus: m.licensingStatus,
        licensingSummary: m.licensingSummary,
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
