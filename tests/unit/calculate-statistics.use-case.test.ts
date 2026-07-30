import { CalculateStatisticsUseCase } from '../../src/application/calculate-statistics.use-case';
import { MatrixValidationError } from '../../src/domain/errors';

describe('CalculateStatisticsUseCase', () => {
  const useCase = new CalculateStatisticsUseCase();

  it('reports the statistics of both matrices', () => {
    const report = useCase.execute({
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upperTriangular: [
        [5, 6],
        [0, 7],
      ],
    });

    expect(report.orthogonal).toEqual({
      maximum: 1,
      minimum: 0,
      average: 0.5,
      sum: 2,
      isDiagonal: true,
    });
    expect(report.upperTriangular.sum).toBe(18);
    expect(report.upperTriangular.isDiagonal).toBe(false);
  });

  it('keeps the two matrices apart instead of merging their values', () => {
    const report = useCase.execute({
      orthogonal: [[1]],
      upperTriangular: [[100]],
    });

    expect(report.orthogonal.maximum).toBe(1);
    expect(report.upperTriangular.maximum).toBe(100);
  });

  it('rejects an invalid orthogonal matrix', () => {
    expect(() =>
      useCase.execute({ orthogonal: [], upperTriangular: [[1]] }),
    ).toThrow(MatrixValidationError);
  });

  it('rejects an invalid upper triangular matrix', () => {
    expect(() =>
      useCase.execute({ orthogonal: [[1]], upperTriangular: [[1, 2], [3]] }),
    ).toThrow(MatrixValidationError);
  });

  it('validates again even though go-api already did', () => {
    expect(() =>
      useCase.execute({ orthogonal: [[Number.POSITIVE_INFINITY]], upperTriangular: [[1]] }),
    ).toThrow(MatrixValidationError);
  });
});
