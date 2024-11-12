import { execSync } from "child_process";
import { copyFileSync } from "fs";
import { platform } from "os";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const __projectRoot = path.join(__dirname, "..");

const source = join(__projectRoot, ".env.example");
const destination = join(__projectRoot, ".env");

if (platform() === "win32") {
  copyFileSync(source, destination);
} else {
  execSync(`cp ${source} ${destination}`);
}
