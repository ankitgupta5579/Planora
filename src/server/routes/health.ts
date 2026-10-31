import { Router, Request, Response } from 'express';

export const healthRouter = Router();

/**
 * GET /api/health
 * Lightweight health check endpoint for Render, cloud monitors, and container probes.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'planora-api',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});
