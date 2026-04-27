import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken, getUserById } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const user = getUserById(session.user_id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('Get current user error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
