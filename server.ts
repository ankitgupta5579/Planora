import express, { Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isTimeoutError } from './src/utils/withTimeout';
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
  planResponseSchema,
  chatResponseSchema,
} from './src/server/prompts';
import {
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
} from './src/server/geminiClient';
import { parseChatReply } from './src/server/parseChatReply';

// Re-export core Gemini helpers for backward compatibility with tests
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

dotenv.config();
if (process.env.NO_API_KEY === '1' || process.env.GEMINI_API_KEY === 'none' || process.env.GEMINI_API_KEY === '') {
  delete process.env.GEMINI_API_KEY;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost =
  !process.env.FORCE_HTTPS &&
  (!process.env.HOST || process.env.HOST === '0.0.0.0' || process.env.HOST === 'localhost');

export const app = express();

// Security headers with Helmet (strict CSP in production, relaxed in dev for Vite)
// upgrade-insecure-requests is disabled on localhost to allow plain HTTP testing
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
          responseSchema: planResponseSchema,
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
          responseSchema: chatResponseSchema,
          maxOutputTokens: 2500,
          thinkingConfig: {
            thinkingLevel: CHAT_THINKING_LEVEL,
          },
        },
      },
      GEMINI_TIMEOUT_MS
    );

    const { reply, suggestions } = parseChatReply(chatResponse.text);
    return res.json({
      reply,
      suggestions,
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

  return app.listen(PORT, '0.0.0.0', () => {
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
