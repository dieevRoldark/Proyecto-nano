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

function getEnvVar(name, defaultValue = undefined) {
  const value = process.env[name];
  if (value !== undefined && value !== '') {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

function getEnvInt(name, defaultValue) {
  const value = process.env[name];
  if (value !== undefined && value !== '') {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid integer for environment variable ${name}: ${value}`);
    }
    return parsed;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

loadEnv();

const isProduction = process.env.NODE_ENV === 'production';

export const config = Object.freeze({
  nodeEnv: isProduction ? 'production' : 'development',
  port: getEnvInt('PORT', 10000),
  db: Object.freeze({
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvInt('DB_PORT', 3306),
    user: getEnvVar('DB_USER', 'root'),
    password: getEnvVar('DB_PASSWORD', ''),
    name: getEnvVar('DB_NAME', 'portfolio_contact'),
    autoMigrate: getEnvVar('DB_AUTO_MIGRATE', 'false') === 'true',
    ssl: getEnvVar('DB_SSL', 'false') === 'true',
  }),
  corsOrigin: getEnvVar('CORS_ORIGIN', '*'),
  rateLimit: Object.freeze({
    max: getEnvInt('RATE_LIMIT_MAX', 5),
    windowMs: getEnvInt('RATE_LIMIT_WINDOW_MS', 900000),
  }),
});

if (!isProduction && config.corsOrigin === '*') {
  console.warn('[env] CORS_ORIGIN not set, defaulting to "*" (insecure for production)');
}
