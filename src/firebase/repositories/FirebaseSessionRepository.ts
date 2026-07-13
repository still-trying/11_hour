/**
 * 11_HOUR - Firebase Session Repository
 * 
 * Part of Slice 1.3: Session Platform.
 * Bridges session domain repository requests with the live Firestore SDK, supporting
 * offline-first queries, persistent multi-tab syncing, and high-fidelity simulated backups.
 */

import { ISessionRepository } from '@/business/domain/SessionRepository';
import { ISession, SessionState, SessionErrorCode } from '@/business/domain/sessionTypes';
import { db, config } from '../config';
import { EMULATOR_CONFIGS } from '../constants';
import { SessionErrorMapper } from '@/business/domain/sessionErrorMapping';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';

export class FirebaseSessionRepository implements ISessionRepository {
  private readonly isMock: boolean;
  private readonly mockSessionStore = new Map<string, ISession>();

  constructor() {
    this.isMock = config.apiKey.includes('mock-api-key') && !EMULATOR_CONFIGS.USE_EMULATORS;
    if (this.isMock) {
      console.warn('🛡️ [FirebaseSessionRepository] Running in high-fidelity mock mode.');
    }
  }

  /**
   * Instantly persists the session document locally and to Firestore server-side.
   */
  public async saveSession(session: ISession): Promise<void> {
    try {
      if (this.isMock) {
        this.mockSessionStore.set(session.sessionId, { ...session });
        return;
      }

      // Store sessions nested under user collections for strict Firestore security boundaries
      const sessionDocRef = doc(db, 'users', session.userId, 'sessions', session.sessionId);
      await setDoc(sessionDocRef, session, { merge: true });
    } catch (error) {
      throw SessionErrorMapper.map(error, SessionErrorCode.PERSISTENCE_FAILED);
    }
  }

  /**
   * Loads a session document by ID.
   */
  public async getSession(sessionId: string): Promise<ISession | null> {
    try {
      if (this.isMock) {
        return this.mockSessionStore.get(sessionId) || null;
      }

      // To find a session across nested collections or if we already know the userId, 
      // but since ISession contains userId, we should attempt lookup by caching or searching.
      // Wait, in standard flows we store the active session userId in sessionStorage, 
      // so we can resolve the doc path. If we don't know the userId yet, we can look in sessionStorage
      // or retrieve it.
      const localCached = sessionStorage.getItem('11hour_active_session');
      if (localCached) {
        const cachedSession = JSON.parse(localCached) as ISession;
        if (cachedSession.sessionId === sessionId) {
          const sessionDocRef = doc(db, 'users', cachedSession.userId, 'sessions', sessionId);
          const snap = await getDoc(sessionDocRef);
          if (snap.exists()) {
            return snap.data() as ISession;
          }
        }
      }
      return null;
    } catch (error) {
      throw SessionErrorMapper.map(error, SessionErrorCode.RECOVERY_FAILED);
    }
  }

  /**
   * Deletes a session document.
   */
  public async deleteSession(sessionId: string): Promise<void> {
    try {
      if (this.isMock) {
        this.mockSessionStore.delete(sessionId);
        return;
      }

      const localCached = sessionStorage.getItem('11hour_active_session');
      if (localCached) {
        const cachedSession = JSON.parse(localCached) as ISession;
        if (cachedSession.sessionId === sessionId) {
          const sessionDocRef = doc(db, 'users', cachedSession.userId, 'sessions', sessionId);
          await deleteDoc(sessionDocRef);
        }
      }
    } catch (error) {
      throw SessionErrorMapper.map(error, SessionErrorCode.PERSISTENCE_FAILED);
    }
  }

  /**
   * Retreives all active sessions registered under this User ID.
   */
  public async getActiveSessions(userId: string): Promise<ISession[]> {
    try {
      if (this.isMock) {
        return Array.from(this.mockSessionStore.values()).filter(
          (s) => s.userId === userId && s.state !== SessionState.EXPIRED && s.state !== SessionState.SIGNING_OUT
        );
      }

      const sessionsCollectionRef = collection(db, 'users', userId, 'sessions');
      const q = query(
        sessionsCollectionRef, 
        where('state', 'not-in', [SessionState.EXPIRED, SessionState.SIGNING_OUT])
      );
      
      const snap = await getDocs(q);
      const results: ISession[] = [];
      snap.forEach((d) => {
        results.push(d.data() as ISession);
      });
      return results;
    } catch (error) {
      throw SessionErrorMapper.map(error, SessionErrorCode.RECOVERY_FAILED);
    }
  }

  /**
   * Connects a real-time Firestore listener to sync external session actions.
   */
  public onSessionChanged(sessionId: string, callback: (session: ISession | null) => void): () => void {
    if (this.isMock) {
      // Ephemeral mock listener
      const interval = setInterval(() => {
        const s = this.mockSessionStore.get(sessionId) || null;
        callback(s);
      }, 5000);
      return () => clearInterval(interval);
    }

    const localCached = sessionStorage.getItem('11hour_active_session');
    if (!localCached) {
      callback(null);
      return () => {};
    }

    try {
      const cachedSession = JSON.parse(localCached) as ISession;
      const sessionDocRef = doc(db, 'users', cachedSession.userId, 'sessions', sessionId);

      return onSnapshot(
        sessionDocRef,
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as ISession);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('❌ [FirebaseSessionRepository] real-time snapshot subscription failed:', error);
        }
      );
    } catch (e) {
      console.error('❌ [FirebaseSessionRepository] Failed parsing active cached session for listener:', e);
      callback(null);
      return () => {};
    }
  }

  /**
   * Reconciles local and remote storage states, pushing any unsynced offline changes.
   */
  public async reconcileSession(session: ISession): Promise<ISession> {
    try {
      if (this.isMock) {
        this.mockSessionStore.set(session.sessionId, { ...session });
        return session;
      }

      const sessionDocRef = doc(db, 'users', session.userId, 'sessions', session.sessionId);
      const snap = await getDoc(sessionDocRef);
      
      if (!snap.exists()) {
        await setDoc(sessionDocRef, session);
        return session;
      }

      const remoteSession = snap.data() as ISession;
      
      // Merge strategy: Last write wins based on lastActiveAt timestamps
      const localTime = new Date(session.lastActiveAt).getTime();
      const remoteTime = new Date(remoteSession.lastActiveAt).getTime();

      if (localTime >= remoteTime) {
        // Local is newer, overwrite remote
        await setDoc(sessionDocRef, session, { merge: true });
        return session;
      } else {
        // Remote is newer, pull remote state
        return remoteSession;
      }
    } catch (error) {
      console.warn('⚠️ [FirebaseSessionRepository] Reconciliation running offline. Overwriting locally.', error);
      return session;
    }
  }
}
export const firebaseSessionRepositoryInstance = new FirebaseSessionRepository();
