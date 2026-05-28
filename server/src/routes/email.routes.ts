import { Router, Request, Response } from 'express';
import { sendEmail, emailTemplates } from '../services/emailService';

const router = Router();

router.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { type, to, data } = req.body;

    if (!type || !to || !data) {
      res.status(400).json({ error: 'Missing required fields: type, to, data' });
      return;
    }

    let subject = '';
    let html = '';

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
        res.status(400).json({ error: `Unknown email type: ${type}` });
        return;
    }

    const success = await sendEmail({ to, subject, html });

    if (!success) {
      res.status(500).json({ error: 'Failed to send email' });
      return;
    }

    res.json({
      success: true,
      message: `Email sent to ${to}`,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Email API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
