import test from 'node:test';
import assert from 'node:assert';
import { app } from '../../../server';

test('routes/health: GET /api/health responds with 200 and valid JSON schema', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'planora-api');
    assert.strictEqual(typeof body.uptime, 'number');
    assert.strictEqual(typeof body.timestamp, 'string');
    assert.strictEqual(typeof body.environment, 'string');
  } finally {
    server.close();
  }
});
