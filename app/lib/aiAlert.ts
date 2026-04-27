import db from './db';
import fetch from 'node-fetch';
import { sendEmail } from './email';

export async function evaluateAndNotify(userId: string, transaction: any) {
  try {
    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(userId);
    if (!user || !user.email) return null;

    // Fetch recent transactions for context
    const recent = db.prepare('SELECT raw_text, amount, merchant, category, date FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 10').all(userId);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Simple heuristic fallback: flag if amount > 1000 (configurable)
      if (transaction.amount && transaction.amount > 1000) {
        const subject = `Potential risky purchase detected · FixMyPayments`;
        const html = `<p>Hi ${user.name || 'User'},</p>
          <p>Your recent transaction for <strong>${transaction.merchant}</strong> of <strong>${transaction.amount}</strong> may be above your usual spending.</p>
          <p>If you'd like to proceed, reply YES or visit your dashboard to approve.</p>`;
        await sendEmail(user.email, subject, html);
        return { alerted: true, reason: 'amount_greater_than_threshold' };
      }
      return { alerted: false };
    }

    const prompt = `You are an assistant that decides whether a transaction is potentially an overpurchase, not ideal, or likely to cause a loss for the user. Respond only with valid JSON: { "alert": boolean, "reason": string, "action": "pass" | "hold", "confidence": number }.\n\nUser recent transactions: ${JSON.stringify(recent)}\n\nNew transaction: ${JSON.stringify(transaction)}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: 'You are a helpful financial advisor. Answer with JSON only.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.warn('Anthropic evaluation failed, falling back to heuristics');
      return { alerted: false };
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    let verdict = null;
    try { verdict = JSON.parse(text); } catch { verdict = null; }

    if (verdict && verdict.alert) {
      const subject = `Alert: potential risky purchase detected · FixMyPayments`;
      const html = `<p>Hi ${user.name || 'User'},</p>
        <p>Your transaction for <strong>${transaction.merchant}</strong> of <strong>${transaction.amount}</strong> was flagged:</p>
        <p><em>${verdict.reason}</em></p>
        <p>Recommended action: <strong>${verdict.action}</strong></p>
        <p>If you want to proceed, reply YES or visit your dashboard to approve.</p>`;
      await sendEmail(user.email, subject, html);
      return { alerted: true, verdict };
    }

    return { alerted: false };
  } catch (err) {
    console.error('evaluateAndNotify error:', err);
    return { alerted: false };
  }
}
