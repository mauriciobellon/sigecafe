FROM node:lts as build-stage

WORKDIR /nuxtapp

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install

RUN npm run build

FROM node:lts as prod-stage

WORKDIR /nuxtapp

COPY --from=build-stage /nuxtapp/.output/ ./.output/
COPY --from=build-stage /nuxtapp/prisma/ ./prisma/
COPY --from=build-stage /nuxtapp/package.json ./package.json
COPY --from=build-stage /nuxtapp/package-lock.json ./package-lock.json
COPY --from=build-stage /nuxtapp/scripts/ ./scripts/

# Install Chrome for Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable to skip Puppeteer's Chrome download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install only production dependencies and Prisma
RUN npm install --only=production && \
    npm install -g prisma

# Create an entrypoint script
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
sleep 5\n\
echo "Running database migrations..."\n\
prisma migrate deploy\n\
echo "Running database seeds..."\n\
node scripts/db-seed.mjs\n\
echo "Starting application..."\n\
node .output/server/index.mjs\n\
' > /nuxtapp/entrypoint.sh && chmod +x /nuxtapp/entrypoint.sh

CMD ["/nuxtapp/entrypoint.sh"]