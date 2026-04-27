import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByEmail,
  createUser,
  verifyPassword,
  hashPassword,
  createSession,
} from '@/app/lib/auth';
import { rateLimit } from '@/app/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Rate limit by IP (20 signup attempts per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const identifier = `signup:${ip}`;
    const rateLimitResult = rateLimit(identifier, 20, 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Check if user exists
    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = createUser(email, passwordHash, name || email.split('@')[0]);

    // Create session
    const session = createSession(user.id);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: session.token,
      },
      { status: 201 }
    );

    // Set secure cookie
    response.cookies.set('auth_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
