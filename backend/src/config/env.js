import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '..', '..', '.env');

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function getEnvVar(name, required = true) {
  const value = process.env[name];
  if (required && (value === undefined || value === '')) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

loadEnv();

export const config = Object.freeze({
  port: parseInt(getEnvVar('PORT'), 10),
  db: Object.freeze({
    host: getEnvVar('DB_HOST'),
    port: parseInt(getEnvVar('DB_PORT'), 10),
    user: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASSWORD', false) || '',
    name: getEnvVar('DB_NAME'),
  }),
  corsOrigin: getEnvVar('CORS_ORIGIN'),
  rateLimit: Object.freeze({
    max: parseInt(getEnvVar('RATE_LIMIT_MAX'), 10),
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS'), 10),
  }),
});
