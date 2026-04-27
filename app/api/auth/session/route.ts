import { supabaseServer } from '../../../lib/supabase-server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';
    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(token);

    if (error || !user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
      },
    });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
