import crypto from 'node:crypto';
import config from '../../config/index.js';
import { TranslationCache } from './language.schema.js';
import { LANGUAGE_OPERATIONS, CONFIDENCE_LEVELS } from './language.constants.js';
import { publish } from '../../common/lib/event-bus.js';
import logger from '../../common/lib/logger.js';

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function isLowConfidence(confidence) {
  return confidence == null || confidence < config.TRANSLATION_CONFIDENCE_THRESHOLD;
}

function createProvider() {
  const providerName = config.LANGUAGE_PROVIDER;

  if (providerName === 'disabled') {
    return {
      name: 'disabled',
      async detect(text) {
        return { locale: config.DEFAULT_LOCALE, confidence: 1, text };
      },
      async transcribe(_mediaRef) {
        return { text: '', confidence: 0, needsHumanAssist: true };
      },
      async translate(text, { sourceLocale, targetLocale } = {}) {
        return {
          text,
          sourceLocale: sourceLocale || config.DEFAULT_LOCALE,
          targetLocale: targetLocale || 'en',
          confidence: 1,
        };
      },
      async reverseTranslate(text, { sourceLocale, targetLocale } = {}) {
        return {
          text,
          sourceLocale: sourceLocale || 'en',
          targetLocale: targetLocale || config.DEFAULT_LOCALE,
          confidence: 1,
        };
      },
    };
  }

  // Stub for future Bhashini/OpenAI providers
  logger.warn({ provider: providerName }, 'Language provider not fully implemented — using pass-through');
  return {
    name: 'disabled',
    async detect(text) {
      return { locale: config.DEFAULT_LOCALE, confidence: 1, text };
    },
    async transcribe(_mediaRef) {
      return { text: '', confidence: 0, needsHumanAssist: true };
    },
    async translate(text, { sourceLocale, targetLocale } = {}) {
      return {
        text,
        sourceLocale: sourceLocale || config.DEFAULT_LOCALE,
        targetLocale: targetLocale || 'en',
        confidence: 1,
      };
    },
    async reverseTranslate(text, { sourceLocale, targetLocale } = {}) {
      return {
        text,
        sourceLocale: sourceLocale || 'en',
        targetLocale: targetLocale || config.DEFAULT_LOCALE,
        confidence: 1,
      };
    },
  };
}

let provider = null;

function getProvider() {
  if (!provider) provider = createProvider();
  return provider;
}

async function getCached(operation, sourceHash, targetLocale) {
  return TranslationCache.findOne({ operation, sourceHash, targetLocale }).lean();
}

async function setCache(record) {
  return TranslationCache.create(record);
}

export async function detect(text) {
  const p = getProvider();
  const result = await p.detect(text);
  const needsHumanAssist = isLowConfidence(result.confidence);

  if (needsHumanAssist) {
    await publish({
      actor: { id: 'system', type: 'system' },
      action: 'language.low_confidence',
      resourceType: 'language',
      resourceId: hashText(text).slice(0, 16),
      payload: { operation: LANGUAGE_OPERATIONS.DETECT, confidence: result.confidence },
    });
  }

  return {
    ...result,
    operation: LANGUAGE_OPERATIONS.DETECT,
    needsHumanAssist,
    provider: p.name,
    cached: false,
  };
}

export async function transcribe(mediaRef) {
  const p = getProvider();
  const result = await p.transcribe(mediaRef);
  const needsHumanAssist = result.needsHumanAssist || isLowConfidence(result.confidence);

  return {
    ...result,
    operation: LANGUAGE_OPERATIONS.TRANSCRIBE,
    needsHumanAssist,
    provider: p.name,
    cached: false,
  };
}

export async function translate(text, { sourceLocale, targetLocale } = {}) {
  const target = targetLocale || 'en';
  const sourceHash = hashText(`${sourceLocale || ''}:${text}`);
  const cached = await getCached(LANGUAGE_OPERATIONS.TRANSLATE, sourceHash, target);

  if (cached) {
    return {
      text: cached.resultText,
      sourceLocale: cached.sourceLocale,
      targetLocale: cached.targetLocale,
      confidence: cached.confidence,
      needsHumanAssist: cached.needsHumanAssist,
      provider: cached.provider,
      cached: true,
      operation: LANGUAGE_OPERATIONS.TRANSLATE,
    };
  }

  const p = getProvider();
  const result = await p.translate(text, { sourceLocale, targetLocale: target });
  const needsHumanAssist = isLowConfidence(result.confidence);

  await setCache({
    operation: LANGUAGE_OPERATIONS.TRANSLATE,
    sourceLocale: result.sourceLocale || sourceLocale,
    targetLocale: target,
    sourceHash,
    sourceText: text,
    resultText: result.text,
    confidence: result.confidence,
    needsHumanAssist,
    provider: p.name,
  });

  await publish({
    actor: { id: 'system', type: 'system' },
    action: 'language.translated',
    resourceType: 'language',
    resourceId: sourceHash.slice(0, 16),
    payload: { targetLocale: target, cached: false },
  });

  if (needsHumanAssist) {
    await publish({
      actor: { id: 'system', type: 'system' },
      action: 'language.low_confidence',
      resourceType: 'language',
      resourceId: sourceHash.slice(0, 16),
      payload: { operation: LANGUAGE_OPERATIONS.TRANSLATE, confidence: result.confidence },
    });
  }

  return {
    ...result,
    operation: LANGUAGE_OPERATIONS.TRANSLATE,
    needsHumanAssist,
    provider: p.name,
    cached: false,
  };
}

export async function reverseTranslate(text, { sourceLocale, targetLocale } = {}) {
  const target = targetLocale || config.DEFAULT_LOCALE;
  const sourceHash = hashText(`rev:${sourceLocale || ''}:${text}`);
  const cached = await getCached(LANGUAGE_OPERATIONS.REVERSE_TRANSLATE, sourceHash, target);

  if (cached) {
    return {
      text: cached.resultText,
      sourceLocale: cached.sourceLocale,
      targetLocale: cached.targetLocale,
      confidence: cached.confidence,
      needsHumanAssist: cached.needsHumanAssist,
      provider: cached.provider,
      cached: true,
      operation: LANGUAGE_OPERATIONS.REVERSE_TRANSLATE,
    };
  }

  const p = getProvider();
  const result = await p.reverseTranslate(text, { sourceLocale, targetLocale: target });
  const needsHumanAssist = isLowConfidence(result.confidence);

  await setCache({
    operation: LANGUAGE_OPERATIONS.REVERSE_TRANSLATE,
    sourceLocale: result.sourceLocale || sourceLocale,
    targetLocale: target,
    sourceHash,
    sourceText: text,
    resultText: result.text,
    confidence: result.confidence,
    needsHumanAssist,
    provider: p.name,
  });

  return {
    ...result,
    operation: LANGUAGE_OPERATIONS.REVERSE_TRANSLATE,
    needsHumanAssist,
    provider: p.name,
    cached: false,
  };
}

export default { detect, transcribe, translate, reverseTranslate };
