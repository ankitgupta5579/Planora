/**
 * Offline, keyword-aware planner replies.
 *
 * Used by POST /api/ai/chat when Gemini is unavailable (no key, timeout, error),
 * so the assistant still answers the question that was actually asked instead of
 * returning one fixed sentence. Pure and dependency-free, so it is easy to test.
 */

export interface ChatFallbackContext {
  title?: string;
  type?: string;
  guestCount?: number;
  totalBudget?: number;
  currency?: string;
  totalAllocated?: number;
  totalSpent?: number;
}

export interface ChatFallbackReply {
  reply: string;
  suggestions: string[];
  topic: ChatFallbackTopic;
}

export type ChatFallbackTopic =
  | 'weather'
  | 'catering'
  | 'venue'
  | 'icebreakers'
  | 'timeline'
  | 'budget'
  | 'vendors'
  | 'guests'
  | 'decor'
  | 'entertainment'
  | 'general';

interface TopicRule {
  topic: Exclude<ChatFallbackTopic, 'general'>;
  keywords: string[];
}

const TOPIC_RULES: TopicRule[] = [
  { topic: 'weather', keywords: ['weather', 'rain', 'storm', 'wind', 'heat', 'monsoon', 'contingency', 'backup plan', 'outdoor'] },
  { topic: 'catering', keywords: ['catering', 'caterer', 'food', 'menu', 'meal', 'dinner', 'buffet', 'drinks', 'bar', 'cake'] },
  { topic: 'venue', keywords: ['venue', 'contract', 'hall', 'location', 'booking', 'deposit', 'cancellation'] },
  { topic: 'icebreakers', keywords: ['icebreaker', 'ice breaker', 'game', 'games', 'activity', 'activities', 'mingle'] },
  { topic: 'timeline', keywords: ['timeline', 'schedule', 'checklist', 'when', 'deadline', 'countdown', 'run of show', 'itinerary'] },
  { topic: 'budget', keywords: ['budget', 'cost', 'costs', 'save', 'saving', 'cheap', 'afford', 'price', 'expensive', 'spend', 'cut'] },
  { topic: 'vendors', keywords: ['vendor', 'photographer', 'florist', 'dj', 'planner', 'decorator', 'videographer', 'hire'] },
  { topic: 'guests', keywords: ['guest', 'guests', 'seating', 'rsvp', 'invite', 'invitation', 'headcount', 'accessibility', 'dietary'] },
  { topic: 'decor', keywords: ['decor', 'decoration', 'flowers', 'florals', 'theme', 'lighting', 'centerpiece', 'color', 'colour'] },
  { topic: 'entertainment', keywords: ['music', 'band', 'playlist', 'entertainment', 'dance', 'speech', 'toast'] },
];

/** Picks the topic whose keywords appear most often in the message. */
export function detectTopic(message: string): ChatFallbackTopic {
  const text = ` ${message.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')} `;
  let best: ChatFallbackTopic = 'general';
  let bestScore = 0;

  for (const rule of TOPIC_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(` ${keyword} `) || (keyword.length > 4 && text.includes(keyword))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = rule.topic;
      bestScore = score;
    }
  }
  return best;
}

function money(currency: string, amount: number): string {
  return `${currency}${Math.round(amount).toLocaleString('en-US')}`;
}

function buildReply(topic: ChatFallbackTopic, ctx: ChatFallbackContext): ChatFallbackReply {
  const type = ctx.type || 'event';
  const guests = ctx.guestCount && ctx.guestCount > 0 ? ctx.guestCount : undefined;
  const currency = ctx.currency || '$';
  const guestText = guests ? `${guests} guests` : 'your guests';

  switch (topic) {
    case 'weather':
      return {
        topic,
        reply: [
          `Bad-weather contingency checklist for your ${type} (${guestText}):`,
          '1. Decide the cut-off: agree on a go/no-go time (usually 48 hours before, with a final check 6 hours before).',
          '2. Book a covered backup: a tent, marquee or indoor room that fits your guest count, and ask the venue what it costs to switch.',
          '3. Rent essentials: tent sidewalls, floor matting, fans or heaters, and umbrellas for arrivals.',
          '4. Protect the details: waterproof signage, covered power and sound equipment, and a dry area for the cake and florals.',
          '5. Tell the vendors: confirm every vendor knows the plan B location and the load-in time.',
          '6. Tell the guests: prepare a short message for guests about the new location, parking and dress suggestions.',
          '7. Check insurance and contracts for weather clauses and rescheduling terms.',
        ].join('\n'),
        suggestions: ['Draft questions to ask before signing a venue contract', 'How can I cut budget costs?', 'Build a day-of timeline'],
      };
    case 'catering':
      return {
        topic,
        reply: [
          `Catering tips for ${guestText}:`,
          '1. Cut cost without cutting quality: reduce the number of mains (two plus a vegetarian option), shift to stations or family-style service, and choose seasonal ingredients.',
          '2. Review the bar: serve a signature drink plus wine and beer instead of a full open bar.',
          '3. Right-size portions: plan for confirmed RSVPs, plus about 5% buffer, not the invitation list.',
          '4. Ask every caterer for a tasting, a per-head price in writing, staffing ratios, and what is included (rentals, service charge, tax).',
          '5. Collect dietary needs on the RSVP form early (vegetarian, vegan, allergies, halal, kosher).',
        ].join('\n'),
        suggestions: ['What questions should I ask my caterer?', 'How can I cut budget costs?', 'Suggest 3 icebreaker games suitable for our guests'],
      };
    case 'venue':
      return {
        topic,
        reply: [
          'Questions to ask before signing a venue contract:',
          '1. What is included in the price (tables, chairs, linens, staff, cleanup, power, parking)?',
          '2. What are the deposit, payment schedule and cancellation or rescheduling terms?',
          '3. Is there a weather or force-majeure clause, and what is the indoor backup space?',
          '4. What are the setup and teardown times, noise limits and curfew?',
          '5. Are outside caterers, alcohol and decorators allowed, and are there extra fees?',
          `6. What is the real capacity for ${guestText} with seating, a dance floor and service space?`,
          '7. Is the venue accessible (step-free entry, accessible restrooms, parking)?',
          '8. Ask for proof of insurance and a written copy of every promise made verbally.',
        ].join('\n'),
        suggestions: ['What should our bad weather contingency checklist be?', 'How can I cut budget costs?', 'Build a day-of timeline'],
      };
    case 'icebreakers':
      return {
        topic,
        reply: [
          `Three icebreaker games that work well for ${guestText}:`,
          '1. Two Truths and a Wish: guests share two true things and one wish for the couple or host. It works at any table.',
          '2. Find Someone Who: a bingo card with prompts like "has traveled to 5+ countries". Guests mingle to fill squares.',
          '3. Story Table Cards: each table gets a card with a question like "best advice you have ever received" to answer in turn.',
          'Tip: keep games optional, short (10 to 15 minutes) and away from the meal service.',
        ].join('\n'),
        suggestions: ['Suggest music and entertainment ideas', 'Build a day-of timeline', 'How can I cut budget costs?'],
      };
    case 'timeline':
      return {
        topic,
        reply: [
          `Planning timeline for your ${type}:`,
          '1. 6 to 12 months out: set the budget, guest range and date; book the venue and key vendors.',
          '2. 3 to 6 months: send save-the-dates, book photographer, music and decor, and start tastings.',
          '3. 6 to 8 weeks: send invitations, finalize the menu and collect dietary needs.',
          '4. 2 to 4 weeks: confirm the headcount, seating plan and all vendor arrival times.',
          '5. 1 week: make final payments, confirm the backup plan and print the day-of schedule.',
          '6. 48 hours before: reconfirm every vendor and share the run-of-show with your helpers.',
          'Day of: build in a 15-minute buffer between big moments such as speeches and dinner.',
        ].join('\n'),
        suggestions: ['What should our bad weather contingency checklist be?', 'What questions should I ask my caterer?', 'How can I cut budget costs?'],
      };
    case 'budget': {
      const total = ctx.totalBudget && ctx.totalBudget > 0 ? ctx.totalBudget : undefined;
      const spent = ctx.totalSpent ?? 0;
      const allocated = ctx.totalAllocated ?? 0;
      const status = total
        ? `You have ${money(currency, total)} total, ${money(currency, allocated)} allocated and ${money(currency, spent)} spent so far (${money(currency, Math.max(total - allocated, 0))} unallocated).`
        : 'Set a total budget so every line item can be tracked.';
      return {
        topic,
        reply: [
          status,
          'Ways to save without hurting the experience:',
          '1. Spend on what guests notice most (food, music, atmosphere) and trim the rest.',
          '2. Choose an off-peak day or time; weekdays and Sundays are often much cheaper.',
          '3. Reuse items: move ceremony florals to the dinner tables, and rent instead of buying.',
          '4. Keep a contingency of 5 to 10% for surprises.',
          '5. Ask each vendor for itemized quotes and compare at least three.',
        ].join('\n'),
        suggestions: ['How to cut 15% from catering without sacrificing quality?', 'What questions should I ask my caterer?', 'Draft questions to ask before signing a venue contract'],
      };
    }
    case 'vendors':
      return {
        topic,
        reply: [
          'Vendor checklist:',
          '1. Shortlist three vendors per category and compare itemized quotes.',
          '2. Check recent reviews and ask to see full galleries or references, not only highlights.',
          '3. Confirm availability, deposit, cancellation terms and a backup plan if they cannot attend.',
          '4. Get everything in writing: services, hours, arrival time, overtime fees and travel costs.',
          '5. Share one run-of-show with all vendors and reconfirm 48 hours before the event.',
        ].join('\n'),
        suggestions: ['Draft questions to ask before signing a venue contract', 'What questions should I ask my caterer?', 'Build a day-of timeline'],
      };
    case 'guests':
      return {
        topic,
        reply: [
          `Guest management for ${guestText}:`,
          '1. Send invitations 6 to 8 weeks ahead with a clear RSVP deadline and a dietary question.',
          '2. Follow up with non-responders 2 weeks before the deadline.',
          '3. Seat by relationships, mix a few groups, and place guests with mobility needs near exits.',
          '4. Provide clear directions, parking and accessibility details in the invitation.',
          '5. Plan for about 5 to 10% late changes in your final headcount.',
        ].join('\n'),
        suggestions: ['Suggest 3 icebreaker games suitable for our guests', 'Build a day-of timeline', 'How can I cut budget costs?'],
      };
    case 'decor':
      return {
        topic,
        reply: [
          `Decor ideas for your ${type}:`,
          '1. Pick two main colors plus one accent, and repeat them across tables, signage and lighting.',
          '2. Warm string lights or candles create atmosphere for less than large floral installs.',
          '3. Use seasonal and local flowers, and reuse ceremony pieces at the reception.',
          '4. Add one memorable focal point, such as an entrance arch, photo wall or a styled dessert table.',
          '5. Test everything in the venue lighting and plan setup and teardown times.',
        ].join('\n'),
        suggestions: ['How can I cut budget costs?', 'What should our bad weather contingency checklist be?', 'Suggest music and entertainment ideas'],
      };
    case 'entertainment':
      return {
        topic,
        reply: [
          'Music and entertainment tips:',
          '1. Split the evening: calm background music for arrival and dinner, then energy for the dance floor.',
          '2. Share a must-play and do-not-play list with the DJ or band.',
          '3. Keep speeches to 2 or 3 minutes each, and schedule them before dessert, not during the meal.',
          '4. Confirm the sound system, microphones and power needs with the venue.',
          '5. Prepare a short playlist backup in case equipment fails.',
        ].join('\n'),
        suggestions: ['Suggest 3 icebreaker games suitable for our guests', 'Build a day-of timeline', 'How can I cut budget costs?'],
      };
    default:
      return {
        topic: 'general',
        reply: [
          `I'm in offline mode, so here are priority checks for your ${type} with ${guestText}:`,
          '1. Lock the date, venue and budget first; everything else depends on them.',
          '2. Verify vendor contracts for cancellation and weather clauses.',
          '3. Build a day-of timeline with a 15-minute buffer between major moments.',
          '4. Confirm vendor arrival windows 48 hours before the event.',
          'Ask me about weather plans, catering, venue contracts, budget, timeline, guests or decor for more detail.',
        ].join('\n'),
        suggestions: ['What should our bad weather contingency checklist be?', 'How can I cut budget costs?', 'Draft questions to ask before signing a venue contract'],
      };
  }
}

/** Builds a useful offline answer for the user's question and event context. */
export function generateOfflineChatReply(message: string, context?: ChatFallbackContext): ChatFallbackReply {
  return buildReply(detectTopic(message || ''), context || {});
}
