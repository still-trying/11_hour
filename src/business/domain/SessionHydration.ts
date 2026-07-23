/**
 * 11_HOUR - Session Hydration Controller
 *
 * Part of Slice 1.3: Session Platform.
 * Loads and verifies the integrity of cached browser sessions during application initialization,
 * handling corrupt states or expired idle windows elegantly.
 */

import { ISession, SessionState } from './sessionTypes';
import { SessionPersistence } from './SessionPersistence';
import { safeValidateSession } from './sessionValidators';
import { SESSION_TIMEOUTS } from './sessionConstants';
import { SessionLogging } from './sessionLogging';

export class SessionHydration {
  /**
   * Attempts to dry-load and validate a session from browser sessionStorage.
   * If valid and active, returns the session and state. If expired, returns EXPIRED.
   * If corrupt or missing, returns null.
   */
  public static hydrate(): { session: ISession; state: SessionState } | null {
    const startTime = performance.now();
    try {
      const cached = SessionPersistence.loadFromLocalCache();
      if (!cached) {
        SessionLogging.info('No active session found in local cache to hydrate.');
        return null;
      }

      // Check schema validation bounds
      const validation = safeValidateSession(cached);
      if (!validation.success) {
        SessionLogging.warn(
          `Hydration schema invalid: ${validation.error.message}. Evicting cache.`,
        );
        SessionPersistence.clearLocalCache();
        return null;
      }

      const session = validation.data as ISession;

      // Check if session has expired due to idle window timeout
      const lastActive = new Date(session.lastActiveAt).getTime();
      const idleTime = Date.now() - lastActive;

      if (idleTime >= SESSION_TIMEOUTS.IDLE_TIMEOUT_MS) {
        SessionLogging.warn(
          `Session "${session.sessionId}" has expired due to exceeding idle threshold.`,
        );
        return {
          session: {
            ...session,
            state: SessionState.EXPIRED,
          },
          state: SessionState.EXPIRED,
        };
      }

      SessionLogging.info(`Session "${session.sessionId}" successfully hydrated from cache.`);
      SessionLogging.metric('SessionHydration', performance.now() - startTime, true);

      return {
        session,
        state: session.state,
      };
    } catch (error) {
      SessionLogging.error('Critical hydration breakdown caught:', error);
      SessionPersistence.clearLocalCache();
      return null;
    }
  }
}
