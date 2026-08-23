import { Taxonomy } from './taxonomy.schema.js';
import {
  TAXONOMY_VERSION,
  THEMATIC_DOMAINS,
  TRL_BANDS,
  SRL_BANDS,
  CLOSURE_REASON_CODES,
} from './taxonomy.constants.js';
import { NotFoundError } from '../../common/errors/http-errors.js';

export async function ensureSeed() {
  const existing = await Taxonomy.findOne({ version: TAXONOMY_VERSION }).lean();
  if (existing) return existing;

  const taxonomy = await Taxonomy.create({
    version: TAXONOMY_VERSION,
    domains: THEMATIC_DOMAINS,
    trlBands: TRL_BANDS,
    srlBands: SRL_BANDS,
    closureReasonCodes: CLOSURE_REASON_CODES,
    isActive: true,
  });

  return taxonomy.toObject();
}

export async function getActive({ version } = {}) {
  const targetVersion = version || TAXONOMY_VERSION;
  let taxonomy = await Taxonomy.findOne({ version: targetVersion, isActive: true }).lean();

  if (!taxonomy) {
    taxonomy = await ensureSeed();
  }

  return taxonomy;
}

export async function listDomains({ version } = {}) {
  const taxonomy = await getActive({ version });
  return taxonomy.domains || [];
}

export function getDomainById(domainId, taxonomy) {
  return (taxonomy?.domains || []).find((d) => d.id === domainId) || null;
}

export default { ensureSeed, getActive, listDomains, getDomainById };
