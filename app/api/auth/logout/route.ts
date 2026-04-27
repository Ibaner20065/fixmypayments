import { adminAuth, verifyToken } from '../../../lib/firebase-admin';
import type { NextRequest } from 'next/server';

/**
 * POST /api/auth/logout
 * Revokes all Firebase refresh tokens for the current user.
 * Requires: Authorization: Bearer <Firebase ID token>
 */
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyToken(request.headers.get('authorization'));
    if (!uid || !adminAuth) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await adminAuth.revokeRefreshTokens(uid);
    return Response.json({ message: 'Logged out successfully' });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
