import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: 20 requests per minute per IP on AI routes.
 * Emits standard headers (RateLimit-Limit, RateLimit-Remaining).
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
});
