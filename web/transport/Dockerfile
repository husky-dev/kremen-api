FROM node:14-alpine3.10

WORKDIR /usr/src/app
RUN apk add --update --no-cache make g++ python2
COPY package.json yarn.lock tsconfig.json esbuild.js .env.prd ./
RUN yarn install
COPY src ./src
RUN yarn dist
