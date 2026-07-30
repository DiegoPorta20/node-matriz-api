import jwt from 'jsonwebtoken';

export class InvalidAccessTokenError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'InvalidAccessTokenError';
  }
}

const SIGNING_ALGORITHM = 'HS256';

export class AccessTokenVerifier {
  constructor(private readonly secret: string) {}

  verify(rawToken: string): void {
    try {
      jwt.verify(rawToken, this.secret, { algorithms: [SIGNING_ALGORITHM] });
    } catch (cause) {
      throw new InvalidAccessTokenError(
        cause instanceof Error ? cause.message : 'token could not be verified',
      );
    }
  }
}
