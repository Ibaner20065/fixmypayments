import { Router, Response } from 'express';
import { auth } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/profile', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.uid! },
      include: { transactions: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let lifetimeSpent = 0;
    const byCategory: Record<string, number> = {};

    user.transactions.forEach((t) => {
      lifetimeSpent += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    res.json({
      profile: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
      stats: {
        totalTransactions: user.transactions.length,
        lifetimeSpent,
        byCategory,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
