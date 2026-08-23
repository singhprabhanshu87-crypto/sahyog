export const EVENT_ACTIONS = Object.freeze({
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATE_CHANGED: 'state_changed',
  LOGGED_IN: 'logged_in',
  LOGGED_OUT: 'logged_out',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

export const RESOURCE_TYPES = Object.freeze({
  USER: 'user',
  ORGANIZATION: 'organization',
  MEMBERSHIP: 'membership',
  SESSION: 'session',
  MEDIA: 'media',
  AUTH: 'auth',
  EVENT: 'event',
});

export default { EVENT_ACTIONS, RESOURCE_TYPES };
