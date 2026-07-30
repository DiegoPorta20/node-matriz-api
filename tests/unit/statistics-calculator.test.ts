import {
  calculateAverage,
  calculateMaximum,
  calculateMinimum,
  calculateStatistics,
  calculateSum,
  countValues,
  isDiagonal,
} from '../../src/domain/statistics-calculator';

describe('calculateMaximum', () => {
  it('returns the largest value of the whole matrix', () => {
    expect(
      calculateMaximum([
        [1, 9],
        [4, 3],
      ]),
    ).toBe(9);
  });

  it('handles negative values without falling back to zero', () => {
    expect(
      calculateMaximum([
        [-5, -2],
        [-8, -3],
      ]),
    ).toBe(-2);
  });

  it('returns the only value of a single cell matrix', () => {
    expect(calculateMaximum([[7]])).toBe(7);
  });
});

describe('calculateMinimum', () => {
  it('returns the smallest value of the whole matrix', () => {
    expect(
      calculateMinimum([
        [1, 9],
        [4, 3],
      ]),
    ).toBe(1);
  });

  it('handles positive values without falling back to zero', () => {
    expect(
      calculateMinimum([
        [5, 2],
        [8, 3],
      ]),
    ).toBe(2);
  });
});

describe('calculateSum', () => {
  it('adds every value of the matrix', () => {
    expect(
      calculateSum([
        [1, 2],
        [3, 4],
      ]),
    ).toBe(10);
  });

  it('cancels opposite values', () => {
    expect(
      calculateSum([
        [1.5, -1.5],
        [2, -2],
      ]),
    ).toBe(0);
  });
});

describe('countValues', () => {
  it('counts every cell, not every row', () => {
    expect(
      countValues([
        [1, 2, 3],
        [4, 5, 6],
      ]),
    ).toBe(6);
  });
});

describe('calculateAverage', () => {
  it('divides the sum by the number of cells', () => {
    expect(
      calculateAverage([
        [1, 2],
        [3, 4],
      ]),
    ).toBe(2.5);
  });

  it('averages a rectangular matrix over all of its cells', () => {
    expect(calculateAverage([[2, 4, 6]])).toBe(4);
  });
});

describe('isDiagonal', () => {
  it('accepts a matrix whose off-diagonal values are all zero', () => {
    expect(
      isDiagonal([
        [3, 0],
        [0, 5],
      ]),
    ).toBe(true);
  });

  it('rejects a matrix with a non-zero value off the diagonal', () => {
    expect(
      isDiagonal([
        [3, 1],
        [0, 5],
      ]),
    ).toBe(false);
  });

  it('tolerates the floating point residue a factorization leaves behind', () => {
    expect(
      isDiagonal([
        [3, 1e-17],
        [-2.5e-18, 5],
      ]),
    ).toBe(true);
  });

  it('rejects a value just above the tolerance', () => {
    expect(
      isDiagonal([
        [3, 1e-8],
        [0, 5],
      ]),
    ).toBe(false);
  });

  it('accepts a single cell matrix, which has no off-diagonal values', () => {
    expect(isDiagonal([[42]])).toBe(true);
  });

  it('accepts a zero matrix', () => {
    expect(
      isDiagonal([
        [0, 0],
        [0, 0],
      ]),
    ).toBe(true);
  });

  it('applies the definition to a rectangular matrix as well', () => {
    expect(isDiagonal([[1, 0, 0]])).toBe(true);
    expect(isDiagonal([[1, 0, 2]])).toBe(false);
  });

  it('ignores the values on the diagonal itself', () => {
    expect(
      isDiagonal([
        [999, 0],
        [0, -999],
      ]),
    ).toBe(true);
  });
});

describe('calculateStatistics', () => {
  it('reports every statistic of the matrix at once', () => {
    const statistics = calculateStatistics([
      [4, 0],
      [0, -2],
    ]);

    expect(statistics).toEqual({
      maximum: 4,
      minimum: -2,
      average: 0.5,
      sum: 2,
      isDiagonal: true,
    });
  });

  it('describes an upper triangular matrix as not diagonal', () => {
    const statistics = calculateStatistics([
      [-3.1623, -4.4272],
      [0, -0.6325],
    ]);

    expect(statistics.isDiagonal).toBe(false);
    expect(statistics.maximum).toBe(0);
    expect(statistics.minimum).toBe(-4.4272);
  });

  it('handles large values without losing them', () => {
    const statistics = calculateStatistics([
      [1e12, 0],
      [0, 1e12],
    ]);

    expect(statistics.sum).toBe(2e12);
    expect(statistics.maximum).toBe(1e12);
  });

  it('reports repeated values as the same maximum and minimum', () => {
    const statistics = calculateStatistics([
      [7, 7],
      [7, 7],
    ]);

    expect(statistics.maximum).toBe(7);
    expect(statistics.minimum).toBe(7);
    expect(statistics.average).toBe(7);
  });
});
