import type { NextFunction, Request, RequestHandler, Response } from 'express';

import type { AccessTokenVerifier } from '../../infrastructure/token/access-token-verifier';
import { UnauthorizedError } from '../errors';

const BEARER_PREFIX = 'Bearer ';

/**
 * Cabecera alternativa para el token del usuario.
 *
 * Cuando go-api invoca a este servicio a través de una Function URL con
 * autenticación IAM, `Authorization` la ocupa la firma SigV4 de AWS y el JWT del
 * usuario no cabe ahí. Se acepta en las dos: esta para la ruta firmada y
 * `Authorization` para la directa (docker compose, red interna).
 *
 * La validación es idéntica en los dos casos: cambia dónde viaja el token, no
 * cuánto se confía en él.
 */
const ACCESS_TOKEN_HEADER = 'X-Access-Token';

export const authenticate = (verifier: AccessTokenVerifier): RequestHandler => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    verifier.verify(extractToken(request));

    next();
  };
};

/**
 * Se mira X-Access-Token antes que Authorization, y el orden importa: en la ruta
 * firmada, `Authorization` contiene `AWS4-HMAC-SHA256 ...` y no un Bearer, así
 * que examinarla primero produciría un 401 con una petición perfectamente válida.
 */
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
