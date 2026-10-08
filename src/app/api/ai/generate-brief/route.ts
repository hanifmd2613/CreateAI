import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredBrief } from '../../../../lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, groqApiKey, geminiApiKey, provider = 'auto' } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'A non-empty prompt string is required.'
        }
      }, { status: 400 });
    }

    const result = await generateStructuredBrief({
      prompt: prompt.trim(),
      groqApiKey,
      geminiApiKey,
      provider,
    });

    return NextResponse.json({
      success: true,
      provider: result.provider,
      brief: result.brief,
    });

  } catch (err: any) {
    console.error('Error in AI brief generation API:', err);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'An error occurred during AI brief generation.'
      }
    }, { status: 500 });
  }
}
