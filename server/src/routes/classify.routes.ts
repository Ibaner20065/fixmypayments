import { Router, Request, Response } from 'express';
import { classifyWithLLM, parseTransaction } from '../services/classifier';

const router = Router();

router.post('/classify', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    let classified = await classifyWithLLM(text);

    if (!classified) {
      classified = parseTransaction(text);
    }

    res.json(classified);
  } catch {
    res.status(500).json({ error: 'Classification failed' });
  }
});

export default router;
