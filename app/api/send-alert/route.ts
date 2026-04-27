import { NextRequest, NextResponse } from 'next/server';
import { sendAlertEmail } from '@/app/lib/alerts';

interface SpendingAlert {
  type: 'category_exceeded' | 'total_exceeded' | 'spike_detected';
  category?: string;
  currentAmount: number;
  budgetLimit: number;
  percentUsed: number;
  message: string;
}

/**
 * POST /api/send-alert
 * Send budget alert email to user
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, alerts, emailType = 'warning' } = await request.json();

    if (!userEmail || !userName || !alerts || !Array.isArray(alerts)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send alert email
    const success = await sendAlertEmail(
      userEmail,
      userName,
      alerts as SpendingAlert[],
      emailType as 'warning' | 'blocked' | 'forced'
    );

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Failed to send alert email',
          warning: 'Alert would be sent in production',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert email sent successfully',
      recipient: userEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Send alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
