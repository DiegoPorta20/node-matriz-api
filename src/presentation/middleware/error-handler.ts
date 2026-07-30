import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { MatrixValidationError } from '../../domain/errors';
import type { Logger } from '../../infrastructure/logger/logger';
import { InvalidAccessTokenError } from '../../infrastructure/token/access-token-verifier';
import { buildErrorResponse } from '../dto/error-response.dto';
import { BadRequestError, UnauthorizedError } from '../errors';

const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error while processing the request';

interface MappedError {
  readonly status: number;
  readonly message: string;
  readonly errors: string[];
}

export const errorHandler = (logger: Logger): ErrorRequestHandler => {
  return (error: unknown, request: Request, response: Response, _next: NextFunction): void => {
    const mapped = classify(error);

    if (mapped.status >= 500) {
      logger.error(
        { err: error, method: request.method, path: request.path },
        'unhandled request failure',
      );
    }

    response.status(mapped.status).json(buildErrorResponse(mapped.message, mapped.errors));
  };
};

const classify = (error: unknown): MappedError => {
  if (error instanceof MatrixValidationError) {
    return { status: 422, message: 'Invalid matrix', errors: [error.message] };
  }

  if (error instanceof BadRequestError) {
    return { status: 400, message: 'Invalid request', errors: [error.message] };
  }

  if (error instanceof UnauthorizedError || error instanceof InvalidAccessTokenError) {
    return { status: 401, message: 'Access token is invalid or has expired', errors: [] };
  }

  if (isMalformedJsonError(error)) {
    return { status: 400, message: 'Invalid request', errors: ['Request body is not valid JSON'] };
  }

  return { status: 500, message: UNEXPECTED_ERROR_MESSAGE, errors: [] };
};

const isMalformedJsonError = (error: unknown): boolean =>
  error instanceof SyntaxError && 'body' in error;
