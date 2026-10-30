import test from 'node:test';
import assert from 'node:assert';
import { parseCsvLine, parseCsvGuestList } from './csvGuestParser';
import { GuestItem } from '../types/event';

test('csvParser: parseCsvLine correctly splits basic comma-delimited fields', () => {
  const line = 'Alice,alice@example.com,family,attending,1';
  const fields = parseCsvLine(line);
  assert.deepStrictEqual(fields, ['Alice', 'alice@example.com', 'family', 'attending', '1']);
});

test('csvParser: parseCsvLine handles quotes containing commas and escaped quotes', () => {
  const line = '"Smith, John",john@example.com,"""VIP"" Guest",attending,"vegan, nut-free"';
  const fields = parseCsvLine(line);
  assert.strictEqual(fields[0], 'Smith, John');
  assert.strictEqual(fields[1], 'john@example.com');
  assert.strictEqual(fields[2], '"VIP" Guest');
  assert.strictEqual(fields[3], 'attending');
  assert.strictEqual(fields[4], 'vegan, nut-free');
});

test('csvParser: parseCsvGuestList parses valid CSV and maps headers case-insensitively', () => {
  const csv = `Full Name,Email Address,Group,RSVP Status,Plus Ones,Dietary,Table
John Doe,john@test.com,Family,Yes,2,Gluten-Free,Table 1
Jane Roe,jane@test.com,Friends,No,0,None,Table 2
Sam Smith,sam@test.com,Work,Pending,1,Vegan,Table 3`;

  const result = parseCsvGuestList(csv);
  assert.strictEqual(result.totalRows, 3);
  assert.strictEqual(result.validCount, 3);
  assert.strictEqual(result.duplicateCount, 0);
  assert.strictEqual(result.errorCount, 0);

  const [first, second, third] = result.validGuests;
  assert.strictEqual(first.name, 'John Doe');
  assert.strictEqual(first.email, 'john@test.com');
  assert.strictEqual(first.group, 'family');
  assert.strictEqual(first.rsvpStatus, 'attending');
  assert.strictEqual(first.plusOnes, 2);
  assert.strictEqual(first.dietaryRestrictions, 'Gluten-Free');
  assert.strictEqual(first.tableNumber, 'Table 1');

  assert.strictEqual(second.rsvpStatus, 'declined');
  assert.strictEqual(second.group, 'friends');

  assert.strictEqual(third.group, 'colleagues');
  assert.strictEqual(third.rsvpStatus, 'pending');
});

test('csvParser: flags duplicate guests by email or name against existing list', () => {
  const existing: GuestItem[] = [
    {
      id: 'g-exist-1',
      name: 'Existing Guest',
      email: 'exist@example.com',
      group: 'friends',
      rsvpStatus: 'attending',
      plusOnes: 0,
    },
  ];

  const csv = `Name,Email,Group,RSVP
Existing Guest,other@example.com,family,attending
Brand New,exist@example.com,friends,attending
Unique Person,unique@example.com,general,attending`;

  const result = parseCsvGuestList(csv, existing);
  assert.strictEqual(result.totalRows, 3);
  assert.strictEqual(result.validCount, 1, 'Only unique guest should be imported');
  assert.strictEqual(result.duplicateCount, 2);
  assert.strictEqual(result.validGuests[0].name, 'Unique Person');
});

test('csvParser: handles missing name or empty rows gracefully', () => {
  const csv = `Name,Email
Alice,alice@example.com

,missing@example.com
Bob,bob@example.com`;

  const result = parseCsvGuestList(csv);
  assert.strictEqual(result.validCount, 2);
  assert.strictEqual(result.errorCount, 1);
  assert.strictEqual(result.validGuests[0].name, 'Alice');
  assert.strictEqual(result.validGuests[1].name, 'Bob');
});

test('csvParser: rejects CSV without Name header', () => {
  const csv = `Email,Phone
foo@example.com,555-1234`;

  const result = parseCsvGuestList(csv);
  assert.strictEqual(result.validCount, 0);
  assert.strictEqual(result.errorCount, 1);
  assert.ok(result.rows[0].error?.includes('Missing required "Name" column'));
});
