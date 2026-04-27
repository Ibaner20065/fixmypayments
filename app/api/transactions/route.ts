import { parseTransaction } from '../../lib/classify';
import type { NextRequest } from 'next/server';
import db from '../../lib/db';
import { randomUUID } from 'crypto';
import { getSessionByToken } from '@/app/lib/auth';
import { evaluateAndNotify } from '@/app/lib/aiAlert';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = getSessionByToken(token);
    if (!session) {
      return Response.json({ error: 'Session expired' }, { status: 401 });
    }

    const { raw_text } = await request.json();

    if (!raw_text || typeof raw_text !== 'string') {
      return Response.json({ error: 'raw_text is required' }, { status: 400 });
    }

    // Try LLM classification first
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
          if (text) {
            classified = JSON.parse(text);
          }
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

    const id = randomUUID();
    const date = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO transactions (id, user_id, raw_text, amount, category, merchant, date, confidence, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      session.user_id,
      raw_text,
      classified.amount,
      classified.category,
      classified.merchant,
      date,
      classified.confidence || 1.0,
      date
    );

    const record = {
      id,
      user_id: session.user_id,
      raw_text,
      amount: classified.amount,
      category: classified.category,
      merchant: classified.merchant,
      date,
      confidence: classified.confidence || 1.0,
    };

    // Evaluate with AI and notify user if needed (email/sms notifications)
    try {
      await evaluateAndNotify(session.user_id, record);
    } catch (err) {
      console.error('evaluateAndNotify failed:', err);
    }

    return Response.json(record, { status: 201 });
  } catch (error) {
    console.error('Transaction API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = getSessionByToken(token);
    if (!session) {
      return Response.json({ error: 'Session expired' }, { status: 401 });
    }

    const transactions = db
      .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC')
      .all(session.user_id);
  
    const byCategory: Record<string, number> = {};
    let total = 0;

    transactions.forEach((t: any) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      total += t.amount;
    });

    return Response.json({
      transactions,
      total,
      by_category: byCategory,
    });
  } catch (error) {
    console.error('GET transactions error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
