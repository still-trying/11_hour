/**
 * 11_HOUR - Profile System Logging
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Enforces structured diagnostic outputs and event trails for audit compliance.
 */

import { PROFILE_LOG_PREFIX } from './profileConstants';

export class ProfileLogging {
  /**
   * Logs general platform information.
   */
  public static info(message: string, context?: Record<string, unknown>): void {
    console.info(
      `${PROFILE_LOG_PREFIX} ${message}`,
      context ? `| Context: ${JSON.stringify(context)}` : ''
    );
  }

  /**
   * Logs warnings about abnormal states (e.g., offline operation, sync retry).
   */
  public static warn(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.warn(
      `${PROFILE_LOG_PREFIX} ⚠️ ${message}`,
      error ? `| Error: ${error instanceof Error ? error.message : String(error)}` : '',
      context ? `| Context: ${JSON.stringify(context)}` : ''
    );
  }

  /**
   * Logs fatal or critical platform errors.
   */
  public static error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(
      `${PROFILE_LOG_PREFIX} ❌ ${message}`,
      error ? `| Error: ${error instanceof Error ? error.message : String(error)}` : '',
      context ? `| Context: ${JSON.stringify(context)}` : ''
    );
  }

  /**
   * Emits audit logs for sensitive operations (e.g. data deletions or settings modifications).
   */
  public static audit(action: string, uid: string, success: boolean, context?: Record<string, unknown>): void {
    const payload = {
      timestamp: new Date().toISOString(),
      action,
      uid,
      success,
      ...context,
    };
    console.log(`${PROFILE_LOG_PREFIX} [AUDIT] ${JSON.stringify(payload)}`);
  }
}
export default ProfileLogging;
