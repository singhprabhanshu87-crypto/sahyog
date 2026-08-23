import config from '../../config/index.js';
import { ReviewQueue } from './classification.schema.js';
import {
  REVIEW_QUEUE_STATUS,
  REVIEW_REASONS,
  TRIAGE_TYPES,
} from './classification.constants.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import * as aiService from '../ai/ai.service.js';
import * as taxonomyService from '../taxonomy/taxonomy.service.js';
import * as submissionsService from '../submissions/submissions.service.js';
import { buildTriagePrompt } from '../ai/prompts/triage.prompt.js';
import { buildCategorizePrompt } from '../ai/prompts/categorize.prompt.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import { EMITTED } from './classification.events.js';

export async function triage(submission) {
  const text = submission.textNormalized || submission.text || '';
  const prompt = buildTriagePrompt({ text, locale: submission.locale });

  const result = await aiService.complete({
    prompt,
    operation: 'triage',
    model: config.AI_MODEL_TRIAGE,
    resourceType: 'submission',
    resourceId: submission._id?.toString?.() ?? submission.id,
  });

  let triage = {
    type: TRIAGE_TYPES.UNKNOWN,
    confidence: 0,
    needsReview: true,
    rationale: result.rationale || result.reason || null,
  };

  if (!result.degraded && result.type) {
    triage = {
      type: result.type,
      confidence: result.confidence ?? 0.5,
      needsReview: (result.confidence ?? 0) < config.TRIAGE_CONFIDENCE_THRESHOLD,
      rationale: result.rationale || null,
    };
  } else {
  // Keyword-based fallback when AI is unavailable
    const lower = text.toLowerCase();
    if (/शिकायत|grievance|complaint|सरकार/.test(lower)) {
      triage = { type: TRIAGE_TYPES.GRIEVANCE, confidence: 0.6, needsReview: true };
    } else if (/problem|challenge|समस्या|issue/.test(lower)) {
      triage = { type: TRIAGE_TYPES.CHALLENGE, confidence: 0.6, needsReview: true };
    }
  }

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.TRIAGED,
    resourceType: 'submission',
    resourceId: submission._id?.toString?.() ?? submission.id,
    payload: { type: triage.type, confidence: triage.confidence },
  });

  if (triage.needsReview) {
    await enqueueReview(submission._id, REVIEW_REASONS.LOW_CONFIDENCE_TRIAGE, { triageResult: triage });
  }

  return triage;
}

export async function categorize(submission) {
  const text = submission.textNormalized || submission.text || '';
  const taxonomy = await taxonomyService.getActive();
  const prompt = buildCategorizePrompt({ text, domains: taxonomy.domains });

  const result = await aiService.complete({
    prompt,
    operation: 'categorize',
    model: config.AI_MODEL_CATEGORIZE,
    resourceType: 'submission',
    resourceId: submission._id?.toString?.() ?? submission.id,
  });

  let categories = [];

  if (!result.degraded && result.categories?.length) {
    categories = result.categories.map((c) => ({
      domainId: c.domainId,
      label: c.label || taxonomyService.getDomainById(c.domainId, taxonomy)?.label,
      confidence: c.confidence ?? 0.5,
    }));
  } else {
    // Keyword fallback
    for (const domain of taxonomy.domains || []) {
      const keywords = domain.keywords || [];
      const matched = keywords.some((kw) =>
        text.toLowerCase().includes(kw.toLowerCase()),
      );
      if (matched) {
        categories.push({ domainId: domain.id, label: domain.label, confidence: 0.55 });
      }
    }
  }

  const needsReview = categories.some(
    (c) => (c.confidence ?? 0) < config.CATEGORY_CONFIDENCE_THRESHOLD,
  ) || categories.length === 0;

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.CATEGORIZED,
    resourceType: 'submission',
    resourceId: submission._id?.toString?.() ?? submission.id,
    payload: { categoryCount: categories.length },
  });

  if (needsReview) {
    await enqueueReview(submission._id, REVIEW_REASONS.LOW_CONFIDENCE_CATEGORY, {
      categoryResult: categories,
    });
  }

  return categories;
}

export async function runClassification(submissionId) {
  const submission = await submissionsService.findById(submissionId);
  const triageResult = await triage(submission);
  const categories = await categorize(submission);

  await submissionsService.updateAfterClassification(submissionId, {
    triage: triageResult,
    categories,
  });

  return { triage: triageResult, categories };
}

export async function enqueueReview(submissionId, reason, data = {}) {
  const existing = await ReviewQueue.findOne({
    submissionId,
    status: REVIEW_QUEUE_STATUS.PENDING,
  }).lean();

  if (existing) return existing;

  const item = await ReviewQueue.create({
    submissionId,
    reason,
    ...data,
  });

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.REVIEW_QUEUED,
    resourceType: 'review_queue',
    resourceId: item._id.toString(),
    payload: { submissionId: submissionId.toString(), reason },
  });

  return item.toObject();
}

export async function listReviewQueue({ status, page, limit }) {
  const filter = {};
  if (status) filter.status = status;
  else filter.status = REVIEW_QUEUE_STATUS.PENDING;

  return paginate(ReviewQueue, { filter, page, limit });
}

export async function applyOverride(reviewId, overrideData, actor) {
  const item = await ReviewQueue.findById(reviewId);
  if (!item) throw new NotFoundError('Review queue item not found');

  const triage = overrideData.triage || item.override?.triage || item.triageResult;
  const categories = overrideData.categories || item.override?.categories || item.categoryResult;

  item.status = REVIEW_QUEUE_STATUS.RESOLVED;
  item.resolvedBy = actor.id;
  item.resolvedAt = new Date();
  item.override = {
    triage,
    categories,
    rationale: overrideData.rationale,
  };
  await item.save();

  await submissionsService.updateAfterClassification(item.submissionId.toString(), {
    triage: triage ? { ...triage, needsReview: false } : undefined,
    categories,
  });

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: EMITTED.OVERRIDE,
    resourceType: 'review_queue',
    resourceId: reviewId,
    payload: {
      submissionId: item.submissionId.toString(),
      triageType: triage?.type,
    },
    rationale: overrideData.rationale,
  });

  return item.toObject();
}

export default {
  triage,
  categorize,
  runClassification,
  enqueueReview,
  listReviewQueue,
  applyOverride,
};
