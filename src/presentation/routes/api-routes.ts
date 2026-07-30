import { Router } from 'express';

import type { AccessTokenVerifier } from '../../infrastructure/token/access-token-verifier';
import type { HealthController } from '../controllers/health-controller';
import type { StatisticsController } from '../controllers/statistics-controller';
import { authenticate } from '../middleware/authenticate';

export interface RouteDependencies {
  readonly health: HealthController;
  readonly statistics: StatisticsController;
  readonly tokenVerifier: AccessTokenVerifier;
}

export const buildHealthRouter = (dependencies: RouteDependencies): Router => {
  const router = Router();
  router.get('/health', dependencies.health.check);
  return router;
};

export const buildStatisticsRouter = (dependencies: RouteDependencies): Router => {
  const router = Router();

  router.post(
    '/statistics',
    authenticate(dependencies.tokenVerifier),
    dependencies.statistics.calculate,
  );

  return router;
};
