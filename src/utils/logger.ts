export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

class ConsoleLogger implements Logger {
  debug(...args: unknown[]) {
    if (import.meta.env.DEV) console.debug(...args);
  }
  info(...args: unknown[]) {
    if (import.meta.env.DEV) console.info(...args);
  }
  warn(...args: unknown[]) {
    if (import.meta.env.DEV) console.warn(...args);
  }
  error(...args: unknown[]) {
    if (import.meta.env.DEV) console.error(...args);
  }
}

export const logger: Logger = new ConsoleLogger();
