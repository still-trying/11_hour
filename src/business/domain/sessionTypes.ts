/**
 * 11_HOUR - Session Type Definitions
 *
 * Part of Slice 1.3: Session Platform.
 * Defines session-related states, events, payloads, interfaces, and exception classes
 * to decouple the presentation and application layers from specific infrastructure SDKs.
 */

import { UserProfile } from '@/types';

/**
 * Standardized session states.
 */
export enum SessionState {
  UNKNOWN = 'UNKNOWN',
  INITIALIZING = 'INITIALIZING',
  AUTHENTICATED = 'AUTHENTICATED',
  ANONYMOUS = 'ANONYMOUS',
  EXPIRED = 'EXPIRED',
  REFRESHING = 'REFRESHING',
  RECOVERING = 'RECOVERING',
  SIGNING_OUT = 'SIGNING_OUT',
}

/**
 * Standardized session event types.
 */
export enum SessionEvent {
  SESSION_STARTED = 'SessionStarted',
  SESSION_HYDRATED = 'SessionHydrated',
  SESSION_RECOVERED = 'SessionRecovered',
  SESSION_EXPIRED = 'SessionExpired',
  SESSION_SIGNED_OUT = 'SessionSignedOut',
  SESSION_ERROR = 'SessionError',
}

/**
 * Interface representing a highly resilient application session.
 */
export interface ISession {
  sessionId: string;
  userId: string;
  userProfile: UserProfile | null;
  state: SessionState;
  createdAt: string;
  lastActiveAt: string;
  deviceId: string;
  isAnonymous: boolean;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    lastSyncedAt?: string;
    clientVersion: string;
    platform: string;
  };
}

/**
 * Standardized session error codes.
 */
export enum SessionErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  HYDRATION_FAILED = 'HYDRATION_FAILED',
  RECOVERY_FAILED = 'RECOVERY_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TRANSIENT_NETWORK_DROP = 'TRANSIENT_NETWORK_DROP',
  RECONCILIATION_CONFLICT = 'RECONCILIATION_CONFLICT',
  SIGN_OUT_FAILED = 'SIGN_OUT_FAILED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom Domain Exception representing a Session Platform failure.
 */
export class SessionException extends Error {
  public readonly code: SessionErrorCode;
  public readonly correlationId: string;
  public readonly originalError?: unknown;

  constructor(
    code: SessionErrorCode,
    message: string,
    correlationId: string = Math.random().toString(36).substring(2, 11),
    originalError?: unknown,
  ) {
    super(message);
    this.name = 'SessionException';
    this.code = code;
    this.correlationId = correlationId;
    this.originalError = originalError;

    // Ensure proper prototype chain for built-in Error extension
    Object.setPrototypeOf(this, SessionException.prototype);
  }

  /**
   * Serializes the domain exception for secure diagnostic telemetry.
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      originalMessage:
        this.originalError instanceof Error
          ? this.originalError.message
          : String(this.originalError || ''),
    };
  }
}

/**
 * Strongly typed payload signatures for individual session event channels.
 */
export interface SessionEventPayloads {
  [SessionEvent.SESSION_STARTED]: { sessionId: string; userId: string; timestamp: string };
  [SessionEvent.SESSION_HYDRATED]: { sessionId: string; userId: string; timestamp: string };
  [SessionEvent.SESSION_RECOVERED]: {
    sessionId: string;
    userId: string;
    timestamp: string;
    previousState: SessionState;
  };
  [SessionEvent.SESSION_EXPIRED]: { sessionId: string; userId: string; timestamp: string };
  [SessionEvent.SESSION_SIGNED_OUT]: { sessionId: string; timestamp: string };
  [SessionEvent.SESSION_ERROR]: { error: SessionException; timestamp: string };
}
