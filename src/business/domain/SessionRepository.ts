/**
 * 11_HOUR - Session Repository Interface
 * 
 * Part of Slice 1.3: Session Platform.
 * Declares the data contract for CRUD, real-time sync, and device-level caching
 * of active user session records.
 */

import { ISession } from './sessionTypes';

export interface ISessionRepository {
  /**
   * Instantly persists the session record in the fastest available layer (Local + memory queue).
   */
  saveSession(session: ISession): Promise<void>;

  /**
   * Retrieves a session record by its unique Session ID.
   */
  getSession(sessionId: string): Promise<ISession | null>;

  /**
   * Deletes a session record from local cache and remote persistence.
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Gathers all currently active sessions associated with the designated User ID.
   */
  getActiveSessions(userId: string): Promise<ISession[]>;

  /**
   * Subscribes to real-time changes of a session record, updating the client instantly.
   */
  onSessionChanged(sessionId: string, callback: (session: ISession | null) => void): () => void;

  /**
   * Reconciles local and remote storage states, pushing any unsynced offline changes.
   */
  reconcileSession(session: ISession): Promise<ISession>;
}
