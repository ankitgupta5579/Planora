import { ValidatedPlanInput } from './validate';

export function buildPlanGenerationPrompt(input: ValidatedPlanInput): string {
  return `You are a world-class professional Celebration and Event Planner. 
Create an exhaustive, realistic, and inspiring event plan for:
- Title: "${input.title}"
- Event Type: "${input.type}" (e.g. wedding, birthday, community event, corporate, anniversary)
- Aesthetic/Vibe: "${input.vibe}"
- Date: "${input.date}"
- Location: "${input.location}"
- Expected Attendees: ${input.guestCount} guests
- Total Budget: ${input.currency}${input.totalBudget}
- Additional Constraints/Wishes: "${input.specialRequests || 'None provided'}"

Provide a structured plan with:
1. themeDescription: Inspiring 2-3 sentence artistic vision for the celebration.
2. colorPalette: 5 cohesive colors with descriptive names and valid hex codes.
3. budgetItems: 6 to 10 categorized budget items covering venue, catering, decor, photography/media, entertainment, logistics/permits, favors, and emergency contingency. Sum of allocated amounts should equal total budget ${input.totalBudget}.
4. timelineItems: 8 to 12 milestone items progressing from early planning (months out) through week-of and day-of minute-by-minute schedule.
5. vendors: 4 to 6 vendor categories with estimated quotes, key checklist questions, and realistic details.
6. ideas: 4 to 6 personalized ideas covering theme decor, food/drink signature touches, interactive guest experiences, and eco-friendly tips.`;
}

export function buildChatPrompt(message: string, eventContext?: any): string {
  const systemPrompt = `You are an elite, proactive Event Planner & Coordinator AI.
You are assisting a client with the following active event plan:
- Event Title: ${eventContext?.title || 'Celebration'}
- Type: ${eventContext?.type || 'Event'}
- Vibe: ${eventContext?.vibe || 'Festive'}
- Date: ${eventContext?.date || 'Upcoming'}
- Location: ${eventContext?.location || 'TBD'}
- Guests: ${eventContext?.guestCount || 0} attendees
- Total Budget: ${eventContext?.currency || '$'}${eventContext?.totalBudget || 0}
- Current Allocated: ${eventContext?.totalAllocated || 0}
- Current Spent: ${eventContext?.totalSpent || 0}

Provide direct, actionable, practical advice. Be warm, structured, and resourceful. 
Include 2-3 quick follow-up prompt suggestions that the user can click next.`;

  return `${systemPrompt}\n\nClient message: ${message}`;
}

export function buildInviteSpeechPrompt(
  requestType: 'invitation' | 'speech',
  tone: string,
  recipient: string,
  event: any,
  customDetails?: string
): string {
  return `You are a talented speechwriter and stationery copywriter.
Generate a ${tone || 'warm and heartfelt'} ${requestType || 'invitation'} for:
- Event: ${event?.title || 'Our Celebration'} (${event?.type || 'event'}, ${event?.vibe || 'celebratory'} vibe)
- Date & Location: ${event?.date || 'Upcoming Date'} at ${event?.location || 'Venue'}
- Intended Audience/Recipient: ${recipient || 'Honored Guests'}
- Specific Notes / Details to weave in: ${customDetails || 'Standard celebration'}

Return an emotionally resonant, polished, ready-to-use text formatted with clear sections and paragraphs.`;
}

export function buildVendorInquiryPrompt(vendor: any, event: any): string {
  return `Write a polite, professional, and clear vendor inquiry email to:
- Vendor Name: ${vendor?.name} (${vendor?.category || 'Vendor Services'})
- Event: ${event?.title || 'Our Celebration'} (${event?.type || 'event'}, ${event?.vibe || 'celebratory'} vibe)
- Event Date: ${event?.date || 'Upcoming'}
- Guest Count: ${event?.guestCount || 50}
- Location: ${event?.location || 'Local area'}
- Allocated Target Budget: ${event?.currency || '$'}${vendor?.quoteAmount || 'Flexible'}
- Specific inquiries: Include questions about availability, package options, setup timelines, and payment deposit structure.`;
}
