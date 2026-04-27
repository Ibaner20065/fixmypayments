import { adminAuth, db, DEFAULT_BUDGETS } from '../../../lib/firebase-admin';
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit';
import type { NextRequest } from 'next/server';

/**
 * POST /api/auth/signup
 * Body: { email, password, name }
 * Creates a Firebase Auth user + Firestore profile with default budgets.
 * Rate limit: 5 signups per IP per 15 min.
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request.headers);
  const allowed = checkRateLimit(`${ip}:signup`, { windowMs: 15 * 60 * 1000, maxRequests: 5 });
  if (!allowed) {
    return Response.json(
      { error: 'Too many signup attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  if (!adminAuth || !db) {
    return Response.json({ error: 'Firebase not configured on server' }, { status: 500 });
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({ email, password, displayName: name });
    } catch (err: any) {
      const message =
        err.code === 'auth/email-already-exists'
          ? 'An account with this email already exists'
          : err.message || 'Could not create account';
      return Response.json({ error: message }, { status: 400 });
    }

    // Create Firestore profile doc with default budgets
    try {
      await db.collection('users').doc(userRecord.uid).set({
        email,
        name,
        createdAt: new Date().toISOString(),
        budget: DEFAULT_BUDGETS,
      });
    } catch (dbErr: any) {
      console.error('Firestore Error:', dbErr);
      return Response.json({ error: `Database error: ${dbErr.message}` }, { status: 500 });
    }

    return Response.json(
      {
        user: { id: userRecord.uid, email, name },
        message: 'Account created. Please sign in to get your access token.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Signup Route Crash:', err);
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
