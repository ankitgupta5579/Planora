import test from 'node:test';
import assert from 'node:assert/strict';
import { detectTopic, generateOfflineChatReply } from './chatFallback';

test('detectTopic: recognises the weather contingency question', () => {
  assert.equal(detectTopic('What should our bad weather contingency checklist be?'), 'weather');
});

test('detectTopic: routes common planner questions to the right topic', () => {
  assert.equal(
    detectTopic('How to cut 15% from catering without sacrificing quality?'),
    'catering'
  );
  assert.equal(detectTopic('Draft questions to ask before signing a venue contract'), 'venue');
  assert.equal(detectTopic('Suggest 3 icebreaker games suitable for our guests'), 'icebreakers');
  assert.equal(detectTopic('Give me a timeline for the next 6 months'), 'timeline');
  assert.equal(detectTopic('How can I save money on costs?'), 'budget');
});

test('detectTopic: falls back to general for unrelated or empty text', () => {
  assert.equal(detectTopic('hello there'), 'general');
  assert.equal(detectTopic(''), 'general');
});

test('generateOfflineChatReply: answers the question asked, not one fixed sentence', () => {
  const weather = generateOfflineChatReply('bad weather plan?');
  const venue = generateOfflineChatReply('venue contract questions');
  assert.notEqual(weather.reply, venue.reply);
  assert.match(weather.reply, /tent|backup/i);
  assert.match(venue.reply, /deposit|cancellation/i);
});

test('generateOfflineChatReply: uses event context in the answer', () => {
  const r = generateOfflineChatReply('catering tips', { type: 'wedding', guestCount: 120 });
  assert.match(r.reply, /120 guests/);
});

test('generateOfflineChatReply: budget answer shows totals with currency', () => {
  const r = generateOfflineChatReply('how can I cut costs', {
    totalBudget: 28000,
    totalAllocated: 20000,
    totalSpent: 5000,
    currency: '$',
  });
  assert.match(r.reply, /\$28,000/);
  assert.match(r.reply, /\$8,000 unallocated/);
});

test('generateOfflineChatReply: always returns follow-up suggestions and handles missing context', () => {
  for (const q of [
    'weather',
    'catering',
    'venue',
    'games',
    'timeline',
    'budget',
    'vendor',
    'guest list',
    'decor',
    'music',
    'xyz',
  ]) {
    const r = generateOfflineChatReply(q);
    assert.ok(r.reply.length > 40, q);
    assert.ok(r.suggestions.length >= 2, q);
  }
});
