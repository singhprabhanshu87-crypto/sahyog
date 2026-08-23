export const EMITTED = Object.freeze({
  CREATED: 'project.created',
});

export const SUBSCRIPTIONS = ['agreement.signed'];

export function registerProjectHandlers() {
  // Industry block lifted on agreement.signed — enforced at create time
}

export default { EMITTED, SUBSCRIPTIONS, registerProjectHandlers };
