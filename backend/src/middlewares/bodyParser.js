import { AppError } from '../utils/AppError.js';

const MAX_BODY_SIZE = 10 * 1024;
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

export function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (!METHODS_WITH_BODY.has(req.method)) {
      req.body = {};
      return resolve(req.body);
    }

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      req.body = {};
      return resolve(req.body);
    }

    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        req.destroy();
        return reject(new AppError('Payload too large', 413));
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8').trim();
      if (raw.length === 0) {
        req.body = {};
        return resolve(req.body);
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new AppError('Body must be a JSON object', 400));
        }
        req.body = parsed;
        resolve(req.body);
      } catch {
        reject(new AppError('Invalid JSON', 400));
      }
    });

    req.on('error', () => {
      reject(new AppError('Error reading request body', 400));
    });
  });
}
