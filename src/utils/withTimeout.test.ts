import test from 'node:test';
import assert from 'node:assert/strict';
import { withTimeout } from './withTimeout';

test('withTimeout: resolves when the promise completes within the timeout limit', async () => {
  const result = await withTimeout(
    new Promise<string>((resolve) => setTimeout(() => resolve('success'), 30)),
    200
  );
  assert.equal(result, 'success');
});

test('withTimeout: rejects on timeout when duration is exceeded', async () => {
  await assert.rejects(
    async () => {
      await withTimeout(
        new Promise<string>((resolve) => setTimeout(() => resolve('too-late'), 200)),
        30
      );
    },
    (err: Error) => {
      assert.match(err.message, /timed out/i);
      return true;
    }
  );
});

test('withTimeout: rejects if the underlying promise rejects before timeout', async () => {
  await assert.rejects(
    async () => {
      await withTimeout(
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('underlying failure')), 20)
        ),
        200
      );
    },
    {
      message: 'underlying failure',
    }
  );
});

test('withTimeout: resolves with default 30000ms timeout', async () => {
  const result = await withTimeout(Promise.resolve('default-ok'));
  assert.equal(result, 'default-ok');
});
