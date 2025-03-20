FROM node:lts as build-stage

WORKDIR /nuxtapp

COPY . .

RUN npm install

RUN npm run build

FROM node:lts as prod-stage

WORKDIR /nuxtapp

COPY --from=build-stage /nuxtapp/.output/ ./.output/
COPY --from=build-stage /nuxtapp/package.json ./package.json
COPY --from=build-stage /nuxtapp/prisma/ ./prisma/

CMD [ "node", ".output/server/index.mjs" ]
