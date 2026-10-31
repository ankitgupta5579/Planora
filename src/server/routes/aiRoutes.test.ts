import test from 'node:test';
import assert from 'node:assert';
import { app } from '../../../server';

test('routes/ai: POST /api/ai/generate-plan returns valid fallback plan on offline mode', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Sunset Beach Wedding',
        type: 'wedding',
        vibe: 'romantic',
        date: '2026-11-20',
        location: 'Malibu Beach, CA',
        guestCount: 120,
        totalBudget: 25000,
        currency: '$',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.plan, 'Should return an event plan');
    assert.strictEqual(body.plan.title, 'Sunset Beach Wedding');
    assert.strictEqual(body.plan.type, 'wedding');
    assert.ok(Array.isArray(body.plan.budgetItems));
    assert.ok(Array.isArray(body.plan.timelineItems));
    assert.ok(Array.isArray(body.plan.vendors));
    assert.ok(Array.isArray(body.plan.ideas));
  } finally {
    server.close();
  }
});

test('routes/ai: POST /api/ai/chat returns contextual answer and action suggestions', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How should I optimize catering expenses?',
        eventContext: {
          title: 'Gala Night',
          type: 'corporate',
          guestCount: 100,
          totalBudget: 15000,
          currency: '$',
        },
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.reply, 'Should have reply');
    assert.ok(typeof body.reply === 'string');
    assert.ok(Array.isArray(body.suggestions));
  } finally {
    server.close();
  }
});

test('routes/ai: POST /api/ai/generate-invite-speech returns tailored invitation text', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/ai/generate-invite-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'speech',
        tone: 'heartfelt',
        recipient: 'Friends and Family',
        event: {
          title: '30th Birthday Celebration',
          type: 'birthday',
          date: '2026-10-15',
          location: 'Rooftop Bar',
          guestCount: 40,
        },
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.result, 'Should return invitation or speech text');
    assert.ok(body.result.length > 20);
  } finally {
    server.close();
  }
});

test('routes/ai: POST /api/ai/vendor-inquiry crafts specialized RFP email', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/ai/vendor-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: {
          name: 'Golden Hour Snaps',
          category: 'photography',
          quoteAmount: 3500,
        },
        event: {
          title: 'Autumn Garden Wedding',
          type: 'wedding',
          date: '2026-09-12',
          location: 'Napa Valley, CA',
          guestCount: 80,
          totalBudget: 20000,
          currency: '$',
        },
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.email, 'Should return vendor inquiry text');
    assert.ok(body.email.includes('Golden Hour Snaps') || body.email.includes('photography'));
  } finally {
    server.close();
  }
});

test('routes/ai: POST /api/ai/generate-ideas returns curated concepts across categories', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/ai/generate-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        focusCategory: 'entertainment',
        eventContext: {
          title: 'Tech Company Anniversary',
          type: 'corporate',
          vibe: 'modern',
          location: 'San Francisco, CA',
          guestCount: 200,
        },
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.ideas), 'Should return list of ideas');
    assert.ok(body.ideas.length > 0);
    assert.strictEqual(body.ideas[0].category, 'entertainment');
  } finally {
    server.close();
  }
});
