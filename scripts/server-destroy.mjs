import { platform } from 'os';
import { execSync } from 'child_process';

const port = 3000;

try {
    if (platform() === 'win32') {
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        if (output) {
            const pid = output.split('\n')[0].trim().split(/\s+/).pop();
            execSync(`taskkill /PID ${pid} /F`);
            console.log(`Successfully killed process using port ${port}`);
        } else {
            console.log(`No process found using port ${port}`);
        }
    } else {
        try {
            execSync(`fusuario -k ${port}/tcp`);
            console.log(`Successfully killed process using port ${port}`);
        } catch (error) {
            if (error.status === 1) {
                console.log(`No process found using port ${port}`);
            } else {
                throw error;
            }
        }
    }
} catch (error) {
    console.error(`Failed to kill process using port ${port}:`, error.message);
}