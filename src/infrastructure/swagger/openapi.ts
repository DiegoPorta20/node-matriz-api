import swaggerJsdoc from 'swagger-jsdoc';

const matrixSchema = {
  type: 'array',
  items: { type: 'array', items: { type: 'number' } },
};

const matrixStatisticsSchema = {
  type: 'object',
  properties: {
    max: { type: 'number', example: 1 },
    min: { type: 'number', example: 0 },
    average: { type: 'number', example: 0.5 },
    sum: { type: 'number', example: 2 },
    isDiagonal: { type: 'boolean', example: true },
  },
};

const statisticsRequestSchema = {
  type: 'object',
  required: ['q', 'r'],
  properties: {
    q: { ...matrixSchema, example: [[1, 0], [0, 1]] },
    r: { ...matrixSchema, example: [[5, 6], [0, 7]] },
  },
};

const statisticsResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: {
      type: 'object',
      properties: { q: matrixStatisticsSchema, r: matrixStatisticsSchema },
    },
    message: { type: 'string', example: 'Statistics calculated successfully' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string', example: 'Invalid matrix' },
    errors: {
      type: 'array',
      items: { type: 'string' },
      example: ['All rows of matrix q must have 2 columns, but row 2 has 1'],
    },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const bearerAuthScheme = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Token issued by go-api and forwarded unchanged.',
};

export const buildOpenApiSpecification = (): object =>
  swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Statistics API',
        version: '1.0.0',
        description:
          'Calculates the statistics of the matrices Q and R produced by a QR factorization. ' +
          'Consumed only by go-api.',
      },
      components: {
        securitySchemes: { BearerAuth: bearerAuthScheme },
        schemas: {
          StatisticsRequest: statisticsRequestSchema,
          StatisticsResponse: statisticsResponseSchema,
          ErrorResponse: errorResponseSchema,
        },
      },
    },
    apis: ['./src/presentation/routes/*.ts', './dist/presentation/routes/*.js'],
  });
