import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export function sendJson(res, statusCode, payload) {
  if (res.writableEnded) return;
  res.writeHead(statusCode, JSON_HEADERS);
  res.end(JSON.stringify(payload));
}

export function sendError(res, err) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';
  const details = err instanceof AppError ? err.details : null;

  logger.error('Request error', {
    statusCode,
    name: err?.name || 'Error',
    message: err?.message || String(err),
  });

  const payload = { success: false, error: message };
  if (details !== null) payload.details = details;
  sendJson(res, statusCode, payload);
}

export function asyncHandler(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch((err) => sendError(res, err));
  };
}
