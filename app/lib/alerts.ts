import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type SpendingAlert = {
  type: 'category_exceeded' | 'total_exceeded' | 'spike_detected';
  category?: string;
  currentAmount: number;
  budgetLimit: number;
  percentUsed: number;
  message: string;
};

// Spike threshold: if a single transaction exceeds this % of total monthly budget
const SPIKE_THRESHOLD_PERCENT = 25;

/**
 * Check if adding a transaction triggers any spending alerts.
 * @param budgets  Per-user budget map from Firestore (includes 'total' key).
 *                 Falls back to sensible defaults if a category is missing.
 */
export function checkSpendingAlerts(
  newAmount: number,
  newCategory: string,
  existingTransactions: { amount: number; category: string; date: string }[],
  budgets: Record<string, number> = {}
): SpendingAlert[] {
  const alerts: SpendingAlert[] = [];
  const totalBudget = budgets.total ?? 40000;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter to current month
  const monthlyTxs = existingTransactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // 1. Category budget check
  const categoryBudget = budgets[newCategory] ?? 5000;
  const categoryTotal =
    monthlyTxs
      .filter((t) => t.category === newCategory)
      .reduce((sum, t) => sum + t.amount, 0) + newAmount;

  const categoryPercent = (categoryTotal / categoryBudget) * 100;

  if (categoryPercent >= 90) {
    alerts.push({
      type: 'category_exceeded',
      category: newCategory,
      currentAmount: categoryTotal,
      budgetLimit: categoryBudget,
      percentUsed: Math.round(categoryPercent),
      message:
        categoryPercent >= 100
          ? `🚨 ${newCategory} budget EXCEEDED! ₹${categoryTotal.toLocaleString('en-IN')} / ₹${categoryBudget.toLocaleString('en-IN')} (${Math.round(categoryPercent)}%)`
          : `⚠️ ${newCategory} budget at ${Math.round(categoryPercent)}%! ₹${categoryTotal.toLocaleString('en-IN')} / ₹${categoryBudget.toLocaleString('en-IN')}`,
    });
  }

  // 2. Total monthly budget check
  const monthlyTotal = monthlyTxs.reduce((sum, t) => sum + t.amount, 0) + newAmount;
  const totalPercent = (monthlyTotal / totalBudget) * 100;

  if (totalPercent >= 80) {
    alerts.push({
      type: 'total_exceeded',
      currentAmount: monthlyTotal,
      budgetLimit: totalBudget,
      percentUsed: Math.round(totalPercent),
      message:
        totalPercent >= 100
          ? `🔥 TOTAL monthly budget EXCEEDED! ₹${monthlyTotal.toLocaleString('en-IN')} / ₹${totalBudget.toLocaleString('en-IN')}`
          : `📊 Total spending at ${Math.round(totalPercent)}% of monthly budget. ₹${monthlyTotal.toLocaleString('en-IN')} / ₹${totalBudget.toLocaleString('en-IN')}`,
    });
  }

  // 3. Spike detection — single large transaction
  const spikeThreshold = (totalBudget * SPIKE_THRESHOLD_PERCENT) / 100;
  if (newAmount >= spikeThreshold) {
    alerts.push({
      type: 'spike_detected',
      currentAmount: newAmount,
      budgetLimit: spikeThreshold,
      percentUsed: Math.round((newAmount / totalBudget) * 100),
      message: `⚡ Large transaction detected! ₹${newAmount.toLocaleString('en-IN')} is ${Math.round((newAmount / totalBudget) * 100)}% of your monthly budget.`,
    });
  }

  return alerts;
}

/**
 * Send email alert via Gmail
 */
export async function sendAlertEmail(
  userEmail: string,
  userName: string,
  alerts: SpendingAlert[],
  emailType: 'warning' | 'blocked' | 'forced' = 'warning'
): Promise<boolean> {
  if (alerts.length === 0) return false;

  const alertRows = alerts
    .map(
      (a) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 2px solid #000; font-family: 'Space Mono', monospace; font-size: 12px; text-transform: uppercase;">
          ${a.type === 'category_exceeded' ? `📁 ${a.category}` : a.type === 'total_exceeded' ? '📊 TOTAL' : '⚡ SPIKE'}
        </td>
        <td style="padding: 12px 16px; border-bottom: 2px solid #000; font-weight: 700;">
          ₹${a.currentAmount.toLocaleString('en-IN')} / ₹${a.budgetLimit.toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px 16px; border-bottom: 2px solid #000;">
          <span style="background: ${a.percentUsed >= 100 ? '#ff0000' : '#ff9900'}; color: #fff; padding: 4px 10px; font-weight: 700; font-size: 12px;">
            ${a.percentUsed}%
          </span>
        </td>
      </tr>`
    )
    .join('');

  let headerText = 'Hey ${userName}, your spending needs attention.';
  let subjectText = `⚠️ Spending Alert — ${alerts[0].message.substring(0, 50)}`;

  if (emailType === 'blocked') {
    headerText = `ACTION REQUIRED: Transaction blocked. You are exceeding your budget.`;
    subjectText = `🚨 BLOCKED: Budget Exceeded — Action Required`;
  } else if (emailType === 'forced') {
    headerText = `WARNING: You forced a transaction that exceeded your budget.`;
    subjectText = `🔥 OVERBUDGET: Transaction Confirmed`;
  }

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
      <div style="background: #000; padding: 24px; text-align: center;">
        <h1 style="color: #CCFF00; font-size: 24px; margin: 0; letter-spacing: 2px;">
          FIXMYPAYMENTS
        </h1>
        <p style="color: #666; font-size: 11px; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 3px;">
          SPENDING ALERT
        </p>
      </div>

      <div style="background: #CCFF00; padding: 20px 24px; border: 4px solid #000;">
        <h2 style="margin: 0; font-size: 18px; color: #000;">
          ${headerText}
        </h2>
      </div>

      <div style="padding: 24px; border: 4px solid #000; border-top: none; background: #fff;">
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
          <thead>
            <tr style="background: #000; color: #CCFF00;">
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Category</th>
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Spent / Limit</th>
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${alertRows}
          </tbody>
        </table>

        <p style="margin: 20px 0 0; font-size: 14px; color: #555; line-height: 1.6;">
          Review your spending in the <a href="https://fixmypayments.vercel.app/dashboard" style="color: #000; font-weight: 700;">dashboard</a> to stay on track.
        </p>
      </div>

      <div style="padding: 16px 24px; background: #f5f5f5; border: 4px solid #000; border-top: none; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #999;">
          FixMyPayments © 2026 • You received this because spending alerts are enabled.
        </p>
      </div>
    </div>
  `;

  try {
    if (!resend) {
      console.warn('⚠ Resend not configured. Skipping alert email.');
      return false;
    }

    await resend.emails.send({
      from: 'FixMyPayments <alerts@fixmypayments.com>',
      to: userEmail,
      subject: subjectText,
      html,
    });
    console.log('✅ Alert email sent to', userEmail);
    return true;
  } catch (err) {
    console.error('❌ Resend Error:', err);
    return false;
  }
}
