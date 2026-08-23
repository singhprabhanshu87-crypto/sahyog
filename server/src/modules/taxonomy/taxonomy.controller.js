import * as taxonomyService from './taxonomy.service.js';
import taxonomyPolicy, { projectTaxonomy } from './taxonomy.policy.js';
import { toDomainList } from './taxonomy.mapper.js';

export async function getTaxonomy(req, res) {
  const taxonomy = await taxonomyService.getActive({ version: req.query.version });
  res.json({ data: projectTaxonomy(taxonomy, req.projection || 'public') });
}

export async function listDomains(req, res) {
  const taxonomy = await taxonomyService.getActive({ version: req.query.version });
  res.json({ data: toDomainList(taxonomy) });
}

export default { getTaxonomy, listDomains };
