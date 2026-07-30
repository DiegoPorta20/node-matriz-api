import type { MatrixStatistics, StatisticsReport } from '../../domain/matrix-statistics';

export interface MatrixStatisticsDto {
  readonly max: number;
  readonly min: number;
  readonly average: number;
  readonly sum: number;
  readonly isDiagonal: boolean;
}

export interface StatisticsDataDto {
  readonly q: MatrixStatisticsDto;
  readonly r: MatrixStatisticsDto;
}

export interface StatisticsResponseDto {
  readonly success: true;
  readonly data: StatisticsDataDto;
  readonly message: string;
  readonly timestamp: string;
}

const SUCCESS_MESSAGE = 'Statistics calculated successfully';

export const buildStatisticsResponse = (report: StatisticsReport): StatisticsResponseDto => ({
  success: true,
  data: {
    q: toDto(report.orthogonal),
    r: toDto(report.upperTriangular),
  },
  message: SUCCESS_MESSAGE,
  timestamp: new Date().toISOString(),
});

const toDto = (statistics: MatrixStatistics): MatrixStatisticsDto => ({
  max: statistics.maximum,
  min: statistics.minimum,
  average: statistics.average,
  sum: statistics.sum,
  isDiagonal: statistics.isDiagonal,
});
