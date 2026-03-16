import fs from 'fs';
import path from 'path';

console.log('CWD:', process.cwd());
console.log('__dirname:', path.dirname(new URL(import.meta.url).pathname));

const dotEnvPath = './backend/.env';
console.log(`Checking ${dotEnvPath}:`, fs.existsSync(dotEnvPath));

const dotEnvPath2 = '../.env';
console.log(`Checking ${dotEnvPath2}:`, fs.existsSync(dotEnvPath2));
