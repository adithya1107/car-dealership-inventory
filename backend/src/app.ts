import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { vehicleRouter } from './modules/auth/vehicles/vehicle.routes';

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

/** Liveness probe used by tests, deployments and uptime monitors. */
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehicleRouter);

app.use(notFoundHandler);
app.use(errorHandler);