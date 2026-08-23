import * as service from './claims.service.js';
import claimsPolicy, { projectClaim } from './claims.policy.js';

export async function createClaim(req, res) {
  const claim = await service.create(req.body, req.user);
  res.status(201).json({ data: projectClaim(claim, req.projection || 'assignee') });
}

export async function listClaims(req, res) {
  const result = await service.list(req.query);
  res.json({
    data: result.data.map((c) => projectClaim(c, req.projection || 'assignee')),
    pagination: result.pagination,
  });
}

export async function releaseClaim(req, res) {
  const claim = await service.release(req.params.id, req.user, { reason: req.body.reason });
  res.json({ data: projectClaim(claim, req.projection || 'internal') });
}

export default { createClaim, listClaims, releaseClaim };
