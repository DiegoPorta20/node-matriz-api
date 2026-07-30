import jwt from 'jsonwebtoken';
import request from 'supertest';

import { buildTestApp, TEST_SECRET, validToken } from '../helpers/build-test-app';

const app = buildTestApp();

const matrices = {
  q: [
    [1, 0],
    [0, 1],
  ],
  r: [
    [5, 6],
    [0, 7],
  ],
};

describe('X-Access-Token como alternativa a Authorization', () => {
  it('acepta un token válido en X-Access-Token', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('X-Access-Token', validToken())
      .send(matrices);

    expect(response.status).toBe(200);
    expect((response.body as { success: boolean }).success).toBe(true);
  });

  it('acepta X-Access-Token aunque Authorization lleve una firma SigV4', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set(
        'Authorization',
        'AWS4-HMAC-SHA256 Credential=AKIA/20260730/eu-west-1/lambda/aws4_request, SignedHeaders=host, Signature=abc',
      )
      .set('X-Access-Token', validToken())
      .send(matrices);

    expect(response.status).toBe(200);
  });

  it('rechaza un token inválido en X-Access-Token', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('X-Access-Token', 'no-es-un-jwt')
      .send(matrices);

    expect(response.status).toBe(401);
  });

  it('rechaza un token firmado con otro secreto en X-Access-Token', async () => {
    const forastero = jwt.sign({ sub: 'demo' }, 'un-secreto-completamente-distinto-32', {
      expiresIn: '1h',
    });

    const response = await request(app)
      .post('/api/v1/statistics')
      .set('X-Access-Token', forastero)
      .send(matrices);

    expect(response.status).toBe(401);
  });

  it('rechaza un token expirado en X-Access-Token', async () => {
    const expirado = jwt.sign({ sub: 'demo' }, TEST_SECRET, { expiresIn: '-1m' });

    const response = await request(app)
      .post('/api/v1/statistics')
      .set('X-Access-Token', expirado)
      .send(matrices);

    expect(response.status).toBe(401);
  });

  it('rechaza un X-Access-Token vacío', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('X-Access-Token', '   ')
      .send(matrices);

    expect(response.status).toBe(401);
  });

  it('prefiere X-Access-Token cuando llegan las dos', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', 'Bearer no-es-un-jwt')
      .set('X-Access-Token', validToken())
      .send(matrices);

    expect(response.status).toBe(200);
  });

  it('sigue aceptando Authorization Bearer, que es la ruta de docker compose', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', `Bearer ${validToken()}`)
      .send(matrices);

    expect(response.status).toBe(200);
  });

  it('rechaza cuando no llega ninguna de las dos', async () => {
    const response = await request(app).post('/api/v1/statistics').send(matrices);

    expect(response.status).toBe(401);
  });
});
