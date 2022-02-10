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

RUN yarn global add micro@9.3.4
COPY --from=builder /usr/src/app/dist ./dist

CMD node --no-deprecation /usr/local/bin/micro -l tcp://0.0.0.0:${PORT-8080} ./dist/index.js
