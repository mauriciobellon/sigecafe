FROM node:lts as build-stage

WORKDIR /nuxtapp

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install

RUN npm run db:migrate

RUN npm run db:seed

RUN npm run build

FROM node:lts as prod-stage

WORKDIR /nuxtapp

COPY --from=build-stage /nuxtapp/.output/ ./.output/

CMD [ "node", ".output/server/index.mjs" ]