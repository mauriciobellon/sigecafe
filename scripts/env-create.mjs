import { writeFileSync } from "fs";
import { platform } from "os";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __projectRoot = path.join(__dirname, "..");
const destination = path.join(__projectRoot, ".env");

const template = `
NUXT_AUTH_ORIGIN="https://sigecafe.bellon.dev"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
AUTH_SECRET="secret"
SESSION_REFRESH_SECONDS=10
SESSION_MAX_AGE_SECONDS=600
`;

writeFileSync(destination, template);
