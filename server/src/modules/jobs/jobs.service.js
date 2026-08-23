import { JobAudit } from './jobs.schema.js';
import { getAllQueues } from './lib/queues.js';
import { publish } from '../../common/lib/event-bus.js';
import logger from '../../common/lib/logger.js';

export async function recordQueued({ queueName, jobName, jobId, resourceType, resourceId }) {
  const record = await JobAudit.create({
    queueName,
    jobName,
    jobId,
    resourceType,
    resourceId,
    status: 'queued',
  });

  await publish({
    actor: { id: 'system', type: 'system' },
    action: 'job.enqueued',
    resourceType: 'job',
    resourceId: record._id.toString(),
    payload: { queueName, jobName, jobId, resourceType, resourceId },
  });

  return record.toObject();
}

export async function recordCompleted(jobId, result) {
  const record = await JobAudit.findOneAndUpdate(
    { jobId },
    { $set: { status: 'completed', result, completedAt: new Date() } },
    { new: true },
  ).lean();

  if (record) {
    await publish({
      actor: { id: 'system', type: 'system' },
      action: 'job.completed',
      resourceType: 'job',
      resourceId: record._id.toString(),
      payload: { jobId, queueName: record.queueName },
    });
  }

  return record;
}

export async function recordFailed(jobId, error) {
  const record = await JobAudit.findOneAndUpdate(
    { jobId },
    {
      $set: { status: 'failed', error: error?.message || String(error), completedAt: new Date() },
      $inc: { attempts: 1 },
    },
    { new: true },
  ).lean();

  if (record) {
    await publish({
      actor: { id: 'system', type: 'system' },
      action: 'job.failed',
      resourceType: 'job',
      resourceId: record._id.toString(),
      payload: { jobId, error: error?.message },
    });
  }

  return record;
}

export async function getQueueStatus() {
  const statuses = [];

  for (const queue of getAllQueues()) {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      statuses.push({
        name: queue.name,
        waiting,
        active,
        completed,
        failed,
      });
    } catch (err) {
      logger.warn({ queue: queue.name, err }, 'Failed to get queue status');
      statuses.push({ name: queue.name, error: err.message });
    }
  }

  return statuses;
}

export default { recordQueued, recordCompleted, recordFailed, getQueueStatus };
