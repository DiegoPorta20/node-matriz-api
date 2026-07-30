import { createMatrix } from '../domain/matrix';
import type { StatisticsReport } from '../domain/matrix-statistics';
import { calculateStatistics } from '../domain/statistics-calculator';

export interface CalculateStatisticsCommand {
  readonly orthogonal: readonly number[][];
  readonly upperTriangular: readonly number[][];
}

export class CalculateStatisticsUseCase {
  execute(command: CalculateStatisticsCommand): StatisticsReport {
    const orthogonal = createMatrix(command.orthogonal, 'q');
    const upperTriangular = createMatrix(command.upperTriangular, 'r');

    return {
      orthogonal: calculateStatistics(orthogonal),
      upperTriangular: calculateStatistics(upperTriangular),
    };
  }
}
