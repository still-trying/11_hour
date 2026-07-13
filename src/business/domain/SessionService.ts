/**
 * 11_HOUR - Session Service
 * 
 * Part of Slice 1.3: Session Platform.
 * Orchestrates session actions, handles idle activity updates, triggers database synchronization,
 * and publishes events across the application.
 */

import { ISession, SessionState, SessionException } from './sessionTypes';
import { ISessionRepository } from './SessionRepository';
import { SessionPersistence } from './SessionPersistence';
import { SessionEventDispatcher } from './SessionEventDispatcher';
import { SessionLogging } from './sessionLogging';
import { parseBrowserMetadata } from './sessionUtils';
import { UserProfile } from '@/types';

export class SessionService {
  private readonly repository: ISessionRepository;

  constructor(repository: ISessionRepository) {
    this.repository = repository;
  }

  /**
   * Spawns a brand new application session, writing it to both local storage cache and database storage.
   */
  public async createSession(user: UserProfile | null, isAnonymous = false): Promise<ISession> {
    const startTime = performance.now();
    const sessionId = 'ses_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    const userId = user ? user.id : 'anonymous_user';
    const deviceId = SessionPersistence.getOrCreateDeviceId();
    const { platform, userAgent, clientVersion } = parseBrowserMetadata();

    const newSession: ISession = {
      sessionId,
      userId,
      userProfile: user,
      state: isAnonymous ? SessionState.ANONYMOUS : SessionState.AUTHENTICATED,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      deviceId,
      isAnonymous,
      metadata: {
        platform,
        userAgent,
        clientVersion,
        lastSyncedAt: new Date().toISOString(),
      },
    };

    SessionLogging.info(`Spawning session "${sessionId}" for User "${userId}". [Device ID: ${deviceId}]`);

    try {
      // Validate session structure before saving
      const { validateSession } = await import('./sessionValidators');
      validateSession(newSession);

      // Save locally first for optimistic responsiveness
      SessionPersistence.saveToLocalCache(newSession);

      // Sync with repository database
      await this.repository.saveSession(newSession);

      // Dispatch event
      SessionEventDispatcher.dispatchSessionStarted(sessionId, userId);

      SessionLogging.metric('CreateSession', performance.now() - startTime, true);
      return newSession;
    } catch (error) {
      SessionLogging.error('Session creation failed:', error);
      if (error instanceof SessionException) {
        SessionEventDispatcher.dispatchSessionError(error);
      }
      throw error;
    }
  }

  /**
   * Refreshes the last active timestamp of the current session to ward off idle timeouts.
   */
  public async pingActivity(session: ISession): Promise<ISession> {
    const updatedSession: ISession = {
      ...session,
      lastActiveAt: new Date().toISOString(),
      metadata: {
        ...session.metadata,
        lastSyncedAt: new Date().toISOString(),
      }
    };

    try {
      SessionPersistence.saveToLocalCache(updatedSession);
      await this.repository.saveSession(updatedSession);
      return updatedSession;
    } catch (error) {
      SessionLogging.error('Failed to sync idle heartbeat timestamp:', error);
      // Fail gracefully: local persistence is already saved
      return updatedSession;
    }
  }

  /**
   * Terminates the current active session, clearing local cache and notifying repositories.
   */
  public async terminateSession(session: ISession): Promise<void> {
    const startTime = performance.now();
    SessionLogging.info(`Terminating active session "${session.sessionId}"...`);

    const terminatedSession: ISession = {
      ...session,
      state: SessionState.SIGNING_OUT,
      lastActiveAt: new Date().toISOString(),
    };

    try {
      // Opt-out repository session
      await this.repository.saveSession(terminatedSession);
      await this.repository.deleteSession(session.sessionId);
    } catch (error) {
      SessionLogging.error('Remote session termination encountered errors:', error);
    } finally {
      // Purge local cache regardless of remote API outcomes
      SessionPersistence.clearLocalCache();
      SessionEventDispatcher.dispatchSessionSignedOut(session.sessionId);
      SessionLogging.metric('TerminateSession', performance.now() - startTime, true);
    }
  }

  /**
   * Transition session into EXPIRED state due to long idle durations.
   */
  public async expireSession(session: ISession): Promise<void> {
    SessionLogging.warn(`Force-expiring inactive session "${session.sessionId}".`);

    const expiredSession: ISession = {
      ...session,
      state: SessionState.EXPIRED,
      lastActiveAt: new Date().toISOString(),
    };

    try {
      SessionPersistence.saveToLocalCache(expiredSession);
      await this.repository.saveSession(expiredSession);
    } catch (error) {
      SessionLogging.error('Remote expiration syncing encountered errors:', error);
    } finally {
      SessionEventDispatcher.dispatchSessionExpired(session.sessionId, session.userId);
    }
  }
}
