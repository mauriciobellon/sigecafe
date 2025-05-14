FROM node:lts

WORKDIR /nuxtapp

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install

RUN npm run build

# Install dependencies for headless browser alternatives
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libu2f-udev \
    xdg-utils \
    wget \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables to skip Chrome download and use a different browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install only production dependencies and Prisma
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
