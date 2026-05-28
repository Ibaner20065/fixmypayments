import { getUserDID, resolveDID } from '../../../lib/identity';
import { extractUserFromHeader } from '../../../lib/auth';
import { NextRequest } from 'next/server';

// GET /api/identity/did - Get current user's DID
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserFromHeader(request.headers.get('authorization') || '');
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const didResult = getUserDID(userId);
    if (!didResult) {
      return Response.json({ error: 'DID not found for user' }, { status: 404 });
    }

    return Response.json({ did: didResult.did, publicKey: didResult.publicKey });
  } catch (error) {
    console.error('Error fetching DID:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/identity/did/resolve - Resolve a DID
export async function POST(request: NextRequest) {
  try {
    const { did } = await request.json();

    if (!did) {
      return Response.json({ error: 'DID is required' }, { status: 400 });
    }

    const result = resolveDID(did);
    if (!result) {
      return Response.json({ error: 'DID not found' }, { status: 404 });
    }

    return Response.json({
      did,
      publicKey: result.publicKey,
      resolved: true,
    });
  } catch (error) {
    console.error('Error resolving DID:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
