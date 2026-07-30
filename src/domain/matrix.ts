import { MatrixValidationError } from './errors';

export type Matrix = readonly (readonly number[])[];


export const createMatrix = (values: readonly number[][], label: string): Matrix => {
  if (values.length === 0) {
    throw new MatrixValidationError(`Matrix ${label} must contain at least one row`);
  }

  const columns = values[0].length;
  if (columns === 0) {
    throw new MatrixValidationError(`Matrix ${label} must contain at least one column`);
  }

  values.forEach((row, rowIndex) => {
    if (row.length !== columns) {
      throw new MatrixValidationError(
        `All rows of matrix ${label} must have ${String(columns)} columns, ` +
          `but row ${String(rowIndex + 1)} has ${String(row.length)}`,
      );
    }
    assertValuesAreFinite(row, rowIndex, label);
  });

  return values;
};

const assertValuesAreFinite = (
  row: readonly number[],
  rowIndex: number,
  label: string,
): void => {
  row.forEach((value, columnIndex) => {
    if (!Number.isFinite(value)) {
      throw new MatrixValidationError(
        `Value at row ${String(rowIndex + 1)}, column ${String(columnIndex + 1)} ` +
          `of matrix ${label} must be a finite number`,
      );
    }
  });
};
