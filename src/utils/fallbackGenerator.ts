import { EventPlan, EventType, EventVibe, BudgetItem, TimelineItem, VendorItem, PersonalizedIdea } from '../types/event';

export interface PlanGenerationInput {
  title: string;
  type: EventType;
  vibe: EventVibe;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency?: string;
  specialRequests?: string;
}

export function generateHeuristicEventPlan(input: PlanGenerationInput): EventPlan {
  const id = 'event-' + Date.now();
  const currency = input.currency || '$';
  const totalBudget = Math.max(100, Number(input.totalBudget) || 5000);
  const guestCount = Math.max(1, Number(input.guestCount) || 50);

  // Derive palette based on vibe
  const paletteMap: Record<EventVibe, { name: string; hex: string }[]> = {
    elegant: [
      { name: 'Champagne Gold', hex: '#D4AF37' },
      { name: 'Onyx Noir', hex: '#1E1E24' },
      { name: 'Pearl Ivory', hex: '#FDFBF7' },
      { name: 'Blush Silk', hex: '#E8D7D0' },
      { name: 'Slate Gray', hex: '#6B7280' },
    ],
    rustic: [
      { name: 'Warm Terracotta', hex: '#C86D51' },
      { name: 'Eucalyptus Green', hex: '#879782' },
      { name: 'Natural Burlap', hex: '#D7C4A5' },
      { name: 'Cream Linen', hex: '#F8F6F0' },
      { name: 'Bark Walnut', hex: '#4A3728' },
    ],
    modern: [
      { name: 'Electric Indigo', hex: '#4F46E5' },
      { name: 'Cyber Cyan', hex: '#06B6D4' },
      { name: 'Midnight Charcoal', hex: '#0F172A' },
      { name: 'Crisp White', hex: '#FFFFFF' },
      { name: 'Cool Slate', hex: '#94A3B8' },
    ],
    bohemian: [
      { name: 'Burnt Sienna', hex: '#E07A5F' },
      { name: 'Deep Sage', hex: '#81B29A' },
      { name: 'Desert Sand', hex: '#F4F1DE' },
      { name: 'Goldenrod', hex: '#F2CC8F' },
      { name: 'Night Plum', hex: '#3D405B' },
    ],
    festive: [
      { name: 'Vibrant Coral', hex: '#FF6B6B' },
      { name: 'Sunburst Gold', hex: '#FFD93D' },
      { name: 'Tropical Mint', hex: '#4D96FF' },
      { name: 'Emerald Wave', hex: '#6BCB77' },
      { name: 'Pure White', hex: '#FFFFFF' },
    ],
    casual: [
      { name: 'Denim Blue', hex: '#3B82F6' },
      { name: 'Sunny Lemon', hex: '#FBBF24' },
      { name: 'Soft Sage', hex: '#A7F3D0' },
      { name: 'Cloud White', hex: '#F9FAFB' },
      { name: 'Stone Gray', hex: '#6B7280' },
    ],
    futuristic: [
      { name: 'Neon Purple', hex: '#A855F7' },
      { name: 'Matrix Cyan', hex: '#22D3EE' },
      { name: 'Void Black', hex: '#030712' },
      { name: 'Holo Silver', hex: '#E2E8F0' },
      { name: 'Laser Lime', hex: '#84CC16' },
    ],
    vintage: [
      { name: 'Rose Dust', hex: '#C97A7E' },
      { name: 'Antique Brass', hex: '#C5A059' },
      { name: 'Parchment', hex: '#EFE9D9' },
      { name: 'Forest Velvet', hex: '#2C4A3E' },
      { name: 'Espresso', hex: '#3C2F2F' },
    ],
    cozy: [
      { name: 'Cinnamon Spiced', hex: '#A0522D' },
      { name: 'Oatmeal Milk', hex: '#F5EBE0' },
      { name: 'Fireside Amber', hex: '#D97706' },
      { name: 'Evergreen Needles', hex: '#2D4F38' },
      { name: 'Warm Charcoal', hex: '#374151' },
    ],
  };

  const colorPalette = paletteMap[input.vibe] || paletteMap.modern;

  // Allocate budget based on event type
  let budgetAllocations: { cat: BudgetItem['category']; title: string; pct: number; notes: string }[] = [];

  if (input.type === 'wedding') {
    budgetAllocations = [
      { cat: 'venue', title: 'Ceremony & Reception Venue Rental', pct: 0.30, notes: 'Includes table/chair setup & security' },
      { cat: 'catering', title: 'Dinner, Hors d’oeuvres & Bar Package', pct: 0.35, notes: `Buffet or plated dining for ${guestCount} guests` },
      { cat: 'photography', title: 'Photographer & Cinematic Video', pct: 0.12, notes: '8 hours coverage + digital gallery' },
      { cat: 'decor', title: 'Florals, Arches & Lighting', pct: 0.10, notes: `${input.vibe} floral arrangements and warm bistro lights` },
      { cat: 'entertainment', title: 'DJ / Live Music & MC', pct: 0.06, notes: 'Ceremony acoustic sound + reception dance set' },
      { cat: 'contingency', title: 'Emergency Buffer & Overrun Reserve', pct: 0.07, notes: 'Covers unforeseen weather, transport, or tips' },
    ];
  } else if (input.type === 'birthday') {
    budgetAllocations = [
      { cat: 'venue', title: 'Private Party Space / Lounge Rental', pct: 0.30, notes: '4-5 hour evening space reservation' },
      { cat: 'catering', title: 'Food Platters, Mocktails & Custom Cake', pct: 0.35, notes: `Bespoke theme cake & appetizers for ${guestCount}` },
      { cat: 'entertainment', title: 'DJ, Arcade/VR Games or Live Performer', pct: 0.15, notes: 'Interactive entertainment for guests' },
      { cat: 'decor', title: 'Balloons, Photo Backdrop & LED Sign', pct: 0.10, notes: `${input.vibe} aesthetic photo zone` },
      { cat: 'favors', title: 'Personalized Keepsakes & Goodie Bags', pct: 0.05, notes: 'Custom themed treats' },
      { cat: 'contingency', title: 'Reserve Buffer', pct: 0.05, notes: 'Covers last minute additions' },
    ];
  } else if (input.type === 'community') {
    budgetAllocations = [
      { cat: 'permits', title: 'City Park Permits, Police & Sound Waiver', pct: 0.10, notes: 'Municipal permit filings and sanitation' },
      { cat: 'logistics', title: 'Canopies, Staging, Tables & Restrooms', pct: 0.30, notes: 'Tent rental, trash bins, handwashing' },
      { cat: 'catering', title: 'Community Refreshments & Food Truck Staging', pct: 0.20, notes: 'Water stations, bulk snacks, food truck hookups' },
      { cat: 'entertainment', title: 'Local Bands, Stage Audio & MC', pct: 0.18, notes: 'PA system, sound engineer, performer honorariums' },
      { cat: 'marketing', title: 'Posters, Banners, Social Ads & Flyers', pct: 0.12, notes: 'Promoting festival across neighborhoods' },
      { cat: 'contingency', title: 'First Aid & Safety Supplies', pct: 0.10, notes: 'EMS kit, extra hydration, volunteers support' },
    ];
  } else {
    budgetAllocations = [
      { cat: 'venue', title: 'Main Event Space & AV Setup', pct: 0.35, notes: 'Venue rental with high-speed internet & screens' },
      { cat: 'catering', title: 'Catered Buffet & Beverage Station', pct: 0.30, notes: `Food service for ${guestCount} attendees` },
      { cat: 'entertainment', title: 'Guest Speakers / MC / Team Building', pct: 0.15, notes: 'Keynote audio & presentation support' },
      { cat: 'decor', title: 'Branding, Badges & Scenic Decor', pct: 0.10, notes: 'Stage backdrop and registration desk' },
      { cat: 'contingency', title: 'Logistics Buffer', pct: 0.10, notes: 'Reserve funds' },
    ];
  }

  let runningAllocated = 0;
  const budgetItems: BudgetItem[] = budgetAllocations.map((b, idx) => {
    const isLast = idx === budgetAllocations.length - 1;
    const allocated = isLast
      ? Math.max(0, totalBudget - runningAllocated)
      : Math.round(totalBudget * b.pct);
    runningAllocated += allocated;
    return {
      id: `b-${idx + 1}`,
      category: b.cat,
      title: b.title,
      allocatedAmount: allocated,
      actualAmount: 0,
      isPaid: false,
      notes: b.notes,
    };
  });

  // Timeline Items
  const timelineItems: TimelineItem[] = [
    {
      id: 't-1',
      phase: 'planning_early',
      timeLabel: 'Months 3-4',
      title: 'Confirm Venue & Secure Essential Permits',
      description: `Reserve location in ${input.location} and sign initial contract.`,
      completed: true,
      assignedTo: 'Lead Organizer',
    },
    {
      id: 't-2',
      phase: 'planning_early',
      timeLabel: 'Months 2-3',
      title: 'Lock In Primary Caterer & Entertainment',
      description: 'Review food menus, dietary accommodations, and sound requirements.',
      completed: false,
      assignedTo: 'Planner',
    },
    {
      id: 't-3',
      phase: 'planning_mid',
      timeLabel: 'Month 1',
      title: 'Send Invitations & Launch RSVP Tracking',
      description: `Distribute digital/print invites to ${guestCount} target attendees.`,
      completed: false,
      assignedTo: 'Host',
    },
    {
      id: 't-4',
      phase: 'planning_final',
      timeLabel: '2 Weeks Out',
      title: 'Finalize Headcount & Vendor Delivery Schedule',
      description: 'Confirm load-in times, seating arrangements, and dietary special requests.',
      completed: false,
      assignedTo: 'Coordinator',
    },
    {
      id: 't-5',
      phase: 'week_of',
      timeLabel: '3 Days Out',
      title: 'Rehearsal / Pre-Event Logistics Check',
      description: 'Test all audio/visual equipment, review timeline with key helpers.',
      completed: false,
      assignedTo: 'All Leads',
    },
    {
      id: 't-6',
      phase: 'day_of',
      timeLabel: '09:00 AM',
      title: 'Vendor Load-In & Venue Staging',
      description: 'Tables, decor, lighting, and sound check.',
      completed: false,
      assignedTo: 'Floor Manager',
    },
    {
      id: 't-7',
      phase: 'day_of',
      timeLabel: '01:00 PM',
      title: 'Guest Arrival & Welcome Refreshments',
      description: 'Greeting attendees, check-in wristbands/nametags, background music.',
      completed: false,
      assignedTo: 'Greeting Team',
    },
    {
      id: 't-8',
      phase: 'day_of',
      timeLabel: '02:30 PM',
      title: 'Main Ceremony / Program Highlights',
      description: 'Key speeches, celebration moments, and photo opportunities.',
      completed: false,
      assignedTo: 'MC',
    },
    {
      id: 't-9',
      phase: 'day_of',
      timeLabel: '05:00 PM',
      title: 'Dining, Toasts & Open Social Hour',
      description: 'Dinner service followed by dancing, activities, and celebration.',
      completed: false,
      assignedTo: 'Caterer & DJ',
    },
    {
      id: 't-10',
      phase: 'day_of',
      timeLabel: '09:00 PM',
      title: 'Grand Finale Send-Off & Teardown',
      description: 'Closing song, farewell favors, and vendor load-out.',
      completed: false,
      assignedTo: 'Floor Manager',
    },
  ];

  // Vendors
  const vendors: VendorItem[] = [
    {
      id: 'v-1',
      category: 'Venue & Facilities',
      name: `${input.location} Event Space`,
      contactName: 'Venue Manager',
      phone: '(555) 012-3456',
      email: 'manager@eventspace.com',
      quoteAmount: Math.round(totalBudget * 0.3),
      depositPaid: Math.round(totalBudget * 0.15),
      status: 'contract_signed',
      notes: 'Tables, chairs, and AV access included in contract.',
      checklist: ['Insurance certificate filed', 'Load-in timing confirmed', 'Restroom access verified'],
    },
    {
      id: 'v-2',
      category: 'Catering & Beverages',
      name: 'Artisan Kitchen & Bar',
      contactName: 'Chef Jordan',
      phone: '(555) 012-7890',
      email: 'jordan@artisankitchen.com',
      quoteAmount: Math.round(totalBudget * 0.35),
      depositPaid: 0,
      status: 'contacted',
      notes: `Customized menu with allergy friendly and vegetarian options.`,
      checklist: ['Dietary list submitted', 'Tasting scheduled', 'Beverage quantities confirmed'],
    },
    {
      id: 'v-3',
      category: 'Sound & Entertainment',
      name: 'Dynamic Vibe Productions',
      contactName: 'DJ Taylor',
      phone: '(555) 019-8765',
      email: 'taylor@dynamicvibes.com',
      quoteAmount: Math.round(totalBudget * 0.12),
      depositPaid: 0,
      status: 'researching',
      notes: 'Wireless mics, subwoofers, and customizable playlist.',
      checklist: ['Do-not-play list', 'Timeline cues sent'],
    },
  ];

  // Ideas
  const ideas: PersonalizedIdea[] = [
    {
      id: 'idea-1',
      title: `Curated ${input.vibe.toUpperCase()} Photo-Op Vignette`,
      category: 'theme_decor',
      description: `Create an eye-catching photo corner featuring ambient backlighting, customized event signage, and props matching the ${input.vibe} aesthetic.`,
      tags: ['Instagrammable', 'Decor', 'Memories'],
    },
    {
      id: 'idea-2',
      title: 'Signature Event Beverage / Mocktail Station',
      category: 'food_beverage',
      description: `Feature a custom-named specialty drink (e.g., "${input.title.slice(0, 15)} Sparkler") infused with fresh botanicals and citrus.`,
      tags: ['Signature Drink', 'Hospitality', 'Creative'],
    },
    {
      id: 'idea-3',
      title: 'Interactive Memory Wall & Digital QR Guestbook',
      category: 'guest_experience',
      description: 'Place cards or a digital QR code at tables allowing guests to instantly upload smartphone snapshots and voice notes directly into a private live photo gallery.',
      tags: ['Interactive', 'Keepsake', 'Modern'],
    },
    {
      id: 'idea-4',
      title: 'Zero-Waste & Eco-Conscious Touch',
      category: 'sustainable_tip',
      description: 'Opt for biodegradable compostable tablewares, seed-packet party favors, and digital-first RSVP management to reduce paper waste.',
      tags: ['Eco-Friendly', 'Green', 'Modern'],
    },
  ];

  return {
    id,
    title: input.title,
    type: input.type,
    vibe: input.vibe,
    date: input.date,
    location: input.location,
    guestCount,
    totalBudget,
    currency,
    themeDescription: `A thoughtfully curated ${input.vibe} ${input.type} celebration held at ${input.location} for ${guestCount} attendees, balancing memorable guest experiences with disciplined financial stewardship.`,
    colorPalette,
    budgetItems,
    timelineItems,
    vendors,
    ideas,
    guests: [
      { id: 'g-1', name: 'Alex Morgan', email: 'alex@example.com', group: 'family', rsvpStatus: 'attending', plusOnes: 1, dietaryRestrictions: 'Vegetarian' },
      { id: 'g-2', name: 'Taylor Swift', email: 'taylor@example.com', group: 'friends', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'None' },
      { id: 'g-3', name: 'Jordan Bell', email: 'jordan@example.com', group: 'colleagues', rsvpStatus: 'pending', plusOnes: 1, dietaryRestrictions: 'Gluten-Free' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
