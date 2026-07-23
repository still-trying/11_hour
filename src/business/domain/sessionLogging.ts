/**
 * 11_HOUR - Session Telemetry and Logging
 *
 * Part of Slice 1.3: Session Platform.
 * Provides a clean, standardized structural log interface that automatically prefixes
 * platform namespaces and tracks trace correlations.
 */

import { SessionException } from './sessionTypes';

export class SessionLogging {
  private static readonly PREFIX = '🛡️ [SessionPlatform]';

  /**
   * Logs a standard operational lifecycle event.
   */
  public static info(message: string, context?: Record<string, unknown>): void {
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    console.info(`${this.PREFIX} Info: ${message}${contextStr}`);
  }

  /**
   * Logs a warning or recoverable anomaly.
   */
  public static warn(message: string, context?: Record<string, unknown>): void {
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    console.warn(`${this.PREFIX} Warning: ${message}${contextStr}`);
  }

  /**
   * Logs a non-recoverable domain exception or infrastructure failure.
   */
  public static error(message: string, error: unknown): void {
    if (error instanceof SessionException) {
      console.error(
        `${this.PREFIX} Error: ${message} | [Exception Code: ${error.code}] | [Correlation: ${error.correlationId}] | Message: ${error.message}`,
        error.originalError || '',
      );
    } else if (error instanceof Error) {
      console.error(`${this.PREFIX} Error: ${message} | [Error Message: ${error.message}]`, error);
    } else {
      console.error(`${this.PREFIX} Error: ${message} | Raw Error:`, error);
    }
  }

  /**
   * Records performance latencies, specifically for database writes and hydration cycles.
   */
  public static metric(operation: string, durationMs: number, success: boolean): void {
    console.log(
      `${this.PREFIX} Metric: Operation "${operation}" took ${durationMs.toFixed(1)}ms | Status: ${success ? 'SUCCESS' : 'FAILED'}`,
    );
  }
}
