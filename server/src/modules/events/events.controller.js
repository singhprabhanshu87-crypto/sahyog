import * as eventsService from './events.service.js';
import { projectEvent } from './events.policy.js';

export async function listEvents(req, res) {
  const result = await eventsService.query(req.query);
  const projection = req.projection || 'assignee';

  res.json({
    data: result.data.map((e) => projectEvent(e, projection)),
    pagination: result.pagination,
  });
}

export async function getResourceEvents(req, res) {
  const { resourceType, resourceId } = req.params;
  const result = await eventsService.getByResource(resourceType, resourceId, req.query);
  const projection = req.projection || 'assignee';

  res.json({
    data: result.data.map((e) => projectEvent(e, projection)),
    pagination: result.pagination,
  });
}

export default { listEvents, getResourceEvents };
