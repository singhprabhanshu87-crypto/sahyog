export const OTP_PURPOSES = Object.freeze({
  LOGIN: 'login',
  VERIFY_EMAIL: 'verify_email',
  RESET_PASSWORD: 'reset_password',
});

export const SESSION_STATUS = Object.freeze({
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
});

export default { OTP_PURPOSES, SESSION_STATUS };
