import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHeuristicEventPlan } from './fallbackGenerator';
import { EventType, EventVibe } from '../types/event';

const EVENT_TYPES: EventType[] = ['wedding', 'birthday', 'community', 'corporate', 'anniversary'];
const EVENT_VIBES: EventVibe[] = [
  'elegant',
  'rustic',
  'modern',
  'bohemian',
  'festive',
  'casual',
  'futuristic',
  'vintage',
  'cozy',
];

test('fallbackGenerator generates valid complete plans for all event types and vibes combination', () => {
  for (const eventType of EVENT_TYPES) {
    for (const vibe of EVENT_VIBES) {
      const totalBudget = 18500;
      const plan = generateHeuristicEventPlan({
        title: `Test ${eventType} ${vibe} Celebration`,
        type: eventType,
        vibe,
        date: '2026-12-25',
        location: 'Central Plaza',
        guestCount: 150,
        totalBudget,
        currency: '$',
      });

      // Verify structure and integrity
      assert.ok(plan.id, `Plan for ${eventType}/${vibe} should have an id`);
      assert.equal(plan.type, eventType);
      assert.equal(plan.vibe, vibe);
      assert.equal(plan.totalBudget, totalBudget);
      assert.ok(plan.themeDescription.length > 10, 'Theme description should be non-empty');
      assert.ok(plan.colorPalette.length >= 4, 'Color palette should have multiple colors');
      assert.ok(plan.timelineItems.length >= 5, 'Timeline should have milestones');
      assert.ok(plan.vendors.length >= 2, 'Vendors should be populated');
      assert.ok(plan.ideas.length >= 3, 'Ideas should be populated');

      // Crucial: Budget items must sum EXACTLY to the total budget
      const allocatedSum = plan.budgetItems.reduce((sum, b) => sum + b.allocatedAmount, 0);
      assert.equal(
        allocatedSum,
        totalBudget,
        `For ${eventType}/${vibe}, budget items sum (${allocatedSum}) must equal totalBudget (${totalBudget})`
      );
    }
  }
});

test('fallbackGenerator handles edge budget amounts cleanly and sums exactly', () => {
  const edgeBudgets = [1, 99, 12345, 99999, 500000];
  for (const budget of edgeBudgets) {
    const plan = generateHeuristicEventPlan({
      title: 'Budget Edge Check',
      type: 'wedding',
      vibe: 'rustic',
      date: '2027-01-01',
      location: 'Rustic Barn',
      guestCount: 80,
      totalBudget: budget,
    });
    const allocatedSum = plan.budgetItems.reduce((sum, b) => sum + b.allocatedAmount, 0);
    assert.equal(allocatedSum, budget, `Sum of allocations must equal ${budget}`);
  }
});

test('fallbackGenerator handles edge guest count values cleanly', () => {
  const guestCounts = [1, 2, 50, 500, 5000];
  for (const count of guestCounts) {
    const plan = generateHeuristicEventPlan({
      title: 'Guest Edge Check',
      type: 'community',
      vibe: 'festive',
      date: '2026-11-01',
      location: 'City Park',
      guestCount: count,
      totalBudget: 10000,
    });
    assert.equal(plan.guestCount, count);
    assert.ok(plan.budgetItems.length > 0);
  }
});
