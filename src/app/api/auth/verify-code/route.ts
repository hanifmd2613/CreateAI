import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpCode, normalizeEmail } from '@/lib/verificationStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    if (!code || typeof code !== 'string' || code.trim().length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit verification code is required.' }, { status: 400 });
    }

    const normEmail = normalizeEmail(email);
    const result = verifyOtpCode(normEmail, code);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      verifiedToken: result.verifiedToken,
      email: normEmail,
    });
  } catch (err: any) {
    console.error('Error in verify-code API:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
