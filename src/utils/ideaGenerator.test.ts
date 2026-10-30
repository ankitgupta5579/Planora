import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHeuristicIdeas } from './ideaGenerator';

const EVENT_TYPES = ['wedding', 'birthday', 'corporate', 'community', 'anniversary'];

test('generateHeuristicIdeas: generates exactly 3 distinct ideas with valid categories for every event type', () => {
  const validCategories = new Set([
    'theme_decor',
    'food_beverage',
    'entertainment',
    'guest_experience',
    'sustainable_tip',
  ]);

  for (const type of EVENT_TYPES) {
    const ideas = generateHeuristicIdeas({
      type,
      vibe: 'festive',
      location: 'Central Plaza',
      guestCount: 80,
    });

    assert.equal(ideas.length, 3, `Expected 3 ideas for ${type}`);
    for (const idea of ideas) {
      assert.ok(idea.id, 'Idea must have an ID');
      assert.ok(idea.title && idea.title.length > 3, 'Idea must have a descriptive title');
      assert.ok(!idea.title.includes('AI Curated'), 'Title must not include AI Curated prefix');
      assert.ok(!idea.title.includes('BESPOKE'), 'Title must not be in ALL CAPS');
      assert.ok(validCategories.has(idea.category), `Category ${idea.category} must be in whitelist`);
      assert.ok(idea.description && idea.description.length > 10, 'Description must be informative');
      assert.ok(Array.isArray(idea.tags) && idea.tags.length >= 2, 'Tags must have at least 2 items');
    }
  }
});

test('generateHeuristicIdeas: prioritizes focus category when provided', () => {
  const ideas = generateHeuristicIdeas({
    type: 'wedding',
    focusCategory: 'sustainable_tip',
  });

  assert.equal(ideas.length, 3);
  assert.equal(ideas[0].category, 'sustainable_tip');
});

test('generateHeuristicIdeas: avoids duplicate existing titles', () => {
  const existing = ['Acoustic Golden-Hour Prelude', 'Artisan Culinary Tasting Station'];
  const ideas = generateHeuristicIdeas({
    type: 'wedding',
    existingTitles: existing,
  });

  assert.equal(ideas.length, 3);
  for (const idea of ideas) {
    assert.ok(!existing.includes(idea.title), `Idea title ${idea.title} should not be in existing list`);
  }
});
