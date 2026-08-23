import config from '../../config/index.js';
import logger from '../../common/lib/logger.js';
import { IntegrationLog } from './integrations.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { INTEGRATION_PROVIDERS, INTEGRATION_STATUS } from './integrations.constants.js';
import { getContext } from '../../common/middleware/request-context.js';

export async function forwardGrievance(data, actor) {
  const context = getContext();
  const log = await IntegrationLog.create({
    provider: INTEGRATION_PROVIDERS.GRIEVANCE,
    status: INTEGRATION_STATUS.PENDING,
    action: 'grievance.forward',
    payload: data,
    triggeredBy: actor.id,
    correlationId: context.correlationId,
  });

  let response;
  let status = INTEGRATION_STATUS.SENT;

  try {
    if (config.GRIEVANCE_FORWARD_ENABLED && config.GRIEVANCE_FORWARD_URL) {
      response = await fetch(config.GRIEVANCE_FORWARD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.GRIEVANCE_FORWARD_API_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        status = INTEGRATION_STATUS.FAILED;
        log.error = `HTTP ${response.status}`;
      } else {
        response = await response.json();
      }
    } else {
      response = { stub: true, message: 'Grievance forward stub — external system not configured' };
      logger.info({ challengeId: data.challengeId }, 'Grievance forward stub invoked');
    }
  } catch (err) {
    status = INTEGRATION_STATUS.FAILED;
    log.error = err.message;
    logger.warn({ err }, 'Grievance forward failed');
  }

  log.status = status;
  log.response = response;
  await log.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'integration.grievance_forwarded',
    resourceType: 'integration_log',
    resourceId: log._id.toString(),
    payload: { challengeId: data.challengeId, status },
  });

  return log.toObject();
}

export async function sendSmsStub({ to, message }, actor) {
  const log = await IntegrationLog.create({
    provider: INTEGRATION_PROVIDERS.SMS,
    status: INTEGRATION_STATUS.SENT,
    action: 'sms.send',
    payload: { to, message },
    triggeredBy: actor?.id,
    response: { stub: true },
  });
  logger.debug({ to }, 'SMS stub — not sent');
  return log.toObject();
}

export async function sendEmailStub({ to, subject, body }, actor) {
  const log = await IntegrationLog.create({
    provider: INTEGRATION_PROVIDERS.EMAIL,
    status: INTEGRATION_STATUS.SENT,
    action: 'email.send',
    payload: { to, subject },
    triggeredBy: actor?.id,
    response: { stub: true },
  });
  logger.debug({ to, subject }, 'Email stub — not sent');
  return log.toObject();
}

export default { forwardGrievance, sendSmsStub, sendEmailStub };
