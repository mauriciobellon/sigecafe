FROM node:lts as build-stage

WORKDIR /nuxtapp

COPY . .

RUN npm install

RUN npm run build

FROM node:lts as prod-stage

WORKDIR /nuxtapp

COPY --from=build-stage /nuxtapp/.output/ ./.output/

CMD [ "node", ".output/server/index.mjs" ]
