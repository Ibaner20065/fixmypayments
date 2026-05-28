import { createUser, generateToken } from '../../../lib/auth';
import { createUserDID } from '../../../lib/identity';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Create user
    const user = createUser(email, password);
    if (!user) {
      return Response.json({ error: 'User already exists or signup failed' }, { status: 409 });
    }

    // Create DID for user
    const didResult = createUserDID(user.id);
    if (!didResult) {
      return Response.json({ error: 'Failed to create identity' }, { status: 500 });
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
