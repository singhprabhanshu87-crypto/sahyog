import crypto from 'node:crypto';
import OpenAI from 'openai';
import config from '../../config/index.js';
import { AiCall } from './ai.schema.js';
import { AI_OPERATIONS, AI_PROVIDERS } from './ai.constants.js';
import { publish } from '../../common/lib/event-bus.js';
import logger from '../../common/lib/logger.js';

let completionClient = null;
let completionProvider = null;

function getCompletionClient() {
  if (completionClient) return { client: completionClient, provider: completionProvider };

  if (config.AI_COMPLETION_PROVIDER === 'openai' && config.OPENAI_API_KEY) {
    completionClient = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
      baseURL: config.OPENAI_BASE_URL,
      timeout: config.AI_REQUEST_TIMEOUT_MS,
      maxRetries: config.AI_MAX_RETRIES,
    });
    completionProvider = AI_PROVIDERS.OPENAI;
    return { client: completionClient, provider: completionProvider };
  }

  if (config.OPENROUTER_API_KEY) {
    completionClient = new OpenAI({
      apiKey: config.OPENROUTER_API_KEY,
      baseURL: config.OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': config.OPENROUTER_SITE_URL || config.CLIENT_URL,
        'X-Title': config.OPENROUTER_APP_NAME,
      },
      timeout: config.AI_REQUEST_TIMEOUT_MS,
      maxRetries: config.AI_MAX_RETRIES,
    });
    completionProvider = AI_PROVIDERS.OPENROUTER;
    return { client: completionClient, provider: completionProvider };
  }

  return { client: null, provider: AI_PROVIDERS.DISABLED };
}

async function auditCall(record) {
  const call = await AiCall.create(record);

  const eventAction = record.success ? 'ai.call_completed' : 'ai.call_failed';
  await publish({
    actor: { id: 'system', type: 'system' },
    action: eventAction,
    resourceType: 'ai_call',
    resourceId: call._id.toString(),
    payload: {
      operation: record.operation,
      model: record.model,
      success: record.success,
    },
  });

  return call.toObject();
}

function parseJsonResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Complete via OpenRouter — graceful degrade if no API key.
 */
export async function complete({
  prompt,
  systemPrompt,
  model,
  operation = AI_OPERATIONS.COMPLETE,
  resourceType,
  resourceId,
}) {
  const start = Date.now();
  const { client, provider } = getCompletionClient();
  const selectedModel = model || config.AI_MODEL_TRIAGE || 'gpt-4o-mini';

  if (!client) {
    logger.warn('AI provider not configured — returning graceful degrade response');
    const degraded = {
      text: '',
      degraded: true,
      reason: 'AI provider not configured',
    };

    await auditCall({
      operation,
      model: selectedModel,
      provider: AI_PROVIDERS.DISABLED,
      resourceType,
      resourceId,
      prompt,
      response: degraded,
      latencyMs: Date.now() - start,
      success: false,
      error: 'AI API key not configured',
    });

    return degraded;
  }

  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.2,
    });

    const text = completion.choices?.[0]?.message?.content || '';
    const parsed = parseJsonResponse(text);
    const latencyMs = Date.now() - start;

    await auditCall({
      operation,
      model: selectedModel,
      provider,
      resourceType,
      resourceId,
      prompt,
      response: parsed,
      latencyMs,
      success: true,
      tokenUsage: {
        prompt: completion.usage?.prompt_tokens,
        completion: completion.usage?.completion_tokens,
        total: completion.usage?.total_tokens,
      },
    });

    return { ...parsed, text, degraded: false };
  } catch (err) {
    const latencyMs = Date.now() - start;
    logger.error({ err, operation }, 'AI complete failed');

    await auditCall({
      operation,
      model: selectedModel,
      provider,
      resourceType,
      resourceId,
      prompt,
      response: null,
      latencyMs,
      success: false,
      error: err.message,
    });

    return {
      degraded: true,
      reason: err.message,
      text: '',
    };
  }
}

/**
 * Embeddings: OpenAI when configured, else local hash stub for dev.
 */
export async function embed(text) {
  if (config.EMBEDDING_PROVIDER === 'openai' && config.OPENAI_API_KEY) {
    const { client } = getCompletionClient();
    if (client) {
      const response = await client.embeddings.create({
        model: config.EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text,
      });
      const vector = response.data?.[0]?.embedding ?? [];
      return {
        vector,
        model: config.EMBEDDING_MODEL,
        modelVersion: config.EMBEDDING_MODEL_VERSION,
        dimensions: vector.length,
        provider: AI_PROVIDERS.OPENAI,
        stub: false,
      };
    }
  }

  const dimensions = config.EMBEDDING_DIMENSIONS;
  const hash = crypto.createHash('sha256').update(text).digest();
  const vector = [];

  for (let i = 0; i < dimensions; i++) {
    const byte = hash[i % hash.length];
    vector.push((byte / 255) * 2 - 1);
  }

  return {
    vector,
    model: config.EMBEDDING_MODEL,
    modelVersion: config.EMBEDDING_MODEL_VERSION,
    dimensions,
    provider: AI_PROVIDERS.LOCAL,
    stub: true,
  };
}

export async function embedAndAudit(text, { resourceType, resourceId } = {}) {
  const start = Date.now();
  const result = await embed(text);

  await auditCall({
    operation: AI_OPERATIONS.EMBED,
    model: result.model,
    provider: result.provider,
    resourceType,
    resourceId,
    prompt: text.slice(0, 500),
    response: { dimensions: result.dimensions, stub: result.stub },
    latencyMs: Date.now() - start,
    success: true,
  });

  return result;
}

export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default { complete, embed, embedAndAudit, cosineSimilarity };
