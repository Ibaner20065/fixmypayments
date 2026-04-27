import { verifyToken, db } from '../../lib/firebase-admin';
import type { NextRequest } from 'next/server';

/**
 * GET /api/profile
 * Returns user profile info and aggregated lifetime stats.
 */
export async function GET(request: NextRequest) {
  if (!db) return Response.json({ error: 'Firebase not configured' }, { status: 500 });

  const uid = await verifyToken(request.headers.get('authorization'));
  if (!uid) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userSnap = await db.collection('users').doc(uid).get();
    const userData = userSnap.data();

    // Calculate lifetime stats
    const txSnap = await db.collection('transactions').where('userId', '==', uid).get();
    
    let lifetimeSpent = 0;
    const byCategory: Record<string, number> = {};
    
    txSnap.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.amount) || 0;
      lifetimeSpent += amount;
      
      const cat = data.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + amount;
    });

    return Response.json({
      profile: {
        email: userData?.email || '',
        name: userData?.name || '',
        createdAt: userData?.createdAt || '',
      },
      stats: {
        totalTransactions: txSnap.size,
        lifetimeSpent,
        byCategory
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
