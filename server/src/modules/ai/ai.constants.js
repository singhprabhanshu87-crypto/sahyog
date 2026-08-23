export const AI_OPERATIONS = Object.freeze({
  COMPLETE: 'complete',
  EMBED: 'embed',
  TRIAGE: 'triage',
  CATEGORIZE: 'categorize',
  SUMMARIZE: 'summarize',
});

export const AI_PROVIDERS = Object.freeze({
  OPENROUTER: 'openrouter',
  OPENAI: 'openai',
  LOCAL: 'local',
  DISABLED: 'disabled',
});

export default { AI_OPERATIONS, AI_PROVIDERS };
