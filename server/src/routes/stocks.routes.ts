import { Router, Request, Response } from 'express';
import { getStocks } from '../services/stockService';

const router = Router();

router.get('/stocks', async (_req: Request, res: Response) => {
  try {
    const result = await getStocks();
    res.json(result);
  } catch (err) {
    console.error('Stocks route error:', err);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

export default router;
