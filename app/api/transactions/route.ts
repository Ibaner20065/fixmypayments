import { parseTransaction } from '../../lib/classify';
import type { NextRequest } from 'next/server';
import db from '../../lib/db';

export async function POST(request: NextRequest) {
  try {
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

    const id = crypto.randomUUID();
    const date = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO transactions (id, raw_text, amount, category, merchant, date, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, raw_text, classified.amount, classified.category, classified.merchant, date, classified.confidence || 1.0);

    const record = {
      id,
      raw_text,
      amount: classified.amount,
      category: classified.category,
      merchant: classified.merchant,
      date,
      confidence: classified.confidence || 1.0,
    };

    return Response.json(record, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
  
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
}
