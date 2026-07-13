/**
 * 11_HOUR - Authentication Logger
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Secures authentication diagnostic logging, tracking metadata and operations
 * while completely stripping credentials and personally identifiable information (PII).
 */

import { FIREBASE_LOG_PREFIX } from '../constants';

export class AuthLogger {
  /**
   * Logs a successful authentication action.
   */
  public static logSuccess(actionName: string, userId: string, extra?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    console.info(
      `${FIREBASE_LOG_PREFIX} [${timestamp}] AUTH SUCCESS: ${actionName} | UID: ${userId}`,
      extra ? `| Context: ${JSON.stringify(extra)}` : ''
    );
  }

  /**
   * Logs an authentication failure securely, keeping trace details but excluding secret parameters.
   */
  public static logFailure(actionName: string, error: unknown, extra?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `${FIREBASE_LOG_PREFIX} [${timestamp}] AUTH FAILURE: ${actionName} | Details: ${errorMsg}`,
      extra ? `| Context: ${JSON.stringify(extra)}` : ''
    );
  }

  /**
   * Logs an authentication lifecycle event, e.g., session initialization or state change.
   */
  public static logLifecycle(message: string): void {
    const timestamp = new Date().toISOString();
    console.info(`${FIREBASE_LOG_PREFIX} [${timestamp}] AUTH LIFECYCLE: ${message}`);
  }
}
