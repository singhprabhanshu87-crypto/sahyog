export const INTEGRATION_PROVIDERS = Object.freeze({
  GRIEVANCE: 'grievance',
  SMS: 'sms',
  EMAIL: 'email',
});

export const INTEGRATION_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
});

export default { INTEGRATION_PROVIDERS, INTEGRATION_STATUS };
