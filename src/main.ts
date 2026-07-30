import type { Server } from 'node:http';

import { CalculateStatisticsUseCase } from './application/calculate-statistics.use-case';
import { loadEnvironment } from './infrastructure/config/environment';
import { createLogger } from './infrastructure/logger/logger';
import type { Logger } from './infrastructure/logger/logger';
import { AccessTokenVerifier } from './infrastructure/token/access-token-verifier';
import { HealthController } from './presentation/controllers/health-controller';
import { StatisticsController } from './presentation/controllers/statistics-controller';
import { createServer } from './presentation/server';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const start = (): void => {
  const environment = loadEnvironment();
  const logger = createLogger(environment.logLevel);

  const app = createServer(logger, {
    health: new HealthController(),
    statistics: new StatisticsController(new CalculateStatisticsUseCase()),
    tokenVerifier: new AccessTokenVerifier(environment.jwtSecret),
  });

  const server = app.listen(environment.port, () => {
    logger.info({ port: environment.port }, 'service started');
  });

  registerShutdownHandlers(server, logger);
};

const registerShutdownHandlers = (server: Server, logger: Logger): void => {
  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutdown requested');

    const forceExit = setTimeout(() => {
      logger.warn('shutdown timed out, exiting anyway');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(() => {
      logger.info('shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
};

try {
  start();
} catch (error) {
  process.stderr.write(`fatal: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
