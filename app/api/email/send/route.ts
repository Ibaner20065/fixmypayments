import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json();

    // Validate required fields
    if (!type || !to || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to, data' },
        { status: 400 }
      );
    }

    let subject = '';
    let html = '';

    // Generate email based on type
    switch (type) {
      case 'payment-confirmation':
        subject = `Payment Sent: ₹${data.amount} to ${data.recipientName}`;
        html = emailTemplates.paymentConfirmation(data);
        break;

      case 'budget-alert':
        subject = `Budget Alert: ${data.budgetName} (${data.percentage}% used)`;
        html = emailTemplates.budgetAlert(data);
        break;

      case 'welcome':
        subject = 'Welcome to FixMyPayments! 🎉';
        html = emailTemplates.welcomeEmail(data);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    // Send email
    const success = await sendEmail({
      to,
      subject,
      html,
    });

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Failed to send email. Gmail credentials may not be configured.',
          warning: 'Email would be sent in production',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${to}`,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
