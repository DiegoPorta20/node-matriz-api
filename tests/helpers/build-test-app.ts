import jwt from 'jsonwebtoken';
import type { Express } from 'express';

import { CalculateStatisticsUseCase } from '../../src/application/calculate-statistics.use-case';
import { createLogger } from '../../src/infrastructure/logger/logger';
import { AccessTokenVerifier } from '../../src/infrastructure/token/access-token-verifier';
import { HealthController } from '../../src/presentation/controllers/health-controller';
import { StatisticsController } from '../../src/presentation/controllers/statistics-controller';
import { createServer } from '../../src/presentation/server';

export const TEST_SECRET = 'an-integration-test-secret-32-chars!';

export const buildTestApp = (): Express =>
  createServer(createLogger('silent'), {
    health: new HealthController(),
    statistics: new StatisticsController(new CalculateStatisticsUseCase()),
    tokenVerifier: new AccessTokenVerifier(TEST_SECRET),
  });

export const validToken = (): string =>
  jwt.sign({ sub: 'demo' }, TEST_SECRET, { algorithm: 'HS256', expiresIn: '1h' });

export const bearer = (): string => `Bearer ${validToken()}`;
