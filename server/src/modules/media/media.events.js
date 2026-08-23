export const EMITTED = Object.freeze({
  CREATED: 'media.created',
  UPLOADED: 'media.uploaded',
  DELETED: 'media.deleted',
});

export const SUBSCRIPTIONS = [];

export function registerMediaHandlers() {
  // Phase 1: no subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerMediaHandlers };
