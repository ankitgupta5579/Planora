export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate' | 'anniversary';

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

export interface BudgetItem {
  id: string;
  category:
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
  title: string;
  allocatedAmount: number;
  actualAmount: number;
  isPaid: boolean;
  notes?: string;
}

export interface TimelineItem {
  id: string;
  phase: 'planning_early' | 'planning_mid' | 'planning_final' | 'week_of' | 'day_of';
  timeLabel?: string; // e.g. "T-180 days" or "14:30"
  title: string;
  description: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  quoteAmount: number;
  depositPaid: number;
  status: 'researching' | 'contacted' | 'booked' | 'contract_signed' | 'declined';
  notes?: string;
  checklist: string[];
}

export interface PersonalizedIdea {
  id: string;
  title: string;
  category:
    'theme_decor' | 'food_beverage' | 'entertainment' | 'guest_experience' | 'sustainable_tip';
  description: string;
  tags: string[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface GuestItem {
  id: string;
  name: string;
  email?: string;
  group: 'family' | 'friends' | 'colleagues' | 'vip' | 'general';
  rsvpStatus: 'attending' | 'declined' | 'pending';
  plusOnes: number;
  dietaryRestrictions?: string;
  tableNumber?: string;
}

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

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionSuggestions?: string[];
}
