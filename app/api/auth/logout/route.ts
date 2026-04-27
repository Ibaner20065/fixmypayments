import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete('auth_token');

    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
