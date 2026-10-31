import express, { Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isTimeoutError } from './src/utils/withTimeout';
import { FallbackReason } from './src/utils/fallbackMessages';
import { generateHeuristicEventPlan } from './src/utils/fallbackGenerator';
import { normalizeBudgetItems } from './src/utils/eventCalculators';
import { EventPlan, BudgetItem, TimelineItem, VendorItem, PersonalizedIdea } from './src/types/event';
import {
  validatePlanInput,
  validateChatInput,
  validateInviteSpeechInput,
  validateVendorInquiryInput,
  validateIdeasInput,
} from './src/server/validate';
import {
  buildPlanGenerationPrompt,
  buildChatPrompt,
  buildInviteSpeechPrompt,
  buildVendorInquiryPrompt,
  buildIdeasPrompt,
  planResponseSchema,
  chatResponseSchema,
  ideasResponseSchema,
} from './src/server/prompts';
import { generateHeuristicIdeas } from './src/utils/ideaGenerator';
import { generateOfflineChatReply } from './src/utils/chatFallback';
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
  GeminiClientLike,
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

// Trust reverse proxy (Cloud Run, Render, Heroku, Nginx) so express-rate-limit tracks real client IPs
const trustProxyConfig = process.env.TRUST_PROXY
  ? isNaN(Number(process.env.TRUST_PROXY))
    ? process.env.TRUST_PROXY
    : Number(process.env.TRUST_PROXY)
  : 1;
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

// Rate limiting: 20 requests per minute per IP on AI routes
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
});

app.use('/api/ai', aiRateLimiter);

/**
 * Standardized AI route wrapper that handles:
 * - Offline fallback when no Gemini client / API key is present
 * - Live AI model generation
 * - Graceful error handling with timeout classification and logging
 */
async function handleAiRoute<T extends Record<string, unknown>>(
  routeName: string,
  res: Response,
  fallbackGenerator: (reason: FallbackReason) => T,
  aiHandler: (ai: GeminiClientLike) => Promise<T>
): Promise<Response> {
  const { ai, apiKey } = getGeminiClient();
  if (!ai || !apiKey) {
    return res.json({
      ...fallbackGenerator('no-api-key'),
      isFallback: true,
      fallbackReason: 'no-api-key',
    });
  }

  try {
    const result = await aiHandler(ai as GeminiClientLike);
    return res.json({
      ...result,
      isFallback: false,
    });
  } catch (err: unknown) {
    const fallbackReason: FallbackReason = isTimeoutError(err) ? 'timeout' : 'error';
    logGeminiError(routeName, err);
    return res.json({
      ...fallbackGenerator(fallbackReason),
      isFallback: true,
      fallbackReason,
    });
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

  return handleAiRoute(
    'generate-plan',
    res,
    () => ({
      plan: generateHeuristicEventPlan(input),
      message: 'AI service temporarily unavailable; loaded offline fallback plan.',
      error: 'AI service temporarily unavailable; loaded offline fallback plan.',
    }),
    async (ai) => {
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

      const parsed = JSON.parse(response.text || '{}') as {
        themeDescription?: string;
        colorPalette?: { name: string; hex: string }[];
        budgetItems?: BudgetItem[];
        timelineItems?: TimelineItem[];
        vendors?: VendorItem[];
        ideas?: PersonalizedIdea[];
      };

      const rawBudgetItems: BudgetItem[] = (parsed.budgetItems || []).map((b, i) => ({
        id: b.id || `b-${i + 1}`,
        category: (b.category || 'other').toLowerCase() as BudgetItem['category'],
        title: b.title || `Item ${i + 1}`,
        allocatedAmount: Number(b.allocatedAmount) || 0,
        actualAmount: Number(b.actualAmount) || 0,
        isPaid: Boolean(b.isPaid),
        notes: b.notes || '',
      }));

      // Enforce server-side budget sum equality: allocated amounts sum exactly to totalBudget
      const normalizedBudgetItems = normalizeBudgetItems(rawBudgetItems, input.totalBudget);

      const completePlan: EventPlan = {
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
        budgetItems: normalizedBudgetItems,
        timelineItems: (parsed.timelineItems || []).map((t, i) => ({
          ...t,
          id: t.id || `t-${i + 1}`,
          phase: (['planning_early', 'planning_mid', 'planning_final', 'week_of', 'day_of'].includes(t.phase)
            ? t.phase
            : 'planning_mid') as TimelineItem['phase'],
          completed: Boolean(t.completed),
        })),
        vendors: (parsed.vendors || []).map((v, i) => ({
          ...v,
          id: v.id || `v-${i + 1}`,
          quoteAmount: Number(v.quoteAmount) || 0,
          depositPaid: Number(v.depositPaid) || 0,
          status: (['researching', 'contacted', 'booked', 'contract_signed', 'declined'].includes(v.status)
            ? v.status
            : 'researching') as VendorItem['status'],
          checklist: Array.isArray(v.checklist) ? v.checklist : [],
        })),
        ideas: (parsed.ideas || []).map((idea, i) => ({
          ...idea,
          id: idea.id || `idea-${i + 1}`,
          category: (['theme_decor', 'food_beverage', 'entertainment', 'guest_experience', 'sustainable_tip'].includes(idea.category)
            ? idea.category
            : 'guest_experience') as PersonalizedIdea['category'],
          tags: Array.isArray(idea.tags) ? idea.tags : [],
        })),
        guests: [
          { id: 'g-1', name: 'VIP Guest / Family Lead', group: 'vip', rsvpStatus: 'attending', plusOnes: 1, dietaryRestrictions: 'None' },
          { id: 'g-2', name: 'Key Supporter / Friend', group: 'friends', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'Vegetarian' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { plan: completePlan };
    }
  );
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

  return handleAiRoute(
    'chat',
    res,
    () => {
      // Keyword-aware offline answer so the assistant still responds to the question asked.
      const offline = generateOfflineChatReply(message, eventContext);
      return {
        reply: offline.reply,
        suggestions: offline.suggestions,
        message: 'AI service temporarily unavailable; loaded offline fallback response.',
      };
    },
    async (ai) => {
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
      return {
        reply,
        suggestions,
      };
    }
  );
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

  const mockContent =
    requestType === 'invitation'
      ? `✨ You're Cordially Invited! ✨\n\nPlease join us for ${event?.title || 'our celebration'}!\n📅 Date: ${event?.date || 'Upcoming'}\n📍 Location: ${event?.location || 'Venue'}\n\nRSVP by contacting the hosts.`
      : `Welcome to this joyous celebration of ${event?.title || 'this milestone'}! Thank you for gathering with us today to celebrate love, community, and unforgettable memories. Cheers!`;

  return handleAiRoute(
    'generate-invite-speech',
    res,
    () => ({
      result: mockContent,
      message: 'AI service temporarily unavailable; loaded offline fallback wording.',
    }),
    async (ai) => {
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

      return { result: response.text || 'Generated draft ready.' };
    }
  );
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

  const defaultEmail = `Subject: Inquiry regarding ${vendor.category || 'Vendor'} services for ${event?.title || 'Upcoming Event'}

Dear ${vendor.contactName || vendor.name || 'Events Team'},

We are currently planning ${event?.title || 'our celebration'} on ${event?.date || 'an upcoming date'} in ${event?.location || 'the area'} for approximately ${event?.guestCount || 50} guests.

We love your work and would appreciate learning your current availability, package details, and pricing.

Best regards,
Event Planning Team`;

  return handleAiRoute(
    'vendor-inquiry',
    res,
    () => ({
      email: defaultEmail,
      message: 'AI service temporarily unavailable; loaded offline fallback email.',
    }),
    async (ai) => {
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

      return { email: response.text || defaultEmail };
    }
  );
});

// -------------------------------------------------------------
// POST /api/ai/generate-ideas
// -------------------------------------------------------------
app.post('/api/ai/generate-ideas', async (req: Request, res: Response) => {
  const validation = validateIdeasInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error || 'Invalid ideas request parameters' });
  }

  const input = validation.data;
  const validCategories = ['theme_decor', 'food_beverage', 'entertainment', 'guest_experience', 'sustainable_tip'];

  return handleAiRoute(
    'generate-ideas',
    res,
    () => ({
      ideas: generateHeuristicIdeas({
        ...input.eventContext,
        focusCategory: input.focusCategory,
        existingTitles: input.existingTitles,
      }),
      message: 'AI service temporarily unavailable; loaded offline creative ideas.',
    }),
    async (ai) => {
      const prompt = buildIdeasPrompt(input);

      const response = await generateContentWithRetry(
        ai,
        {
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: ideasResponseSchema,
            maxOutputTokens: 1000,
          },
        },
        GEMINI_TIMEOUT_MS
      );

      const parsed = JSON.parse(response.text || '{}') as {
        ideas?: Array<{ title?: string; category?: string; description?: string; tags?: string[] }>;
      };

      const rawIdeas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
      const sanitizedIdeas: PersonalizedIdea[] = rawIdeas
        .slice(0, 6)
        .filter((item) => typeof item.title === 'string' && item.title.trim().length > 0)
        .map((item, idx) => {
          const cat = validCategories.includes(item.category || '')
            ? (item.category as PersonalizedIdea['category'])
            : 'guest_experience';
          return {
            id: `idea-ai-${Date.now()}-${idx + 1}`,
            title: item.title!.trim().slice(0, 100),
            category: cat,
            description: (item.description || 'Creative touch tailored for your event.').trim().slice(0, 500),
            tags: Array.isArray(item.tags)
              ? item.tags.filter((t) => typeof t === 'string').map((t) => t.trim().slice(0, 30)).slice(0, 4)
              : ['Creative', 'Personalized'],
          };
        });

      const finalIdeas =
        sanitizedIdeas.length > 0
          ? sanitizedIdeas
          : generateHeuristicIdeas({
              ...input.eventContext,
              focusCategory: input.focusCategory,
              existingTitles: input.existingTitles,
            });

      return { ideas: finalIdeas };
    }
  );
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
    console.log(`Planora server running on http://0.0.0.0:${PORT}`);
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
