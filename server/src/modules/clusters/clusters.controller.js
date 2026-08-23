import * as clustersService from './clusters.service.js';
import clustersPolicy, { projectCluster } from './clusters.policy.js';

export async function listClusters(req, res) {
  const result = await clustersService.list({ ...req.query, actor: req.user });
  res.json({
    data: result.data.map((c) => projectCluster(c, req.projection || 'assignee')),
    pagination: result.pagination,
  });
}

export async function getCluster(req, res) {
  const cluster = await clustersService.findById(req.params.id);
  res.json({ data: projectCluster(cluster, req.projection || 'assignee') });
}

export default { listClusters, getCluster };
