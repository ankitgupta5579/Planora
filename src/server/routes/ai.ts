import { Router, Request, Response } from 'express';
import { isTimeoutError } from '../../utils/withTimeout';
import { FallbackReason } from '../../utils/fallbackMessages';
import { generateHeuristicEventPlan } from '../../utils/fallbackGenerator';
import { normalizeBudgetItems } from '../../utils/eventCalculators';
import {
  EventPlan,
  BudgetItem,
  TimelineItem,
  VendorItem,
  PersonalizedIdea,
} from '../../types/event';
import {
  validatePlanInput,
  validateChatInput,
  validateInviteSpeechInput,
  validateVendorInquiryInput,
  validateIdeasInput,
} from '../validate';
import {
  buildPlanGenerationPrompt,
  buildChatPrompt,
  buildInviteSpeechPrompt,
  buildVendorInquiryPrompt,
  buildIdeasPrompt,
  planResponseSchema,
  chatResponseSchema,
  ideasResponseSchema,
} from '../prompts';
import { generateHeuristicIdeas } from '../../utils/ideaGenerator';
import { generateOfflineChatReply } from '../../utils/chatFallback';
import {
  GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  CHAT_THINKING_LEVEL,
} from '../config';
import {
  generateContentWithRetry,
  logGeminiError,
  getGeminiClient,
  GeminiClientLike,
} from '../geminiClient';
import { parseChatReply } from '../parseChatReply';

export const aiRouter = Router();

/**
 * Standardized AI route wrapper that handles:
 * - Offline fallback when no Gemini client / API key is present
 * - Live AI model generation
 * - Graceful error handling with timeout classification and logging
 */
export async function handleAiRoute<T extends Record<string, unknown>>(
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
aiRouter.post('/generate-plan', async (req: Request, res: Response) => {
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
            thinkingConfig: {
              thinkingLevel: CHAT_THINKING_LEVEL,
            },
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
        themeDescription:
          parsed.themeDescription || 'A memorable celebration tailored to your vision.',
        colorPalette: parsed.colorPalette || [],
        budgetItems: normalizedBudgetItems,
        timelineItems: (parsed.timelineItems || []).map((t, i) => ({
          ...t,
          id: t.id || `t-${i + 1}`,
          phase: ([
            'planning_early',
            'planning_mid',
            'planning_final',
            'week_of',
            'day_of',
          ].includes(t.phase)
            ? t.phase
            : 'planning_mid') as TimelineItem['phase'],
          completed: Boolean(t.completed),
        })),
        vendors: (parsed.vendors || []).map((v, i) => ({
          ...v,
          id: v.id || `v-${i + 1}`,
          quoteAmount: Number(v.quoteAmount) || 0,
          depositPaid: Number(v.depositPaid) || 0,
          status: (['researching', 'contacted', 'booked', 'contract_signed', 'declined'].includes(
            v.status
          )
            ? v.status
            : 'researching') as VendorItem['status'],
          checklist: Array.isArray(v.checklist) ? v.checklist : [],
        })),
        ideas: (parsed.ideas || []).map((idea, i) => ({
          ...idea,
          id: idea.id || `idea-${i + 1}`,
          category: ([
            'theme_decor',
            'food_beverage',
            'entertainment',
            'guest_experience',
            'sustainable_tip',
          ].includes(idea.category)
            ? idea.category
            : 'guest_experience') as PersonalizedIdea['category'],
          tags: Array.isArray(idea.tags) ? idea.tags : [],
        })),
        guests: [
          {
            id: 'g-1',
            name: 'VIP Guest / Family Lead',
            group: 'vip',
            rsvpStatus: 'attending',
            plusOnes: 1,
            dietaryRestrictions: 'None',
          },
          {
            id: 'g-2',
            name: 'Key Supporter / Friend',
            group: 'friends',
            rsvpStatus: 'attending',
            plusOnes: 0,
            dietaryRestrictions: 'Vegetarian',
          },
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
aiRouter.post('/chat', async (req: Request, res: Response) => {
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
            maxOutputTokens: 800,
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
aiRouter.post('/generate-invite-speech', async (req: Request, res: Response) => {
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
            maxOutputTokens: 800,
            thinkingConfig: {
              thinkingLevel: CHAT_THINKING_LEVEL,
            },
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
aiRouter.post('/vendor-inquiry', async (req: Request, res: Response) => {
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
            maxOutputTokens: 800,
            thinkingConfig: {
              thinkingLevel: CHAT_THINKING_LEVEL,
            },
          },
        },
        GEMINI_TIMEOUT_MS
      );

      let draft = response.text?.trim() || defaultEmail;

      // Safety check: Ensure the generated draft is a complete email with body content, not just a subject line
      if (draft.split(/\s+/).length < 25 || !draft.includes('\n')) {
        const subjectLine = draft.startsWith('Subject:')
          ? draft
          : `Subject: Inquiry regarding ${vendor.category || 'services'} for ${event?.title || 'our event'}`;
        draft = `${subjectLine}

Dear ${vendor.contactName || vendor.name || 'Events Team'},

We are currently planning ${event?.title || 'our celebration'} on ${event?.date || 'an upcoming date'} in ${event?.location || 'the local area'} for approximately ${event?.guestCount || 50} guests.

We love your work and would appreciate learning more about your availability, service packages, and pricing within our target budget of ${event?.currency || '$'}${vendor.quoteAmount ?? 'flexible'}. Could you also share your standard booking deposit requirements and timeline for scheduling?

We look forward to hearing from you!

Warm regards,
${event?.title ? event.title + ' Planning Team' : 'Event Host'}`;
      }

      return { email: draft };
    }
  );
});

// -------------------------------------------------------------
// POST /api/ai/generate-ideas
// -------------------------------------------------------------
aiRouter.post('/generate-ideas', async (req: Request, res: Response) => {
  const validation = validateIdeasInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error || 'Invalid ideas request parameters' });
  }

  const input = validation.data;
  const validCategories = [
    'theme_decor',
    'food_beverage',
    'entertainment',
    'guest_experience',
    'sustainable_tip',
  ];

  return handleAiRoute(
    'generate-ideas',
    res,
    () => ({
      ideas: generateHeuristicIdeas({
        ...input.eventContext,
        focusCategory: input.focusCategory,
        existingTitles: input.existingTitles,
        allSections: Boolean(input.allSections),
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
            maxOutputTokens: 1500,
            thinkingConfig: {
              thinkingLevel: CHAT_THINKING_LEVEL,
            },
          },
        },
        GEMINI_TIMEOUT_MS
      );

      const parsed = JSON.parse(response.text || '{}') as {
        ideas?: Array<{ title?: string; category?: string; description?: string; tags?: string[] }>;
      };

      const rawIdeas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
      const sanitizedIdeas: PersonalizedIdea[] = rawIdeas
        .slice(0, 10)
        .filter((item) => typeof item.title === 'string' && item.title.trim().length > 0)
        .map((item, idx) => {
          const cat = validCategories.includes(item.category || '')
            ? (item.category as PersonalizedIdea['category'])
            : 'guest_experience';
          return {
            id: `idea-ai-${Date.now()}-${idx + 1}`,
            title: item.title!.trim().slice(0, 100),
            category: cat,
            description: (item.description || 'Fun creative touch tailored for your event.')
              .trim()
              .slice(0, 500),
            tags: Array.isArray(item.tags)
              ? item.tags
                  .filter((t) => typeof t === 'string')
                  .map((t) => t.trim().slice(0, 30))
                  .slice(0, 4)
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
              allSections: Boolean(input.allSections),
            });

      return { ideas: finalIdeas };
    }
  );
});
