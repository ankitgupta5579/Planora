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
}

export function validatePlanInput(body: any): ValidationResult<ValidatedPlanInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { title, type, vibe, date, location, guestCount, totalBudget, currency, specialRequests } = body;

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
    },
  };
}

export interface ValidatedChatInput {
  message: string;
  eventContext?: {
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
  };
}

export function validateChatInput(body: any): ValidationResult<ValidatedChatInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { message, eventContext } = body;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }
  if (message.trim().length > 1000) {
    return { valid: false, error: 'Message must not exceed 1000 characters' };
  }

  let safeContext: ValidatedChatInput['eventContext'] = undefined;
  if (eventContext && typeof eventContext === 'object') {
    safeContext = {
      title: typeof eventContext.title === 'string' ? eventContext.title.slice(0, 100) : undefined,
      type: typeof eventContext.type === 'string' ? eventContext.type.slice(0, 50) : undefined,
      vibe: typeof eventContext.vibe === 'string' ? eventContext.vibe.slice(0, 50) : undefined,
      date: typeof eventContext.date === 'string' ? eventContext.date.slice(0, 50) : undefined,
      location: typeof eventContext.location === 'string' ? eventContext.location.slice(0, 200) : undefined,
      guestCount: typeof eventContext.guestCount === 'number' ? Math.max(0, eventContext.guestCount) : undefined,
      totalBudget: typeof eventContext.totalBudget === 'number' ? Math.max(0, eventContext.totalBudget) : undefined,
      currency: typeof eventContext.currency === 'string' ? eventContext.currency.slice(0, 5) : '$',
      totalAllocated: typeof eventContext.totalAllocated === 'number' ? Math.max(0, eventContext.totalAllocated) : undefined,
      totalSpent: typeof eventContext.totalSpent === 'number' ? Math.max(0, eventContext.totalSpent) : undefined,
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
  event?: any;
}

export function validateInviteSpeechInput(body: any): ValidationResult<ValidatedInviteSpeechInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { requestType, tone, recipient, customDetails, event } = body;

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
      event: event && typeof event === 'object' ? event : {},
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
  event: any;
}

export function validateVendorInquiryInput(body: any): ValidationResult<ValidatedVendorInquiryInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { vendor, event } = body;
  if (!vendor || typeof vendor !== 'object') {
    return { valid: false, error: 'vendor object is required' };
  }

  if (typeof vendor.name !== 'string' || vendor.name.trim().length === 0) {
    return { valid: false, error: 'Vendor name is required' };
  }
  if (vendor.name.trim().length > 100) {
    return { valid: false, error: 'Vendor name must not exceed 100 characters' };
  }

  return {
    valid: true,
    data: {
      vendor: {
        name: vendor.name.trim(),
        category: typeof vendor.category === 'string' ? vendor.category.trim().slice(0, 100) : 'Vendor',
        contactName: typeof vendor.contactName === 'string' ? vendor.contactName.trim().slice(0, 100) : undefined,
        quoteAmount: typeof vendor.quoteAmount === 'number' ? Math.max(0, vendor.quoteAmount) : undefined,
        email: typeof vendor.email === 'string' ? vendor.email.trim().slice(0, 100) : undefined,
      },
      event: event && typeof event === 'object' ? event : {},
    },
  };
}
