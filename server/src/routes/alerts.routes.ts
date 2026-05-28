import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { checkSpendingAlerts, sendAlertEmail } from '../services/alertEngine';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.post('/alerts/check', async (req: Request, res: Response) => {
  try {
    const { newAmount, newCategory, existingTransactions, budgets } = req.body;

    if (!newAmount || !newCategory || !existingTransactions || !budgets) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const alerts = checkSpendingAlerts(newAmount, newCategory, existingTransactions, budgets);

    res.json({
      success: true,
      alerts,
      hasAlerts: alerts.length > 0,
    });
  } catch (err) {
    console.error('Spending check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/alerts/send', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userEmail, userName, alerts, emailType = 'warning' } = req.body;

    if (!userEmail || !userName || !alerts || !Array.isArray(alerts)) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const success = await sendAlertEmail(userEmail, userName, alerts, emailType);

    if (!success) {
      res.status(500).json({ error: 'Failed to send alert email' });
      return;
    }

    res.json({
      success: true,
      message: 'Alert email sent successfully',
      recipient: userEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Send alert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
