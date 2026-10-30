import test from 'node:test';
import assert from 'node:assert/strict';
import { getFallbackMessage, FallbackReason } from './fallbackMessages';

test('getFallbackMessage: returns correct message for timeout', () => {
  assert.equal(
    getFallbackMessage('timeout'),
    'The assistant took too long, so this is an offline answer.'
  );
});

test('getFallbackMessage: returns correct message for no-api-key', () => {
  assert.equal(
    getFallbackMessage('no-api-key'),
    'Offline mode: add a Gemini API key for live AI replies.'
  );
});

test('getFallbackMessage: returns correct message for generic error', () => {
  assert.equal(
    getFallbackMessage('error'),
    'The assistant is unavailable right now, so this is an offline answer.'
  );
});

test('getFallbackMessage: returns empty string when no reason or unknown reason is provided', () => {
  assert.equal(getFallbackMessage(undefined), '');
  assert.equal(getFallbackMessage(null), '');
  assert.equal(getFallbackMessage('' as FallbackReason), '');
});
