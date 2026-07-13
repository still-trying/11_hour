/**
 * 11_HOUR - Session Error Mapping
 * 
 * Part of Slice 1.3: Session Platform.
 * Converts infrastructure, validation, and storage anomalies into standardized,
 * high-fidelity SessionException objects with correlation tracking.
 */

import { SessionErrorCode, SessionException } from './sessionTypes';
import { ZodError } from 'zod';

export class SessionErrorMapper {
  /**
   * Translates any caught runtime exception into a strongly-typed SessionException.
   */
  public static map(error: unknown, defaultCode: SessionErrorCode = SessionErrorCode.UNKNOWN): SessionException {
    if (error instanceof SessionException) {
      return error;
    }

    const correlationId = Math.random().toString(36).substring(2, 11);
    
    // Check if it's a Zod Validation Error
    if (error instanceof ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new SessionException(
        SessionErrorCode.VALIDATION_FAILED,
        `Session payload failed verification bounds: ${messages}`,
        correlationId,
        error
      );
    }

    // Check for network offline/timeout anomalies
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('network') ||
        msg.includes('offline') ||
        msg.includes('failed to fetch') ||
        msg.includes('load failed')
      ) {
        return new SessionException(
          SessionErrorCode.TRANSIENT_NETWORK_DROP,
          'A transient internet connection drop has interrupted cloud session synchronization.',
          correlationId,
          error
        );
      }

      if (msg.includes('expired') || msg.includes('token-expired') || msg.includes('auth/id-token-expired')) {
        return new SessionException(
          SessionErrorCode.SESSION_EXPIRED,
          'Your authenticated security token has expired. Please sign in again.',
          correlationId,
          error
        );
      }

      if (msg.includes('permission') || msg.includes('insufficient permissions') || msg.includes('auth/')) {
        return new SessionException(
          SessionErrorCode.RECOVERY_FAILED,
          'Security clearance failed. Session credentials could not be recovered.',
          correlationId,
          error
        );
      }

      return new SessionException(
        defaultCode,
        error.message,
        correlationId,
        error
      );
    }

    return new SessionException(
      defaultCode,
      'An unexpected, unclassified storage or execution error has occurred.',
      correlationId,
      error
    );
  }
}
