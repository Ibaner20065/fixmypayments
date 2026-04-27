import { parseTransaction } from '../../lib/classify';
import { checkSpendingAlerts, sendAlertEmail } from '../../lib/alerts';
import { supabaseAdmin, supabaseServer } from '../../lib/supabase-server';
import type { NextRequest } from 'next/server';

function readBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = readBearerToken(request);
  if (!token) return null;

  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user;
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return Response.json(
        { error: 'Supabase service role key missing on server' },
        { status: 500 }
      );
    }

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

    const { data: existingTxs } = await supabaseAdmin
      .from('transactions')
      .select('amount, category, date')
      .eq('user_id', user.id);

    const record = {
      user_id: user.id,
      raw_text,
      amount: classified.amount,
      category: classified.category,
      merchant: classified.merchant,
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert(record)
      .select('id, raw_text, amount, category, merchant, date')
      .single();

    if (insertError || !inserted) {
      return Response.json(
        { error: insertError?.message || 'Could not save transaction' },
        { status: 500 }
      );
    }

    const alerts = checkSpendingAlerts(
      inserted.amount,
      inserted.category,
      (existingTxs || []).map((t) => ({
        amount: Number(t.amount),
        category: t.category,
        date: t.date,
      }))
    );

    if (alerts.length > 0 && user.email) {
      const userName =
        (user.user_metadata?.name as string | undefined) ||
        (user.email ? user.email.split('@')[0] : 'there');
      await sendAlertEmail(user.email, userName, alerts);
    }

    return Response.json({ ...inserted, alerts }, { status: 201 });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return Response.json(
      { error: 'Supabase service role key missing on server' },
      { status: 500 }
    );
  }

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: transactions, error } = await supabaseAdmin
    .from('transactions')
    .select('id, raw_text, amount, category, merchant, date')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message || 'Could not fetch transactions' },
      { status: 500 }
    );
  }

  const byCategory: Record<string, number> = {};
  let total = 0;

  (transactions || []).forEach((t) => {
    const amount = Number(t.amount) || 0;
    byCategory[t.category] = (byCategory[t.category] || 0) + amount;
    total += amount;
  });

  return Response.json({
    transactions: transactions || [],
    total,
    by_category: byCategory,
  });
}
