import express, { Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { withTimeout, isTimeoutError } from './src/utils/withTimeout';
import { FallbackReason } from './src/utils/fallbackMessages';
import { generateHeuristicEventPlan } from './src/utils/fallbackGenerator';
import {
  validatePlanInput,
  validateChatInput,
  validateInviteSpeechInput,
  validateVendorInquiryInput,
} from './src/server/validate';
import {
  buildPlanGenerationPrompt,
  buildChatPrompt,
  buildInviteSpeechPrompt,
  buildVendorInquiryPrompt,
} from './src/server/prompts';

dotenv.config();
if (process.env.NO_API_KEY === '1' || process.env.GEMINI_API_KEY === 'none' || process.env.GEMINI_API_KEY === '') {
  delete process.env.GEMINI_API_KEY;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEPRECATED_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-2.5-flash', 'gemini-2.5-pro'];
export const FALLBACK_MODELS = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'];

const rawModel = process.env.GEMINI_MODEL;
export const GEMINI_MODEL = (rawModel && !DEPRECATED_MODELS.includes(rawModel))
  ? rawModel
  : 'gemini-3-flash-preview';

export const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 30000;
export const CHAT_THINKING_LEVEL = (ThinkingLevel && ThinkingLevel.MINIMAL) ? ThinkingLevel.MINIMAL : 'minimal';
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost =
  !process.env.FORCE_HTTPS &&
  (!process.env.HOST || process.env.HOST === '0.0.0.0' || process.env.HOST === 'localhost');

/**
 * Sanitized server-side error logging for Gemini calls.
 * Never leaks the API key, and clearly logs status code vs timeout vs model errors.
 */
function logGeminiError(context: string, err: any) {
  if (isTimeoutError(err)) {
    console.error(`[Gemini Error] ${context} timed out after ${GEMINI_TIMEOUT_MS}ms`);
    return;
  }
  const status = err?.status || err?.statusCode || err?.code || 'UNKNOWN_STATUS';
  let message = String(err?.message || err || 'Unknown error');
  // Strip out any accidental API keys from query strings or headers in the error message
  message = message.replace(/(key=)[A-Za-z0-9_-]+/gi, '$1[REDACTED]');
  message = message.replace(/(API[ _-]?key[:=]\s*)[A-Za-z0-9_-]+/gi, '$1[REDACTED]');
  console.error(`[Gemini Error] ${context} failed (status: ${status}): ${message}`);
}

/**
 * Executes a Gemini model call wrapped in a timeout.
 * If the model rejects with HTTP 400 mentioning 'thinking', it retries ONCE
 * without thinkingConfig before throwing/falling through to the fallback handler.
 * If the model rejects with HTTP 404 (deprecated model) or HTTP 503 (high demand spike),
 * it iterates through candidate fallback models until one succeeds.
 */
export async function generateContentWithRetry(
  ai: { models: { generateContent: (params: any) => Promise<any> } },
  params: any,
  timeoutMs: number = GEMINI_TIMEOUT_MS
): Promise<any> {
  try {
    return await withTimeout(ai.models.generateContent(params), timeoutMs);
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode ?? err?.code;
    const is400 = status === 400 || String(status) === '400' || /400\b/.test(String(err?.message || ''));
    const mentionsThinking = /thinking/i.test(String(err?.message || ''));

    if (is400 && mentionsThinking && params?.config?.thinkingConfig) {
      let cleanMsg = String(err?.message || err);
      cleanMsg = cleanMsg.replace(/(key=)[A-Za-z0-9_-]+/gi, '$1[REDACTED]');
      cleanMsg = cleanMsg.replace(/(API[ _-]?key[:=]\s*)[A-Za-z0-9_-]+/gi, '$1[REDACTED]');
      console.warn(`[Gemini Warning] Model rejected thinkingConfig (HTTP 400), retrying once without thinkingConfig: ${cleanMsg}`);

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
        const retryStatus = retryErr?.status ?? retryErr?.statusCode ?? retryErr?.code;
        const retry404 = retryStatus === 404 || /404\b/.test(String(retryErr?.message || ''));
        const retry503 = retryStatus === 503 || /503\b/.test(String(retryErr?.message || ''));
        const retry429 = retryStatus === 429 || /429\b/.test(String(retryErr?.message || '')) || /quota|resource_exhausted/i.test(String(retryErr?.message || ''));
        if (retry404 || retry503 || retry429) {
          const candidates = FALLBACK_MODELS.filter((m) => m !== params.model);
          for (const altModel of candidates) {
            try {
              console.warn(`[Gemini Warning] Retrying with fallback model ${altModel} after ${retryStatus}...`);
              return await withTimeout(
                ai.models.generateContent({
                  ...params,
                  model: altModel,
                  config: configWithoutThinking,
                }),
                timeoutMs
              );
            } catch {
              // try next fallback model
            }
          }
        }
        throw retryErr;
      }
    }

    const is404 = status === 404 || String(status) === '404' || /404\b/.test(String(err?.message || '')) || /no longer available/i.test(String(err?.message || ''));
    const is503 = status === 503 || String(status) === '503' || /503\b/.test(String(err?.message || '')) || /high demand|unavailable/i.test(String(err?.message || ''));
    const is429 = status === 429 || String(status) === '429' || /429\b/.test(String(err?.message || '')) || /quota|resource_exhausted/i.test(String(err?.message || ''));

    if (is404 || is503 || is429) {
      const candidates = FALLBACK_MODELS.filter((m) => m !== params.model);
      const { thinkingConfig, ...configWithoutThinking } = params.config || {};
      for (const altModel of candidates) {
        try {
          console.warn(`[Gemini Warning] Model ${params.model} encountered status ${status}, retrying with fallback model ${altModel}...`);
          return await withTimeout(
            ai.models.generateContent({
              ...params,
              model: altModel,
              config: configWithoutThinking,
            }),
            timeoutMs
          );
        } catch {
          // try next candidate
        }
      }
    }

    throw err;
  }
}

export const app = express();

// Security headers with Helmet (strict CSP in production, relaxed in dev for Vite)
// Note: upgrade-insecure-requests is standard in production HTTPS deployments to prevent mixed content.
// When serving the production build locally over plain HTTP on localhost, we disable it (null)
// so Safari and other browsers do not attempt to upgrade local HTTP asset requests to HTTPS.
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

// Rate limiting: 20 requests per minute per IP on AI routes
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
});

app.use('/api/ai', aiRateLimiter);

// Initialize Gemini Client Helper
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
    console.error('Failed to initialize GoogleGenAI client:', err);
    return { ai: null, apiKey: undefined };
  }
}

// -------------------------------------------------------------
// POST /api/ai/generate-plan
// -------------------------------------------------------------
app.post('/api/ai/generate-plan', async (req: Request, res: Response) => {
  const validation = validatePlanInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error || 'Invalid plan request parameters' });
  }

  const input = validation.data;
  const { ai, apiKey } = getGeminiClient();

  if (!ai || !apiKey) {
    const plan = generateHeuristicEventPlan(input);
    return res.json({
      plan,
      isFallback: true,
      fallbackReason: 'no-api-key',
      message: 'AI service temporarily unavailable; loaded offline fallback plan.',
      error: 'AI service temporarily unavailable; loaded offline fallback plan.',
    });
  }

  try {
    const prompt = buildPlanGenerationPrompt(input);

    const response = await generateContentWithRetry(
      ai,
      {
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themeDescription: { type: Type.STRING },
              colorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                  },
                  required: ['name', 'hex'],
                },
              },
              budgetItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    title: { type: Type.STRING },
                    allocatedAmount: { type: Type.NUMBER },
                    actualAmount: { type: Type.NUMBER },
                    isPaid: { type: Type.BOOLEAN },
                    notes: { type: Type.STRING },
                  },
                  required: ['id', 'category', 'title', 'allocatedAmount', 'actualAmount', 'isPaid'],
                },
              },
              timelineItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    phase: { type: Type.STRING },
                    timeLabel: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN },
                    assignedTo: { type: Type.STRING },
                  },
                  required: ['id', 'phase', 'title', 'description', 'completed'],
                },
              },
              vendors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    name: { type: Type.STRING },
                    contactName: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    email: { type: Type.STRING },
                    quoteAmount: { type: Type.NUMBER },
                    depositPaid: { type: Type.NUMBER },
                    status: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    checklist: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'category', 'name', 'quoteAmount', 'depositPaid', 'status', 'checklist'],
                },
              },
              ideas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'title', 'category', 'description', 'tags'],
                },
              },
            },
            required: ['themeDescription', 'colorPalette', 'budgetItems', 'timelineItems', 'vendors', 'ideas'],
          },
        },
      },
      GEMINI_TIMEOUT_MS
    );

    const parsed = JSON.parse(response.text || '{}');

    const completePlan = {
      id: 'plan-' + Date.now(),
      title: input.title,
      type: input.type,
      vibe: input.vibe,
      date: input.date,
      location: input.location,
      guestCount: input.guestCount,
      totalBudget: input.totalBudget,
      currency: input.currency,
      themeDescription: parsed.themeDescription || 'A memorable celebration tailored to your vision.',
      colorPalette: parsed.colorPalette || [],
      budgetItems: (parsed.budgetItems || []).map((b: any, i: number) => ({
        ...b,
        id: b.id || `b-${i + 1}`,
        category: (b.category || 'other').toLowerCase(),
        allocatedAmount: Number(b.allocatedAmount) || 0,
        actualAmount: Number(b.actualAmount) || 0,
        isPaid: Boolean(b.isPaid),
      })),
      timelineItems: (parsed.timelineItems || []).map((t: any, i: number) => ({
        ...t,
        id: t.id || `t-${i + 1}`,
        phase: ['planning_early', 'planning_mid', 'planning_final', 'week_of', 'day_of'].includes(t.phase)
          ? t.phase
          : 'planning_mid',
        completed: Boolean(t.completed),
      })),
      vendors: (parsed.vendors || []).map((v: any, i: number) => ({
        ...v,
        id: v.id || `v-${i + 1}`,
        quoteAmount: Number(v.quoteAmount) || 0,
        depositPaid: Number(v.depositPaid) || 0,
        status: ['researching', 'contacted', 'booked', 'contract_signed', 'declined'].includes(v.status)
          ? v.status
          : 'researching',
        checklist: Array.isArray(v.checklist) ? v.checklist : [],
      })),
      ideas: (parsed.ideas || []).map((idea: any, i: number) => ({
        ...idea,
        id: idea.id || `idea-${i + 1}`,
        category: ['theme_decor', 'food_beverage', 'entertainment', 'guest_experience', 'sustainable_tip'].includes(idea.category)
          ? idea.category
          : 'guest_experience',
        tags: Array.isArray(idea.tags) ? idea.tags : [],
      })),
      guests: [
        { id: 'g-1', name: 'VIP Guest / Family Lead', group: 'vip', rsvpStatus: 'attending', plusOnes: 1, dietaryRestrictions: 'None' },
        { id: 'g-2', name: 'Key Supporter / Friend', group: 'friends', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'Vegetarian' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ plan: completePlan, isFallback: false });
  } catch (err: any) {
    const fallbackReason: FallbackReason = isTimeoutError(err) ? 'timeout' : 'error';
    logGeminiError('generate-plan', err);
    // Return deterministic heuristic plan so client experience is resilient
    const fallbackPlan = generateHeuristicEventPlan(input);
    return res.json({
      plan: fallbackPlan,
      isFallback: true,
      fallbackReason,
      message: 'AI service temporarily unavailable; loaded offline fallback plan.',
      error: 'AI service temporarily unavailable; loaded offline fallback plan.',
    });
  }
});

// -------------------------------------------------------------
// POST /api/ai/chat
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const validation = validateChatInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error || 'Invalid chat parameters' });
  }

  const { message, eventContext } = validation.data;
  const { ai, apiKey } = getGeminiClient();

  const offlineChatReply = {
    reply: `For your ${eventContext?.type || 'event'} with ${eventContext?.guestCount || 50} guests, here are key planner recommendations:
1. Priority Check: Verify vendor contract clauses regarding cancellations and weather backups.
2. Cost Savings: Look into repurposing ceremony florals to the reception dinner tables.
3. Flow & Logistics: Always budget a 15-minute buffer between major speeches and dining transitions.`,
    suggestions: [
      'How can I save 15% on catering without compromising quality?',
      'Draft questions to ask before signing a venue contract',
      'Suggest 3 icebreaker games suitable for our guests',
    ],
    isFallback: true,
    fallbackReason: 'no-api-key' as FallbackReason,
    message: 'AI service temporarily unavailable; loaded offline fallback response.',
  };

  if (!ai || !apiKey) {
    return res.json(offlineChatReply);
  }

  try {
    const prompt = buildChatPrompt(message, eventContext);

    const chatResponse = await generateContentWithRetry(
      ai,
      {
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['reply', 'suggestions'],
          },
          maxOutputTokens: 2500,
          thinkingConfig: {
            thinkingLevel: CHAT_THINKING_LEVEL,
          },
        },
      },
      GEMINI_TIMEOUT_MS
    );

    let parsed: any = {};
    try {
      parsed = JSON.parse(chatResponse.text || '{}');
    } catch {
      const replyMatch = chatResponse.text?.match(/"reply"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"suggestions"|"$)/);
      if (replyMatch) {
        parsed = { reply: replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'), suggestions: [] };
      } else {
        throw new Error('Failed to parse chat response JSON');
      }
    }
    return res.json({
      reply: parsed.reply || 'Here are my recommendations for your celebration.',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      isFallback: false,
    });
  } catch (err: any) {
    const fallbackReason: FallbackReason = isTimeoutError(err) ? 'timeout' : 'error';
    logGeminiError('chat', err);
    return res.json({
      reply: `Based on your celebration parameters, remember to confirm arrival windows with all key vendors 48 hours prior to the event.`,
      suggestions: ['How can I cut budget costs?', 'What questions should I ask my caterer?'],
      isFallback: true,
      fallbackReason,
      message: 'AI service temporarily unavailable; loaded offline fallback response.',
    });
  }
});

// -------------------------------------------------------------
// POST /api/ai/generate-invite-speech
// -------------------------------------------------------------
app.post('/api/ai/generate-invite-speech', async (req: Request, res: Response) => {
  const validation = validateInviteSpeechInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error || 'Invalid invite/speech parameters' });
  }

  const { requestType, tone, recipient, customDetails, event } = validation.data;
  const { ai, apiKey } = getGeminiClient();

  const mockContent =
    requestType === 'invitation'
      ? `✨ You're Cordially Invited! ✨\n\nPlease join us for ${event?.title || 'our celebration'}!\n📅 Date: ${event?.date || 'Upcoming'}\n📍 Location: ${event?.location || 'Venue'}\n\nRSVP by contacting the hosts.`
      : `Welcome to this joyous celebration of ${event?.title || 'this milestone'}! Thank you for gathering with us today to celebrate love, community, and unforgettable memories. Cheers!`;

  if (!ai || !apiKey) {
    return res.json({
      result: mockContent,
      isFallback: true,
      fallbackReason: 'no-api-key',
      message: 'AI service temporarily unavailable; loaded offline fallback wording.',
    });
  }

  try {
    const prompt = buildInviteSpeechPrompt(requestType, tone, recipient, event, customDetails);

    const response = await generateContentWithRetry(
      ai,
      {
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 600,
        },
      },
      GEMINI_TIMEOUT_MS
    );

    return res.json({ result: response.text || 'Generated draft ready.', isFallback: false });
  } catch (err: any) {
    const fallbackReason: FallbackReason = isTimeoutError(err) ? 'timeout' : 'error';
    logGeminiError('generate-invite-speech', err);
    return res.json({
      result: mockContent,
      isFallback: true,
      fallbackReason,
      message: 'AI service temporarily unavailable; loaded offline fallback wording.',
    });
  }
});

// -------------------------------------------------------------
// POST /api/ai/vendor-inquiry
// -------------------------------------------------------------
app.post('/api/ai/vendor-inquiry', async (req: Request, res: Response) => {
  const validation = validateVendorInquiryInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error || 'Invalid vendor inquiry parameters' });
  }

  const { vendor, event } = validation.data;
  const { ai, apiKey } = getGeminiClient();

  const defaultEmail = `Subject: Inquiry regarding ${vendor.category || 'Vendor'} services for ${event?.title || 'Upcoming Event'}

Dear ${vendor.contactName || vendor.name || 'Events Team'},

We are currently planning ${event?.title || 'our celebration'} on ${event?.date || 'an upcoming date'} in ${event?.location || 'the area'} for approximately ${event?.guestCount || 50} guests.

We love your work and would appreciate learning your current availability, package details, and pricing.

Best regards,
Event Planning Team`;

  if (!ai || !apiKey) {
    return res.json({
      email: defaultEmail,
      isFallback: true,
      fallbackReason: 'no-api-key',
      message: 'AI service temporarily unavailable; loaded offline fallback email.',
    });
  }

  try {
    const prompt = buildVendorInquiryPrompt(vendor, event);

    const response = await generateContentWithRetry(
      ai,
      {
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 600,
        },
      },
      GEMINI_TIMEOUT_MS
    );

    return res.json({ email: response.text || defaultEmail, isFallback: false });
  } catch (err: any) {
    const fallbackReason: FallbackReason = isTimeoutError(err) ? 'timeout' : 'error';
    logGeminiError('vendor-inquiry', err);
    return res.json({
      email: defaultEmail,
      isFallback: true,
      fallbackReason,
      message: 'AI service temporarily unavailable; loaded offline fallback email.',
    });
  }
});

// -------------------------------------------------------------
// Dev vs Production Server
// -------------------------------------------------------------
export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Celebration Planner Server running on http://0.0.0.0:${PORT}`);
    const { ai, apiKey } = getGeminiClient();
    const isAiEnabled = Boolean(apiKey && ai);
    console.log(`Planner Mode: ${isAiEnabled ? `AI mode active (${GEMINI_MODEL})` : 'Offline-fallback mode active'}`);
  });
}

const isMainModule = Boolean(
  process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  startServer();
}
