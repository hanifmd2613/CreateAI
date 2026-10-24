import { NextRequest, NextResponse } from 'next/server';
import { searchCreators, SearchFilters } from '@/lib/search';
import { MOCK_CREATORS } from '@/data/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query = '',
      tool = 'All Tools',
      specialization = 'All Specializations',
      contentType = 'All Types',
      verifiedOnly = false,
    }: SearchFilters = body;

    const creatorPool = MOCK_CREATORS;

    const results = searchCreators(creatorPool, {
      query,
      tool,
      specialization,
      contentType,
      verifiedOnly,
    });

    return NextResponse.json({
      success: true,
      query,
      totalMatches: results.length,
      results,
    });
  } catch (err: any) {
    console.error('Error in creators search API:', err);
    return NextResponse.json({ error: err.message || 'Search execution failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const tool = searchParams.get('tool') || 'All Tools';
  const specialization = searchParams.get('specialization') || 'All Specializations';
  const contentType = searchParams.get('contentType') || 'All Types';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

  const creatorPool = MOCK_CREATORS;

  const results = searchCreators(creatorPool, {
    query,
    tool,
    specialization,
    contentType,
    verifiedOnly,
  });

  return NextResponse.json({
    success: true,
    query,
    totalMatches: results.length,
    results,
  });
}
