import jwt from 'jsonwebtoken';
import request from 'supertest';

import { bearer, buildTestApp, TEST_SECRET } from '../helpers/build-test-app';

const app = buildTestApp();

const identityAndUpperTriangular = {
  q: [
    [1, 0],
    [0, 1],
  ],
  r: [
    [5, 6],
    [0, 7],
  ],
};

describe('POST /api/v1/statistics', () => {
  it('returns the statistics of both matrices in the agreed envelope', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .send(identityAndUpperTriangular);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        q: { max: 1, min: 0, average: 0.5, sum: 2, isDiagonal: true },
        r: { max: 7, min: 0, average: 4.5, sum: 18, isDiagonal: false },
      },
      message: expect.any(String) as string,
      timestamp: expect.any(String) as string,
    });
  });

  it('returns a timestamp that parses as a date', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .send(identityAndUpperTriangular);

    const { timestamp } = response.body as { timestamp: string };
    expect(Number.isNaN(Date.parse(timestamp))).toBe(false);
  });

  it('does not round the values it was given', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .send({ q: [[-0.31622776601683794]], r: [[-3.1622776601683795]] });

    const { data } = response.body as { data: { q: { sum: number } } };
    expect(data.q.sum).toBe(-0.31622776601683794);
  });
});

describe('POST /api/v1/statistics without a usable token', () => {
  it.each([
    ['no header', undefined],
    ['the wrong scheme', 'Basic dXNlcjpwYXNz'],
    ['a bearer prefix and nothing else', 'Bearer '],
    ['a token that is not a jwt', 'Bearer not-a-real-token'],
    [
      'a token signed with another secret',
      `Bearer ${jwt.sign({ sub: 'demo' }, 'a-completely-different-secret-32ch', { expiresIn: '1h' })}`,
    ],
    [
      'an expired token',
      `Bearer ${jwt.sign({ sub: 'demo' }, TEST_SECRET, { expiresIn: '-1m' })}`,
    ],
    [
      'a token signed with HS512',
      `Bearer ${jwt.sign({ sub: 'demo' }, TEST_SECRET, { algorithm: 'HS512', expiresIn: '1h' })}`,
    ],
  ])('answers 401 when the request carries %s', async (_description, header?: string) => {
    const call = request(app).post('/api/v1/statistics');
    if (header !== undefined) {
      call.set('Authorization', header);
    }

    const response = await call.send(identityAndUpperTriangular);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false });
  });

  it('answers identically whether the token expired or was forged', async () => {
    const expired = jwt.sign({ sub: 'demo' }, TEST_SECRET, { expiresIn: '-1m' });
    const forged = jwt.sign({ sub: 'demo' }, 'a-completely-different-secret-32ch', {
      expiresIn: '1h',
    });

    const [toExpired, toForged] = await Promise.all(
      [expired, forged].map((token) =>
        request(app)
          .post('/api/v1/statistics')
          .set('Authorization', `Bearer ${token}`)
          .send(identityAndUpperTriangular),
      ),
    );

    expect(toExpired.status).toBe(toForged.status);
    expect((toExpired.body as { message: string }).message).toBe(
      (toForged.body as { message: string }).message,
    );
    expect((toExpired.body as { errors: string[] }).errors).toEqual([]);
  });

  it('never leaks the phrasing of the jwt library', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', `Bearer ${jwt.sign({ sub: 'demo' }, TEST_SECRET, { expiresIn: '-1m' })}`)
      .send(identityAndUpperTriangular);

    const body = JSON.stringify(response.body);
    expect(body).not.toContain('jwt expired');
    expect(body).not.toContain('invalid signature');
    expect(body).not.toContain('JsonWebTokenError');
  });
});

describe('POST /api/v1/statistics with a body that cannot be used', () => {
  it.each([
    ['q is missing', { r: [[1]] }, 400],
    ['r is missing', { q: [[1]] }, 400],
    ['q is not an array', { q: 'matrix', r: [[1]] }, 400],
    ['a value is a string', { q: [['1']], r: [[1]] }, 400],
    ['a value is null', { q: [[null]], r: [[1]] }, 400],
    ['q is empty', { q: [], r: [[1]] }, 422],
    ['a row of q is empty', { q: [[]], r: [[1]] }, 422],
    ['q is not rectangular', { q: [[1, 2], [3]], r: [[1]] }, 422],
    ['r is not rectangular', { q: [[1]], r: [[1, 2], [3]] }, 422],
  ])('answers %i when %s', async (_description, body: unknown, expectedStatus: number) => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .send(body as object);

    expect(response.status).toBe(expectedStatus);
    expect(response.body).toMatchObject({ success: false, errors: expect.any(Array) as string[] });
  });

  it('answers 400 for a body that is not valid JSON', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .set('Content-Type', 'application/json')
      .send('{"q": [[1]], "r":');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false });
  });

  it('says which matrix broke the rule', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .send({ q: [[1]], r: [[1, 2], [3]] });

    expect(response.status).toBe(422);
    expect(JSON.stringify(response.body)).toContain('matrix r');
  });

  it('never exposes a stack trace', async () => {
    const response = await request(app)
      .post('/api/v1/statistics')
      .set('Authorization', bearer())
      .send({ q: [], r: [] });

    const body = JSON.stringify(response.body);
    expect(body).not.toMatch(/at .*\.ts:|node_modules/);
  });
});
