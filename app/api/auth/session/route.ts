import { verifyToken, db } from '../../../lib/firebase-admin';
import type { NextRequest } from 'next/server';

/**
 * GET /api/auth/session
 * Returns the current user's profile from Firestore.
 * Requires: Authorization: Bearer <Firebase ID token>
 */
export async function GET(request: NextRequest) {
  try {
    const uid = await verifyToken(request.headers.get('authorization'));
    if (!uid) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const snap = await db.collection('users').doc(uid).get();
    const data = snap.data();

    return Response.json({
      user: {
        id: uid,
        email: data?.email || '',
        name: data?.name || '',
      },
    });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
