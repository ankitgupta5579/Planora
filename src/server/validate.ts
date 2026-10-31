import { EventType, EventVibe } from '../types/event';

export const ALLOWED_EVENT_TYPES: readonly EventType[] = [
  'wedding',
  'birthday',
  'community',
  'corporate',
  'anniversary',
] as const;

export const ALLOWED_EVENT_VIBES: readonly EventVibe[] = [
  'elegant',
  'rustic',
  'modern',
  'bohemian',
  'festive',
  'casual',
  'futuristic',
  'vintage',
  'cozy',
] as const;

export interface ValidationResult<T> {
  valid: boolean;
  error?: string;
  data?: T;
}

export interface ValidatedPlanInput {
  title: string;
  type: EventType;
  vibe: EventVibe;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  specialRequests?: string;
  rsvpDeadline?: string;
}

export interface EventSummaryContext {
  title?: string;
  type?: string;
  vibe?: string;
  date?: string;
  location?: string;
  guestCount?: number;
  totalBudget?: number;
  currency?: string;
  totalAllocated?: number;
  totalSpent?: number;
  rsvpDeadline?: string;
  [key: string]: unknown;
}

export function validatePlanInput(body: unknown): ValidationResult<ValidatedPlanInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const { title, type, vibe, date, location, guestCount, totalBudget, currency, specialRequests, rsvpDeadline } = b;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { valid: false, error: 'Event title is required' };
  }
  if (title.trim().length > 100) {
    return { valid: false, error: 'Event title must not exceed 100 characters' };
  }

  if (typeof type !== 'string' || !ALLOWED_EVENT_TYPES.includes(type.toLowerCase() as EventType)) {
    return {
      valid: false,
      error: `Event type must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}`,
    };
  }

  const safeVibe: EventVibe =
    typeof vibe === 'string' && ALLOWED_EVENT_VIBES.includes(vibe.toLowerCase() as EventVibe)
      ? (vibe.toLowerCase() as EventVibe)
      : 'elegant';

  if (typeof date !== 'string' || date.trim().length === 0 || date.trim().length > 50) {
    return { valid: false, error: 'Event date is required and must not exceed 50 characters' };
  }

  if (typeof location !== 'string' || location.trim().length === 0 || location.trim().length > 200) {
    return { valid: false, error: 'Location is required and must not exceed 200 characters' };
  }

  const numericGuests = Number(guestCount);
  if (isNaN(numericGuests) || !Number.isInteger(numericGuests) || numericGuests < 1 || numericGuests > 5000) {
    return { valid: false, error: 'Guest count must be an integer between 1 and 5000' };
  }

  const numericBudget = Number(totalBudget);
  if (isNaN(numericBudget) || numericBudget <= 0 || numericBudget > 100_000_000) {
    return { valid: false, error: 'Total budget must be a positive number greater than 0' };
  }

  let safeCurrency = '$';
  if (typeof currency === 'string' && currency.trim().length > 0) {
    if (currency.trim().length > 5) {
      return { valid: false, error: 'Currency symbol must not exceed 5 characters' };
    }
    safeCurrency = currency.trim();
  }

  let safeRequests: string | undefined = undefined;
  if (specialRequests !== undefined && specialRequests !== null) {
    if (typeof specialRequests !== 'string') {
      return { valid: false, error: 'Special requests must be a string' };
    }
    if (specialRequests.trim().length > 500) {
      return { valid: false, error: 'Special requests must not exceed 500 characters' };
    }
    safeRequests = specialRequests.trim();
  }

  let safeRsvpDeadline: string | undefined = undefined;
  if (rsvpDeadline !== undefined && rsvpDeadline !== null) {
    if (typeof rsvpDeadline !== 'string') {
      return { valid: false, error: 'rsvpDeadline must be a string' };
    }
    if (rsvpDeadline.trim().length > 50) {
      return { valid: false, error: 'rsvpDeadline must not exceed 50 characters' };
    }
    safeRsvpDeadline = rsvpDeadline.trim();
  }

  return {
    valid: true,
    data: {
      title: title.trim(),
      type: type.toLowerCase() as EventType,
      vibe: safeVibe,
      date: date.trim(),
      location: location.trim(),
      guestCount: numericGuests,
      totalBudget: numericBudget,
      currency: safeCurrency,
      specialRequests: safeRequests,
      rsvpDeadline: safeRsvpDeadline,
    },
  };
}

export interface ValidatedChatInput {
  message: string;
  eventContext?: EventSummaryContext;
}

export function validateChatInput(body: unknown): ValidationResult<ValidatedChatInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const { message, eventContext } = b;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }
  if (message.trim().length > 1000) {
    return { valid: false, error: 'Message must not exceed 1000 characters' };
  }

  let safeContext: ValidatedChatInput['eventContext'] = undefined;
  if (eventContext && typeof eventContext === 'object') {
    const ec = eventContext as Record<string, unknown>;
    safeContext = {
      title: typeof ec.title === 'string' ? ec.title.slice(0, 100) : undefined,
      type: typeof ec.type === 'string' ? ec.type.slice(0, 50) : undefined,
      vibe: typeof ec.vibe === 'string' ? ec.vibe.slice(0, 50) : undefined,
      date: typeof ec.date === 'string' ? ec.date.slice(0, 50) : undefined,
      location: typeof ec.location === 'string' ? ec.location.slice(0, 200) : undefined,
      guestCount: typeof ec.guestCount === 'number' ? Math.max(0, ec.guestCount) : undefined,
      totalBudget: typeof ec.totalBudget === 'number' ? Math.max(0, ec.totalBudget) : undefined,
      currency: typeof ec.currency === 'string' ? ec.currency.slice(0, 5) : '$',
      totalAllocated: typeof ec.totalAllocated === 'number' ? Math.max(0, ec.totalAllocated) : undefined,
      totalSpent: typeof ec.totalSpent === 'number' ? Math.max(0, ec.totalSpent) : undefined,
      rsvpDeadline: typeof ec.rsvpDeadline === 'string' ? ec.rsvpDeadline.slice(0, 50) : undefined,
    };
  }

  return {
    valid: true,
    data: {
      message: message.trim(),
      eventContext: safeContext,
    },
  };
}

export interface ValidatedInviteSpeechInput {
  requestType: 'invitation' | 'speech';
  tone: string;
  recipient: string;
  customDetails?: string;
  event?: EventSummaryContext;
}

export function validateInviteSpeechInput(body: unknown): ValidationResult<ValidatedInviteSpeechInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const { requestType, tone, recipient, customDetails, event } = b;

  if (requestType !== 'invitation' && requestType !== 'speech') {
    return { valid: false, error: 'requestType must be either "invitation" or "speech"' };
  }

  const safeTone = typeof tone === 'string' && tone.trim().length > 0 ? tone.trim().slice(0, 50) : 'heartfelt';
  const safeRecipient = typeof recipient === 'string' && recipient.trim().length > 0 ? recipient.trim().slice(0, 100) : 'Honored Guests';

  let safeCustom: string | undefined = undefined;
  if (customDetails !== undefined && customDetails !== null) {
    if (typeof customDetails !== 'string') {
      return { valid: false, error: 'customDetails must be a string' };
    }
    if (customDetails.trim().length > 500) {
      return { valid: false, error: 'customDetails must not exceed 500 characters' };
    }
    safeCustom = customDetails.trim();
  }

  return {
    valid: true,
    data: {
      requestType,
      tone: safeTone,
      recipient: safeRecipient,
      customDetails: safeCustom,
      event: event && typeof event === 'object' ? (event as EventSummaryContext) : {},
    },
  };
}

export interface ValidatedVendorInquiryInput {
  vendor: {
    name: string;
    category?: string;
    contactName?: string;
    quoteAmount?: number;
    email?: string;
  };
  event: EventSummaryContext;
}

export function validateVendorInquiryInput(body: unknown): ValidationResult<ValidatedVendorInquiryInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const { vendor, event } = b;
  if (!vendor || typeof vendor !== 'object') {
    return { valid: false, error: 'vendor object is required' };
  }

  const v = vendor as Record<string, unknown>;
  if (typeof v.name !== 'string' || v.name.trim().length === 0) {
    return { valid: false, error: 'Vendor name is required' };
  }
  if (v.name.trim().length > 100) {
    return { valid: false, error: 'Vendor name must not exceed 100 characters' };
  }

  return {
    valid: true,
    data: {
      vendor: {
        name: v.name.trim(),
        category: typeof v.category === 'string' ? v.category.trim().slice(0, 100) : 'Vendor',
        contactName: typeof v.contactName === 'string' ? v.contactName.trim().slice(0, 100) : undefined,
        quoteAmount: typeof v.quoteAmount === 'number' ? Math.max(0, v.quoteAmount) : undefined,
        email: typeof v.email === 'string' ? v.email.trim().slice(0, 100) : undefined,
      },
      event: event && typeof event === 'object' ? (event as EventSummaryContext) : {},
    },
  };
}


export const ALLOWED_IDEA_CATEGORIES = [
  'theme_decor',
  'food_beverage',
  'entertainment',
  'guest_experience',
  'sustainable_tip',
] as const;

export type IdeaCategory = (typeof ALLOWED_IDEA_CATEGORIES)[number];

export interface ValidatedIdeasInput {
  eventContext?: EventSummaryContext;
  focusCategory?: IdeaCategory;
  existingTitles?: string[];
  allSections?: boolean;
}

export function validateIdeasInput(body: unknown): ValidationResult<ValidatedIdeasInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const { eventContext, focusCategory, existingTitles, allSections } = b;

  let safeFocus: IdeaCategory | undefined = undefined;
  if (focusCategory !== undefined && focusCategory !== null) {
    if (
      typeof focusCategory !== 'string' ||
      !ALLOWED_IDEA_CATEGORIES.includes(focusCategory.toLowerCase() as IdeaCategory)
    ) {
      return {
        valid: false,
        error: `focusCategory must be one of: ${ALLOWED_IDEA_CATEGORIES.join(', ')}`,
      };
    }
    safeFocus = focusCategory.toLowerCase() as IdeaCategory;
  }

  let safeTitles: string[] | undefined = undefined;
  if (existingTitles !== undefined && existingTitles !== null) {
    if (!Array.isArray(existingTitles)) {
      return { valid: false, error: 'existingTitles must be an array of strings' };
    }
    safeTitles = existingTitles
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 20)
      .map((t) => t.trim().slice(0, 100));
  }

  let safeContext: EventSummaryContext | undefined = undefined;
  if (eventContext && typeof eventContext === 'object') {
    const ec = eventContext as Record<string, unknown>;
    safeContext = {
      title: typeof ec.title === 'string' ? ec.title.slice(0, 100) : undefined,
      type: typeof ec.type === 'string' ? ec.type.slice(0, 50) : undefined,
      vibe: typeof ec.vibe === 'string' ? ec.vibe.slice(0, 50) : undefined,
      date: typeof ec.date === 'string' ? ec.date.slice(0, 50) : undefined,
      location: typeof ec.location === 'string' ? ec.location.slice(0, 200) : undefined,
      guestCount: typeof ec.guestCount === 'number' ? Math.max(0, ec.guestCount) : undefined,
      totalBudget: typeof ec.totalBudget === 'number' ? Math.max(0, ec.totalBudget) : undefined,
      currency: typeof ec.currency === 'string' ? ec.currency.slice(0, 5) : '$',
    };
  }

  return {
    valid: true,
    data: {
      eventContext: safeContext,
      focusCategory: safeFocus,
      existingTitles: safeTitles,
      allSections: allSections === true,
    },
  };
}
