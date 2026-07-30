export interface MatrixStatistics {
  readonly maximum: number;
  readonly minimum: number;
  readonly average: number;
  readonly sum: number;
  readonly isDiagonal: boolean;
}

export interface StatisticsReport {
  readonly orthogonal: MatrixStatistics;
  readonly upperTriangular: MatrixStatistics;
}
