import * as jobsService from './jobs.service.js';

export async function getQueueStatus(req, res) {
  const status = await jobsService.getQueueStatus();
  res.json({ data: status });
}

export default { getQueueStatus };
