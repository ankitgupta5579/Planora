import test from 'node:test';
import assert from 'node:assert';
import {
  generatePlannerInsights,
  MAX_INSIGHTS_DISPLAYED,
} from './plannerInsights';
import { EventPlan } from '../types/event';

function createBasePlan(overrides: Partial<EventPlan> = {}): EventPlan {
  return {
    id: 'test-event-1',
    title: 'Test Celebration',
    date: '2026-11-30',
    type: 'wedding',
    vibe: 'elegant',
    location: 'San Francisco, CA',
    guestCount: 100,
    totalBudget: 20000,
    currency: '$',
    themeDescription: 'Classic elegance',
    colorPalette: [],
    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        title: 'Venue Rental',
        allocatedAmount: 18000,
        actualAmount: 5000,
        isPaid: false,
      },
      {
        id: 'b-2',
        category: 'contingency',
        title: 'Contingency Fund',
        allocatedAmount: 2000,
        actualAmount: 0,
        isPaid: false,
      },
    ],
    timelineItems: [
      {
        id: 't-1',
        title: 'Initial Concept',
        description: 'Establish theme',
        phase: 'planning_early',
        timeLabel: 'Month 1',
        completed: true,
      },
      {
        id: 't-2',
        title: 'Setup Tables',
        description: 'Arrange reception',
        phase: 'day_of',
        timeLabel: '10:00 AM',
        completed: false,
      },
    ],
    vendors: [
      {
        id: 'v-1',
        name: 'Sunset Venue',
        category: 'venue',
        status: 'booked',
        quoteAmount: 10000,
        depositPaid: 10000,
        checklist: [],
      },
    ],
    ideas: [],
    guests: [
      {
        id: 'g-1',
        name: 'Alice',
        email: 'alice@example.com',
        group: 'friends',
        rsvpStatus: 'attending',
        plusOnes: 0,
        dietaryRestrictions: 'none',
      },
      {
        id: 'g-2',
        name: 'Bob',
        email: 'bob@example.com',
        group: 'friends',
        rsvpStatus: 'attending',
        plusOnes: 29,
        dietaryRestrictions: 'vegan',
      },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

test('plannerInsights: returns healthy on-track insight when no warnings exist', () => {
  const plan = createBasePlan({
    date: '2026-12-01',
  });
  const today = new Date(2026, 9, 1); // 61 days remaining
  const insights = generatePlannerInsights(plan, today);

  assert.ok(insights.length > 0);
  const onTrack = insights.find((i) => i.id === 'insight-on-track');
  assert.ok(onTrack, 'Should include on-track insight');
  assert.strictEqual(onTrack.severity, 'success');
});

test('plannerInsights: detects critical budget cap overflow', () => {
  const plan = createBasePlan({
    totalBudget: 10000,
    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        title: 'Venue',
        allocatedAmount: 10000,
        actualAmount: 12500, // over by 2500
        isPaid: true,
      },
    ],
  });
  const today = new Date(2026, 10, 1); // 29 days left
  const insights = generatePlannerInsights(plan, today);

  const overflow = insights.find((i) => i.id === 'insight-budget-overflow');
  assert.ok(overflow, 'Should detect total budget cap overflow');
  assert.strictEqual(overflow.severity, 'critical');
  assert.strictEqual(overflow.action?.tab, 'budget');
});

test('plannerInsights: detects high budget utilization pace when days <= 30 and spend >= 85%', () => {
  const plan = createBasePlan({
    date: '2026-11-20',
    totalBudget: 10000,
    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        title: 'Venue',
        allocatedAmount: 10000,
        actualAmount: 8800, // 88%
        isPaid: true,
      },
    ],
  });
  const today = new Date(2026, 10, 1); // 19 days remaining
  const insights = generatePlannerInsights(plan, today);

  const paceWarning = insights.find((i) => i.id === 'insight-budget-pace-warning');
  assert.ok(paceWarning, 'Should trigger high budget utilization pace warning');
  assert.strictEqual(paceWarning.severity, 'warning');
});

test('plannerInsights: detects over-allocation and under-allocation', () => {
  // Over-allocated
  const overPlan = createBasePlan({
    totalBudget: 10000,
    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        title: 'Venue',
        allocatedAmount: 12000,
        actualAmount: 0,
        isPaid: false,
      },
    ],
  });
  const today = new Date(2026, 9, 1);
  const overInsights = generatePlannerInsights(overPlan, today);
  const overAlloc = overInsights.find((i) => i.id === 'insight-over-allocated');
  assert.ok(overAlloc, 'Should trigger over-allocated warning');
  assert.strictEqual(overAlloc.severity, 'warning');

  // Under-allocated
  const underPlan = createBasePlan({
    totalBudget: 10000,
    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        title: 'Venue',
        allocatedAmount: 7000,
        actualAmount: 0,
        isPaid: false,
      },
    ],
  });
  const underInsights = generatePlannerInsights(underPlan, today);
  const underAlloc = underInsights.find((i) => i.id === 'insight-under-allocated');
  assert.ok(underAlloc, 'Should trigger under-allocated info');
  assert.strictEqual(underAlloc.severity, 'info');
});

test('plannerInsights: triggers early contingency drawdown warning', () => {
  const plan = createBasePlan({
    date: '2026-12-15',
    budgetItems: [
      {
        id: 'b-contingency',
        category: 'contingency',
        title: 'Emergency Fund',
        allocatedAmount: 2000,
        actualAmount: 1200, // 60% drawn down
        isPaid: false,
      },
    ],
  });
  const today = new Date(2026, 10, 1); // 44 days remaining (>= 30 days)
  const insights = generatePlannerInsights(plan, today);

  const contingencyInsight = insights.find((i) => i.id === 'insight-contingency-drawdown');
  assert.ok(contingencyInsight, 'Should detect early contingency drawdown');
  assert.strictEqual(contingencyInsight.severity, 'warning');
});

test('plannerInsights: detects low RSVP response rate when days <= 45', () => {
  const plan = createBasePlan({
    date: '2026-11-20',
    guestCount: 200,
    guests: [
      {
        id: 'g-1',
        name: 'Guest A',
        email: 'a@example.com',
        group: 'general',
        rsvpStatus: 'attending',
        plusOnes: 0,
        dietaryRestrictions: 'none',
      }, // 1 confirmed out of 200 (< 25%)
    ],
  });
  const today = new Date(2026, 10, 1); // 19 days remaining
  const insights = generatePlannerInsights(plan, today);

  const guestInsight = insights.find((i) => i.id === 'insight-guest-response-lag');
  assert.ok(guestInsight, 'Should flag low RSVP response rate');
  assert.strictEqual(guestInsight.severity, 'warning');
  assert.strictEqual(guestInsight.action?.tab, 'guests');
});

test('plannerInsights: handles community event with volunteer mobilization rather than 1:1 RSVP lag', () => {
  const plan = createBasePlan({
    type: 'community',
    date: '2026-11-20',
    guestCount: 650,
    guests: [
      {
        id: 'g-1',
        name: 'Mayor',
        email: 'mayor@city.gov',
        group: 'vip',
        rsvpStatus: 'attending',
        plusOnes: 0,
        dietaryRestrictions: 'none',
      },
    ],
  });
  const today = new Date(2026, 10, 1);
  const insights = generatePlannerInsights(plan, today);

  const rsvpLag = insights.find((i) => i.id === 'insight-guest-response-lag');
  assert.strictEqual(rsvpLag, undefined, 'Should not show rigid 1:1 RSVP lag for open community festivals');

  const volInsight = insights.find((i) => i.id === 'insight-community-volunteers');
  assert.ok(volInsight, 'Should suggest volunteer roster mobilization instead');
  assert.strictEqual(volInsight.severity, 'warning');
});

test('plannerInsights: detects unbooked vendors when days <= 30', () => {
  const plan = createBasePlan({
    date: '2026-11-15',
    vendors: [
      {
        id: 'v-1',
        name: 'DJ Beats',
        category: 'music',
        status: 'researching',
        quoteAmount: 1500,
        depositPaid: 0,
        checklist: [],
      },
    ],
  });
  const today = new Date(2026, 10, 1); // 14 days remaining
  const insights = generatePlannerInsights(plan, today);

  const vendorInsight = insights.find((i) => i.id === 'insight-unbooked-vendors');
  assert.ok(vendorInsight, 'Should warn about unbooked vendors');
  assert.strictEqual(vendorInsight.severity, 'warning');
  assert.strictEqual(vendorInsight.action?.tab, 'vendors');
});

test('plannerInsights: handles event day-of (daysRemaining === 0)', () => {
  const plan = createBasePlan({
    date: '2026-10-31',
    timelineItems: [
      {
        id: 't-day',
        title: 'Morning Setup',
        description: 'Vendor load-in',
        phase: 'day_of',
        timeLabel: '8:00 AM',
        completed: false,
      },
    ],
  });
  const today = new Date(2026, 9, 31); // same day
  const insights = generatePlannerInsights(plan, today);

  const dayOfCelebration = insights.find((i) => i.id === 'insight-day-of-celebration');
  assert.ok(dayOfCelebration, 'Should celebrate day-of event');
  assert.strictEqual(dayOfCelebration.severity, 'success');

  const pendingMilestone = insights.find((i) => i.id === 'insight-day-of-incomplete');
  assert.ok(pendingMilestone, 'Should notify about pending day-of milestones');
});

test('plannerInsights: handles past event (daysRemaining < 0)', () => {
  const plan = createBasePlan({
    date: '2026-10-20',
    vendors: [
      {
        id: 'v-1',
        name: 'Caterer',
        category: 'catering',
        status: 'booked',
        quoteAmount: 5000,
        depositPaid: 2000, // 3000 balance remaining
        checklist: [],
      },
    ],
  });
  const today = new Date(2026, 9, 31); // 11 days past
  const insights = generatePlannerInsights(plan, today);

  const concluded = insights.find((i) => i.id === 'insight-event-concluded');
  assert.ok(concluded, 'Should note event is concluded');

  const balance = insights.find((i) => i.id === 'insight-post-vendor-balance');
  assert.ok(balance, 'Should flag post-event unpaid vendor balances');
  assert.strictEqual(balance.severity, 'warning');
});

test('plannerInsights: caps output at MAX_INSIGHTS_DISPLAYED and sorts by severity', () => {
  const plan = createBasePlan({
    date: '2026-11-05', // 5 days left
    totalBudget: 10000,
    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        title: 'Venue',
        allocatedAmount: 12000, // over-allocated
        actualAmount: 11000, // over-budget
        isPaid: true,
      },
      {
        id: 'b-2',
        category: 'contingency',
        title: 'Contingency',
        allocatedAmount: 2000,
        actualAmount: 1500,
        isPaid: false,
      },
    ],
    timelineItems: [
      {
        id: 't-day',
        title: 'Run of show',
        description: 'Execute program',
        phase: 'day_of',
        timeLabel: '9:00 AM',
        completed: false,
      },
    ],
    vendors: [
      {
        id: 'v-1',
        name: 'Photo',
        category: 'photography',
        status: 'researching',
        quoteAmount: 3000,
        depositPaid: 500,
        checklist: [],
      },
    ],
    guestCount: 200,
    guests: [],
  });

  const today = new Date(2026, 10, 1);
  const insights = generatePlannerInsights(plan, today);

  assert.ok(insights.length <= MAX_INSIGHTS_DISPLAYED);
  assert.strictEqual(insights[0].severity, 'critical', 'First item should be highest severity (critical)');
});

test('plannerInsights: cash commitment rule triggers warning when uncommitted < 10% and days <= 45', () => {
  // totalBudget = 20000, 10% = 2000.
  // spent = 12000, vendor balances = 7000 => uncommitted = 20000 - 12000 - 7000 = 1000 (< 2000)
  // daysRemaining = 20 (<= 45)
  const plan = createBasePlan({
    date: '2026-11-20',
    totalBudget: 20000,
    budgetItems: [
      { id: 'b1', category: 'venue', title: 'Venue', allocatedAmount: 12000, actualAmount: 12000, isPaid: true },
      { id: 'b2', category: 'other', title: 'Other', allocatedAmount: 8000, actualAmount: 0, isPaid: false },
    ],
    vendors: [
      { id: 'v1', category: 'Catering', name: 'Chef Co', quoteAmount: 10000, depositPaid: 3000, status: 'booked', checklist: [] }, // balance = 7000
    ],
  });

  const today = new Date(2026, 10, 1); // 19 days remaining
  const insights = generatePlannerInsights(plan, today);
  const cashInsight = insights.find((i) => i.id === 'insight-cash-commitment');

  assert.ok(cashInsight, 'Expected cash commitment insight to trigger');
  assert.strictEqual(cashInsight.severity, 'warning');
  assert.strictEqual(
    cashInsight.message,
    'Only $1,000 is uncommitted after $7,000 in vendor balances. Hold the remainder for contingencies.'
  );
});

test('plannerInsights: cash commitment rule does NOT trigger when uncommitted >= 10% or days > 45', () => {
  // uncommitted = 20000 - 5000 - 2000 = 13000 (> 2000)
  const planHealthy = createBasePlan({
    date: '2026-11-20',
    totalBudget: 20000,
    budgetItems: [
      { id: 'b1', category: 'venue', title: 'Venue', allocatedAmount: 10000, actualAmount: 5000, isPaid: true },
      { id: 'b2', category: 'other', title: 'Other', allocatedAmount: 10000, actualAmount: 0, isPaid: false },
    ],
    vendors: [
      { id: 'v1', category: 'Catering', name: 'Chef Co', quoteAmount: 4000, depositPaid: 2000, status: 'booked', checklist: [] },
    ],
  });

  const today = new Date(2026, 10, 1);
  const insights = generatePlannerInsights(planHealthy, today);
  assert.strictEqual(insights.some((i) => i.id === 'insight-cash-commitment'), false);

  // Far out: daysRemaining = 90 (> 45) even if buffer is tight
  const planFar = createBasePlan({
    date: '2027-02-01',
    totalBudget: 20000,
    budgetItems: [
      { id: 'b1', category: 'venue', title: 'Venue', allocatedAmount: 19500, actualAmount: 19500, isPaid: true },
      { id: 'b2', category: 'other', title: 'Other', allocatedAmount: 500, actualAmount: 0, isPaid: false },
    ],
  });
  const insightsFar = generatePlannerInsights(planFar, today);
  assert.strictEqual(insightsFar.some((i) => i.id === 'insight-cash-commitment'), false);
});

test('plannerInsights: RSVP deadline rule triggers warning when past deadline with pending RSVPs', () => {
  // Deadline was 2026-10-10, today is 2026-10-15 (5 days past deadline), event is 2026-11-28
  const plan = createBasePlan({
    date: '2026-11-28',
    rsvpDeadline: '2026-10-10',
    guests: [
      { id: 'g1', name: 'Alice', group: 'friends', rsvpStatus: 'attending', plusOnes: 0 },
      { id: 'g2', name: 'Bob', group: 'family', rsvpStatus: 'pending', plusOnes: 0 },
      { id: 'g3', name: 'Charlie', group: 'family', rsvpStatus: 'pending', plusOnes: 1 },
    ],
  });

  const today = new Date(2026, 9, 15); // Oct 15, 2026 => 5 days past Oct 10
  const insights = generatePlannerInsights(plan, today);
  const rsvpInsight = insights.find((i) => i.id === 'insight-rsvp-deadline-passed');

  assert.ok(rsvpInsight, 'Expected RSVP deadline passed insight');
  assert.strictEqual(rsvpInsight.severity, 'warning');
  assert.strictEqual(rsvpInsight.message, "2 guests haven't responded, 5 days past the RSVP deadline.");
  assert.strictEqual(rsvpInsight.action?.tab, 'guests');
});

test('plannerInsights: RSVP deadline singular phrasing (1 guest, 1 day)', () => {
  // Deadline was 2026-10-14, today is 2026-10-15 (1 day past), 1 pending guest
  const plan = createBasePlan({
    date: '2026-11-28',
    rsvpDeadline: '2026-10-14',
    guests: [
      { id: 'g1', name: 'Alice', group: 'friends', rsvpStatus: 'attending', plusOnes: 0 },
      { id: 'g2', name: 'Bob', group: 'family', rsvpStatus: 'pending', plusOnes: 0 },
    ],
  });

  const today = new Date(2026, 9, 15);
  const insights = generatePlannerInsights(plan, today);
  const rsvpInsight = insights.find((i) => i.id === 'insight-rsvp-deadline-passed');

  assert.ok(rsvpInsight);
  assert.strictEqual(rsvpInsight.message, "1 guest hasn't responded, 1 day past the RSVP deadline.");
});

test('plannerInsights: RSVP deadline does NOT trigger when before deadline, zero pending, or no deadline', () => {
  // Before deadline
  const planBefore = createBasePlan({
    date: '2026-11-28',
    rsvpDeadline: '2026-10-25',
    guests: [{ id: 'g1', name: 'Bob', group: 'family', rsvpStatus: 'pending', plusOnes: 0 }],
  });
  const today = new Date(2026, 9, 15); // 10 days before deadline
  assert.strictEqual(
    generatePlannerInsights(planBefore, today).some((i) => i.id === 'insight-rsvp-deadline-passed'),
    false
  );

  // All responded (zero pending)
  const planAllResponded = createBasePlan({
    date: '2026-11-28',
    rsvpDeadline: '2026-10-10',
    guests: [{ id: 'g1', name: 'Bob', group: 'family', rsvpStatus: 'attending', plusOnes: 0 }],
  });
  assert.strictEqual(
    generatePlannerInsights(planAllResponded, today).some((i) => i.id === 'insight-rsvp-deadline-passed'),
    false
  );

  // No deadline set
  const planNoDeadline = createBasePlan({
    date: '2026-11-28',
    guests: [{ id: 'g1', name: 'Bob', group: 'family', rsvpStatus: 'pending', plusOnes: 0 }],
  });
  assert.strictEqual(
    generatePlannerInsights(planNoDeadline, today).some((i) => i.id === 'insight-rsvp-deadline-passed'),
    false
  );
});

test('plannerInsights: allergy safety rule triggers info insight for guests with allergies', () => {
  const plan = createBasePlan({
    date: '2026-11-28',
    guests: [
      { id: 'g1', name: 'Sam', group: 'friends', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'Nut Allergy' },
      { id: 'g2', name: 'Tara', group: 'family', rsvpStatus: 'attending', plusOnes: 1, dietaryRestrictions: 'Shellfish allergy' },
      { id: 'g3', name: 'Uma', group: 'family', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'Vegetarian' },
    ],
  });

  const today = new Date(2026, 9, 15);
  const insights = generatePlannerInsights(plan, today);
  const allergyInsight = insights.find((i) => i.id === 'insight-allergy-safety');

  assert.ok(allergyInsight, 'Expected allergy safety insight');
  assert.strictEqual(allergyInsight.severity, 'info');
  assert.ok(allergyInsight.message.includes('2 guests with allergies'));
  assert.ok(allergyInsight.message.includes('Nut Allergy'));
  assert.ok(allergyInsight.message.includes('Shellfish allergy'));
  assert.ok(allergyInsight.message.includes('confirm with your caterer'));
  assert.strictEqual(allergyInsight.action?.tab, 'vendors');
});

test('plannerInsights: allergy safety rule does NOT trigger when no allergies present', () => {
  const plan = createBasePlan({
    date: '2026-11-28',
    guests: [
      { id: 'g1', name: 'Uma', group: 'family', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'Vegetarian' },
      { id: 'g2', name: 'Vic', group: 'friends', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'Gluten-Free' },
      { id: 'g3', name: 'Will', group: 'friends', rsvpStatus: 'attending', plusOnes: 0, dietaryRestrictions: 'None' },
    ],
  });

  const today = new Date(2026, 9, 15);
  const insights = generatePlannerInsights(plan, today);
  assert.strictEqual(insights.some((i) => i.id === 'insight-allergy-safety'), false);
});

test('plannerInsights: unbooked vendors singular phrasing ("1 vendor remains")', () => {
  const plan = createBasePlan({
    date: '2026-11-20',
    vendors: [
      { id: 'v1', name: 'Sunset DJ', category: 'Music', status: 'contacted', quoteAmount: 1000, depositPaid: 0, checklist: [] },
      { id: 'v2', name: 'Grand Venue', category: 'Venue', status: 'contract_signed', quoteAmount: 5000, depositPaid: 5000, checklist: [] },
    ],
  });

  const today = new Date(2026, 10, 1); // 19 days remaining (<= 30)
  const insights = generatePlannerInsights(plan, today);
  const vendorInsight = insights.find((i) => i.id === 'insight-unbooked-vendors');

  assert.ok(vendorInsight);
  assert.ok(vendorInsight.message.includes('1 vendor (Sunset DJ) remains uncontracted with 19 days to go.'));
});
