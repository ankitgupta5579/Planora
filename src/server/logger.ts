/**
 * Structured logger utility for the Planora server.
 * Provides leveled logging and suppresses verbose output in test mode.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatTimestamp(): string {
  return new Date().toISOString();
}

function logMessage(level: LogLevel, message: string, meta?: unknown) {
  if (process.env.NODE_ENV === 'test' && level === 'debug') {
    return;
  }

  const prefix = `[${formatTimestamp()}] [${level.toUpperCase()}]`;
  if (level === 'error') {
    if (meta !== undefined) {
      console.error(`${prefix} ${message}`, meta);
    } else {
      console.error(`${prefix} ${message}`);
    }
  } else if (level === 'warn') {
    if (meta !== undefined) {
      console.warn(`${prefix} ${message}`, meta);
    } else {
      console.warn(`${prefix} ${message}`);
    }
  } else {
    if (meta !== undefined) {
      console.info(`${prefix} ${message}`, meta);
    } else {
      console.info(`${prefix} ${message}`);
    }
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => logMessage('info', message, meta),
  warn: (message: string, meta?: unknown) => logMessage('warn', message, meta),
  error: (message: string, meta?: unknown) => logMessage('error', message, meta),
  debug: (message: string, meta?: unknown) => logMessage('debug', message, meta),
};
