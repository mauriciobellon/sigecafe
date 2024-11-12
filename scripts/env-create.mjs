import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { platform } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import path from "path";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const __projectRoot = path.join(__dirname, "..");

const source = join(__projectRoot, '.env.example');
const destination = join(__projectRoot, '.env');

if (platform() === 'win32') {
    copyFileSync(source, destination);
} else {
    execSync(`cp ${source} ${destination}`);
}