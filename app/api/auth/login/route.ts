import { adminAuth, db } from '../../../lib/firebase-admin';
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit';
import type { NextRequest } from 'next/server';

/**
 * POST /api/auth/login
 * Body: { idToken }  (Firebase ID token obtained client-side after signInWithEmailAndPassword)
 *
 * Firebase Auth sign-in happens on the CLIENT using the Firebase JS SDK.
 * This route verifies the resulting ID token server-side and returns the user profile.
 * Rate limit: 10 verifications per IP per 15 min.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const allowed = checkRateLimit(`${ip}:login`, { windowMs: 15 * 60 * 1000, maxRequests: 10 });
  if (!allowed) {
    return Response.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  if (!adminAuth || !db) {
    return Response.json({ error: 'Firebase not configured on server' }, { status: 500 });
  }

  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return Response.json({ error: 'idToken is required' }, { status: 400 });
    }

    // Verify the Firebase ID token
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Fetch name from Firestore profile (fallback to displayName)
    const profileSnap = await db.collection('users').doc(decoded.uid).get();
    const profileData = profileSnap.data();

    const name =
      profileData?.name ||
      decoded.name ||
      (decoded.email ? decoded.email.split('@')[0] : 'User');

    return Response.json({
      user: {
        id: decoded.uid,
        email: decoded.email,
        name,
      },
      idToken, // echo back so client can store it
    });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
