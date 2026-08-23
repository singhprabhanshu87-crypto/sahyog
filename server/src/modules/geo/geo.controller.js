import * as geoService from './geo.service.js';
import geoPolicy, { projectBoundary } from './geo.policy.js';
import { toResolvedLocation } from './geo.mapper.js';

export async function resolvePoint(req, res) {
  const { lat, lng } = req.body;
  const resolution = await geoService.resolveAndPublish(lat, lng, req.user || { id: 'anonymous', type: 'user' });
  res.json({ data: toResolvedLocation(resolution) });
}

export async function listBoundaries(req, res) {
  const result = await geoService.list(req.query);
  res.json({
    data: result.data.map((b) => projectBoundary(b, req.projection || 'public')),
    pagination: result.pagination,
  });
}

export default { resolvePoint, listBoundaries };
