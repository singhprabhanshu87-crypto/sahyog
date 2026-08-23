import * as classificationService from './classification.service.js';
import classificationPolicy, { projectReviewItem } from './classification.policy.js';

export async function listReviewQueue(req, res) {
  const result = await classificationService.listReviewQueue(req.query);
  res.json({
    data: result.data.map((item) => projectReviewItem(item, req.projection || 'internal')),
    pagination: result.pagination,
  });
}

export async function overrideClassification(req, res) {
  const item = await classificationService.applyOverride(req.params.id, req.body, req.user);
  res.json({ data: projectReviewItem(item, 'internal') });
}

export default { listReviewQueue, overrideClassification };
