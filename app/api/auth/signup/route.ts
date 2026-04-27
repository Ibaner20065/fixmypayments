import { supabase } from '../../../lib/supabase';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      // Map Supabase errors to user-friendly messages
      const message =
        error.message === 'User already registered'
          ? 'An account with this email already exists'
          : error.message;
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json(
      {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name,
        },
        session: data.session,
        requiresEmailConfirmation: !data.session,
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
