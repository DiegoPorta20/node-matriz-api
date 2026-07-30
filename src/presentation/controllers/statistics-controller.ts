import type { Request, Response } from 'express';

import type { CalculateStatisticsUseCase } from '../../application/calculate-statistics.use-case';
import { buildStatisticsResponse } from '../dto/statistics-response.dto';
import { parseStatisticsRequest } from '../dto/statistics-request.dto';

export class StatisticsController {
  constructor(private readonly useCase: CalculateStatisticsUseCase) {}

  calculate = (request: Request, response: Response): void => {
    const { q, r } = parseStatisticsRequest(request.body);

    const report = this.useCase.execute({ orthogonal: q, upperTriangular: r });

    response.status(200).json(buildStatisticsResponse(report));
  };
}
