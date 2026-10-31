import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PORT,
  isProduction,
  DEPRECATED_MODELS,
  FALLBACK_MODELS,
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  CHAT_THINKING_LEVEL,
} from './src/server/config';
import { applySecurityMiddleware, applyErrorMiddleware } from './src/server/middleware/security';
import { aiRateLimiter } from './src/server/middleware/rateLimit';
import { healthRouter } from './src/server/routes/health';
import { aiRouter } from './src/server/routes/ai';
import {
  classifyGeminiError,
  tryFallbackModels,
  generateContentWithRetry,
  logGeminiError,
  setCustomGeminiClient,
  getGeminiClient,
} from './src/server/geminiClient';
import { logger } from './src/server/logger';

// Re-export core Gemini helpers for backward compatibility with existing tests
export {
  DEPRECATED_MODELS,
  FALLBACK_MODELS,
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  CHAT_THINKING_LEVEL,
  classifyGeminiError,
  tryFallbackModels,
  generateContentWithRetry,
  logGeminiError,
  setCustomGeminiClient,
  getGeminiClient,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Apply security headers, reverse proxy trust, and JSON size limits
applySecurityMiddleware(app);

// Mount modular route handlers
app.use('/api/health', healthRouter);
app.use('/api/ai', aiRateLimiter, aiRouter);

// Apply centralized error handler for 413, 400 and unhandled exceptions
applyErrorMiddleware(app);

/**
 * Initializes and starts the Express server.
 * In dev: mounts Vite middleware for hot module replacement.
 * In prod: serves pre-compiled production assets from dist/.
 */
export async function startServer(portOverride?: number) {
  const listenPort = portOverride || PORT;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return app.listen(listenPort, '0.0.0.0', () => {
    logger.info(`Planora server running on http://0.0.0.0:${listenPort}`);
    const { ai, apiKey } = getGeminiClient();
    const isAiEnabled = Boolean(apiKey && ai);
    logger.info(
      `Planner Mode: ${isAiEnabled ? `AI mode active (${GEMINI_MODEL})` : 'Offline-fallback mode active'}`
    );
  });
}

const isMainModule = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  startServer();
}
