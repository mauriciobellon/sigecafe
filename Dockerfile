FROM node:lts as build-stage

WORKDIR /nuxtapp

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install

RUN npm run build

FROM node:lts as prod-stage

WORKDIR /nuxtapp

COPY --from=build-stage /nuxtapp/.output/ ./.output/
COPY --from=build-stage /nuxtapp/package.json ./package.json
COPY --from=build-stage /nuxtapp/prisma/ ./prisma/

# Create entrypoint script
RUN echo '#!/bin/sh\n\
npm install prisma@5.22.0\n\
npx prisma migrate deploy\n\
npm run db:seed\n\
exec node .output/server/index.mjs' > /nuxtapp/entrypoint.sh && \
chmod +x /nuxtapp/entrypoint.sh

ENTRYPOINT ["/nuxtapp/entrypoint.sh"]
