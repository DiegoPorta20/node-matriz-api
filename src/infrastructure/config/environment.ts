import { config as loadDotenv } from 'dotenv';

export interface Environment {
  readonly port: number;
  readonly jwtSecret: string;
  readonly logLevel: string;
}

const DEFAULT_PORT = 3000;
const DEFAULT_LOG_LEVEL = 'info';
const MINIMUM_SECRET_LENGTH = 32;

const ENV_FILE_CANDIDATES = ['.env', '../.env'];

export const loadEnvironment = (): Environment => {
  loadDotenv({ path: ENV_FILE_CANDIDATES, quiet: true });

  return readEnvironment(process.env);
};

export const readEnvironment = (source: NodeJS.ProcessEnv): Environment => {
  const problems: string[] = [];

  const jwtSecret = readString(source, 'JWT_SECRET');
  if (jwtSecret === '') {
    problems.push('JWT_SECRET is required');
  } else if (jwtSecret.length < MINIMUM_SECRET_LENGTH) {
    problems.push(`JWT_SECRET must be at least ${String(MINIMUM_SECRET_LENGTH)} characters long`);
  }

  const port = readPositiveInteger(source, 'NODE_API_PORT', DEFAULT_PORT, problems);
  const logLevel = readString(source, 'LOG_LEVEL') || DEFAULT_LOG_LEVEL;

  if (problems.length > 0) {
    throw new Error(`Invalid configuration: ${problems.join('; ')}`);
  }

  return { port, jwtSecret, logLevel };
};

const readString = (source: NodeJS.ProcessEnv, key: string): string =>
  (source[key] ?? '').trim();

const readPositiveInteger = (
  source: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  problems: string[],
): number => {
  const raw = readString(source, key);
  if (raw === '') {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    problems.push(`${key} must be a positive integer`);
    return fallback;
  }

  return value;
};
