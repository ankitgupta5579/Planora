process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { app, setCustomGeminiClient, generateContentWithRetry, CHAT_THINKING_LEVEL } from '../../server';
import { SAMPLE_EVENTS } from '../utils/sampleData';

function startTestServer(): Promise<{ server: http.Server; baseUrl: string }> {
  // Ensure no API key in tests so fallback behavior is strictly tested
  process.env.GEMINI_API_KEY = '';
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

test('server: /api/ai/generate-plan returns valid fallback plan with isFallback:true and fallbackReason:no-api-key', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Golden Jubilee Celebration',
        type: 'birthday',
        vibe: 'festive',
        date: '2026-12-15',
        location: 'Skyline Terrace, Chicago',
        guestCount: 75,
        totalBudget: 15000,
        currency: '$',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isFallback, true);
    assert.equal(data.fallbackReason, 'no-api-key');
    assert.equal(Boolean(data.plan), true);
    assert.equal(data.plan.title, 'Golden Jubilee Celebration');
    assert.equal(data.plan.guestCount, 75);
    assert.equal(Array.isArray(data.plan.budgetItems), true);
    assert.equal(Array.isArray(data.plan.timelineItems), true);
    assert.equal(Array.isArray(data.plan.vendors), true);
  } finally {
    server.close();
  }
});

test('server: /api/ai/generate-plan validation rejects missing fields with 400', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing title and date
        type: 'wedding',
        location: 'Beachfront',
        guestCount: 50,
        totalBudget: 5000,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /title/i);
  } finally {
    server.close();
  }
});

test('server: /api/ai/generate-plan validation rejects oversized strings with 400', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        type: 'corporate',
        vibe: 'modern',
        date: '2026-11-10',
        location: 'Convention Hall',
        guestCount: 100,
        totalBudget: 10000,
        specialRequests: 'A'.repeat(1001), // Max is 1000
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /length|character/i);
  } finally {
    server.close();
  }
});

test('server: /api/ai/generate-plan validation rejects guestCount out of range with 400', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Small Party',
        type: 'birthday',
        vibe: 'casual',
        date: '2026-10-31',
        location: 'Home',
        guestCount: 0, // Must be >= 1
        totalBudget: 500,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /guest/i);
  } finally {
    server.close();
  }
});

test('server: /api/ai/generate-plan validation rejects invalid event type outside whitelist with 400', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Space Journey',
        type: 'intergalactic_tour', // Invalid
        vibe: 'futuristic',
        date: '2026-10-31',
        location: 'Launchpad',
        guestCount: 20,
        totalBudget: 10000,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /type/i);
  } finally {
    server.close();
  }
});

test('server: /api/ai/chat returns offline fallback response with isFallback:true and fallbackReason:no-api-key', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How should I handle bad weather backups?',
        eventContext: {
          title: SAMPLE_EVENTS[0].title,
          type: SAMPLE_EVENTS[0].type,
          guestCount: SAMPLE_EVENTS[0].guestCount,
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isFallback, true);
    assert.equal(data.fallbackReason, 'no-api-key');
    assert.equal(typeof data.reply, 'string');
    assert.equal(Array.isArray(data.suggestions), true);
  } finally {
    server.close();
  }
});

test('server: /api/ai/generate-invite-speech returns offline fallback response with isFallback:true and fallbackReason:no-api-key', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-invite-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: SAMPLE_EVENTS[0],
        requestType: 'invitation',
        tone: 'heartfelt',
        recipient: 'Family and Friends',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isFallback, true);
    assert.equal(data.fallbackReason, 'no-api-key');
    assert.equal(typeof data.result, 'string');
    assert.match(data.result, /Invited|Welcome/i);
  } finally {
    server.close();
  }
});

test('server: /api/ai/vendor-inquiry returns offline fallback response with isFallback:true and fallbackReason:no-api-key', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/vendor-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: SAMPLE_EVENTS[0].vendors[0],
        event: SAMPLE_EVENTS[0],
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isFallback, true);
    assert.equal(data.fallbackReason, 'no-api-key');
    assert.equal(typeof data.email, 'string');
    assert.match(data.email, /Inquiry regarding/i);
  } finally {
    server.close();
  }
});

test('generateContentWithRetry: retries ONCE without thinkingConfig when model returns HTTP 400 mentioning thinking', async () => {
  const calls: any[] = [];
  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        if (calls.length === 1) {
          const err: any = new Error('Invalid thinkingConfig: Thinking is not supported for this model');
          err.status = 400;
          throw err;
        }
        return { text: '{"reply":"Success on retry","suggestions":[]}' };
      },
    },
  };

  const initialParams = {
    model: 'gemini-3.8-flash',
    contents: 'Hello',
    config: {
      maxOutputTokens: 800,
      thinkingConfig: {
        thinkingLevel: CHAT_THINKING_LEVEL,
      },
    },
  };

  const result = await generateContentWithRetry(mockAi, initialParams, 5000);

  assert.equal(calls.length, 2, 'generateContent should be called exactly twice');
  assert.equal(Boolean(calls[0].config.thinkingConfig), true, 'First call must include thinkingConfig');
  assert.equal(Boolean(calls[1].config.thinkingConfig), false, 'Second call must omit thinkingConfig');
  assert.equal(calls[1].config.maxOutputTokens, 800, 'Second call must preserve other configuration properties');
  assert.equal(result.text, '{"reply":"Success on retry","suggestions":[]}');
});

test('server: /api/ai/chat retries ONCE without thinkingConfig on HTTP 400 thinking error and succeeds', async () => {
  const calls: any[] = [];
  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        if (calls.length === 1) {
          const err: any = new Error('HTTP 400: thinkingConfig is not supported for requested model');
          err.status = 400;
          throw err;
        }
        return {
          text: JSON.stringify({
            reply: 'Live advice returned after retry without thinkingConfig',
            suggestions: ['Confirm caterer schedule', 'Review guest count'],
          }),
        };
      },
    },
  };

  setCustomGeminiClient({ ai: mockAi as any, apiKey: 'mock-test-key' });
  const { server, baseUrl } = await startTestServer();

  try {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What should we confirm this week?',
        eventContext: {
          title: 'Fall Gala',
          type: 'corporate',
          vibe: 'modern',
          budget: 20000,
          guestCount: 80,
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isFallback, false);
    assert.equal(data.reply, 'Live advice returned after retry without thinkingConfig');
    assert.deepEqual(data.suggestions, ['Confirm caterer schedule', 'Review guest count']);
    assert.equal(calls.length, 2);
    assert.equal(Boolean(calls[0].config.thinkingConfig), true);
    assert.equal(Boolean(calls[1].config.thinkingConfig), false);
  } finally {
    setCustomGeminiClient(null);
    server.close();
  }
});
