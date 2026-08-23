import { nanoid } from 'nanoid';
import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage();

export function requestContextMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || nanoid();
  const correlationId = req.headers['x-correlation-id'] || requestId;

  res.setHeader('x-request-id', requestId);

  const context = {
    requestId,
    correlationId,
    actor: null,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  req.context = context;

  storage.run(context, () => next());
}

export function setActor(actor) {
  const context = storage.getStore();
  if (context) {
    context.actor = actor;
  }
}

export function getContext() {
  return storage.getStore() || {};
}

export default { requestContextMiddleware, setActor, getContext };
