import { PersonalizedIdea } from '../types/event';

export interface HeuristicIdeasInput {
  type?: string;
  vibe?: string;
  location?: string;
  guestCount?: number;
  totalBudget?: number;
  focusCategory?: string;
  existingTitles?: string[];
  allSections?: boolean;
}

interface IdeaTemplate {
  title: string;
  category: PersonalizedIdea['category'];
  description: string;
  tags: string[];
}

const ALL_CATEGORIES: PersonalizedIdea['category'][] = [
  'theme_decor',
  'food_beverage',
  'entertainment',
  'guest_experience',
  'sustainable_tip',
];

const IDEAS_BY_TYPE: Record<string, IdeaTemplate[]> = {
  wedding: [
    {
      title: 'Warm Fairy String Lights',
      category: 'theme_decor',
      description:
        'Hang soft, warm string lights across the ceiling or garden trees to make dinner and dancing feel magical.',
      tags: ['Warm Lights', 'Cozy Vibe', 'Romantic'],
    },
    {
      title: 'Local Snack Tasting Table',
      category: 'food_beverage',
      description:
        'A fun snack table with bite-sized treats and fresh fruit drinks celebrating delicious local flavors.',
      tags: ['Snack Table', 'Tasty Bites', 'Refreshing'],
    },
    {
      title: 'Live Acoustic Welcome Songs',
      category: 'entertainment',
      description:
        'A friendly local guitar player performs relaxed, popular acoustic songs as your guests arrive and mingle.',
      tags: ['Live Music', 'Acoustic Guitar', 'Welcome'],
    },
    {
      title: 'Vintage Voicemail Guestbook',
      category: 'guest_experience',
      description:
        'Set up a classic rotary telephone where friends pick up the receiver and record sweet voice messages for you to keep.',
      tags: ['Voice Messages', 'Keepsake', 'Guest Fun'],
    },
    {
      title: 'Little Potted Herb Favors',
      category: 'sustainable_tip',
      description:
        'Give each guest a cute little potted kitchen herb (like basil or mint) in paper pots to grow at home.',
      tags: ['Potted Herbs', 'Zero Waste', 'Living Gift'],
    },
  ],
  birthday: [
    {
      title: 'Custom Glow Neon Selfie Wall',
      category: 'theme_decor',
      description:
        'A bright, colorful neon sign on a leafy green backdrop where friends can take fun group photos and selfies.',
      tags: ['Neon Sign', 'Photo Wall', 'Celebration'],
    },
    {
      title: 'DIY Mocktail & Soda Station',
      category: 'food_beverage',
      description:
        'Guests can mix sparkling fruit sodas with tasty flavor syrups, fresh berries, and colorful straws.',
      tags: ['Fun Drinks', 'Fruit Soda', 'Sweet Treats'],
    },
    {
      title: 'Crowd-Favorite Song Requests DJ',
      category: 'entertainment',
      description:
        'A lively DJ who plays birthday guest favorite anthems and takes requests to keep everyone dancing.',
      tags: ['Party DJ', 'Dance Music', 'Song Requests'],
    },
    {
      title: 'Instant Photo & Notes Board',
      category: 'guest_experience',
      description:
        'Set out instant cameras and pens so guests can snap pictures and peg them on a board with sweet handwritten wishes.',
      tags: ['Instant Photos', 'Polaroid', 'Guest Wishes'],
    },
    {
      title: 'Flower Petal Confetti Sendoff',
      category: 'sustainable_tip',
      description:
        'Use packets of dried flower petals instead of plastic glitter for a pretty, eco-friendly celebration toss.',
      tags: ['Flower Petals', 'Eco Confetti', 'Clean Sendoff'],
    },
  ],
  anniversary: [
    {
      title: 'Milestone Photo Timeline Wall',
      category: 'theme_decor',
      description:
        'Display favorite framed photos from each year along a pathway showing your journey together.',
      tags: ['Photo Timeline', 'Memories', 'Heritage'],
    },
    {
      title: 'Sweet Treats & Coffee Cart',
      category: 'food_beverage',
      description:
        'A cozy dessert cart serving mini pastries, warm chocolate brownies, and freshly brewed coffee or tea.',
      tags: ['Dessert Cart', 'Warm Coffee', 'Sweet Bites'],
    },
    {
      title: 'Family Story Sharing Hour',
      category: 'entertainment',
      description:
        'Set aside 20 minutes for close family and friends to share warm, funny memories and raise a heartfelt toast.',
      tags: ['Family Stories', 'Heartfelt Toasts', 'Gathering'],
    },
    {
      title: 'Handmade Memory Keepsake Book',
      category: 'guest_experience',
      description:
        'A beautiful open scrapbook where guests can paste instant snapshots and write personal blessings.',
      tags: ['Scrapbook', 'Loving Notes', 'Keepsake'],
    },
    {
      title: 'Donation in Honor of Guests',
      category: 'sustainable_tip',
      description:
        'In place of plastic party favors, make a friendly contribution to a local nature sanctuary in honor of your guests.',
      tags: ['Giving Back', 'Eco Choice', 'Meaningful'],
    },
  ],
  corporate: [
    {
      title: 'Modern Brand Color Glow Lighting',
      category: 'theme_decor',
      description:
        'Clean uplighting around the room in your organization brand colors to create an upbeat, professional look.',
      tags: ['Room Lighting', 'Modern Glow', 'Brand Colors'],
    },
    {
      title: 'Fresh Farm-Style Grazing Bar',
      category: 'food_beverage',
      description:
        'A delicious assortment of fresh breads, fruit, local cheeses, and healthy snacks that are easy to grab while talking.',
      tags: ['Fresh Snacks', 'Grazing Table', 'Healthy Bites'],
    },
    {
      title: 'Interactive Team Trivia Contest',
      category: 'entertainment',
      description:
        'A quick, friendly smartphone trivia game with fun questions that gets everyone chatting and laughing together.',
      tags: ['Team Trivia', 'Interactive Game', 'Fun Quiz'],
    },
    {
      title: 'Live Digital Sketch Artist',
      category: 'guest_experience',
      description:
        'A talented illustrator draws fun digital caricatures or key highlights on a screen for attendees to take home.',
      tags: ['Fun Sketches', 'Digital Art', 'Memorable'],
    },
    {
      title: 'Plant-a-Tree Green Pass',
      category: 'sustainable_tip',
      description:
        'Plant one native tree seedling for each attendee through an environmental partner, sharing a certificate link.',
      tags: ['Tree Planting', 'Green Choice', 'Zero Waste'],
    },
  ],
  community: [
    {
      title: 'Bright Welcome Banners & Lanterns',
      category: 'theme_decor',
      description:
        'Hang colorful fabric banners and paper lanterns between trees to guide families between activity zones.',
      tags: ['Park Banners', 'Festive Flags', 'Welcoming'],
    },
    {
      title: 'Fresh Lemonade & Snack Stand',
      category: 'food_beverage',
      description:
        'Ice-cold fresh lemonade with fruit slices and baked snacks contributed by neighborhood bakers.',
      tags: ['Cold Lemonade', 'Baked Snacks', 'Community'],
    },
    {
      title: 'Neighborhood Talent & Acoustic Stage',
      category: 'entertainment',
      description:
        'A relaxed outdoor stage featuring local singer-songwriters, school groups, and acoustic performers.',
      tags: ['Local Bands', 'Acoustic Stage', 'Live Music'],
    },
    {
      title: 'Community Canvas Handprint Mural',
      category: 'guest_experience',
      description:
        'A big canvas board with washable paints where neighbors add handprints, signatures, and cheerful wishes.',
      tags: ['Art Mural', 'Handprints', 'Kids & Family'],
    },
    {
      title: 'Reusable Cup & Water Refill Hub',
      category: 'sustainable_tip',
      description:
        'Free drinking water refill stations with reusable cups to keep the park completely clean of plastic bottles.',
      tags: ['Water Refill', 'Zero Plastic', 'Park Clean'],
    },
  ],
};

const DEFAULT_IDEAS: IdeaTemplate[] = [
  {
    title: 'Warm Fairy String Lights',
    category: 'theme_decor',
    description:
      'Hang soft, warm string lights across the ceiling or outdoor trees to give your celebration a cozy, welcoming glow.',
    tags: ['Warm Lights', 'Cozy Vibe', 'Atmosphere'],
  },
  {
    title: 'Chilled Fruit Refreshment Bar',
    category: 'food_beverage',
    description:
      'Clear drink dispensers with fresh cucumber-mint water, lemonade, and iced tea with fun fruit garnishes.',
    tags: ['Fresh Lemonade', 'Cold Drinks', 'Refreshing'],
  },
  {
    title: 'Live Acoustic Guitar & Song Requests',
    category: 'entertainment',
    description:
      'A friendly local musician plays upbeat acoustic tunes and takes song requests from guests.',
    tags: ['Acoustic Guitar', 'Live Songs', 'Singalong'],
  },
  {
    title: 'Instant Photo & Memory Board',
    category: 'guest_experience',
    description:
      'Set up an instant camera station where guests snap cute photos and clip them to a board with nice notes.',
    tags: ['Instant Photos', 'Polaroid', 'Guestbook'],
  },
  {
    title: 'Eco-Friendly Flower Seed Packets',
    category: 'sustainable_tip',
    description:
      'Give guests small packets of native flower seeds in brown paper envelopes to plant in their home gardens.',
    tags: ['Wildflower Seeds', 'Zero Waste', 'Earth Friendly'],
  },
];

export function generateHeuristicIdeas(input: HeuristicIdeasInput): PersonalizedIdea[] {
  const eventType = (input.type || 'wedding').toLowerCase();
  const pool = IDEAS_BY_TYPE[eventType] || DEFAULT_IDEAS;
  const existingSet = new Set((input.existingTitles || []).map((t) => t.trim().toLowerCase()));

  // Filter pool to avoid duplicate titles
  const poolFiltered = pool.filter((idea) => !existingSet.has(idea.title.toLowerCase()));

  // 1. If allSections is requested (or explicitly asked to generate across all categories)
  if (input.allSections) {
    const selectedAcrossAll: IdeaTemplate[] = [];

    for (const cat of ALL_CATEGORIES) {
      // Find candidate in poolFiltered
      const match =
        poolFiltered.find(
          (i) => i.category === cat && !selectedAcrossAll.some((s) => s.title === i.title)
        ) ||
        pool.find((i) => i.category === cat) ||
        DEFAULT_IDEAS.find((i) => i.category === cat)!;

      selectedAcrossAll.push(match);
    }

    const now = Date.now();
    return selectedAcrossAll.map((item, idx) => ({
      id: `idea-heur-${now}-${idx + 1}`,
      title: item.title,
      category: item.category,
      description: item.description,
      tags: item.tags,
    }));
  }

  // 2. Standard mode (prioritize focus category or take slice of 3)
  let candidates = [...poolFiltered];

  if (input.focusCategory) {
    const focus = input.focusCategory.toLowerCase();
    const focused = candidates.filter((c) => c.category === focus);
    const others = candidates.filter((c) => c.category !== focus);
    candidates = [...focused, ...others];
  }

  // If candidates exhausted, fall back to default pool
  if (candidates.length < 3) {
    for (const def of DEFAULT_IDEAS) {
      if (
        !existingSet.has(def.title.toLowerCase()) &&
        !candidates.some((c) => c.title === def.title)
      ) {
        candidates.push(def);
      }
    }
  }

  // Return 3 ideas for standard calls
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
