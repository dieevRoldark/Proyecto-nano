import { config } from '../config/env.js';

const ALLOWED_METHODS = 'GET, POST, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type';
const MAX_AGE_SECONDS = '86400';

export function applyCors(req, res) {
  const origin = config.corsOrigin;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.setHeader('Access-Control-Max-Age', MAX_AGE_SECONDS);
  res.setHeader('Vary', 'Origin');

  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }

  return false;
}
