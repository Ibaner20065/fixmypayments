import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { classifyWithLLM, parseTransaction } from '../services/classifier';
import { checkSpendingAlerts, sendAlertEmail } from '../services/alertEngine';

const router = Router();

router.get('/transactions', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.uid! } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    const byCategory: Record<string, number> = {};
    let total = 0;

    transactions.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      total += t.amount;
    });

    res.json({ transactions, total, by_category: byCategory });
  } catch (err) {
    console.error('Transactions GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transactions', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { raw_text, force } = req.body;

    if (!raw_text || typeof raw_text !== 'string') {
      res.status(400).json({ error: 'raw_text is required' });
      return;
    }

    let llmResult = await classifyWithLLM(raw_text);
    let classified = llmResult || parseTransaction(raw_text);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.uid! },
      include: { budget: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const existingTxs = await prisma.transaction.findMany({
      where: { userId: user.id },
      select: { amount: true, category: true, date: true },
    });

    const budgetRecord = user.budget
      ? {
          total: user.budget.total,
          Food: user.budget.food,
          Transport: user.budget.transport,
          Shopping: user.budget.shopping,
          Utilities: user.budget.utilities,
          Medical: user.budget.medical,
          Entertainment: user.budget.entertainment,
          Health: user.budget.health,
          Groceries: user.budget.groceries,
        }
      : undefined;

    const existingForAlerts = existingTxs.map((t) => ({
      amount: t.amount,
      category: t.category,
      date: t.date.toISOString(),
    }));

    const alerts = checkSpendingAlerts(
      classified.amount,
      classified.category,
      existingForAlerts,
      budgetRecord
    );

    const isOverbudget = alerts.some((a) => a.percentUsed > 100);
    const isWarning = alerts.some((a) => a.percentUsed > 80 && a.percentUsed <= 100);

    if (isOverbudget && !force) {
      await sendAlertEmail(user.email, user.name, alerts, 'blocked');
      res.status(403).json({
        error: 'Budget Exceeded',
        status: 'Blocked',
        alerts,
        amount: classified.amount,
        category: classified.category,
        merchant: classified.merchant,
      });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        rawText: raw_text,
        amount: classified.amount,
        category: classified.category,
        merchant: classified.merchant,
        date: new Date(),
        status: 'Confirmed',
      },
    });

    if (alerts.length > 0) {
      await sendAlertEmail(user.email, user.name, alerts, isOverbudget ? 'forced' : 'warning');
    }

    res.status(201).json({
      ...transaction,
      alerts,
    });
  } catch (err) {
    console.error('Transactions POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
