import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChatReply } from './parseChatReply';

test('parseChatReply: parses valid JSON with reply and suggestions', () => {
  const json = JSON.stringify({
    reply: 'Here are the recommended venue questions for your wedding.',
    suggestions: [
      'What are the corkage fees?',
      'Is there an overtime fee?',
      'What is the rain contingency?',
    ],
  });

  const result = parseChatReply(json);
  assert.equal(result.reply, 'Here are the recommended venue questions for your wedding.');
  assert.equal(result.suggestions.length, 3);
  assert.equal(result.suggestions[0], 'What are the corkage fees?');
});

test('parseChatReply: caps suggestions at 4', () => {
  const json = JSON.stringify({
    reply: 'Planning recommendations',
    suggestions: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  });

  const result = parseChatReply(json);
  assert.equal(result.reply, 'Planning recommendations');
  assert.equal(result.suggestions.length, 4);
  assert.deepEqual(result.suggestions, ['S1', 'S2', 'S3', 'S4']);
});

test('parseChatReply: salvages reply from truncated JSON', () => {
  const truncated =
    '{"reply":"Here is a detailed breakdown of contract questions:\\n1. Confirm arrival windows.\\n2. Check cleanup fees.';
  const result = parseChatReply(truncated);
  assert.equal(
    result.reply,
    'Here is a detailed breakdown of contract questions:\n1. Confirm arrival windows.\n2. Check cleanup fees.'
  );
  assert.deepEqual(result.suggestions, []);
});

test('parseChatReply: throws on garbage text without recoverable reply', () => {
  assert.throws(() => {
    parseChatReply('Something completely unformatted and broken');
  }, /Failed to parse chat response/);
});

test('parseChatReply: throws on empty, null, or whitespace-only inputs', () => {
  assert.throws(() => parseChatReply(''), /empty/);
  assert.throws(() => parseChatReply('   '), /empty/);
  assert.throws(() => parseChatReply(null), /empty/);
  assert.throws(() => parseChatReply(undefined), /empty/);
});

test('parseChatReply: throws if parsed JSON contains an empty reply', () => {
  const emptyReplyJson = JSON.stringify({ reply: '   ', suggestions: ['tip'] });
  assert.throws(() => parseChatReply(emptyReplyJson), /Failed to parse chat response/);
});
