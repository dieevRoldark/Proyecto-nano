import { applyCors } from '../middlewares/cors.js';
import { parseBody } from '../middlewares/bodyParser.js';
import { sendError, sendJson, asyncHandler } from '../middlewares/errorHandler.js';
import { applyRateLimit } from '../middlewares/rateLimiter.js';
import { serveStatic } from '../middlewares/staticServer.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

import { handleContact } from '../controllers/contactController.js';

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#38bdf8"/><text x="16" y="22" font-family="system-ui,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#06182a">D</text></svg>`;

function handleHealth(req, res) {
  sendJson(res, 200, {
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}

function handleApiInfo(req, res) {
  sendJson(res, 200, {
    success: true,
    name: 'Portfolio Contact API',
    version: '1.0.0',
    description: 'API backend para el formulario de contacto del portafolio. Node.js nativo + MySQL.',
    endpoints: {
      'GET  /':             'Sirve el portafolio (index.html)',
      'GET  /api/info':     'Información de la API (esta respuesta)',
      'GET  /api/health':   'Health check del servidor',
      'POST /api/contact':  'Enviar mensaje de contacto (rate-limited: 5/15min por IP)',
    },
    security: {
      cors: 'Origen restringido vía CORS_ORIGIN',
      rateLimit: '5 requests / 15 minutos por IP en /api/contact',
      bodyLimit: '10 KB máximo por request',
      validation: 'Whitelist regex + escape HTML + prepared statements',
    },
    timestamp: new Date().toISOString(),
  });
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  });
  res.end(FAVICON_SVG);
}

const apiRoutes = [
  { method: 'POST', path: '/api/contact', handler: handleContact, rateLimit: true },
  { method: 'GET',  path: '/api/health',  handler: handleHealth,  rateLimit: false },
  { method: 'GET',  path: '/api/info',    handler: handleApiInfo, rateLimit: false },
  { method: 'GET',  path: '/favicon.ico', handler: handleFavicon, rateLimit: false },
];

export async function handleRequest(req, res) {
  if (applyCors(req, res)) return;

  const host = req.headers.host || 'localhost';
  let pathname;
  try {
    pathname = new URL(req.url, `http://${host}`).pathname;
  } catch {
    return sendError(res, new AppError('Malformed request URL', 400));
  }

  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    const route = apiRoutes.find((r) => r.method === req.method && r.path === pathname);
    if (!route) {
      return sendError(res, new AppError(`Route not found: ${req.method} ${pathname}`, 404));
    }

    if (route.rateLimit && !applyRateLimit(req, res)) return;

    try {
      req.body = await parseBody(req);
    } catch (err) {
      return sendError(res, err);
    }

    const wrapped = asyncHandler(route.handler);
    await wrapped(req, res);
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return sendError(res, new AppError(`Not found: ${req.method} ${pathname}`, 404));
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendError(res, new AppError(`Method not allowed: ${req.method} ${pathname}`, 405));
  }

  const faviconRoute = apiRoutes.find((r) => r.path === pathname && r.method === 'GET');
  if (faviconRoute) {
    return faviconRoute.handler(req, res);
  }

  try {
    const result = await serveStatic(pathname);
    if (result.ok) {
      const cacheControl = pathname === '/' || pathname.endsWith('.html')
        ? 'no-cache'
        : 'public, max-age=3600';
      res.writeHead(200, {
        'Content-Type': result.mime,
        'Cache-Control': cacheControl,
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(result.data);
      return;
    }
    if (result.status === 403) {
      logger.warn('Static path traversal blocked', { pathname, ip: req.socket?.remoteAddress });
    }
    return sendError(res, new AppError(`Not found: ${pathname}`, result.status));
  } catch (err) {
    logger.error('Static serve error', { pathname, message: err?.message });
    return sendError(res, new AppError('Static file error', 500));
  }
}
