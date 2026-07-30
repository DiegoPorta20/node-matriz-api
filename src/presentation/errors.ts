export class BadRequestError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'UnauthorizedError';
  }
}
