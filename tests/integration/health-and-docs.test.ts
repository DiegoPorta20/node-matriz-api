import request from 'supertest';

import { buildTestApp } from '../helpers/build-test-app';

const app = buildTestApp();

describe('GET /health', () => {
  it('answers without a token, because the container probe has none to send', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /swagger', () => {
  it('serves the documentation UI', async () => {
    const response = await request(app).get('/swagger/').redirects(1);

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger');
  });
});

describe('unknown routes', () => {
  it('answers 404 with the same envelope as every other error', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: expect.any(String) as string,
      errors: expect.any(Array) as string[],
      timestamp: expect.any(String) as string,
    });
  });

  it('answers 404 for the statistics path under the wrong method', async () => {
    const response = await request(app).get('/api/v1/statistics');

    expect(response.status).toBe(404);
  });
});

describe('security headers', () => {
  it('sets the headers helmet is there to provide', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['referrer-policy']).toBeDefined();
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('does not advertise the framework', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
