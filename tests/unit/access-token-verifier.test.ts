import jwt from 'jsonwebtoken';

import {
  AccessTokenVerifier,
  InvalidAccessTokenError,
} from '../../src/infrastructure/token/access-token-verifier';

const SECRET = 'a-node-api-test-secret-of-32-chars!!';

const sign = (payload: object, options: jwt.SignOptions = {}, secret = SECRET): string =>
  jwt.sign(payload, secret, { algorithm: 'HS256', ...options });

describe('AccessTokenVerifier', () => {
  const verifier = new AccessTokenVerifier(SECRET);

  it('accepts a token signed by go-api with the shared secret', () => {
    const token = sign({ sub: 'demo' }, { expiresIn: '1h' });

    expect(() => {
      verifier.verify(token);
    }).not.toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => {
      verifier.verify('');
    }).toThrow(InvalidAccessTokenError);
  });

  it('rejects something that is not a token', () => {
    expect(() => {
      verifier.verify('clearly-not-a-jwt');
    }).toThrow(InvalidAccessTokenError);
  });

  it('rejects a token signed with a different secret', () => {
    const token = sign({ sub: 'demo' }, { expiresIn: '1h' }, 'a-completely-different-secret-32ch');

    expect(() => {
      verifier.verify(token);
    }).toThrow(InvalidAccessTokenError);
  });

  it('rejects an expired token', () => {
    const token = sign({ sub: 'demo' }, { expiresIn: '-1m' });

    expect(() => {
      verifier.verify(token);
    }).toThrow(InvalidAccessTokenError);
  });

  it('rejects a token signed with HS512 instead of HS256', () => {
    const token = sign({ sub: 'demo' }, { algorithm: 'HS512', expiresIn: '1h' });

    expect(() => {
      verifier.verify(token);
    }).toThrow(InvalidAccessTokenError);
  });

  it('rejects an unsigned token declaring alg none', () => {
    const token = jwt.sign({ sub: 'demo' }, '', { algorithm: 'none' });

    expect(() => {
      verifier.verify(token);
    }).toThrow(InvalidAccessTokenError);
  });

  it('never leaks the secret in the error message', () => {
    try {
      verifier.verify('not-a-jwt');
      throw new Error('the verifier should have rejected the token');
    } catch (error) {
      expect((error as Error).message).not.toContain(SECRET);
    }
  });
});
