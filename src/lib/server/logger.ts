/**
 * Centralized structured logging utility
 * Provides consistent log formatting across the application
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  stack?: string;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: "info",
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    console.log(this.formatLog(entry));
  }

  warn(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: "warn",
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    console.warn(this.formatLog(entry));
  }

  error(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: "error",
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: context?.error instanceof Error ? context.error.stack : undefined,
    };
    console.error(this.formatLog(entry));
  }

  debug(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: "debug",
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    console.debug(this.formatLog(entry));
  }
}

export const logger = new Logger();
