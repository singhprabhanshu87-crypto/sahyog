import { Cluster } from './clusters.schema.js';
import { Submission } from '../submissions/submissions.schema.js';
import { CLUSTER_STATUS } from './clusters.constants.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import { EMITTED } from './clusters.events.js';

export async function createFromSubmissions(submissionIds, { districtCode } = {}) {
  const ids = submissionIds.map((id) => id.toString());
  const representativeSubmissionId = ids[0];

  const submissions = await Submission.find({ _id: { $in: ids } }).lean();
  const triageType = submissions.find((s) => s.triage?.type)?.triage?.type || null;
  const categories = submissions.find((s) => s.categories?.length)?.categories || [];

  const cluster = await Cluster.create({
    representativeSubmissionId,
    submissionIds: ids,
    duplicateCount: ids.length,
    districtCode: districtCode || submissions[0]?.location?.districtCode || null,
    triageType,
    categories,
    status: CLUSTER_STATUS.OPEN,
  });

  await Submission.updateMany(
    { _id: { $in: ids } },
    { $set: { clusterId: cluster._id } },
  );

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.CREATED,
    resourceType: 'cluster',
    resourceId: cluster._id.toString(),
    payload: { submissionCount: ids.length, districtCode },
  });

  return cluster.toObject();
}

export async function attachSubmission(clusterId, submissionId) {
  const cluster = await Cluster.findById(clusterId);
  if (!cluster) throw new NotFoundError('Cluster not found');

  const sid = submissionId.toString();
  if (!cluster.submissionIds.some((id) => id.toString() === sid)) {
    cluster.submissionIds.push(submissionId);
    cluster.duplicateCount = cluster.submissionIds.length;
  }

  const submission = await Submission.findById(submissionId).lean();
  if (submission?.triage?.type && !cluster.triageType) {
    cluster.triageType = submission.triage.type;
  }
  if (submission?.categories?.length && !cluster.categories?.length) {
    cluster.categories = submission.categories;
  }

  await cluster.save();
  await Submission.findByIdAndUpdate(submissionId, { $set: { clusterId: cluster._id } });

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.UPDATED,
    resourceType: 'cluster',
    resourceId: clusterId,
    payload: { submissionId: sid, duplicateCount: cluster.duplicateCount },
  });

  return cluster.toObject();
}

export async function propagateStatus(clusterId, status) {
  const cluster = await Cluster.findByIdAndUpdate(
    clusterId,
    { $set: { status } },
    { new: true },
  ).lean();

  if (!cluster) throw new NotFoundError('Cluster not found');

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.STATUS_CHANGED,
    resourceType: 'cluster',
    resourceId: clusterId,
    payload: { status },
  });

  return cluster;
}

export async function findById(id) {
  const cluster = await Cluster.findById(id).lean();
  if (!cluster) throw new NotFoundError('Cluster not found');
  return cluster;
}

export async function list({ status, districtCode, page, limit, actor }) {
  const filter = {};
  if (status) filter.status = status;
  if (districtCode) filter.districtCode = districtCode;

  if (actor?.role === 'district_officer' && actor.districts?.length) {
    filter.districtCode = { $in: actor.districts };
  }

  return paginate(Cluster, { filter, page, limit });
}

export default {
  createFromSubmissions,
  attachSubmission,
  propagateStatus,
  findById,
  list,
};
