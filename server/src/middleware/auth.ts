import { Response, NextFunction } from 'express';
import { verifyToken } from '../config/firebase';
import { AuthenticatedRequest } from '../types';

export function auth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const uidPromise = verifyToken(req.headers.authorization || null);
  uidPromise.then((uid) => {
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.uid = uid;
    next();
  }).catch(() => {
    res.status(401).json({ error: 'Unauthorized' });
  });
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || null;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }
  verifyToken(authHeader).then((uid) => {
    if (uid) req.uid = uid;
    next();
  }).catch(() => {
    next();
  });
}
