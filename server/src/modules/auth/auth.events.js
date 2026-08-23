export const EMITTED = Object.freeze({
  LOGGED_IN: 'auth.logged_in',
  LOGGED_OUT: 'auth.logged_out',
});

export const SUBSCRIPTIONS = [];

export function registerAuthHandlers() {
  // Phase 1: no subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerAuthHandlers };
