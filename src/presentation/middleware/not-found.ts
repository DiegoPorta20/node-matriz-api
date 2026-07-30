import type { Request, RequestHandler, Response } from 'express';

import { buildErrorResponse } from '../dto/error-response.dto';

export const notFound = (): RequestHandler => {
  return (request: Request, response: Response): void => {
    response
      .status(404)
      .json(buildErrorResponse('Resource not found', [`${request.method} ${request.path}`]));
  };
};
