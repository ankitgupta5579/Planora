import { PersonalizedIdea } from '../types/event';

export interface HeuristicIdeasInput {
  type?: string;
  vibe?: string;
  location?: string;
  guestCount?: number;
  totalBudget?: number;
  focusCategory?: string;
  existingTitles?: string[];
}

interface IdeaTemplate {
  title: string;
  category: PersonalizedIdea['category'];
  description: string;
  tags: string[];
}

const IDEAS_BY_TYPE: Record<string, IdeaTemplate[]> = {
  wedding: [
    {
      title: 'Acoustic Golden-Hour Prelude',
      category: 'entertainment',
      description: 'Host an unplugged acoustic soloist performing mellow indie arrangements as guests arrive and transition between ceremony and cocktail hour.',
      tags: ['Acoustic', 'Music', 'Golden Hour'],
    },
    {
      title: 'Artisan Culinary Tasting Station',
      category: 'food_beverage',
      description: 'Feature a curated tasting flight celebrating local regional flavors with paired mocktails, infused oils, and chef storytelling cards.',
      tags: ['Foodie', 'Local', 'Pairing'],
    },
    {
      title: 'Botanical Herb & Seedling Favor Bar',
      category: 'sustainable_tip',
      description: 'Offer guests potted aromatic culinary herbs or wildflower seed packets in stamped recyclable kraft planters as eco-conscious living keepsakes.',
      tags: ['Eco Friendly', 'Zero Waste', 'Living Keepsake'],
    },
    {
      title: 'Interactive Audio Guestbook Station',
      category: 'guest_experience',
      description: 'Set up a vintage rotary telephone recording heartfelt voicemail messages and spontaneous toasts from loved ones throughout the reception.',
      tags: ['Audio Book', 'Vintage', 'Memories'],
    },
    {
      title: 'Warm Canopy Bistro & Micro-Fairy Lighting',
      category: 'theme_decor',
      description: 'Suspend criss-cross Edison filaments and warm ambient micro-fairy strands above dining tables to create an intimate, stargazing glow.',
      tags: ['Lighting', 'Warm Glow', 'Ambience'],
    },
  ],
  birthday: [
    {
      title: 'Signature Birthday Mocktail Bar',
      category: 'food_beverage',
      description: 'Craft two bespoke infused signature drinks with edible floral ice spheres, fresh herbal garnishes, and custom commemorative swizzle sticks.',
      tags: ['Signature Drink', 'Mocktail', 'Interactive'],
    },
    {
      title: 'Interactive Polaroid Memory Gallery',
      category: 'guest_experience',
      description: 'Provide instant cameras, metallic gel pens, and a wooden pinboard where guests clip candid snapshots beside handwritten notes.',
      tags: ['Polaroid', 'Guest Photos', 'Keepsake'],
    },
    {
      title: 'Illuminated Milestone Neon Photo Op',
      category: 'theme_decor',
      description: 'Stage an energetic selfie backdrop with a customized warm neon phrase nestled inside lush trailing greenery and architectural palms.',
      tags: ['Photo Backdrop', 'Neon', 'Vibrant'],
    },
    {
      title: 'Curated Vinyl Listening Lounge',
      category: 'entertainment',
      description: 'Set up a cozy listening nook with a turntable and genre crates where guests browse and queue milestone tracks.',
      tags: ['Vinyl', 'Music Lounge', 'Retro'],
    },
    {
      title: 'Biodegradable Confetti Sunset Sendoff',
      category: 'sustainable_tip',
      description: 'Supply dried flower petal sachets in unbleached glassine envelopes for an environmentally safe send-off shower at sunset.',
      tags: ['Eco Confetti', 'Petals', 'Sunset'],
    },
  ],
  anniversary: [
    {
      title: 'Curated Timeline Memory Ribbon',
      category: 'theme_decor',
      description: 'Suspend an illuminated photo timeline along a gallery wall showcasing milestone moments from each decade of love and companionship.',
      tags: ['Photo Gallery', 'Milestone', 'Heritage'],
    },
    {
      title: 'Vintage Dessert & Wine Pairing Bar',
      category: 'food_beverage',
      description: 'Serve mini dessert pairings alongside commemorative reserve vintage beverages and artisanal chocolate truffles.',
      tags: ['Dessert Flight', 'Pairing', 'Gourmet'],
    },
    {
      title: 'Community Story Circle & Open Mic',
      category: 'entertainment',
      description: 'Designate a 20-minute twilight storytelling block where close family members share fond anecdotes and toast the hosts.',
      tags: ['Storytelling', 'Heartfelt', 'Toast'],
    },
    {
      title: 'Hand-Bound Leather Commemorative Album',
      category: 'guest_experience',
      description: 'Invite attendees to pen blessings and press instant portraits into an archival hand-stitched leather guest journal.',
      tags: ['Archival', 'Leather Journal', 'Keepsake'],
    },
  ],
  corporate: [
    {
      title: 'Gamified Team Connection Scavenger Quest',
      category: 'entertainment',
      description: 'Deploy a lightweight mobile QR-based team trivia hunt that encourages cross-department networking and friendly puzzle solving.',
      tags: ['Team Building', 'Gamified', 'Interactive'],
    },
    {
      title: 'Locally Sourced Farm-to-Fork Grazing Tables',
      category: 'food_beverage',
      description: 'Partner with regional growers to present artisanal cheeses, sourdough, honeycomb, and seasonal fruits labeled with farm origins.',
      tags: ['Farm to Table', 'Local Growers', 'Sustainable'],
    },
    {
      title: 'Digital Keynote & Live Sketch Artist',
      category: 'guest_experience',
      description: 'Commission a live graphic scribe to illustrate key themes and keynote takeaways on a digital display wall in real time.',
      tags: ['Graphic Scribing', 'Visual Notes', 'Keynote'],
    },
    {
      title: 'Carbon-Neutral Plant-a-Tree Badge',
      category: 'sustainable_tip',
      description: 'Pledge one native sapling planting per attendee through verified conservation partners, with custom digital impact certificates.',
      tags: ['Carbon Offset', 'Tree Planting', 'Green Summit'],
    },
  ],
  community: [
    {
      title: 'Neighborhood Artisan Craft Workshop Corner',
      category: 'guest_experience',
      description: 'Invite local makers to run interactive mini workshops where participants handcraft pottery, screen prints, or floral wreaths.',
      tags: ['Artisan', 'Hands-on', 'Community'],
    },
    {
      title: 'Community Acoustic Lawn Sessions',
      category: 'entertainment',
      description: 'Host rotating half-hour performance sets showcasing neighborhood singer-songwriters, school ensembles, and folk acoustic artists.',
      tags: ['Local Talent', 'Acoustic', 'Festival'],
    },
    {
      title: 'Zero-Waste Reusable Dishware Hub',
      category: 'sustainable_tip',
      description: 'Implement a sanitized returnable cup and plate station to eliminate single-use plastics across all food and beverage stalls.',
      tags: ['Zero Waste', 'Reusable', 'Eco Pioneer'],
    },
    {
      title: 'Communal Canvas Mural Project',
      category: 'theme_decor',
      description: 'Erect a giant primed canvas board with paint markers where community members contribute spontaneous drawings and signatures.',
      tags: ['Collaborative Art', 'Mural', 'Inclusive'],
    },
  ],
};

const DEFAULT_IDEAS: IdeaTemplate[] = [
  {
    title: 'Interactive Polaroid & Audio Guestbook Corner',
    category: 'guest_experience',
    description: 'Set up a dedicated photo table with vintage instant cameras, metallic gel pens, and custom envelopes for handwritten notes.',
    tags: ['Keepsake', 'Photo', 'Creative'],
  },
  {
    title: 'Curated Twilight Bistro Lighting Canopy',
    category: 'theme_decor',
    description: 'Drape warm Edison bulbs and micro-fairy strands above common areas to elevate evening atmosphere and photo quality.',
    tags: ['Ambience', 'Lighting', 'Warmth'],
  },
  {
    title: 'Artisan Infused Refreshment Station',
    category: 'food_beverage',
    description: 'Feature crystal glass dispensers with cucumber-mint, blackberry-thyme, and citrus-rosemary water alongside seasonal mocktails.',
    tags: ['Hydration', 'Fresh Herbs', 'Refreshing'],
  },
];

export function generateHeuristicIdeas(input: HeuristicIdeasInput): PersonalizedIdea[] {
  const eventType = (input.type || 'wedding').toLowerCase();
  const pool = IDEAS_BY_TYPE[eventType] || DEFAULT_IDEAS;
  const existingSet = new Set((input.existingTitles || []).map((t) => t.trim().toLowerCase()));

  // Filter pool to avoid duplicate titles
  let candidates = pool.filter((idea) => !existingSet.has(idea.title.toLowerCase()));

  // If focusCategory requested, prioritize matching items
  if (input.focusCategory) {
    const focus = input.focusCategory.toLowerCase();
    const focused = candidates.filter((c) => c.category === focus);
    const others = candidates.filter((c) => c.category !== focus);
    candidates = [...focused, ...others];
  }

  // If candidates exhausted, fall back to default pool
  if (candidates.length < 3) {
    for (const def of DEFAULT_IDEAS) {
      if (!existingSet.has(def.title.toLowerCase()) && !candidates.some((c) => c.title === def.title)) {
        candidates.push(def);
      }
    }
  }

  // Always return exactly 3 ideas
  const selected = candidates.slice(0, 3);
  const now = Date.now();

  return selected.map((item, idx) => ({
    id: `idea-heur-${now}-${idx + 1}`,
    title: item.title,
    category: item.category,
    description: item.description,
    tags: item.tags,
  }));
}
