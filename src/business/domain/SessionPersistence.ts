/**
 * 11_HOUR - Session Persistence Manager
 * 
 * Part of Slice 1.3: Session Platform.
 * Governs browser storage transactions (sessionStorage & localStorage) to preserve active
 * session signatures between page refreshes and tab closures.
 */

import { ISession } from './sessionTypes';
import { SESSION_STORAGE_KEYS } from './sessionConstants';
import { SessionErrorMapper } from './sessionErrorMapping';
import { SessionErrorCode } from './sessionTypes';

export class SessionPersistence {
  /**
   * Generates or retrieves a persistent, randomized Device ID for this client.
   * Surves standard cache clears by caching securely in localStorage.
   */
  public static getOrCreateDeviceId(): string {
    try {
      if (typeof window === 'undefined') {
        return 'ssr-device-11hour';
      }

      let deviceId = window.localStorage.getItem(SESSION_STORAGE_KEYS.SESSION_DEVICE_ID);
      if (!deviceId) {
        // High-entropy pseudorandom generation
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
        window.localStorage.setItem(SESSION_STORAGE_KEYS.SESSION_DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (e) {
      console.warn('⚠️ [SessionPersistence] Storage disabled or sandboxed. Using ephemeral device fallback.', e);
      return 'ephemeral-device-' + Math.random().toString(36).substring(2, 8);
    }
  }

  /**
   * Caches the active session state structure inside sessionStorage (and optionally localStorage).
   */
  public static saveToLocalCache(session: ISession): void {
    try {
      if (typeof window === 'undefined') return;
      
      const serialized = JSON.stringify(session);
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.ACTIVE_SESSION, serialized);
    } catch (error) {
      throw SessionErrorMapper.map(
        error,
        SessionErrorCode.PERSISTENCE_FAILED
      );
    }
  }

  /**
   * Restores the session state structure from sessionStorage caches.
   */
  public static loadFromLocalCache(): ISession | null {
    try {
      if (typeof window === 'undefined') return null;

      const serialized = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.ACTIVE_SESSION);
      if (!serialized) return null;

      return JSON.parse(serialized) as ISession;
    } catch (error) {
      console.error('❌ [SessionPersistence] Cache corruption detected. Resetting session cache.', error);
      SessionPersistence.clearLocalCache();
      return null;
    }
  }

  /**
   * Completely purges all active cached session variables.
   */
  public static clearLocalCache(): void {
    try {
      if (typeof window === 'undefined') return;
      
      window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.ACTIVE_SESSION);
    } catch (e) {
      console.error('❌ [SessionPersistence] Failed to purge active session cache:', e);
    }
  }
}
