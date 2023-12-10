FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

FROM node:lts-alpine as app

WORKDIR /app

COPY --from=build-stage /app .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD ["yarn", "start"]
