/** Global platform roles — a user may hold different roles per org via memberships */
export const ROLES = Object.freeze({
  CITIZEN: 'citizen',
  FACILITATOR: 'facilitator',
  HEI_FACULTY: 'hei_faculty',
  HEI_STUDENT: 'hei_student',
  INDUSTRY_MEMBER: 'industry_member',
  DISTRICT_OFFICER: 'district_officer',
  PMU_ADMIN: 'pmu_admin',
  ORG_ADMIN: 'org_admin',
  COMMUNITY_VALIDATOR: 'community_validator',
});

export const ORG_TYPES = Object.freeze({
  HEI: 'hei',
  INDUSTRY: 'industry',
  STARTUP: 'startup',
  MSME: 'msme',
  NGO: 'ngo',
  CSR: 'csr',
  INCUBATOR: 'incubator',
  GOVERNMENT_DEPARTMENT: 'government_department',
  ULB: 'ulb',
  PRI: 'pri',
});

/** Organization verification lifecycle */
export const ORG_VERIFICATION_STATES = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

/** Challenge governance workflow — status is derived from event log */
export const CHALLENGE_WORKFLOW_STATES = Object.freeze({
  SUBMITTED: 'submitted',
  TRIAGED: 'triaged',
  SCOPED: 'scoped',
  CLAIMED: 'claimed',
  IN_PROJECT: 'in_project',
  VALIDATED: 'validated',
  CLOSED: 'closed',
});

/** Membership status */
export const MEMBERSHIP_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked',
});

/** Auth channels */
export const AUTH_CHANNELS = Object.freeze({
  EMAIL_OTP: 'email_otp',
  EMAIL_PASSWORD: 'email_password',
  PHONE_OTP: 'phone_otp',
  INVITE_TOKEN: 'invite_token',
});

/** Media asset status */
export const MEDIA_STATUS = Object.freeze({
  PENDING: 'pending',
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
  DELETED: 'deleted',
});

/** Projection levels for ABAC mappers */
export const PROJECTION_LEVELS = Object.freeze({
  PUBLIC: 'public',
  ASSIGNEE: 'assignee',
  INTERNAL: 'internal',
});

/** Standard actions for policy engine */
export const ACTIONS = Object.freeze({
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  VERIFY: 'verify',
  ASSIGN: 'assign',
  CLAIM: 'claim',
});

export default {
  ROLES,
  ORG_TYPES,
  ORG_VERIFICATION_STATES,
  CHALLENGE_WORKFLOW_STATES,
  MEMBERSHIP_STATUS,
  AUTH_CHANNELS,
  MEDIA_STATUS,
  PROJECTION_LEVELS,
  ACTIONS,
};
