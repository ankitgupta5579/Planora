import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateContentWithRetry,
  classifyGeminiError,
  sanitizeGeminiErrorMessage,
  resolveGeminiModel,
  DEPRECATED_MODELS,
  FALLBACK_MODELS,
  DEFAULT_GEMINI_MODEL,
  CHAT_THINKING_LEVEL,
} from './geminiClient';

test('resolveGeminiModel: defaults to gemini-3-flash-preview and maps deprecated models', () => {
  const originalEnv = process.env.GEMINI_MODEL;
  try {
    delete process.env.GEMINI_MODEL;
    assert.equal(resolveGeminiModel(), DEFAULT_GEMINI_MODEL);

    for (const dep of DEPRECATED_MODELS) {
      process.env.GEMINI_MODEL = dep;
      assert.equal(resolveGeminiModel(), DEFAULT_GEMINI_MODEL, `Model ${dep} should map to default`);
    }

    process.env.GEMINI_MODEL = 'gemini-3.5-flash';
    assert.equal(resolveGeminiModel(), 'gemini-3.5-flash');
  } finally {
    if (originalEnv) {
      process.env.GEMINI_MODEL = originalEnv;
    } else {
      delete process.env.GEMINI_MODEL;
    }
  }
});

test('classifyGeminiError: correctly classifies errors', () => {
  const badThinking = new Error('HTTP 400: thinkingConfig is not supported for requested model');
  (badThinking as any).status = 400;
  assert.equal(classifyGeminiError(badThinking), 'bad-thinking');

  const err404 = new Error('This model is no longer available');
  (err404 as any).status = 404;
  assert.equal(classifyGeminiError(err404), 'model-unavailable');

  const err503 = new Error('This model is currently experiencing high demand');
  (err503 as any).status = 503;
  assert.equal(classifyGeminiError(err503), 'model-unavailable');

  const err429 = new Error('Quota exceeded for metric: generate_content_free_tier_requests');
  (err429 as any).status = 429;
  assert.equal(classifyGeminiError(err429), 'model-unavailable');

  const timeoutErr = new Error('Operation timed out');
  assert.equal(classifyGeminiError(timeoutErr), 'other');
});

test('sanitizeGeminiErrorMessage: strips API keys from query strings and headers', () => {
  const rawMsg = 'Failed request: https://generativelanguage.googleapis.com?key=AIzaSySecretKey123&other=param with API_key: SecretKey456';
  const clean = sanitizeGeminiErrorMessage(rawMsg);
  assert.equal(clean.includes('AIzaSySecretKey123'), false);
  assert.equal(clean.includes('SecretKey456'), false);
  assert.match(clean, /\[REDACTED\]/);
});

test('generateContentWithRetry: success on first try', async () => {
  const calls: any[] = [];
  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        return { text: '{"reply":"All good"}' };
      },
    },
  };

  const res = await generateContentWithRetry(mockAi, {
    model: 'gemini-3-flash-preview',
    contents: 'Hello',
    config: { maxOutputTokens: 100 },
  }, 1000);

  assert.equal(calls.length, 1);
  assert.equal(res.text, '{"reply":"All good"}');
});

test('generateContentWithRetry: timeout rejects with TimeoutError', async () => {
  const mockAi = {
    models: {
      generateContent: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { text: 'Late response' };
      },
    },
  };

  await assert.rejects(
    async () => {
      await generateContentWithRetry(mockAi, { model: 'gemini-3-flash-preview', contents: 'Hello' }, 20);
    },
    /timed out/i
  );
});

test('generateContentWithRetry: 400-thinking retry without thinkingConfig', async () => {
  const calls: any[] = [];
  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        if (calls.length === 1) {
          const err: any = new Error('Thinking level MINIMAL is not supported for this model');
          err.status = 400;
          throw err;
        }
        return { text: '{"reply":"Success without thinking"}' };
      },
    },
  };

  const res = await generateContentWithRetry(
    mockAi,
    {
      model: 'gemini-3.8-flash',
      contents: 'Plan',
      config: {
        maxOutputTokens: 500,
        thinkingConfig: { thinkingLevel: CHAT_THINKING_LEVEL },
      },
    },
    1000
  );

  assert.equal(calls.length, 2);
  assert.equal(Boolean(calls[0].config.thinkingConfig), true);
  assert.equal(Boolean(calls[1].config.thinkingConfig), false);
  assert.equal(calls[1].config.maxOutputTokens, 500);
  assert.equal(res.text, '{"reply":"Success without thinking"}');
});

test('generateContentWithRetry: 404 then success on the second fallback model', async () => {
  const primaryModel = 'gemini-3-flash-preview';
  const calls: any[] = [];

  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        if (params.model === primaryModel) {
          const err: any = new Error('Model models/gemini-3-flash-preview is no longer available');
          err.status = 404;
          throw err;
        }
        // First candidate in FALLBACK_MODELS (gemini-3.5-flash) fails with 503
        if (params.model === 'gemini-3.5-flash') {
          const err: any = new Error('Model is currently experiencing high demand');
          err.status = 503;
          throw err;
        }
        // Second candidate (gemini-3.1-flash-lite) succeeds
        return { text: '{"reply":"Success on second fallback"}' };
      },
    },
  };

  const res = await generateContentWithRetry(
    mockAi,
    {
      model: primaryModel,
      contents: 'Plan event',
      config: {
        maxOutputTokens: 500,
        thinkingConfig: { thinkingLevel: CHAT_THINKING_LEVEL },
      },
    },
    1000
  );

  assert.equal(calls.length, 3);
  assert.equal(calls[0].model, primaryModel);
  assert.equal(calls[1].model, 'gemini-3.5-flash');
  assert.equal(calls[2].model, 'gemini-3.1-flash-lite');
  assert.equal(res.text, '{"reply":"Success on second fallback"}');
});

test('generateContentWithRetry: 503 and 429 paths trigger fallback', async () => {
  // Test 503 path
  const calls503: any[] = [];
  const mockAi503 = {
    models: {
      generateContent: async (params: any) => {
        calls503.push(params);
        if (calls503.length === 1) {
          const err: any = new Error('Service Unavailable');
          err.status = 503;
          throw err;
        }
        return { text: '{"reply":"503 recovered"}' };
      },
    },
  };
  const res503 = await generateContentWithRetry(mockAi503, { model: 'gemini-3-flash-preview', contents: 'Hi' }, 1000);
  assert.equal(calls503.length, 2);
  assert.equal(res503.text, '{"reply":"503 recovered"}');

  // Test 429 path
  const calls429: any[] = [];
  const mockAi429 = {
    models: {
      generateContent: async (params: any) => {
        calls429.push(params);
        if (calls429.length === 1) {
          const err: any = new Error('RESOURCE_EXHAUSTED: Quota exceeded');
          err.status = 429;
          throw err;
        }
        return { text: '{"reply":"429 recovered"}' };
      },
    },
  };
  const res429 = await generateContentWithRetry(mockAi429, { model: 'gemini-3-flash-preview', contents: 'Hi' }, 1000);
  assert.equal(calls429.length, 2);
  assert.equal(res429.text, '{"reply":"429 recovered"}');
});

test('generateContentWithRetry: failed model is not retried during fallback', async () => {
  const failedModel = 'gemini-3.5-flash';
  const calls: any[] = [];

  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        if (params.model === failedModel) {
          const err: any = new Error('Model unavailable');
          err.status = 503;
          throw err;
        }
        return { text: '{"reply":"Fallback worked"}' };
      },
    },
  };

  await generateContentWithRetry(mockAi, { model: failedModel, contents: 'Test' }, 1000);

  // Failed model should have been called once as primary, and NEVER in fallback list
  const callsToFailedModel = calls.filter((c) => c.model === failedModel);
  assert.equal(callsToFailedModel.length, 1);
  assert.notEqual(calls[1].model, failedModel);
});

test('generateContentWithRetry: thinkingConfig is stripped on fallback calls', async () => {
  const calls: any[] = [];
  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        calls.push(params);
        if (calls.length === 1) {
          const err: any = new Error('Model deprecated');
          err.status = 404;
          throw err;
        }
        return { text: '{"reply":"Recovered"}' };
      },
    },
  };

  await generateContentWithRetry(
    mockAi,
    {
      model: 'gemini-3-flash-preview',
      contents: 'Test',
      config: {
        thinkingConfig: { thinkingLevel: CHAT_THINKING_LEVEL },
        maxOutputTokens: 600,
      },
    },
    1000
  );

  assert.equal(calls.length, 2);
  assert.equal(Boolean(calls[0].config?.thinkingConfig), true);
  assert.equal(calls[1].config?.thinkingConfig, undefined);
  assert.equal(calls[1].config?.maxOutputTokens, 600);
});

test('generateContentWithRetry: all models failing throws last error', async () => {
  const mockAi = {
    models: {
      generateContent: async (params: any) => {
        const err: any = new Error(`Failure on ${params.model}`);
        err.status = 503;
        throw err;
      },
    },
  };

  await assert.rejects(
    async () => {
      await generateContentWithRetry(mockAi, { model: 'gemini-3-flash-preview', contents: 'Test' }, 1000);
    },
    (err: any) => {
      assert.equal(err.status, 503);
      assert.match(err.message, /Failure on/);
      return true;
    }
  );
});
