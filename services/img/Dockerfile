FROM ghcr.io/husky-dev/kremen-api/builder:latest AS builder

COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
RUN yarn lint:types
RUN yarn dist


FROM node:17.4-alpine3.15

LABEL org.opencontainers.image.source https://github.com/husky-dev/kremen-api

ENV NODE_ENV=prd
ENV PORT=8080
EXPOSE 8080
WORKDIR /usr/src/app

CMD node --no-deprecation dist/index.js
RUN apk add --no-cache \
  fontconfig \
  freetype \
  ttf-freefont \
  font-noto-emoji \
  font-vollkorn \
  font-misc-cyrillic \
  font-mutt-misc \
  font-screen-cyrillic \
  font-winitzki-cyrillic \
  font-cronyx-cyrillic
ENV FONTCONFIG_PATH=/usr/src/app/fonts
RUN yarn add -E sharp@0.30.1

COPY --from=builder /usr/src/app/dist ./dist
