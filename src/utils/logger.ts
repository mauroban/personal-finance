/**
 * Logging Service
 *
 * Centralized logging utility that provides structured logging with different levels.
 * In production, this can be extended to send logs to external services like Sentry, LogRocket, etc.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: Date
  context?: string
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    // Use Vite environment variable
    this.isDevelopment = import.meta.env.DEV
  }

  /**
   * Format log entry for console output
   */
  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const context = entry.context ? `[${entry.context}]` : ''
    return `${timestamp} ${context} ${entry.message}`
  }

  /**
   * Send log to external service (placeholder for future implementation)
   */
  private sendToExternalService(_entry: LogEntry): void {
    // TODO: Implement integration with logging service
    // Examples: Sentry, LogRocket, CloudWatch, etc.
    // For now, this is a no-op
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context,
    }

    // Always log errors and warnings
    if (level === 'error' || level === 'warn') {
      const formattedMessage = this.formatMessage(entry)

      if (level === 'error') {
        console.error(formattedMessage, data || '')
        this.sendToExternalService(entry)
      } else {
        console.warn(formattedMessage, data || '')
      }
      return
    }

    // In development, log everything to console
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(entry)

      switch (level) {
        case 'debug':
          console.debug(formattedMessage, data || '')
          break
        case 'info':
          console.log(formattedMessage, data || '')
          break
      }
    }
  }

  /**
   * Debug level - verbose information for development
   */
  debug(message: string, data?: unknown, context?: string): void {
    this.log('debug', message, data, context)
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, data?: unknown, context?: string): void {
    this.log('info', message, data, context)
  }

  /**
   * Warning level - potentially harmful situations
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.log('warn', message, data, context)
  }

  /**
   * Error level - error events that might still allow the application to continue
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    this.log('error', message, error, context)
  }

  /**
   * Create a child logger with a specific context
   */
  withContext(context: string): ContextLogger {
    return new ContextLogger(this, context)
  }
}

/**
 * Context Logger - automatically adds context to all log messages
 */
class ContextLogger {
  constructor(
    private logger: Logger,
    private context: string
  ) {}

  debug(message: string, data?: unknown): void {
    this.logger.debug(message, data, this.context)
  }

  info(message: string, data?: unknown): void {
    this.logger.info(message, data, this.context)
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(message, data, this.context)
  }

  error(message: string, error?: Error | unknown): void {
    this.logger.error(message, error, this.context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export named loggers for specific modules
export const dbLogger = logger.withContext('Database')
export const apiLogger = logger.withContext('API')
export const uiLogger = logger.withContext('UI')
