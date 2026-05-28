import { authenticateUser, generateToken } from '../../../lib/auth';
import { getUserDID } from '../../../lib/identity';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate user
    const user = authenticateUser(email, password);
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Get user's DID
    const didResult = getUserDID(user.id);
    if (!didResult) {
      return Response.json({ error: 'User identity not found' }, { status: 500 });
    }

    // Generate token
    const token = generateToken(user.id);

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
        did: didResult.did,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
