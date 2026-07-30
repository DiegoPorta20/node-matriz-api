import { readEnvironment } from '../../src/infrastructure/config/environment';

const VALID_SECRET = 'a-node-api-config-secret-32-chars!!';

const validEnvironment = (): NodeJS.ProcessEnv => ({ JWT_SECRET: VALID_SECRET });

describe('readEnvironment', () => {
  it('reads a complete environment', () => {
    const environment = readEnvironment({
      JWT_SECRET: VALID_SECRET,
      NODE_API_PORT: '4000',
      LOG_LEVEL: 'debug',
    });

    expect(environment).toEqual({ port: 4000, jwtSecret: VALID_SECRET, logLevel: 'debug' });
  });

  it('applies defaults for the optional values', () => {
    const environment = readEnvironment(validEnvironment());

    expect(environment.port).toBe(3000);
    expect(environment.logLevel).toBe('info');
  });

  it('trims surrounding whitespace', () => {
    const environment = readEnvironment({ JWT_SECRET: `  ${VALID_SECRET}  `, LOG_LEVEL: ' warn ' });

    expect(environment.jwtSecret).toBe(VALID_SECRET);
    expect(environment.logLevel).toBe('warn');
  });

  it('refuses to start without a secret, instead of falling back to an insecure default', () => {
    expect(() => readEnvironment({})).toThrow(/JWT_SECRET is required/);
  });

  it('refuses a secret too short to be worth signing with', () => {
    expect(() => readEnvironment({ JWT_SECRET: 'too-short' })).toThrow(/at least 32/);
  });

  it.each([
    ['not a number', 'three-thousand'],
    ['zero', '0'],
    ['negative', '-1'],
    ['a decimal', '3000.5'],
  ])('rejects a port that is %s', (_description, port: string) => {
    expect(() => readEnvironment({ ...validEnvironment(), NODE_API_PORT: port })).toThrow(
      /NODE_API_PORT must be a positive integer/,
    );
  });

  it('reports every problem together', () => {
    let message = '';
    try {
      readEnvironment({ JWT_SECRET: 'short', NODE_API_PORT: 'nope' });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain('JWT_SECRET');
    expect(message).toContain('NODE_API_PORT');
  });
});
