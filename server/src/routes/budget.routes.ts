import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';

const DEFAULT_BUDGETS = {
  total: 40000,
  food: 5000,
  transport: 3000,
  shopping: 8000,
  utilities: 4000,
  medical: 5000,
  entertainment: 3000,
  health: 3000,
  groceries: 6000,
};

const router = Router();

router.get('/budget', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.uid! },
      include: { budget: true },
    });

    if (!user) {
      res.json({ budget: DEFAULT_BUDGETS });
      return;
    }

    const budget = user.budget
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
      : DEFAULT_BUDGETS;

    res.json({ budget });
  } catch (err) {
    console.error('Budget GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/budget', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.uid! } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const fieldMap: Record<string, keyof typeof DEFAULT_BUDGETS> = {
      total: 'total',
      Food: 'food',
      Transport: 'transport',
      Shopping: 'shopping',
      Utilities: 'utilities',
      Medical: 'medical',
      Entertainment: 'entertainment',
      Health: 'health',
      Groceries: 'groceries',
    };

    const budgetData: Record<string, number> = {};
    for (const [key, dbKey] of Object.entries(fieldMap)) {
      if (key in body) {
        const val = Number(body[key]);
        if (isNaN(val) || val < 0) {
          res.status(400).json({ error: `Invalid value for ${key}` });
          return;
        }
        budgetData[dbKey] = val;
      }
    }

    if (Object.keys(budgetData).length === 0) {
      res.status(400).json({ error: 'No valid budget fields provided' });
      return;
    }

    // Map frontend PascalCase keys to snake_case DB column names
    const dbUpdateData: any = {};
    for (const [key, value] of Object.entries(budgetData)) {
      dbUpdateData[key] = value;
    }

    const budget = await prisma.budget.upsert({
      where: { userId: user.id },
      update: dbUpdateData,
      create: {
        userId: user.id,
        ...DEFAULT_BUDGETS,
        ...dbUpdateData,
      },
    });

    const response = {
      total: budget.total,
      Food: budget.food,
      Transport: budget.transport,
      Shopping: budget.shopping,
      Utilities: budget.utilities,
      Medical: budget.medical,
      Entertainment: budget.entertainment,
      Health: budget.health,
      Groceries: budget.groceries,
    };

    res.json({ budget: response });
  } catch (err) {
    console.error('Budget PUT error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
