/**
 * 11_HOUR - Session Recovery Controller
 * 
 * Part of Slice 1.3: Session Platform.
 * Governs active session restoration, security validation with the remote repository,
 * and state merging during network reconciliation.
 */

import { ISession, SessionException, SessionErrorCode } from './sessionTypes';
import { ISessionRepository } from './SessionRepository';
import { SessionPersistence } from './SessionPersistence';
import { SessionLogging } from './sessionLogging';

export class SessionRecovery {
  /**
   * Recovers and re-validates a hydrated session with the remote database.
   * If remote session is found, reconciles and returns the merged result.
   */
  public static async recover(
    hydratedSession: ISession,
    repository: ISessionRepository
  ): Promise<ISession> {
    const startTime = performance.now();
    SessionLogging.info(`Initiating security recovery for session "${hydratedSession.sessionId}".`);

    try {
      // Reconcile state in the repository (e.g. Last-Write-Wins merge)
      const reconciled = await repository.reconcileSession(hydratedSession);
      
      // Update local storage cache with reconciled state
      SessionPersistence.saveToLocalCache(reconciled);

      SessionLogging.info(`Session "${reconciled.sessionId}" successfully recovered and reconciled.`);
      SessionLogging.metric('SessionRecovery', performance.now() - startTime, true);

      return reconciled;
    } catch (error) {
      SessionLogging.error(`Session recovery failed:`, error);
      
      // If a transient network drop occurs, continue working with the local hydrated state
      if (error instanceof SessionException && error.code === SessionErrorCode.TRANSIENT_NETWORK_DROP) {
        SessionLogging.warn(`Transient drop. Operating with local offline session copy.`);
        return hydratedSession;
      }

      // Serious credentials or database recovery failure
      throw error;
    }
  }
}
