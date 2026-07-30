# Angular 20 y este servicio comparten runtime: Node 22 LTS.
FROM node:22-alpine AS dependencies

WORKDIR /app

# npm ci instala exactamente lo que fija el lockfile, a diferencia de npm install.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:22-alpine AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build

# La imagen final no lleva TypeScript ni las dependencias de test.
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist

# El spec de OpenAPI se genera leyendo las anotaciones de los fuentes, y en
# produccion swagger-jsdoc lee los .js compilados en dist/.

# AWS Lambda Web Adapter. Ver la nota del Dockerfile de go-api: /opt/extensions
# solo lo lee el runtime de Lambda, asi que la misma imagen sirve para compose.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 \
     /lambda-adapter /opt/extensions/lambda-adapter

ENV AWS_LWA_PORT=3000
ENV AWS_LWA_READINESS_CHECK_PATH=/health

# La imagen de node ya trae el usuario `node`, sin privilegios.
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
