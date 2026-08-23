export const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
});

export const NOTIFICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  READ: 'read',
  FAILED: 'failed',
});

export default { NOTIFICATION_CHANNELS, NOTIFICATION_STATUS };
