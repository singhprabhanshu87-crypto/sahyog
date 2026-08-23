export const AGREEMENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_SIGNATURES: 'pending_signatures',
  SIGNED: 'signed',
  VOID: 'void',
});

export const SIGNER_ROLES = Object.freeze({
  HEI_REP: 'hei_rep',
  INDUSTRY_REP: 'industry_rep',
  PMU_REP: 'pmu_rep',
  COMMUNITY_REP: 'community_rep',
});

export default { AGREEMENT_STATUS, SIGNER_ROLES };
