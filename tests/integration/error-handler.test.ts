import express from 'express';
import request from 'supertest';
import type { Express, RequestHandler } from 'express';

import { createLogger } from '../../src/infrastructure/logger/logger';
import { errorHandler } from '../../src/presentation/middleware/error-handler';

interface ErrorEnvelope {
  success: boolean;
  message: string;
  errors: string[];
  timestamp: string;
}

const appRaising = (error: unknown): Express => {
  const app = express();
  const failing: RequestHandler = () => {
    throw error;
  };

  app.post('/resource', failing);
  app.use(errorHandler(createLogger('silent')));

  return app;
};

describe('errorHandler con un error que nadie mapeó', () => {
  const unexpected = new Error('connect ECONNREFUSED 10.0.0.5:5432');

  it('responde 500 con el envoltorio de error', async () => {
    const response = await request(appRaising(unexpected)).post('/resource');

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Unexpected error while processing the request',
      errors: [],
    });
  });

  it('no filtra el mensaje interno ni la traza', async () => {
    const response = await request(appRaising(unexpected)).post('/resource');

    const body = JSON.stringify(response.body);
    expect(body).not.toContain('10.0.0.5');
    expect(body).not.toContain('ECONNREFUSED');
    expect(body).not.toMatch(/at .*\.ts:|node_modules/);
  });

  it('incluye un timestamp válido', async () => {
    const response = await request(appRaising(unexpected)).post('/resource');

    const { timestamp } = response.body as ErrorEnvelope;
    expect(Number.isNaN(Date.parse(timestamp))).toBe(false);
  });

  it('responde 500 aunque lo lanzado no sea un Error', async () => {
    const response = await request(appRaising('just a string')).post('/resource');

    expect(response.status).toBe(500);
    expect((response.body as ErrorEnvelope).message).toBe(
      'Unexpected error while processing the request',
    );
  });
});
