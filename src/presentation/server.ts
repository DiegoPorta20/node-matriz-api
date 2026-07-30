import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

import type { Logger } from '../infrastructure/logger/logger';
import { buildOpenApiSpecification } from '../infrastructure/swagger/openapi';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { requestLogger } from './middleware/request-logger';
import { buildHealthRouter, buildStatisticsRouter } from './routes/api-routes';
import type { RouteDependencies } from './routes/api-routes';

const MAX_BODY_SIZE = '1mb';

export const createServer = (logger: Logger, dependencies: RouteDependencies): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(requestLogger(logger));
  app.use(express.json({ limit: MAX_BODY_SIZE }));

  app.use(buildHealthRouter(dependencies));
  app.use('/api/v1', buildStatisticsRouter(dependencies));
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(buildOpenApiSpecification()));

  app.use(notFound());
  app.use(errorHandler(logger));

  return app;
};
