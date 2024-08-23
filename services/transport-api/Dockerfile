FROM node:18-alpine3.16 as builder

WORKDIR /srv

COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
RUN yarn && \
    yarn lint:types && \
    yarn dist


FROM node:18-alpine3.16

LABEL org.opencontainers.image.source https://github.com/husky-dev/kremen-api

WORKDIR /srv

ENV \
    TERM=xterm-color           \
    APP_USER=app               \
    APP_UID=1001               \
    DOCKER_GID=999             \
    NODE_ENV=production        \
    PORT=8080

RUN \
    set -x && \
    # User
    mkdir -p /home/$APP_USER && \
    adduser -s /bin/sh -D -u $APP_UID $APP_USER && chown -R $APP_USER:$APP_USER /home/$APP_USER && \
    delgroup ping && addgroup -g 998 ping && \
    addgroup -g ${DOCKER_GID} docker && addgroup ${APP_USER} docker && \
    mkdir -p /srv && chown -R $APP_USER:$APP_USER /srv && \
    rm -rf /var/cache/apk/*


EXPOSE 8080

CMD node --no-deprecation /srv/dist/index.js

COPY --from=builder /srv/dist ./dist
