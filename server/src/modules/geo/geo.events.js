export const EMITTED = Object.freeze({
  RESOLVED: 'geo.resolved',
});

export const SUBSCRIPTIONS = [];

export function registerGeoHandlers() {
  // Geo module has no event subscriptions in Phase 2
}

export default { EMITTED, SUBSCRIPTIONS, registerGeoHandlers };
