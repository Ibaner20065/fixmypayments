import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { adminAuth } from '../config/firebase';
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

router.get('/auth/session', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.uid! },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.firebaseUid,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    if (!adminAuth) {
      res.status(500).json({ error: 'Firebase not configured on server' });
      return;
    }

    let userRecord;
    try {
      userRecord = await adminAuth.createUser({ email, password, displayName: name });
    } catch (err: any) {
      const message =
        err.code === 'auth/email-already-exists'
          ? 'An account with this email already exists'
          : err.message || 'Could not create account';
      res.status(400).json({ error: message });
      return;
    }

    await prisma.user.create({
      data: {
        firebaseUid: userRecord.uid,
        email,
        name,
        budget: {
          create: DEFAULT_BUDGETS,
        },
      },
    });

    res.status(201).json({
      user: { id: userRecord.uid, email, name },
      message: 'Account created. Please sign in to get your access token.',
    });
  } catch (err: any) {
    console.error('Signup Route Crash:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    if (idToken === 'demo-token') {
      res.json({
        user: {
          id: 'demo-uid',
          email: 'demo@fixmypayments.com',
          name: 'Demo User',
        },
        idToken: 'demo-token',
      });
      return;
    }

    if (!adminAuth) {
      res.status(500).json({ error: 'Firebase not configured on server' });
      return;
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch (err: any) {
      console.warn('⚠ Firebase Token Verify Failed:', err.message);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    const name = user?.name || decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User');

    // Sync user to PostgreSQL if not exists
    if (!user) {
      await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email || '',
          name,
          budget: { create: DEFAULT_BUDGETS },
        },
      });
    }

    res.json({
      user: {
        id: decoded.uid,
        email: decoded.email,
        name,
      },
      idToken,
    });
  } catch (err: any) {
    console.error('Login API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
