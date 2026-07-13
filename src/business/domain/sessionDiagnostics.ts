/**
 * 11_HOUR - Session Diagnostics Engine
 * 
 * Part of Slice 1.3: Session Platform.
 * Compiles real-time health scores, latency scales, and device fingerprints for debugging.
 */

import { ISession, SessionState } from './sessionTypes';
import { SessionPersistence } from './SessionPersistence';

export interface SessionDiagnosticReport {
  healthScore: number;
  hasActiveSession: boolean;
  sessionState: SessionState;
  deviceId: string;
  isOnline: boolean;
  timeSinceLastActiveMs: number;
  driftLatencyMs: number;
  browserStorageResponsive: boolean;
}

export class SessionDiagnostics {
  /**
   * Performs real-time system diagnostics to audit session stability and storage responsiveness.
   */
  public static run(currentSession: ISession | null, currentStoreState: SessionState): SessionDiagnosticReport {
    const startTime = performance.now();
    let browserStorageResponsive = false;

    // Test storage responsiveness
    try {
      if (typeof window !== 'undefined') {
        const testKey = '__11hour_diagnostics_ping__';
        window.sessionStorage.setItem(testKey, 'pong');
        const responsive = window.sessionStorage.getItem(testKey) === 'pong';
        window.sessionStorage.removeItem(testKey);
        browserStorageResponsive = responsive;
      }
    } catch {
      browserStorageResponsive = false;
    }

    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    const deviceId = SessionPersistence.getOrCreateDeviceId();
    
    let timeSinceLastActiveMs = 0;
    if (currentSession) {
      const lastActive = new Date(currentSession.lastActiveAt).getTime();
      timeSinceLastActiveMs = Date.now() - lastActive;
    }

    // Determine aggregate health score
    let healthScore = 100;
    if (!browserStorageResponsive) healthScore -= 40;
    if (!isOnline) healthScore -= 20;
    if (timeSinceLastActiveMs > 30 * 60 * 1000) healthScore -= 15; // long idle times
    if (currentStoreState === SessionState.EXPIRED) healthScore -= 30;
    
    const driftLatencyMs = performance.now() - startTime;

    return {
      healthScore: Math.max(0, healthScore),
      hasActiveSession: currentSession !== null,
      sessionState: currentStoreState,
      deviceId,
      isOnline,
      timeSinceLastActiveMs,
      driftLatencyMs,
      browserStorageResponsive,
    };
  }
}
