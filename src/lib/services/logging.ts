/**
 * Logging Service
 * Centralized, structured logging for the inference system
 * Supports different log levels and async persistence
 */

import { INFERENCE_CONFIG, LOG_EVENTS } from '@/config/constants';
import { RequestLog } from '@/lib/utils/types';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
}

class LoggingService {
  private static instance: LoggingService;
  private logBuffer: LogEntry[] = [];
  private bufferSize = 50;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = INFERENCE_CONFIG.LOG_LEVEL;
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('ERROR', message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
    };

    // Console logging for immediate visibility
    const logFunc = level === 'ERROR' ? console.error : console.log;
    logFunc(`[${entry.timestamp.toISOString()}] [${level}] ${message}`, context || '');

    // Add to buffer for batch persistence
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.bufferSize) {
      this.flushLogs();
    }
  }

  /**
   * Async persistence to storage (Supabase)
   * This would be called periodically or when buffer is full
   */
  async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      const logsToWrite = [...this.logBuffer];
      this.logBuffer = [];

      // In production, write to Supabase or external logging service
      // await supabaseClient.from('logs').insert(logsToWrite);

      console.log(`[LoggingService] Flushed ${logsToWrite.length} logs`);
    } catch (error) {
      console.error('[LoggingService] Failed to flush logs:', error);
      // Re-add logs to buffer if flush failed
      // this.logBuffer.push(...logsToWrite);
    }
  }

  /**
   * Track request-level events
   */
  trackEvent(
    event: string,
    userId: string,
    requestId: string,
    context?: Record<string, any>
  ) {
    this.info(`[${event}]`, {
      userId,
      requestId,
      ...context,
    });
  }

  /**
   * Format context object for cleaner logging
   */
  formatContext(context: any): Record<string, any> {
    return {
      ...context,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    };
  }
}

export const logger = LoggingService.getInstance();
