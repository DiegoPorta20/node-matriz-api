import { BadRequestError } from '../errors';

export interface StatisticsRequestDto {
  readonly q: number[][];
  readonly r: number[][];
}

export const parseStatisticsRequest = (body: unknown): StatisticsRequestDto => {
  if (!isRecord(body)) {
    throw new BadRequestError('Request body must be a JSON object');
  }

  return {
    q: parseMatrixField(body.q, 'q'),
    r: parseMatrixField(body.r, 'r'),
  };
};

const parseMatrixField = (value: unknown, field: string): number[][] => {
  if (value === undefined || value === null) {
    throw new BadRequestError(`Field ${field} is required`);
  }

  if (!Array.isArray(value)) {
    throw new BadRequestError(`Field ${field} must be an array of arrays of numbers`);
  }

  return value.map((row, rowIndex) => parseMatrixRow(row, field, rowIndex));
};

const parseMatrixRow = (row: unknown, field: string, rowIndex: number): number[] => {
  if (!Array.isArray(row)) {
    throw new BadRequestError(
      `Row ${String(rowIndex + 1)} of field ${field} must be an array of numbers`,
    );
  }

  return row.map((value, columnIndex) => {
    if (typeof value !== 'number') {
      throw new BadRequestError(
        `Value at row ${String(rowIndex + 1)}, column ${String(columnIndex + 1)} ` +
          `of field ${field} must be a number`,
      );
    }
    return value;
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
