import { NextRequest, NextResponse } from 'next/server';

interface AlertEvent {
  budgetId: string;
  budgetName: string;
  spent: number;
  limit: number;
  percentage: number;
  email: string;
  timestamp: string;
}

// In-memory alert log (in production, use database)
const alertLog: AlertEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const { budgetId, budgetName, spent, limit, email } = await request.json();

    // Validate inputs
    if (!budgetId || !email || spent === undefined || limit === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const percentage = Math.round((spent / limit) * 100);

    // Only trigger alert if threshold exceeded (80%)
    if (percentage < 80) {
      return NextResponse.json({
        success: true,
        alerted: false,
        message: 'Budget under threshold',
      });
    }

    const alertEvent: AlertEvent = {
      budgetId,
      budgetName,
      spent,
      limit,
      percentage,
      email,
      timestamp: new Date().toISOString(),
    };

    alertLog.push(alertEvent);

    // In production, send real email via SendGrid/Resend
    console.log(`
📧 EMAIL ALERT TRIGGERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${email}
Subject: Budget Alert: ${budgetName} (${percentage}% used)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Budget: ${budgetName}
Spent: $${spent.toFixed(2)} / $${limit.toFixed(2)}
Usage: ${percentage}%

⚠️ You've exceeded ${percentage - 80}% over your safe threshold!
Consider pausing new expenses or increasing your budget.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    return NextResponse.json({
      success: true,
      alerted: true,
      event: alertEvent,
      message: `Alert sent to ${email}`,
    });
  } catch (error) {
    console.error('Alert error:', error);
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      alerts: alertLog,
      total: alertLog.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
