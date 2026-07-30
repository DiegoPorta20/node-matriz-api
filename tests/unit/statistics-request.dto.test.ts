import { parseStatisticsRequest } from '../../src/presentation/dto/statistics-request.dto';
import { BadRequestError } from '../../src/presentation/errors';

describe('parseStatisticsRequest', () => {
  it('returns both matrices when the body is well formed', () => {
    const parsed = parseStatisticsRequest({
      q: [
        [1, 0],
        [0, 1],
      ],
      r: [[5, 6]],
    });

    expect(parsed.q).toEqual([
      [1, 0],
      [0, 1],
    ]);
    expect(parsed.r).toEqual([[5, 6]]);
  });

  it.each([
    ['null', null],
    ['a string', 'q and r'],
    ['a number', 42],
    ['an array', [[1, 2]]],
  ])('rejects a body that is %s', (_description, body: unknown) => {
    expect(() => parseStatisticsRequest(body)).toThrow(BadRequestError);
  });

  it.each([
    ['q is missing', { r: [[1]] }],
    ['r is missing', { q: [[1]] }],
    ['q is null', { q: null, r: [[1]] }],
    ['q is not an array', { q: 'matrix', r: [[1]] }],
    ['a row is not an array', { q: [1, 2], r: [[1]] }],
    ['a value is a string', { q: [['1']], r: [[1]] }],
    ['a value is null', { q: [[null]], r: [[1]] }],
    ['a value is a boolean', { q: [[true]], r: [[1]] }],
    ['a value is an object', { q: [[{}]], r: [[1]] }],
  ])('rejects a body where %s', (_description, body: unknown) => {
    expect(() => parseStatisticsRequest(body)).toThrow(BadRequestError);
  });

  it('names the offending field', () => {
    expect(() => parseStatisticsRequest({ q: [[1]] })).toThrow(/Field r is required/);
  });

  it('points at the offending cell', () => {
    expect(() => parseStatisticsRequest({ q: [[1, 'two']], r: [[1]] })).toThrow(
      /row 1, column 2 of field q/,
    );
  });

  it('accepts an empty matrix and leaves the rule to the domain', () => {
    expect(() => parseStatisticsRequest({ q: [], r: [] })).not.toThrow();
  });
});
