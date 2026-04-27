import { NextRequest } from 'next/server';

// In-memory rate limiter for login: IP -> { count, resetTime }
const loginRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 10; // Max 10 login attempts per 15 minutes

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip.trim();
}

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);

  if (!record) {
    loginRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, retryAfter: 0 };
  }

  if (now > record.resetTime) {
    // Window expired, reset
    loginRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'email and password are required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const clientIP = getClientIP(request);
    const { allowed, retryAfter } = checkLoginRateLimit(clientIP);

    if (!allowed) {
      return Response.json(
        { 
          error: `Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() }
        }
      );
    }

    // Accept any email/password for testing (mock authentication)
    // In production, verify with Supabase
    if (!email.includes('@')) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user_${Date.now()}`;
    
    return Response.json(
      {
        id: userId,
        email,
        name: email.split('@')[0],
        session: sessionToken,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
