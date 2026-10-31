import dotenv from 'dotenv';
import {
  DEPRECATED_MODELS,
  FALLBACK_MODELS,
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  CHAT_THINKING_LEVEL,
} from './geminiClient';

dotenv.config();

if (
  process.env.NO_API_KEY === '1' ||
  process.env.GEMINI_API_KEY === 'none' ||
  process.env.GEMINI_API_KEY === ''
) {
  delete process.env.GEMINI_API_KEY;
}

// Auto-detect production mode when run via "npm start" or hosted on Render/cloud platforms
if (
  !process.env.NODE_ENV &&
  (process.env.RENDER === 'true' || process.env.npm_lifecycle_event === 'start')
) {
  process.env.NODE_ENV = 'production';
}

export const PORT = Number(process.env.PORT) || 3000;
export const isProduction = process.env.NODE_ENV === 'production';
export const isLocalhost =
  !process.env.FORCE_HTTPS &&
  (!process.env.HOST || process.env.HOST === '0.0.0.0' || process.env.HOST === 'localhost');

export const trustProxyConfig = process.env.TRUST_PROXY
  ? isNaN(Number(process.env.TRUST_PROXY))
    ? process.env.TRUST_PROXY
    : Number(process.env.TRUST_PROXY)
  : 1;

export {
  DEPRECATED_MODELS,
  FALLBACK_MODELS,
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  CHAT_THINKING_LEVEL,
};
