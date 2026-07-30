import pino from 'pino';
import type { Logger } from 'pino';

export type { Logger };

export const createLogger = (level: string): Logger =>
  pino({
    level,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'headers.authorization'],
      censor: '[redacted]',
    },
  });
