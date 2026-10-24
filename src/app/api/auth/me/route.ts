import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, getUserByIdAsync } from '@/lib/userStore';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('gencraft_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const userId = getSessionUserId(sessionToken);
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await getUserByIdAsync(userId);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
