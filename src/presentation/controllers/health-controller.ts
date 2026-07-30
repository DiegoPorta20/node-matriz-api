import type { Request, Response } from 'express';

import { buildHealthResponse } from '../dto/health-response.dto';

export class HealthController {
  check = (_request: Request, response: Response): void => {
    response.status(200).json(buildHealthResponse());
  };
}
