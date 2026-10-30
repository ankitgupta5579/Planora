import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePlanInput,
  validateChatInput,
  validateInviteSpeechInput,
  validateVendorInquiryInput,
  validateIdeasInput,
} from './validate';

test('validatePlanInput: valid input passes cleanly', () => {
  const result = validatePlanInput({
    title: 'Autumn Garden Wedding',
    type: 'wedding',
    vibe: 'bohemian',
    date: '2026-10-15',
    location: 'Napa Valley, CA',
    guestCount: 120,
    totalBudget: 25000,
    currency: '$',
    specialRequests: 'Vegan dessert table',
  });

  assert.equal(result.valid, true);
  assert.equal(result.data?.title, 'Autumn Garden Wedding');
  assert.equal(result.data?.guestCount, 120);
  assert.equal(result.data?.totalBudget, 25000);
});

test('validatePlanInput: rejects missing or empty required fields', () => {
  const missingTitle = validatePlanInput({
    type: 'wedding',
    date: '2026-10-15',
    location: 'City Hall',
    guestCount: 50,
    totalBudget: 5000,
  });
  assert.equal(missingTitle.valid, false);
  assert.match(missingTitle.error!, /title/i);

  const missingDate = validatePlanInput({
    title: 'Birthday Bash',
    type: 'birthday',
    location: 'City Hall',
    guestCount: 50,
    totalBudget: 5000,
  });
  assert.equal(missingDate.valid, false);
  assert.match(missingDate.error!, /date/i);
});

test('validatePlanInput: rejects invalid event types outside whitelist', () => {
  const badType = validatePlanInput({
    title: 'Spaceship Launch',
    type: 'space_voyage', // Not in whitelist
    date: '2026-10-15',
    location: 'Launchpad',
    guestCount: 50,
    totalBudget: 5000,
  });
  assert.equal(badType.valid, false);
  assert.match(badType.error!, /must be one of/i);
});

test('validatePlanInput: rejects oversized strings', () => {
  const longTitle = 'A'.repeat(101);
  const result = validatePlanInput({
    title: longTitle,
    type: 'wedding',
    date: '2026-10-15',
    location: 'Park',
    guestCount: 50,
    totalBudget: 5000,
  });
  assert.equal(result.valid, false);
  assert.match(result.error!, /exceed 100 characters/i);

  const longRequests = 'A'.repeat(501);
  const requestsResult = validatePlanInput({
    title: 'Valid Title',
    type: 'birthday',
    date: '2026-10-15',
    location: 'Park',
    guestCount: 50,
    totalBudget: 5000,
    specialRequests: longRequests,
  });
  assert.equal(requestsResult.valid, false);
  assert.match(requestsResult.error!, /exceed 500 characters/i);
});

test('validatePlanInput: rejects out-of-range guestCount and budget', () => {
  // guestCount < 1
  const zeroGuests = validatePlanInput({
    title: 'Private Event',
    type: 'corporate',
    date: '2026-10-15',
    location: 'Office',
    guestCount: 0,
    totalBudget: 5000,
  });
  assert.equal(zeroGuests.valid, false);
  assert.match(zeroGuests.error!, /between 1 and 5000/i);

  // guestCount > 5000
  const tooManyGuests = validatePlanInput({
    title: 'Massive Fest',
    type: 'community',
    date: '2026-10-15',
    location: 'Park',
    guestCount: 6000,
    totalBudget: 5000,
  });
  assert.equal(tooManyGuests.valid, false);
  assert.match(tooManyGuests.error!, /between 1 and 5000/i);

  // budget <= 0
  const zeroBudget = validatePlanInput({
    title: 'Free Fest',
    type: 'community',
    date: '2026-10-15',
    location: 'Park',
    guestCount: 50,
    totalBudget: 0,
  });
  assert.equal(zeroBudget.valid, false);
  assert.match(zeroBudget.error!, /greater than 0/i);
});

test('validateChatInput: checks message length and bounds', () => {
  const valid = validateChatInput({ message: 'How do I cut catering costs?' });
  assert.equal(valid.valid, true);

  const empty = validateChatInput({ message: '' });
  assert.equal(empty.valid, false);

  const oversized = validateChatInput({ message: 'X'.repeat(1001) });
  assert.equal(oversized.valid, false);
  assert.match(oversized.error!, /1000 characters/i);
});

test('validateInviteSpeechInput: enforces invitation/speech types', () => {
  const valid = validateInviteSpeechInput({
    requestType: 'speech',
    tone: 'humorous',
    recipient: 'Guests',
  });
  assert.equal(valid.valid, true);

  const invalid = validateInviteSpeechInput({
    requestType: 'poem', // invalid type
    tone: 'romantic',
    recipient: 'Guests',
  });
  assert.equal(invalid.valid, false);
});

test('validateVendorInquiryInput: validates vendor name and caps', () => {
  const valid = validateVendorInquiryInput({
    vendor: { name: 'Sunset Catering', category: 'Food' },
    event: { title: 'Party' },
  });
  assert.equal(valid.valid, true);

  const missing = validateVendorInquiryInput({
    vendor: { name: '' },
    event: {},
  });
  assert.equal(missing.valid, false);
});


test('validateIdeasInput: accepts valid event context and focus category', () => {
  const valid = validateIdeasInput({
    eventContext: {
      title: 'Beach Luau',
      type: 'birthday',
      vibe: 'festive',
      guestCount: 60,
      totalBudget: 4000,
    },
    focusCategory: 'entertainment',
    existingTitles: ['Fire Dancer Show', 'Ukulele Duo'],
  });

  assert.equal(valid.valid, true);
  assert.equal(valid.data?.focusCategory, 'entertainment');
  assert.equal(valid.data?.existingTitles?.length, 2);
  assert.equal(valid.data?.eventContext?.title, 'Beach Luau');
});

test('validateIdeasInput: rejects invalid focus category', () => {
  const invalid = validateIdeasInput({
    focusCategory: 'invalid_category_name',
  });
  assert.equal(invalid.valid, false);
  assert.match(invalid.error!, /focusCategory must be one of/i);
});

test('validateIdeasInput: caps existingTitles at 20 items and 100 characters each', () => {
  const manyTitles = Array.from({ length: 30 }, (_, i) => `Title ${i} ` + 'X'.repeat(150));
  const res = validateIdeasInput({
    existingTitles: manyTitles,
  });

  assert.equal(res.valid, true);
  assert.equal(res.data?.existingTitles?.length, 20);
  assert.ok(res.data!.existingTitles![0].length <= 100);
});

test('validateIdeasInput: rejects non-object body', () => {
  assert.equal(validateIdeasInput(null).valid, false);
  assert.equal(validateIdeasInput('string').valid, false);
});
