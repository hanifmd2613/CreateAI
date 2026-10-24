import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('gencraft_session')?.value;
    if (sessionToken) {
      invalidateSession(sessionToken);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    response.cookies.delete('gencraft_session');
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error logging out' }, { status: 500 });
  }
}
