export const EMITTED = Object.freeze({
  SIGN_OFF: 'validation.sign_off',
});

export const SUBSCRIPTIONS = ['milestone.reviewed'];

export function registerValidationHandlers() {
  // Validation triggered when milestones pass
}

export default { EMITTED, SUBSCRIPTIONS, registerValidationHandlers };
