FROM node:17.4-alpine3.15

LABEL org.opencontainers.image.source https://github.com/husky-dev/kremen-api

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
