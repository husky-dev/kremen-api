FROM node:14-alpine3.10 AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install
COPY src ./src
RUN yarn dist


FROM node:14-alpine3.10

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production
COPY --from=builder /usr/src/app/dist ./dist

CMD ["yarn", "start"]
