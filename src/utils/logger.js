export function log(...args) {
  if (process.env.LOG_TO_CONSOLE === 'true') {
    console.log('[LOG]', ...args);
  }
}
export function error(...args) {
  console.error('[ERR]', ...args);
}
