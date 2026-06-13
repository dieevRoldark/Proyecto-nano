import { config } from '../config/env.js';
import { sendError } from './errorHandler.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const buckets = new Map();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function cleanupExpired() {
  const now = Date.now();
  let removed = 0;
  for (const [ip, bucket] of buckets) {
    if (now - bucket.windowStart >= config.rateLimit.windowMs) {
      buckets.delete(ip);
      removed++;
    }
  }
  if (removed > 0) {
    logger.info('Rate limiter cleanup', { removed, remaining: buckets.size });
  }
}

const cleanupTimer = setInterval(cleanupExpired, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

export function checkRateLimit(ip) {
  const now = Date.now();
  const max = config.rateLimit.max;
  const windowMs = config.rateLimit.windowMs;

  let bucket = buckets.get(ip);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    bucket = { count: 0, windowStart: now };
    buckets.set(ip, bucket);
  }

  const resetAt = bucket.windowStart + windowMs;
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));

  if (bucket.count >= max) {
    return { allowed: false, retryAfter, remaining: 0, limit: max, resetAt };
  }

  bucket.count++;
  return {
    allowed: true,
    retryAfter,
    remaining: max - bucket.count,
    limit: max,
    resetAt,
  };
}

export function applyRateLimit(req, res) {
  const ip = getClientIp(req);
  const result = checkRateLimit(ip);

  res.setHeader('X-RateLimit-Limit', String(result.limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    res.setHeader('Retry-After', String(result.retryAfter));
    logger.warn('Rate limit exceeded', { ip, limit: result.limit });
    sendError(res, new AppError('Demasiadas solicitudes, intente más tarde', 429));
    return false;
  }

  return true;
}

export function _resetBuckets() {
  buckets.clear();
}

export default { checkRateLimit, applyRateLimit, _resetBuckets };
