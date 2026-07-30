import pinoHttp from 'pino-http';
import type { HttpLogger } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Logger } from '../../infrastructure/logger/logger';

export const requestLogger = (logger: Logger): HttpLogger =>
  pinoHttp({
    logger,
    serializers: {
      req: (request: IncomingMessage) => ({ method: request.method, url: request.url }),
      res: (response: ServerResponse) => ({ status: response.statusCode }),
    },
  });
