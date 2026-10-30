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

test('AiAssistantDrawer message prefix: no notice when isFallback is false, correct notice when true', () => {
  function formatAssistantMessage(data: { isFallback: boolean; fallbackReason?: FallbackReason | null; reply: string }) {
    const fallbackNote = data.isFallback ? getFallbackMessage(data.fallbackReason || 'error') : '';
    const prefix = fallbackNote ? `${fallbackNote}\n\n` : '';
    return `${prefix}${data.reply}`;
  }

  // When isFallback is false: no notice prepended
  const liveMessage = formatAssistantMessage({
    isFallback: false,
    reply: 'Live customized recommendation for Elena & Marcus.',
  });
  assert.equal(liveMessage, 'Live customized recommendation for Elena & Marcus.');
  assert.equal(liveMessage.includes('offline'), false);

  // When isFallback is true with no-api-key
  const noApiKeyMsg = formatAssistantMessage({
    isFallback: true,
    fallbackReason: 'no-api-key',
    reply: 'Check vendor contracts 48 hours before.',
  });
  assert.match(noApiKeyMsg, /^Offline mode: add a Gemini API key for live AI replies\.\n\n/);

  // When isFallback is true with timeout
  const timeoutMsg = formatAssistantMessage({
    isFallback: true,
    fallbackReason: 'timeout',
    reply: 'Check vendor contracts 48 hours before.',
  });
  assert.match(timeoutMsg, /^The assistant took too long, so this is an offline answer\.\n\n/);

  // When isFallback is true with error
  const errorMsg = formatAssistantMessage({
    isFallback: true,
    fallbackReason: 'error',
    reply: 'Check vendor contracts 48 hours before.',
  });
  assert.match(errorMsg, /^The assistant is unavailable right now, so this is an offline answer\.\n\n/);
});
