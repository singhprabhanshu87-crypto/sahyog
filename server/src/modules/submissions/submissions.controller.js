import * as submissionsService from './submissions.service.js';
import submissionsPolicy, { projectSubmission } from './submissions.policy.js';

export async function createSubmission(req, res) {
  const submission = await submissionsService.create(req.body, req.user);
  res.status(201).json({
    data: {
      trackingId: submission.trackingId,
      status: submission.status,
      createdAt: submission.createdAt,
    },
  });
}

export async function trackSubmission(req, res) {
  const submission = await submissionsService.findByTrackingId(req.params.trackingId);
  res.json({ data: projectSubmission(submission, 'public') });
}

export async function listSubmissions(req, res) {
  const result = await submissionsService.list({ ...req.query, actor: req.user });
  res.json({
    data: result.data.map((s) => projectSubmission(s, req.projection || 'assignee')),
    pagination: result.pagination,
  });
}

export default { createSubmission, trackSubmission, listSubmissions };
