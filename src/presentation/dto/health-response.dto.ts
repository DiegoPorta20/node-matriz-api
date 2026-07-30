export interface HealthResponseDto {
  readonly status: 'ok';
}

export const buildHealthResponse = (): HealthResponseDto => ({ status: 'ok' });
