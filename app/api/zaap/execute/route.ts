import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken } from '@/app/lib/auth';
import db from '@/app/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const { steps, wallet } = await req.json();

    if (!steps || !Array.isArray(steps) || steps.length !== 3) {
      return NextResponse.json({ error: 'Bundle must have exactly 3 steps' }, { status: 400 });
    }

    // Validate steps
    if (steps[0]?.action !== 'withdraw' || steps[1]?.action !== 'swap' || steps[2]?.action !== 'transfer') {
      return NextResponse.json(
        { error: 'Invalid step sequence: must be withdraw → swap → transfer' },
        { status: 400 }
      );
    }

    if (!wallet || !wallet.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Create ZAAP bundle record
    const bundleId = randomUUID();
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO zaap_bundles (id, user_id, wallet_address, bundle_type, status, tx_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      bundleId,
      session.user_id,
      wallet.toLowerCase(),
      '3-step-bundle',
      'submitted',
      txHash,
      now
    );

    return NextResponse.json(
      {
        bundleId,
        txHash,
        status: 'submitted',
        message: 'ZAAP bundle submitted! In production, this would execute via Paymaster.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('ZAAP execute error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
