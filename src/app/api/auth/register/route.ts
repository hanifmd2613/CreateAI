import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await registerUser(body);

    if (!result.success) {
      const status = result.error?.includes('already exists') ? 409 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: `Account successfully created as ${result.user?.role.toUpperCase()}.`,
    });

    if (result.token) {
      response.cookies.set('gencraft_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (err: any) {
    console.error('Error in auth register API:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
