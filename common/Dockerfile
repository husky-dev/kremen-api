FROM node:17.4-alpine3.15 AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install
COPY src ./src
RUN yarn dist


FROM node:17.4-alpine3.15

LABEL org.opencontainers.image.source https://github.com/husky-dev/kremen-api

ENV NODE_ENV=prd
ENV PORT=8080
EXPOSE 8080
WORKDIR /usr/src/app

CMD node --no-deprecation dist/index.js

COPY --from=builder /usr/src/app/dist ./dist
