export const LANGUAGE_OPERATIONS = Object.freeze({
  DETECT: 'detect',
  TRANSCRIBE: 'transcribe',
  TRANSLATE: 'translate',
  REVERSE_TRANSLATE: 'reverse_translate',
});

export const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: 'high',
  LOW: 'low',
  UNKNOWN: 'unknown',
});

export default { LANGUAGE_OPERATIONS, CONFIDENCE_LEVELS };
