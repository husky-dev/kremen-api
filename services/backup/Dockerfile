FROM alpine:3.12

LABEL org.opencontainers.image.source https://github.com/husky-dev/kremen-api

WORKDIR /usr/src/app

RUN apk add --update --no-cache mongodb-tools redis

COPY scripts /usr/src/app
