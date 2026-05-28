import express from 'express';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Middleware stack
app.use(corsMiddleware);
app.use(requestLogger);
app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));

// Routes
app.use(healthRoutes);
app.use(routes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     FixMyPayments API Server         ║
  ║──────────────────────────────────────║
  ║  Port:    ${String(env.PORT).padEnd(30)}║
  ║  Env:     ${env.NODE_ENV.padEnd(30)}║
  ║  CORS:    ${env.CORS_ORIGIN.padEnd(30)}║
  ╚══════════════════════════════════════╝
  `);
});

export default app;
