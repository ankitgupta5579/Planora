/**
 * Core domain types and schema contracts for the Planora celebration platform.
 * Provides strict TypeScript types, union aliases, and runtime type guards.
 *
 * @packageDocumentation
 */

/** Primary celebration classification types. */
export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate' | 'anniversary';

/** Aesthetic atmosphere and theme vibes. */
export type EventVibe =
  | 'elegant'
  | 'rustic'
  | 'modern'
  | 'bohemian'
  | 'festive'
  | 'casual'
  | 'futuristic'
  | 'vintage'
  | 'cozy';

/** Financial expense categorization bucket. */
export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'decor'
  | 'photography'
  | 'entertainment'
  | 'attire'
  | 'favors'
  | 'logistics'
  | 'marketing'
  | 'permits'
  | 'contingency'
  | 'other';

/** Milestone scheduling phase within the event lifecycle. */
export type TimelinePhase =
  | 'planning_early'
  | 'planning_mid'
  | 'planning_final'
  | 'week_of'
  | 'day_of';

/** Vendor pipeline and booking status. */
export type VendorStatus =
  | 'researching'
  | 'contacted'
  | 'booked'
  | 'contract_signed'
  | 'declined';

/** Guest social relationship classification. */
export type GuestGroup = 'family' | 'friends' | 'colleagues' | 'vip' | 'general';

/** RSVP response state for an invited guest. */
export type GuestRsvpStatus = 'attending' | 'declined' | 'pending';

/** Creative concept category. */
export type IdeaCategory =
  | 'theme_decor'
  | 'food_beverage'
  | 'entertainment'
  | 'guest_experience'
  | 'sustainable_tip';

/**
 * Line item in the event budget ledger.
 */
export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  title: string;
  allocatedAmount: number;
  actualAmount: number;
  isPaid: boolean;
  notes?: string;
}

/**
 * Milestone or run-of-show task in the event schedule.
 */
export interface TimelineItem {
  id: string;
  phase: TimelinePhase;
  timeLabel?: string;
  title: string;
  description: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

/**
 * Contracted or prospective vendor partner.
 */
export interface VendorItem {
  id: string;
  category: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  quoteAmount: number;
  depositPaid: number;
  status: VendorStatus;
  notes?: string;
  checklist: string[];
}

/**
 * Personalized thematic or logistical inspiration card.
 */
export interface PersonalizedIdea {
  id: string;
  title: string;
  category: IdeaCategory;
  description: string;
  tags: string[];
}

/**
 * Cohesive color palette swatch.
 */
export interface ColorSwatch {
  name: string;
  hex: string;
}

/**
 * Invited guest entry with RSVP and hospitality tracking.
 */
export interface GuestItem {
  id: string;
  name: string;
  email?: string;
  group: GuestGroup;
  rsvpStatus: GuestRsvpStatus;
  plusOnes: number;
  dietaryRestrictions?: string;
  tableNumber?: string;
}

/**
 * Master aggregate record representing an entire celebration plan.
 */
export interface EventPlan {
  id: string;
  title: string;
  type: EventType;
  vibe: EventVibe;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  rsvpDeadline?: string;
  themeDescription: string;
  colorPalette: ColorSwatch[];
  budgetItems: BudgetItem[];
  timelineItems: TimelineItem[];
  vendors: VendorItem[];
  ideas: PersonalizedIdea[];
  guests: GuestItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Turn-based message in the conversational AI assistant log.
 */
export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionSuggestions?: string[];
}

// ─────────────────────────────────────────────────────────────
// Runtime Type Guards & Predicates
// ─────────────────────────────────────────────────────────────

/** Validates whether an arbitrary string is an allowed EventType. */
export function isEventType(val: unknown): val is EventType {
  return (
    typeof val === 'string' &&
    ['wedding', 'birthday', 'community', 'corporate', 'anniversary'].includes(val)
  );
}

/** Validates whether an arbitrary string is an allowed EventVibe. */
export function isEventVibe(val: unknown): val is EventVibe {
  return (
    typeof val === 'string' &&
    [
      'elegant',
      'rustic',
      'modern',
      'bohemian',
      'festive',
      'casual',
      'futuristic',
      'vintage',
      'cozy',
    ].includes(val)
  );
}

/** Validates whether an arbitrary string is an allowed BudgetCategory. */
export function isBudgetCategory(val: unknown): val is BudgetCategory {
  return (
    typeof val === 'string' &&
    [
      'venue',
      'catering',
      'decor',
      'photography',
      'entertainment',
      'attire',
      'favors',
      'logistics',
      'marketing',
      'permits',
      'contingency',
      'other',
    ].includes(val)
  );
}

/** Validates whether an arbitrary string is an allowed TimelinePhase. */
export function isTimelinePhase(val: unknown): val is TimelinePhase {
  return (
    typeof val === 'string' &&
    ['planning_early', 'planning_mid', 'planning_final', 'week_of', 'day_of'].includes(val)
  );
}

/** Validates whether an arbitrary string is an allowed VendorStatus. */
export function isVendorStatus(val: unknown): val is VendorStatus {
  return (
    typeof val === 'string' &&
    ['researching', 'contacted', 'booked', 'contract_signed', 'declined'].includes(val)
  );
}

/** Validates whether an arbitrary string is an allowed GuestGroup. */
export function isGuestGroup(val: unknown): val is GuestGroup {
  return (
    typeof val === 'string' &&
    ['family', 'friends', 'colleagues', 'vip', 'general'].includes(val)
  );
}

/** Validates whether an arbitrary string is an allowed GuestRsvpStatus. */
export function isGuestRsvpStatus(val: unknown): val is GuestRsvpStatus {
  return (
    typeof val === 'string' &&
    ['attending', 'declined', 'pending'].includes(val)
  );
}
