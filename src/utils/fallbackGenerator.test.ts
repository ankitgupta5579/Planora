import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHeuristicEventPlan } from './fallbackGenerator';
import { EventType } from '../types/event';

const EVENT_TYPES: EventType[] = ['wedding', 'birthday', 'community', 'corporate', 'anniversary'];

test('fallbackGenerator generates valid complete plans for every supported event type', () => {
  for (const eventType of EVENT_TYPES) {
    const totalBudget = 18500;
    const plan = generateHeuristicEventPlan({
      title: `Test ${eventType} Gala`,
      type: eventType,
      vibe: 'elegant',
      date: '2026-12-25',
      location: 'Central Plaza',
      guestCount: 150,
      totalBudget,
      currency: '$',
    });

    // Check basic validity
    assert.ok(plan.id, `Plan for ${eventType} should have an id`);
    assert.equal(plan.type, eventType);
    assert.equal(plan.totalBudget, totalBudget);
    assert.ok(plan.themeDescription.length > 10, 'Theme description should be non-empty');
    assert.ok(plan.colorPalette.length >= 4, 'Color palette should have multiple colors');
    assert.ok(plan.timelineItems.length >= 5, 'Timeline should have milestones');
    assert.ok(plan.vendors.length >= 2, 'Vendors should be populated');
    assert.ok(plan.ideas.length >= 3, 'Ideas should be populated');

    // Budget items must sum EXACTLY to the total budget
    const allocatedSum = plan.budgetItems.reduce((sum, b) => sum + b.allocatedAmount, 0);
    assert.equal(
      allocatedSum,
      totalBudget,
      `For ${eventType}, budget items sum (${allocatedSum}) must equal totalBudget (${totalBudget})`
    );
  }
});

test('fallbackGenerator handles edge budget amounts cleanly and sums exactly', () => {
  const edgeBudgets = [12345, 999, 50000, 100];
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
