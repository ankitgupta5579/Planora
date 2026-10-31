import { Express } from 'express';
import express from 'express';
import helmet from 'helmet';
import { isProduction, isLocalhost, trustProxyConfig } from '../config';

/**
 * Configures reverse proxy trust, strict security headers (Helmet),
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

  // Strict payload limit: 50kb
  app.use(express.json({ limit: '50kb' }));
}
