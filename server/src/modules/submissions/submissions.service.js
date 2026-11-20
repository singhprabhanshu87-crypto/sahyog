import { customAlphabet } from 'nanoid';
import { Submission } from './submissions.schema.js';
import { SUBMISSION_STATUS, SUBMISSION_TYPES } from './submissions.constants.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import * as geoService from '../geo/geo.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors/http-errors.js';
import { EMITTED } from './submissions.events.js';

const generateTrackingId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10);

export async function create(data, actor) {
  if (!data.consentGiven) {
    throw new BadRequestError('Consent is required to submit');
  }

  const trackingId = generateTrackingId();
  const isAssisted = data.submissionType === SUBMISSION_TYPES.ASSISTED;

  let location = data.location || null;
  let publicLocation = null;

  if (location?.lat && location?.lng) {
    const resolution = await geoService.resolvePoint(location.lat, location.lng);
    location = {
      lat: location.lat,
      lng: location.lng,
      districtCode: resolution.district?.code || null,
      blockCode: resolution.block?.code || null,
      panchayatCode: resolution.panchayat?.code || null,
    };
    publicLocation = resolution.publicLocation;
  }

  const submission = await Submission.create({
    trackingId,
    text: data.text || null,
    voiceMediaId: data.voiceMediaId || null,
    mediaRefs: data.mediaRefs || [],
    location,
    publicLocation,
    consentGiven: true,
    submissionType: data.submissionType || SUBMISSION_TYPES.DIRECT,
    channel: data.channel,
    locale: data.locale || null,
    originatorId: isAssisted ? data.originatorId || null : actor?.id || null,
    facilitatorId: isAssisted ? actor?.id || null : null,
    submittedBy: actor?.id || null,
    status: SUBMISSION_STATUS.RECEIVED,
  });

  await publish({
    actor: actor ? { id: actor.id, type: 'user', role: actor.role } : { id: 'anonymous', type: 'user' },
    action: EMITTED.CREATED,
    resourceType: 'submission',
    resourceId: submission._id.toString(),
    payload: {
      trackingId,
      submissionType: submission.submissionType,
      districtCode: location?.districtCode,
    },
  });

  return submission.toObject();
}

export async function findByTrackingId(trackingId) {
  const submission = await Submission.findOne({ trackingId }).lean();
  if (!submission) throw new NotFoundError('Submission not found');
  return submission;
}

export async function findById(id) {
  const submission = await Submission.findById(id).lean();
  if (!submission) throw new NotFoundError('Submission not found');
  return submission;
}

export async function list({ status, districtCode, clusterId, page, limit, actor }) {
  const filter = {};

  if (status) filter.status = status;
  if (clusterId) filter.clusterId = clusterId;
  if (districtCode) filter['location.districtCode'] = districtCode;

  if (actor?.role === 'district_officer' && actor.districts?.length) {
    filter['location.districtCode'] = { $in: actor.districts };
  }

  if (actor?.role === 'citizen') {
    filter.submittedBy = actor.id;
  }

  return paginate(Submission, { filter, page, limit });
}

export async function updateStatus(id, status, extra = {}) {
  const submission = await Submission.findByIdAndUpdate(
    id,
    { $set: { status, ...extra } },
    { new: true },
  ).lean();

  if (!submission) throw new NotFoundError('Submission not found');
  return submission;
}

export async function updateAfterIntake(id, { textNormalized, locale, needsHumanAssist }) {
  return updateStatus(id, SUBMISSION_STATUS.INTAKE, {
    textNormalized,
    locale,
    metadata: { needsHumanAssist },
  });
}

export async function updateAfterEmbedding(id, { embedding, embeddingModelVersion }) {
  const submission = await Submission.findByIdAndUpdate(
    id,
    {
      $set: {
        status: SUBMISSION_STATUS.EMBEDDING,
        embedding,
        embeddingModelVersion,
      },
    },
    { new: true },
  ).lean();

  if (!submission) throw new NotFoundError('Submission not found');

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.EMBEDDED,
    resourceType: 'submission',
    resourceId: id,
    payload: { embeddingModelVersion },
  });

  return submission;
}

export async function updateAfterDedup(id, { clusterId }) {
  const submission = await updateStatus(id, SUBMISSION_STATUS.DEDUP, { clusterId });

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.DEDUPED,
    resourceType: 'submission',
    resourceId: id,
    payload: { clusterId },
  });

  return submission;
}

export async function updateAfterClassification(id, { triage, categories } = {}) {
  const $set = { status: SUBMISSION_STATUS.TRIAGED };
  if (triage !== undefined) $set.triage = triage;
  if (categories !== undefined) $set.categories = categories;

  const submission = await Submission.findByIdAndUpdate(id, { $set }, { new: true }).lean();

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.CLASSIFIED,
    resourceType: 'submission',
    resourceId: id,
    payload: { triageType: triage?.type, categoryCount: categories?.length },
  });

  return submission;
}

export default {
  create,
  findByTrackingId,
  findById,
  list,
  updateStatus,
  updateAfterIntake,
  updateAfterEmbedding,
  updateAfterDedup,
  updateAfterClassification,
};
