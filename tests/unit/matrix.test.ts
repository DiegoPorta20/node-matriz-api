import { MatrixValidationError } from '../../src/domain/errors';
import { createMatrix } from '../../src/domain/matrix';

describe('createMatrix', () => {
  it('returns the values when the matrix is valid', () => {
    const values = [
      [1, 2],
      [3, 4],
    ];

    expect(createMatrix(values, 'q')).toEqual(values);
  });

  it.each([
    ['no rows', []],
    ['a row without columns', [[]]],
    [
      'rows of different length',
      [
        [1, 2],
        [3],
      ],
    ],
    ['a value that is Infinity', [[Number.POSITIVE_INFINITY]]],
    ['a value that is -Infinity', [[Number.NEGATIVE_INFINITY]]],
    ['a value that is NaN', [[Number.NaN]]],
  ])('rejects a matrix with %s', (_description, values: number[][]) => {
    expect(() => createMatrix(values, 'q')).toThrow(MatrixValidationError);
  });

  it('names the offending matrix in the message, so the caller knows which one failed', () => {
    expect(() => createMatrix([[1, 2], [3]], 'r')).toThrow(/matrix r/);
  });

  it('reports which row is the wrong length', () => {
    expect(() =>
      createMatrix(
        [
          [1, 2],
          [3, 4],
          [5],
        ],
        'q',
      ),
    ).toThrow(/row 3 has 1/);
  });

  it('accepts more columns than rows', () => {
    expect(() => createMatrix([[1, 2, 3]], 'r')).not.toThrow();
  });

  it('accepts a single cell matrix', () => {
    expect(() => createMatrix([[5]], 'q')).not.toThrow();
  });

  it('accepts a single column matrix', () => {
    expect(() => createMatrix([[1], [2], [3]], 'q')).not.toThrow();
  });

  it('accepts negative and decimal values', () => {
    expect(() =>
      createMatrix(
        [
          [-1.5, 0.25],
          [0, -0.75],
        ],
        'q',
      ),
    ).not.toThrow();
  });
});
