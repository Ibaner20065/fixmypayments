import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailTemplate {
  paymentConfirmation: (data: {
    recipientName: string;
    amount: string;
    category: string;
    transactionId: string;
  }) => string;
  budgetAlert: (data: {
    budgetName: string;
    spent: string;
    limit: string;
    percentage: number;
  }) => string;
  welcomeEmail: (data: { userName: string }) => string;
}

// Email templates
const emailTemplates: EmailTemplate = {
  paymentConfirmation: ({ recipientName, amount, category, transactionId }) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; color: #fff; padding: 40px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 2rem;">✓ Payment Sent</h1>
      </div>
      
      <div style="padding: 40px 24px; background: #f9f9f9;">
        <p style="margin: 0 0 24px 0; font-size: 1rem; color: #333;">
          Your payment to <strong>${recipientName}</strong> has been sent successfully.
        </p>

        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e0e0e0;">
          <div style="display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #666;">Amount</span>
            <strong style="font-size: 1.25rem;">₹${amount}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0;">
            <span style="color: #666;">Category</span>
            <strong>${category}</strong>
          </div>
        </div>

        <div style="background: #f0f8ff; border-left: 4px solid #0066cc; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 0.875rem; color: #333;">
            <strong>Transaction ID:</strong><br />
            <code style="font-family: monospace; color: #666;">${transactionId}</code>
          </p>
        </div>

        <p style="margin: 0; font-size: 0.875rem; color: #999; text-align: center;">
          This transaction was made via FixMyPayments
        </p>
      </div>

      <div style="padding: 24px; background: #fff; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="margin: 0; font-size: 0.75rem; color: #999;">
          © 2026 FixMyPayments. All rights reserved.
        </p>
      </div>
    </div>
  `,

  budgetAlert: ({ budgetName, spent, limit, percentage }) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f57f17; color: #fff; padding: 40px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 2rem;">⚠ Budget Alert</h1>
      </div>
      
      <div style="padding: 40px 24px; background: #f9f9f9;">
        <p style="margin: 0 0 24px 0; font-size: 1rem; color: #333;">
          Your <strong>${budgetName}</strong> budget is running out!
        </p>

        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #ffe082;">
          <h3 style="margin: 0 0 16px 0; color: #333;">Budget Usage</h3>
          <div style="background: #f0f0f0; height: 24px; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
            <div style="background: #f57f17; height: 100%; width: ${percentage}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: #666;">
            <span>₹${spent} spent</span>
            <strong>${percentage}% used</strong>
            <span>₹${limit} limit</span>
          </div>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #f57f17; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 0.875rem; color: #333;">
            You've exceeded ${percentage - 80}% of your safe threshold. Consider pausing new expenses or increasing your budget limit.
          </p>
        </div>

        <a href="https://fixmypayments.vercel.app/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
          View Dashboard
        </a>
      </div>

      <div style="padding: 24px; background: #fff; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="margin: 0; font-size: 0.75rem; color: #999;">
          © 2026 FixMyPayments. All rights reserved.
        </p>
      </div>
    </div>
  `,

  welcomeEmail: ({ userName }) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #fff; padding: 40px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 2rem;">Welcome to FixMyPayments! 🎉</h1>
      </div>
      
      <div style="padding: 40px 24px; background: #f9f9f9;">
        <p style="margin: 0 0 24px 0; font-size: 1rem; color: #333;">
          Hey ${userName},
        </p>

        <p style="margin: 0 0 24px 0; font-size: 1rem; color: #333;">
          Welcome to <strong>FixMyPayments</strong> — your AI-powered finance assistant for payments and DeFi.
        </p>

        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #000;">
          <h3 style="margin: 0 0 16px 0; color: #000;">What you can do:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">💰 Send money instantly with our GPay-style payment interface</li>
            <li style="margin-bottom: 8px;">📊 Track spending with AI-powered budget alerts</li>
            <li style="margin-bottom: 8px;">⚡ Bundle DeFi transactions gaslessly on zkSync</li>
            <li style="margin-bottom: 8px;">🤖 Get AI stock recommendations</li>
            <li>📧 Receive smart email notifications</li>
          </ul>
        </div>

        <p style="margin: 0 0 24px 0; font-size: 1rem; color: #333;">
          Let's get started by setting up your first budget or sending your first payment!
        </p>

        <a href="https://fixmypayments.vercel.app/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
          Go to Dashboard
        </a>
      </div>

      <div style="padding: 24px; background: #fff; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="margin: 0; font-size: 0.75rem; color: #999;">
          © 2026 FixMyPayments. All rights reserved.
        </p>
      </div>
    </div>
  `,
};

// Gmail transporter configuration
async function createTransporter() {
  // Using Gmail App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter;
}

// Send email function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured. Email not sent.');
      console.log(`📧 Would send email to: ${options.to}`);
      console.log(`📌 Subject: ${options.subject}`);
      return false;
    }

    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${options.to}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Export templates for use in API routes
export { emailTemplates };

export type { EmailOptions };
