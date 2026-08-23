export function toPublic(result) {
  if (!result) return null;
  return {
    text: result.resultText || result.text,
    locale: result.detectedLocale || result.targetLocale,
    confidence: result.confidence,
    needsHumanAssist: result.needsHumanAssist ?? false,
  };
}

export function toInternal(result) {
  if (!result) return null;
  return {
    operation: result.operation,
    sourceLocale: result.sourceLocale,
    targetLocale: result.targetLocale,
    sourceText: result.sourceText,
    resultText: result.resultText || result.text,
    confidence: result.confidence,
    needsHumanAssist: result.needsHumanAssist,
    provider: result.provider,
    cached: result.cached ?? false,
  };
}

export default { toPublic, toInternal };
