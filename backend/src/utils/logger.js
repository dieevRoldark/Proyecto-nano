const LEVELS = Object.freeze({
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
});

function timestamp() {
  return new Date().toISOString();
}

function log(level, message, meta = null) {
  const parts = [`[${timestamp()}]`, `[${level}]`, message];
  if (meta !== null) {
    parts.push(JSON.stringify(meta));
  }
  const output = parts.join(' ');
  if (level === LEVELS.ERROR) {
    console.error(output);
  } else {
    console.log(output);
  }
}

export const logger = Object.freeze({
  info: (msg, meta) => log(LEVELS.INFO, msg, meta),
  warn: (msg, meta) => log(LEVELS.WARN, msg, meta),
  error: (msg, meta) => log(LEVELS.ERROR, msg, meta),
});
