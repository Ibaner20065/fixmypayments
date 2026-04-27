import { supabase } from '../../../lib/supabase';

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return Response.json({ error: 'Logout failed' }, { status: 500 });
    }

    return Response.json({ message: 'Logged out successfully' });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
