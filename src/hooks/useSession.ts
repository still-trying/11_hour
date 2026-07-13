/**
 * 11_HOUR - Unified Session Hook
 * 
 * Part of Slice 1.3: Session Platform.
 * Provides a clean, modular React interface for components to query active session parameters,
 * track network/sync status, trigger manual recoveries, and pull diagnostics.
 */

import { useSessionStore, SessionStoreState, SessionStoreActions } from '@/stores/sessionStore';
import { BaseState, BaseActions } from '@/stores/platform/contracts';

type CombinedSessionStoreState = SessionStoreState & SessionStoreActions & BaseState & BaseActions;

export function useSession() {
  const currentSession = useSessionStore((state: CombinedSessionStoreState) => state.currentSession);
  const sessionState = useSessionStore((state: CombinedSessionStoreState) => state.sessionState);
  const error = useSessionStore((state: CombinedSessionStoreState) => state.error);
  const isOnline = useSessionStore((state: CombinedSessionStoreState) => state.isOnline);
  const diagnostics = useSessionStore((state: CombinedSessionStoreState) => state.diagnostics);

  const initialize = useSessionStore((state: CombinedSessionStoreState) => state.initialize);
  const forceRecovery = useSessionStore((state: CombinedSessionStoreState) => state.forceRecovery);
  const recordActivity = useSessionStore((state: CombinedSessionStoreState) => state.recordActivity);
  const clearError = useSessionStore((state: CombinedSessionStoreState) => state.clearError);
  const runDiagnostics = useSessionStore((state: CombinedSessionStoreState) => state.runDiagnostics);

  return {
    currentSession,
    sessionState,
    error,
    isOnline,
    diagnostics,
    initialize,
    forceRecovery,
    recordActivity,
    clearError,
    runDiagnostics,
  };
}

export default useSession;
