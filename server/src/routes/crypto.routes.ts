import { Router, Request, Response } from 'express';
import { getCryptoInsights } from '../services/cryptoService';

const router = Router();

router.get('/crypto', async (_req: Request, res: Response) => {
  try {
    const result = await getCryptoInsights();

    if (!result) {
      res.status(502).json({ error: 'Could not load crypto market data right now' });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Could not load crypto market data right now' });
  }
});

export default router;
