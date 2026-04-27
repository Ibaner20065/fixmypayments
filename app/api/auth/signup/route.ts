import { NextRequest } from 'next/server';

// In-memory rate limiter: IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5; // Max 5 signup attempts per minute

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip.trim();
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, retryAfter: 0 };
  }

  if (now > record.resetTime) {
    // Window expired, reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return Response.json(
        { error: 'name, email, and password are required' },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return Response.json(
        { error: 'name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check rate limit
    const clientIP = getClientIP(request);
    const { allowed, retryAfter } = checkRateLimit(clientIP);

    if (!allowed) {
      return Response.json(
        { error: `Too many signup attempts. Please try again in ${retryAfter} seconds.` },
        { 
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() }
        }
      );
    }

    // Mock Supabase signup (in real scenario, call Supabase API)
    // For now, we'll simulate successful signup
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Send email alert (mock implementation)
    await sendWelcomeEmail(email, name);

    return Response.json(
      {
        id: userId,
        email,
        name,
        message: 'Account created successfully. Check your email for confirmation.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, name: string) {
  // Mock email sending - in production, integrate with email service
  // (SendGrid, AWS SES, Resend, etc.)
  console.log(`Welcome email sent to ${email} for ${name}`);
  
  // If you have email service configured:
  // try {
  //   await fetch('https://api.sendgrid.com/v3/mail/send', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       personalizations: [{ to: [{ email }] }],
  //       from: { email: 'noreply@fixmypayments.com' },
  //       subject: `Welcome to FixMyPayments, ${name}!`,
  //       content: [{ type: 'text/plain', value: `Hi ${name}, welcome to FixMyPayments!` }],
  //     }),
  //   });
  // } catch (error) {
  //   console.error('Email sending failed:', error);
  // }
}
