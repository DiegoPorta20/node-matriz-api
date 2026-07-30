export interface ErrorResponseDto {
  readonly success: false;
  readonly message: string;
  readonly errors: string[];
  readonly timestamp: string;
}

export const buildErrorResponse = (message: string, errors: string[] = []): ErrorResponseDto => ({
  success: false,
  message,
  errors,
  timestamp: new Date().toISOString(),
});
