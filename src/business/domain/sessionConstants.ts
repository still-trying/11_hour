/**
 * 11_HOUR - Session Constants
 *
 * Part of Slice 1.3: Session Platform.
 * Defines central constants for storage, timeout rates, device fingerprint tags,
 * and high-fidelity error messaging.
 */

import { SessionErrorCode } from './sessionTypes';

/**
 * Storage session/local cache keys.
 */
export const SESSION_STORAGE_KEYS = {
  ACTIVE_SESSION: '11hour_active_session',
  SESSION_DEVICE_ID: '11hour_session_device_id',
  SESSION_HISTORY: '11hour_session_history',
};

/**
 * Timing & timeout thresholds.
 */
export const SESSION_TIMEOUTS = {
  /**
   * Idle timeout threshold (30 minutes of complete inactivity).
   */
  IDLE_TIMEOUT_MS: 30 * 60 * 1000,

  /**
   * Keep-alive ping interval (every 2 minutes).
   */
  PING_INTERVAL_MS: 2 * 60 * 1000,

  /**
   * Cooldown for session write reconciliation (5 seconds).
   */
  RECONCILE_COOLDOWN_MS: 5000,
};

/**
 * Standard user-friendly error messages mapped to session domain codes.
 * Ensures the end-user receives constructive advice rather than raw database or SDK trace noise.
 */
export const SESSION_ERROR_MESSAGES: Record<SessionErrorCode, string> = {
  [SessionErrorCode.INITIALIZATION_FAILED]:
    'We could not establish your active workspace session. Please try signing in again.',
  [SessionErrorCode.HYDRATION_FAILED]:
    'We had trouble loading your session from local cache. Recovering clean state...',
  [SessionErrorCode.RECOVERY_FAILED]:
    'Session recovery failed. Please verify your connection or sign in again.',
  [SessionErrorCode.VALIDATION_FAILED]:
    'Your active session data could not be validated. For security, we must restart your session.',
  [SessionErrorCode.PERSISTENCE_FAILED]:
    'We failed to save your session progress locally. Your workspace remains active, but updates may not persist.',
  [SessionErrorCode.SESSION_EXPIRED]:
    'Your active session has expired due to inactivity. Please sign in again to resume your workspace.',
  [SessionErrorCode.TRANSIENT_NETWORK_DROP]:
    'Connection temporarily dropped. We are operating offline and queuing sync commands.',
  [SessionErrorCode.RECONCILIATION_CONFLICT]:
    'A session conflict occurred on another device. Synchronizing with the latest remote state...',
  [SessionErrorCode.SIGN_OUT_FAILED]:
    'We had trouble securely logging you out. Local session data has been purged regardless.',
  [SessionErrorCode.UNKNOWN]:
    'An unexpected session anomaly occurred. Our engineers are investigating.',
};
