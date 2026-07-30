import type { NextFunction, Request, RequestHandler, Response } from 'express';

import type { AccessTokenVerifier } from '../../infrastructure/token/access-token-verifier';
import { UnauthorizedError } from '../errors';

const BEARER_PREFIX = 'Bearer ';

const ACCESS_TOKEN_HEADER = 'X-Access-Token';

export const authenticate = (verifier: AccessTokenVerifier): RequestHandler => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    verifier.verify(extractToken(request));

    next();
  };
};

const extractToken = (request: Request): string => {
  const fromDedicatedHeader = (request.header(ACCESS_TOKEN_HEADER) ?? '').trim();
  if (fromDedicatedHeader !== '') {
    return fromDedicatedHeader;
  }

  const authorization = request.header('Authorization') ?? '';
  if (!authorization.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError('Authorization header must use the Bearer scheme');
  }

  const fromAuthorization = authorization.slice(BEARER_PREFIX.length).trim();
  if (fromAuthorization === '') {
    throw new UnauthorizedError('Access token is missing');
  }

  return fromAuthorization;
};
