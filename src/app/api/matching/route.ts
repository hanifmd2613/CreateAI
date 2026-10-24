import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { BriefModel } from '../../../lib/models/Brief';
import { CreatorModel } from '../../../lib/models/Creator';
import { evaluateBriefMatchingRun } from '../../../lib/matching';
import { executeUniversalBriefMatching } from '../../../lib/universalMatching';
import { INITIAL_BRIEFS, MOCK_CREATORS } from '../../../data/mockData';
import { Brief, Creator } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { brief, briefId, query, prompt, naturalLanguageBrief } = body;
    const rawSearchText = query || prompt || naturalLanguageBrief;

    // Connect to DB
    const conn = await connectToDatabase();

    // 1. Fetch creators list from DB or fallback
    let creatorsList: Creator[] = [];
    if (conn) {
      try {
        const dbCreators = await CreatorModel.find({}).lean();
        if (dbCreators && dbCreators.length > 0) {
          creatorsList = dbCreators as any[];
        }
      } catch (e) {
        console.warn('MongoDB query warning in matching API:', e);
      }
    }

    if (creatorsList.length === 0) {
      creatorsList = MOCK_CREATORS;
    }

    // 2. If raw natural language brief is provided
    if (rawSearchText && typeof rawSearchText === 'string' && rawSearchText.trim().length > 0) {
      const universalRun = executeUniversalBriefMatching(rawSearchText.trim(), creatorsList);

      return NextResponse.json({
        success: true,
        mode: 'universal_natural_language',
        query: universalRun.query,
        extractedCriteria: universalRun.extractedCriteria,
        totalCreatorsEvaluated: universalRun.totalEvaluated,
        hasStrongMatch: universalRun.hasStrongMatch,
        status: universalRun.status,
        statusExplanation: universalRun.statusExplanation,
        relaxationSuggestions: universalRun.relaxationSuggestions,
        matches: universalRun.matches.map(m => ({
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
          factors: m.factorScores,
          categoryScores: {
            contentFit: m.factorScores.contentFit,
            styleAndFormat: m.factorScores.styleAndFormat,
            skillsAndTools: m.factorScores.skillsAndTools,
            portfolioEvidence: m.factorScores.portfolioEvidence,
            trustSignals: m.factorScores.trustSignals,
            commercialCompatibility: m.factorScores.commercialCompatibility,
            semanticScore: m.factorScores.contentFit,
            skillScore: m.factorScores.skillsAndTools,
            toolScore: m.factorScores.skillsAndTools,
            contentTypeScore: m.factorScores.contentFit,
            formatScore: m.factorScores.styleAndFormat,
            commercialScore: m.factorScores.commercialCompatibility,
            experienceScore: m.factorScores.portfolioEvidence,
          },
          reasons: m.reasons,
          positiveEvidence: m.positiveEvidence,
          missingMatches: m.missingMatches,
          conflicts: m.conflicts,
          matchedTools: m.matchedTools,
          matchedSkills: m.matchedSkills,
          matchedPortfolioIds: m.matchedPortfolioIds,
          licensingStatus: m.licensingStatus,
          licensingSummary: m.licensingSummary,
          recommendedNextAction: m.recommendedNextAction,
          citations: m.citations,
          budgetCompatible: m.budgetCompatible,
          languageCompatible: m.languageCompatible,
        })),
      });
    }

    // 3. Structured brief resolution
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
          message: 'Valid brief, briefId, or natural language query is required.'
        }
      }, { status: 400 });
    }

    // 4. Evaluate matching run with 6-factor normalized engine
    const runResult = evaluateBriefMatchingRun(brief, creatorsList);

    return NextResponse.json({
      success: true,
      mode: 'structured_brief',
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
    const query = searchParams.get('query') || searchParams.get('search');

    const conn = await connectToDatabase();
    let creatorsList: Creator[] = [];

    if (conn) {
      try {
        const dbCreators = await CreatorModel.find({}).lean();
        if (dbCreators && dbCreators.length > 0) creatorsList = dbCreators as any[];
      } catch (e) {}
    }

    if (creatorsList.length === 0) {
      creatorsList = MOCK_CREATORS;
    }

    // Support natural language GET query
    if (query) {
      const universalRun = executeUniversalBriefMatching(query, creatorsList);
      return NextResponse.json({
        success: true,
        mode: 'universal_natural_language',
        query,
        hasStrongMatch: universalRun.hasStrongMatch,
        status: universalRun.status,
        statusExplanation: universalRun.statusExplanation,
        relaxationSuggestions: universalRun.relaxationSuggestions,
        matches: universalRun.matches.map(m => ({
          creatorId: m.creatorId,
          creatorName: m.creator.name,
          rank: m.rank,
          finalScore: m.finalScore,
          factors: m.factorScores,
          reasons: m.reasons,
          licensingStatus: m.licensingStatus,
          licensingSummary: m.licensingSummary,
          budgetCompatible: m.budgetCompatible,
          languageCompatible: m.languageCompatible,
        }))
      });
    }

    if (!briefId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter ?briefId=... or ?query=... is required.'
        }
      }, { status: 400 });
    }

    let brief: Brief | null = null;
    if (conn) {
      try {
        const foundBrief = await BriefModel.findOne({ id: briefId }).lean();
        if (foundBrief) brief = foundBrief as any;
      } catch (e) {}
    }

    if (!brief) {
      brief = INITIAL_BRIEFS.find(b => b.id === briefId) || null;
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
      mode: 'structured_brief',
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
