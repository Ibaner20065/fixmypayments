import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionsRoutes from './transactions.routes';
import budgetRoutes from './budget.routes';
import classifyRoutes from './classify.routes';
import profileRoutes from './profile.routes';
import identityRoutes from './identity.routes';
import alertsRoutes from './alerts.routes';
import stocksRoutes from './stocks.routes';
import cryptoRoutes from './crypto.routes';
import emailRoutes from './email.routes';

const router = Router();

router.use('/api/v1', authRoutes);
router.use('/api/v1', transactionsRoutes);
router.use('/api/v1', budgetRoutes);
router.use('/api/v1', classifyRoutes);
router.use('/api/v1', profileRoutes);
router.use('/api/v1', identityRoutes);
router.use('/api/v1', alertsRoutes);
router.use('/api/v1', stocksRoutes);
router.use('/api/v1', cryptoRoutes);
router.use('/api/v1', emailRoutes);

export default router;
