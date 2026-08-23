export const EMITTED = Object.freeze({
  PUBLISHED: 'taxonomy.published',
});

export const SUBSCRIPTIONS = [];

export function registerTaxonomyHandlers() {
  // Taxonomy is static reference data — no subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerTaxonomyHandlers };
