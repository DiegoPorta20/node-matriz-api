export class MatrixValidationError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'MatrixValidationError';
  }
}
