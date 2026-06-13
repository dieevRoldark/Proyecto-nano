import { readFile, stat } from 'node:fs/promises';
import { resolve, join, normalize, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..', '..', '..');

const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
});

function isPathSafe(filePath) {
  const normalized = normalize(filePath);
  const rootWithSep = ROOT_DIR.endsWith(sep) ? ROOT_DIR : ROOT_DIR + sep;
  return normalized === ROOT_DIR || normalized.startsWith(rootWithSep);
}

export async function serveStatic(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const stripped = decoded.split('?')[0].split('#')[0];

  const safeRelative = normalize(stripped).replace(/^([./\\]+)/, '');
  let filePath = join(ROOT_DIR, safeRelative);

  if (!isPathSafe(filePath)) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  try {
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    return {
      ok: true,
      status: 200,
      mime,
      data,
    };
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return { ok: false, status: 404, error: 'Not found' };
    }
    if (err.code === 'EACCES') {
      return { ok: false, status: 403, error: 'Forbidden' };
    }
    throw err;
  }
}
