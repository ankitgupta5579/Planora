import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { withTimeout, isTimeoutError } from '../utils/withTimeout';

export const DEPRECATED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
] as const;

export const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
] as const;

export const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

/**
 * Resolves the Gemini model name to use.
 * Defaults to 'gemini-3-flash-preview'.
 * If process.env.GEMINI_MODEL is set to a deprecated model, uses the default.
 * Any other valid model override in process.env.GEMINI_MODEL is preserved.
 */
export function resolveGeminiModel(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel) return DEFAULT_GEMINI_MODEL;
  if ((DEPRECATED_MODELS as readonly string[]).includes(envModel)) {
    return DEFAULT_GEMINI_MODEL;
  }
  return envModel;
}

export const GEMINI_MODEL = resolveGeminiModel();
export const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 30000;
export const CHAT_THINKING_LEVEL = (ThinkingLevel && ThinkingLevel.MINIMAL) ? ThinkingLevel.MINIMAL : 'minimal';

export type GeminiErrorClassification = 'bad-thinking' | 'model-unavailable' | 'other';

/**
 * Strips sensitive API keys from error messages before logging or throwing.
 */
export function sanitizeGeminiErrorMessage(err: any): string {
  let message = String(err?.message || err || 'Unknown error');
  message = message.replace(/(key=)[A-Za-z0-9_-]+/gi, '$1[REDACTED]');
  message = message.replace(/(API[ _-]?key[:=]\s*)[A-Za-z0-9_-]+/gi, '$1[REDACTED]');
  return message;
}

/**
 * Sanitized server-side error logging for Gemini calls.
 */
export function logGeminiError(context: string, err: any) {
  if (isTimeoutError(err)) {
    console.error(`[Gemini Error] ${context} timed out after ${GEMINI_TIMEOUT_MS}ms`);
    return;
  }
  const status = err?.status || err?.statusCode || err?.code || 'UNKNOWN_STATUS';
  const message = sanitizeGeminiErrorMessage(err);
  console.error(`[Gemini Error] ${context} failed (status: ${status}): ${message}`);
}

/**
 * Classifies an error from Google GenAI into:
 * - 'bad-thinking': HTTP 400 specifically mentioning thinkingConfig
 * - 'model-unavailable': HTTP 404, 503, 429, or quota/unavailable/deprecated indicators
 * - 'other': any other error (timeouts, validation, etc.)
 */
export function classifyGeminiError(err: any): GeminiErrorClassification {
  const status = err?.status ?? err?.statusCode ?? err?.code;
  const statusStr = String(status ?? '');
  const message = String(err?.message || err || '');

  const is400 = status === 400 || statusStr === '400' || /400\b/.test(message);
  const mentionsThinking = /thinking/i.test(message);

  if (is400 && mentionsThinking) {
    return 'bad-thinking';
  }

  const is404 = status === 404 || statusStr === '404' || /404\b/.test(message) || /no longer available|not found/i.test(message);
  const is503 = status === 503 || statusStr === '503' || /503\b/.test(message) || /high demand|unavailable/i.test(message);
  const is429 = status === 429 || statusStr === '429' || /429\b/.test(message) || /quota|resource_exhausted|resource exhausted/i.test(message);

  if (is404 || is503 || is429) {
    return 'model-unavailable';
  }

  return 'other';
}

/**
 * Iterates through FALLBACK_MODELS in order, skipping the model that just failed,
 * stripping thinkingConfig, and returning the first successful response.
 * If all fallback models fail, throws the last error.
 */
export async function tryFallbackModels(
  ai: { models: { generateContent: (params: any) => Promise<any> } },
  params: any,
  timeoutMs: number = GEMINI_TIMEOUT_MS
): Promise<any> {
  const failedModel = params.model;
  const candidates = FALLBACK_MODELS.filter((m) => m !== failedModel);
  const { thinkingConfig, ...configWithoutThinking } = params.config || {};

  let lastError: any = null;
  for (const altModel of candidates) {
    try {
      console.warn(`[Gemini Warning] Model ${failedModel} unavailable, retrying with fallback model ${altModel}...`);
      return await withTimeout(
        ai.models.generateContent({
          ...params,
          model: altModel,
          config: configWithoutThinking,
        }),
        timeoutMs
      );
    } catch (candidateErr: any) {
      lastError = candidateErr;
      const cStatus = candidateErr?.status ?? candidateErr?.statusCode ?? candidateErr?.code;
      console.warn(`[Gemini Warning] Fallback candidate ${altModel} failed with status ${cStatus}`);
    }
  }

  throw lastError;
}

/**
 * Executes a Gemini model call with timeout and automated resiliency:
 * 1. Calls the primary model.
 * 2. If rejected with HTTP 400 mentioning 'thinking', retries once without thinkingConfig.
 * 3. If model is unavailable (404/503/429), falls back through FALLBACK_MODELS in order.
 * 4. Throws the final error if all options are exhausted.
 */
export async function generateContentWithRetry(
  ai: { models: { generateContent: (params: any) => Promise<any> } },
  params: any,
  timeoutMs: number = GEMINI_TIMEOUT_MS
): Promise<any> {
  try {
    return await withTimeout(ai.models.generateContent(params), timeoutMs);
  } catch (err: any) {
    const errorType = classifyGeminiError(err);

    if (errorType === 'bad-thinking' && params?.config?.thinkingConfig) {
      const cleanMsg = sanitizeGeminiErrorMessage(err);
      console.warn(
        `[Gemini Warning] Model rejected thinkingConfig (HTTP 400), retrying once without thinkingConfig: ${cleanMsg}`
      );
      const { thinkingConfig, ...configWithoutThinking } = params.config;
      try {
        return await withTimeout(
          ai.models.generateContent({
            ...params,
            config: configWithoutThinking,
          }),
          timeoutMs
        );
      } catch (retryErr: any) {
        if (classifyGeminiError(retryErr) === 'model-unavailable') {
          return await tryFallbackModels(ai, { ...params, config: configWithoutThinking }, timeoutMs);
        }
        throw retryErr;
      }
    }

    if (errorType === 'model-unavailable') {
      return await tryFallbackModels(ai, params, timeoutMs);
    }

    throw err;
  }
}

// Client helper & singleton management
let customGeminiClient: { ai: any; apiKey?: string } | null = null;

export function setCustomGeminiClient(client: { ai: any; apiKey?: string } | null) {
  customGeminiClient = client;
}

export function getGeminiClient(): { ai: GoogleGenAI | null; apiKey?: string } {
  if (customGeminiClient) return customGeminiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ai: null, apiKey: undefined };
  try {
    return { ai: new GoogleGenAI({ apiKey: key }), apiKey: key };
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', sanitizeGeminiErrorMessage(err));
    return { ai: null, apiKey: undefined };
  }
}
