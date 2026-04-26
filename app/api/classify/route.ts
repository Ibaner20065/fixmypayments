import { parseTransaction } from '../../lib/classify';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

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
            messages: [{ role: 'user', content: text }],
          }),
        });

        if (llmRes.ok) {
          const llmData = await llmRes.json();
          const content = llmData.content?.[0]?.text;
          if (content) {
            return Response.json(JSON.parse(content));
          }
        }
      } catch {
        // Fall through to rule-based
      }
    }

    // Rule-based fallback
    const parsed = parseTransaction(text);
    return Response.json({
      amount: parsed.amount,
      category: parsed.category,
      merchant: parsed.merchant,
      confidence: parsed.confidence,
    });
  } catch {
    return Response.json({ error: 'Classification failed' }, { status: 500 });
  }
}
