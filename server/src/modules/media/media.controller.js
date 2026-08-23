import * as mediaService from './media.service.js';
import mediaPolicy, { projectMedia } from './media.policy.js';

export async function createMedia(req, res) {
  const asset = await mediaService.createRecord(req.body, req.user.id);
  res.status(201).json({ data: projectMedia(asset, 'assignee') });
}

export async function getMedia(req, res) {
  const asset = await mediaService.findById(req.params.id);
  res.json({ data: projectMedia(asset, req.projection || 'assignee') });
}

export async function listMedia(req, res) {
  const result = await mediaService.list(req.query);
  res.json({
    data: result.data.map((a) => projectMedia(a, req.projection || 'assignee')),
    pagination: result.pagination,
  });
}

export async function getSignedUrl(req, res) {
  const result = await mediaService.getSignedUrl(req.params.id, req.user);
  res.json({
    data: {
      url: result.url,
      expiresAt: result.expiresAt,
      stub: result.stub ?? false,
      asset: projectMedia(result.asset, req.projection || 'assignee'),
    },
  });
}

export default { createMedia, getMedia, listMedia, getSignedUrl };
