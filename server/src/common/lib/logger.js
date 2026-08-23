import pino from 'pino';
import config from '../../config/index.js';

const logger = pino({
  level: config.LOG_LEVEL,
  ...(config.isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

export function childLogger(bindings = {}) {
  return logger.child(bindings);
}

export default logger;
