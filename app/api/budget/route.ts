import { verifyToken, db, DEFAULT_BUDGETS } from '../../lib/firebase-admin';
import { MOCK_BUDGET } from '../../lib/mockData';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // If Firebase is missing, return default budget immediately
  if (!db) return Response.json({ budget: DEFAULT_BUDGETS });

  const uid = await verifyToken(request.headers.get('authorization'));
  if (!uid) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Demo Mode: Serve rich mock data
  if (uid === 'demo-uid') {
    return Response.json({ budget: MOCK_BUDGET });
  }

  try {
    const snap = await db.collection('users').doc(uid).get();
    const data = snap.data();
    const budget = data?.budget ?? DEFAULT_BUDGETS;
    return Response.json({ budget });
  } catch (error: any) {
    console.warn('⚠ Firestore Fetch Failed (Budget):', error.message);
    return Response.json({ budget: DEFAULT_BUDGETS });
  }
}

export async function PUT(request: NextRequest) {
  if (!db) return Response.json({ error: 'Firebase not configured' }, { status: 500 });

  const uid = await verifyToken(request.headers.get('authorization'));
  if (!uid) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    // Validate: only allow known categories + total, must be positive numbers
    const allowedKeys = Object.keys(DEFAULT_BUDGETS);
    const budget: Record<string, number> = {};

    for (const key of allowedKeys) {
      if (key in body) {
        const val = Number(body[key]);
        if (isNaN(val) || val < 0) {
          return Response.json({ error: `Invalid value for ${key}` }, { status: 400 });
        }
        budget[key] = val;
      }
    }

    if (Object.keys(budget).length === 0) {
      return Response.json({ error: 'No valid budget fields provided' }, { status: 400 });
    }

    // Merge into existing budget
    await db.collection('users').doc(uid).set({ budget }, { merge: true });

    const snap = await db.collection('users').doc(uid).get();
    return Response.json({ budget: snap.data()?.budget ?? budget });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
