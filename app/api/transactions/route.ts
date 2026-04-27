import { parseTransaction } from '../../lib/classify';
import { checkSpendingAlerts, sendAlertEmail } from '../../lib/alerts';
import { verifyToken, db, getUserBudgets } from '../../lib/firebase-admin';
import type { NextRequest } from 'next/server';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getAuthenticatedUid(request: NextRequest): Promise<string | null> {
  return verifyToken(request.headers.get('authorization'));
}

// ─── POST /api/transactions ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!db) {
    return Response.json({ error: 'Firebase not configured on server' }, { status: 500 });
  }

  const uid = await getAuthenticatedUid(request);
  if (!uid) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { raw_text, force } = await request.json();

    if (!raw_text || typeof raw_text !== 'string') {
      return Response.json({ error: 'raw_text is required' }, { status: 400 });
    }

    // Try LLM classification first, fall back to rule-based
    let classified;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const llmRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            system: `You are a financial transaction classifier. Given raw transaction text, extract the merchant name, amount (as a number), and classify into exactly one of: Food, Transport, Shopping, Utilities, Medical, Entertainment, Health, Groceries. Respond ONLY with valid JSON, no markdown, no preamble: { "amount": number, "category": string, "merchant": string, "confidence": number }`,
            messages: [{ role: 'user', content: raw_text }],
          }),
        });
        if (llmRes.ok) {
          const llmData = await llmRes.json();
          const text = llmData.content?.[0]?.text;
          if (text) classified = JSON.parse(text);
        }
      } catch {
        // Fall through to rule-based
      }
    }

    if (!classified) {
      const parsed = parseTransaction(raw_text);
      classified = {
        amount: parsed.amount,
        category: parsed.category,
        merchant: parsed.merchant,
        confidence: parsed.confidence,
      };
    }

    // Fetch existing transactions for budget-alert calculation
    const existingSnap = await db
      .collection('transactions')
      .where('userId', '==', uid)
      .select('amount', 'category', 'date')
      .get();

    const existingTxs = existingSnap.docs.map((d) => {
      const data = d.data();
      return {
        amount: Number(data.amount) || 0,
        category: data.category as string,
        date: data.date as string,
      };
    });

    // Check budget alerts with user-specific limits FIRST, before saving
    const budgets = await getUserBudgets(uid);
    const alerts = checkSpendingAlerts(
      classified.amount,
      classified.category,
      existingTxs,
      budgets
    );

    const isOverbudget = alerts.some((a) => a.percentUsed > 100);
    const isWarning = alerts.some((a) => a.percentUsed > 80 && a.percentUsed <= 100);

    // If over budget and not forcing, block and email
    if (isOverbudget && !force) {
      const userSnap = await db.collection('users').doc(uid).get();
      const userData = userSnap.data();
      if (userData?.email) {
        const userName = userData.name || userData.email.split('@')[0];
        await sendAlertEmail(userData.email, userName, alerts, 'blocked');
      }

      return Response.json(
        {
          error: 'Budget Exceeded',
          status: 'Blocked',
          alerts,
          amount: classified.amount,
          category: classified.category,
          merchant: classified.merchant,
        },
        { status: 403 } // 403 Forbidden until forced
      );
    }

    // Save to Firestore
    const record = {
      userId: uid,
      rawText: raw_text,
      amount: classified.amount,
      category: classified.category,
      merchant: classified.merchant,
      date: new Date().toISOString(),
      status: 'Confirmed',
    };

    const docRef = await db.collection('transactions').add(record);

    // Send warning email if triggered (and we didn't just force an overbudget, or maybe we still send it)
    if (alerts.length > 0) {
      const userSnap = await db.collection('users').doc(uid).get();
      const userData = userSnap.data();
      if (userData?.email) {
        const userName = userData.name || userData.email.split('@')[0];
        // If we forced it, we could send a 'forced' email, but let's stick to warning/blocked logic
        await sendAlertEmail(userData.email, userName, alerts, isOverbudget ? 'forced' : 'warning');
      }
    }

    return Response.json(
      {
        id: docRef.id,
        ...record,
        alerts,
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── GET /api/transactions ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!db) {
    return Response.json({ error: 'Firebase not configured on server' }, { status: 500 });
  }

  const uid = await getAuthenticatedUid(request);
  if (!uid) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snap = await db
      .collection('transactions')
      .where('userId', '==', uid)
      .orderBy('date', 'desc')
      .get();

    const transactions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const byCategory: Record<string, number> = {};
    let total = 0;

    transactions.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      byCategory[t.category] = (byCategory[t.category] || 0) + amount;
      total += amount;
    });

    return Response.json({ transactions, total, by_category: byCategory });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
