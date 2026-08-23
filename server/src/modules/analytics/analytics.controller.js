import * as service from './analytics.service.js';
import analyticsPolicy, { projectSnapshot } from './analytics.policy.js';

export async function getDashboard(req, res) {
  const snapshot = await service.getDashboard(req.query);
  res.json({ data: projectSnapshot(snapshot, req.projection || 'assignee') });
}

export async function getDistricts(req, res) {
  const snapshot = await service.getDistricts(req.query);
  res.json({ data: projectSnapshot(snapshot, req.projection || 'assignee') });
}

export default { getDashboard, getDistricts };
