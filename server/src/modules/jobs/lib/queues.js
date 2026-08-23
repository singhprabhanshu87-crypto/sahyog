import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../../../config/index.js';
import { QUEUE_NAMES, JOB_NAMES } from '../jobs.constants.js';
import logger from '../../../common/lib/logger.js';

let connection = null;
const queues = new Map();

function createRedisConnection() {
  if (connection) return connection;
  connection = new IORedis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    ...(config.REDIS_TLS && { tls: {} }),
  });
  return connection;
}

function defaultJobOptions() {
  return {
    attempts: config.JOB_DEFAULT_ATTEMPTS,
    backoff: { type: 'exponential', delay: config.JOB_BACKOFF_MS },
    removeOnComplete: { count: config.JOB_REMOVE_ON_COMPLETE },
    removeOnFail: { count: config.JOB_REMOVE_ON_FAIL },
  };
}

function buildJobId(queueName, resourceType, resourceId, suffix = '') {
  const base = `${queueName}:${resourceType}:${resourceId}`;
  return suffix ? `${base}:${suffix}` : base;
}

function getQueue(name) {
  if (queues.has(name)) return queues.get(name);

  const queue = new Queue(name, {
    connection: createRedisConnection(),
    prefix: config.BULLMQ_PREFIX,
    defaultJobOptions: defaultJobOptions(),
  });

  queues.set(name, queue);
  return queue;
}

export function getAllQueues() {
  return Object.values(QUEUE_NAMES).map((name) => getQueue(name));
}

async function enqueue(queueName, jobName, data, { resourceType, resourceId, suffix, opts = {} } = {}) {
  const queue = getQueue(queueName);
  const jobId = resourceType && resourceId
    ? buildJobId(queueName, resourceType, resourceId, suffix)
    : undefined;

  try {
    const job = await queue.add(jobName, data, {
      ...defaultJobOptions(),
      ...opts,
      ...(jobId && { jobId }),
    });
    logger.debug({ queueName, jobName, jobId: job.id }, 'Job enqueued');
    return job;
  } catch (err) {
    if (err.message?.includes('JobId') || err.message?.includes('already exists')) {
      logger.debug({ queueName, jobName, jobId }, 'Job already queued (idempotent)');
      return { id: jobId, duplicate: true };
    }
    throw err;
  }
}

export async function enqueueIntake(submissionId, payload = {}) {
  return enqueue(QUEUE_NAMES.INTAKE, JOB_NAMES.INTAKE_PROCESS, {
    submissionId,
    ...payload,
  }, { resourceType: 'submission', resourceId: submissionId });
}

export async function enqueueEmbedding(submissionId, payload = {}) {
  return enqueue(QUEUE_NAMES.EMBEDDING, JOB_NAMES.EMBEDDING_GENERATE, {
    submissionId,
    ...payload,
  }, { resourceType: 'submission', resourceId: submissionId });
}

export async function enqueueDedup(submissionId, payload = {}) {
  return enqueue(QUEUE_NAMES.DEDUP, JOB_NAMES.DEDUP_CHECK, {
    submissionId,
    ...payload,
  }, { resourceType: 'submission', resourceId: submissionId });
}

export async function enqueueClassification(submissionId, payload = {}) {
  return enqueue(QUEUE_NAMES.CLASSIFICATION, JOB_NAMES.CLASSIFICATION_RUN, {
    submissionId,
    ...payload,
  }, { resourceType: 'submission', resourceId: submissionId });
}

export async function enqueueMatching(submissionId, payload = {}) {
  return enqueue(QUEUE_NAMES.MATCHING, JOB_NAMES.MATCHING_SHORTLIST, {
    submissionId,
    ...payload,
  }, { resourceType: 'submission', resourceId: submissionId });
}

export async function enqueueNotification(data, { resourceType, resourceId, suffix } = {}) {
  return enqueue(QUEUE_NAMES.NOTIFICATIONS, JOB_NAMES.NOTIFICATION_SEND, data, {
    resourceType,
    resourceId,
    suffix,
  });
}

export async function enqueueScheduled(jobName, data, opts = {}) {
  return enqueue(QUEUE_NAMES.SCHEDULED, jobName, data, opts);
}

export async function closeQueues() {
  for (const queue of queues.values()) {
    await queue.close();
  }
  queues.clear();
  if (connection) {
    connection.disconnect();
    connection = null;
  }
}

export default {
  getQueue,
  getAllQueues,
  enqueueIntake,
  enqueueEmbedding,
  enqueueDedup,
  enqueueClassification,
  enqueueMatching,
  enqueueNotification,
  enqueueScheduled,
  closeQueues,
  buildJobId,
};
