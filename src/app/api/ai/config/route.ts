import { NextRequest, NextResponse } from 'next/server';
import { saveBrandAiKeys, getBrandAiKeys, maskApiKey } from '@/lib/aiConfigStore';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authUser = await getAuthenticatedUser(req);
    const brandId = authUser?.id || searchParams.get('brandId') || 'user-brand-kaveri';
    const role = authUser?.role || req.headers.get('x-user-role') || searchParams.get('role');

    // STRICT ROLE GUARD: Creators are blocked from reading AI config
    if (role === 'creator') {
      return NextResponse.json(
        { error: 'Forbidden: AI Inference Configuration is restricted to verified Brand accounts.' },
        { status: 403 }
      );
    }

    const creds = getBrandAiKeys(brandId);
    const groqMasked = maskApiKey(creds?.groqKey || process.env.GROQ_API_KEY);
    const geminiMasked = maskApiKey(creds?.geminiKey || process.env.GOOGLE_GEMINI_API_KEY);

    return NextResponse.json({
      success: true,
      brandId,
      groqConfigured: Boolean(creds?.groqKey || process.env.GROQ_API_KEY),
      geminiConfigured: Boolean(creds?.geminiKey || process.env.GOOGLE_GEMINI_API_KEY),
      groqMasked,
      geminiMasked,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch AI configuration' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json();
    const { brandId = authUser?.id || 'user-brand-kaveri', role, groqKey, geminiKey } = body;
    const headerRole = authUser?.role || req.headers.get('x-user-role') || role;

    // STRICT ROLE GUARD: Creators are blocked from updating AI config
    if (headerRole === 'creator') {
      return NextResponse.json(
        { error: 'Forbidden: AI Inference Configuration is restricted to verified Brand accounts.' },
        { status: 403 }
      );
    }

    // Input validation: ensure keys format matches expected conventions if provided
    if (groqKey && typeof groqKey === 'string' && groqKey.trim() && !groqKey.trim().startsWith('gsk_')) {
      return NextResponse.json(
        { error: 'Invalid Groq API Key format. Valid keys begin with "gsk_".' },
        { status: 400 }
      );
    }

    if (geminiKey && typeof geminiKey === 'string' && geminiKey.trim() && !geminiKey.trim().startsWith('AIzaSy')) {
      return NextResponse.json(
        { error: 'Invalid Google Gemini API Key format. Valid keys begin with "AIzaSy".' },
        { status: 400 }
      );
    }

    const updated = saveBrandAiKeys(brandId, groqKey, geminiKey);

    return NextResponse.json({
      success: true,
      message: 'AI inference keys securely configured for brand account.',
      brandId,
      groqConfigured: Boolean(updated.groqKey || process.env.GROQ_API_KEY),
      geminiConfigured: Boolean(updated.geminiKey || process.env.GOOGLE_GEMINI_API_KEY),
      groqMasked: maskApiKey(updated.groqKey || process.env.GROQ_API_KEY),
      geminiMasked: maskApiKey(updated.geminiKey || process.env.GOOGLE_GEMINI_API_KEY),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save AI configuration' }, { status: 500 });
  }
}
