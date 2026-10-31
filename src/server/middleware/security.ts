import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import helmet from 'helmet';
import { isProduction, isLocalhost, trustProxyConfig } from '../config';
import { logger } from '../logger';

/**
 * Configures reverse proxy trust, CORS policies, strict security headers (Helmet),
 * and payload size limits on the Express application.
 */
export function applySecurityMiddleware(app: Express) {
  // Trust reverse proxy (Cloud Run, Render, Heroku, Nginx) so rate limiters track real client IPs
  app.set('trust proxy', trustProxyConfig);

  // Security headers with Helmet (strict CSP in production, relaxed in dev for Vite)
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              imgSrc: ["'self'", 'data:'],
              fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
              connectSrc: ["'self'"],
              upgradeInsecureRequests: isLocalhost ? null : [],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Policy: Allow same-origin and verified Render domain
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      const isAllowed =
        !isProduction ||
        origin === 'https://planora-njz8.onrender.com' ||
        origin.endsWith('.onrender.com');

      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      }
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Strict payload limit: 50kb
  app.use(express.json({ limit: '50kb' }));
}

/**
 * Global error handler ensuring no internal stack traces or secrets leak to the client.
 */
export function applyErrorMiddleware(app: Express) {
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (
      err &&
      typeof err === 'object' &&
      'type' in err &&
      (err as { type: string }).type === 'entity.too.large'
    ) {
      return res.status(413).json({ error: 'Payload too large. Maximum allowed size is 50kb.' });
    }
    if (
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status: number }).status === 400
    ) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    logger.error('Unhandled server error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ error: 'Internal server error' });
  });
}
