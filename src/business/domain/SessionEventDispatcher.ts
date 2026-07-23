/**
 * 11_HOUR - Session Event Dispatcher
 *
 * Part of Slice 1.3: Session Platform.
 * Adapts the global strongly-typed AppEventBus to broadcast Session Platform events,
 * allowing other decoupled modules (e.g., notification systems, logs) to respond to session actions.
 */

import { AppEventBus } from '@/stores/platform/eventBus';
import { SessionException, SessionState } from './sessionTypes';

export class SessionEventDispatcher {
  /**
   * Publishes the start of a brand new authenticated or anonymous user workspace session.
   */
  public static dispatchSessionStarted(sessionId: string, userId: string): void {
    AppEventBus.publish('SESSION_STARTED', {
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes successful restoration of a session from local storage cache.
   */
  public static dispatchSessionHydrated(sessionId: string, userId: string): void {
    AppEventBus.publish('SESSION_HYDRATED', {
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes session recovery, e.g., recovering from network offline drops.
   */
  public static dispatchSessionRecovered(
    sessionId: string,
    userId: string,
    previousState: SessionState,
  ): void {
    AppEventBus.publish('SESSION_RECOVERED', {
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
      previousState,
    });
  }

  /**
   * Publishes a session expiration event due to idle timeout thresholds.
   */
  public static dispatchSessionExpired(sessionId: string, userId: string): void {
    AppEventBus.publish('SESSION_EXPIRED', {
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes standard session termination and user sign-out completion.
   */
  public static dispatchSessionSignedOut(sessionId: string): void {
    AppEventBus.publish('SESSION_SIGNED_OUT', {
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a critical session failure or security exception.
   */
  public static dispatchSessionError(error: SessionException): void {
    AppEventBus.publish('SESSION_ERROR', {
      code: error.code,
      message: error.message,
      correlationId: error.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
