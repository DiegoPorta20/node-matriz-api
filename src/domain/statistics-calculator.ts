import type { Matrix } from './matrix';
import type { MatrixStatistics } from './matrix-statistics';

const DIAGONAL_TOLERANCE = 1e-9;

const reduceValues = (
  matrix: Matrix,
  reducer: (accumulator: number, value: number) => number,
  initialValue: number,
): number =>
  matrix.reduce(
    (accumulator, row) => row.reduce((rowAccumulator, value) => reducer(rowAccumulator, value), accumulator),
    initialValue,
  );

export const calculateMaximum = (matrix: Matrix): number =>
  reduceValues(matrix, (maximum, value) => Math.max(maximum, value), Number.NEGATIVE_INFINITY);

export const calculateMinimum = (matrix: Matrix): number =>
  reduceValues(matrix, (minimum, value) => Math.min(minimum, value), Number.POSITIVE_INFINITY);

export const calculateSum = (matrix: Matrix): number =>
  reduceValues(matrix, (total, value) => total + value, 0);

export const countValues = (matrix: Matrix): number =>
  matrix.reduce((total, row) => total + row.length, 0);

export const calculateAverage = (matrix: Matrix): number =>
  calculateSum(matrix) / countValues(matrix);

export const isDiagonal = (matrix: Matrix): boolean =>
  matrix.every((row, rowIndex) =>
    row.every(
      (value, columnIndex) => rowIndex === columnIndex || Math.abs(value) <= DIAGONAL_TOLERANCE,
    ),
  );

export const calculateStatistics = (matrix: Matrix): MatrixStatistics => ({
  maximum: calculateMaximum(matrix),
  minimum: calculateMinimum(matrix),
  average: calculateAverage(matrix),
  sum: calculateSum(matrix),
  isDiagonal: isDiagonal(matrix),
});
