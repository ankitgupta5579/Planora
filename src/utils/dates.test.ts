process.env.TZ = 'Asia/Kolkata';

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLocalDate, formatLocalDate, calculateDaysRemaining } from './dates';

const TEST_ZONES = ['Asia/Kolkata', 'America/Los_Angeles', 'Pacific/Auckland', 'UTC'];

test('parseLocalDate: validates dates and rejects impossible dates like 2026-02-31', () => {
  assert.equal(parseLocalDate(''), null);
  assert.equal(parseLocalDate('invalid-date'), null);
  assert.equal(parseLocalDate('2026-02-31'), null, '2026-02-31 must be rejected');
  assert.equal(parseLocalDate('2026-04-31'), null, 'April only has 30 days');
  assert.equal(parseLocalDate('2026-13-01'), null, 'Month 13 is invalid');

  const valid = parseLocalDate('2026-11-28');
  assert.ok(valid);
  assert.equal(valid.getFullYear(), 2026);
  assert.equal(valid.getMonth(), 10); // November is month index 10
  assert.equal(valid.getDate(), 28);
  assert.equal(valid.getHours(), 0);
  assert.equal(valid.getMinutes(), 0);
});

test('calculateDaysRemaining: accurate across multiple timezones and DST boundaries', () => {
  for (const zone of TEST_ZONES) {
    process.env.TZ = zone;

    // Simulate today = 2026-10-31 00:09 local time
    const fromDate = new Date(2026, 9, 31, 0, 9, 0, 0);

    // Event date = 2026-11-28 (28 days later)
    const days28 = calculateDaysRemaining('2026-11-28', fromDate);
    assert.equal(days28, 28, `Expected 28 days in zone ${zone}, got ${days28}`);

    // Same day = 0
    const sameDay = calculateDaysRemaining('2026-10-31', fromDate);
    assert.equal(sameDay, 0, `Expected 0 days for same day in zone ${zone}`);

    // Tomorrow = 1
    const tomorrow = calculateDaysRemaining('2026-11-01', fromDate);
    assert.equal(tomorrow, 1, `Expected 1 day for tomorrow in zone ${zone}`);

    // Yesterday = -1
    const yesterday = calculateDaysRemaining('2026-10-30', fromDate);
    assert.equal(yesterday, -1, `Expected -1 day for yesterday in zone ${zone}`);

    // DST Boundary test: US clocks change on Nov 1, 2026. From Oct 31 to Nov 5 is 5 days
    const daysAcrossDst = calculateDaysRemaining('2026-11-05', fromDate);
    assert.equal(daysAcrossDst, 5, `Expected exactly 5 days across DST boundary in zone ${zone}`);

    // Invalid dates return 0 safely
    assert.equal(calculateDaysRemaining('', fromDate), 0);
    assert.equal(calculateDaysRemaining('garbage', fromDate), 0);
    assert.equal(calculateDaysRemaining('2026-02-31', fromDate), 0);
  }
});

test('formatLocalDate: preserves exact day without UTC shifting in any zone', () => {
  for (const zone of TEST_ZONES) {
    process.env.TZ = zone;
    const formatted = formatLocalDate(
      '2026-11-28',
      {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      },
      'en-US'
    );
    assert.equal(formatted, '11/28/2026', `Formatted date shifted in zone ${zone}: ${formatted}`);
  }
});
