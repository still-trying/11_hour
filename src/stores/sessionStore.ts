/**
 * 11_HOUR - State Platform Session Store
 * 
 * Part of Slice 1.3: Session Platform.
 * Coordinates reactive session tracking, idle countdown transitions, and telemetry
 * diagnostics for UI components. Wraps the SessionManager orchestrator.
 */

import { createStateStore } from './platform/factory';
import { STORE_NAMES, StorageType } from './platform/constants';
import { ISession, SessionState } from '@/business/domain/sessionTypes';
import { SessionManager } from '@/business/domain/SessionManager';
import { SessionDiagnostics } from '@/business/domain/sessionDiagnostics';

export interface SessionStoreState {
  currentSession: ISession | null;
  sessionState: SessionState;
  error: string | null;
  isOnline: boolean;
  diagnostics: ReturnType<typeof SessionDiagnostics.run> | null;
}

export interface SessionStoreActions {
  initialize: () => void;
  forceRecovery: () => Promise<boolean>;
  recordActivity: () => void;
  clearError: () => void;
  runDiagnostics: () => void;
}

const initialState: SessionStoreState = {
  currentSession: null,
  sessionState: SessionState.UNKNOWN,
  error: null,
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  diagnostics: null,
};

export const useSessionStore = createStateStore<SessionStoreState, SessionStoreActions>({
  name: STORE_NAMES.SESSION,
  storageType: StorageType.SESSION,
  initialState,
  actions: (set, get) => {
    // Dynamically update the online status using standard browser event systems
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => set({ isOnline: true }));
      window.addEventListener('offline', () => set({ isOnline: false }));
    }

    // Initialize and bind session changes directly from the Domain SessionManager
    // Defer start to ensure store construction and hydration completes first
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        SessionManager.start((state, session) => {
          set({
            sessionState: state,
            currentSession: session,
          });

          // Recalculate diagnostics on state changes for instant telemetry
          const currentDiagnostics = SessionDiagnostics.run(session, state);
          set({ diagnostics: currentDiagnostics });
        });
      }, 0);
    }

    return {
      initialize: () => {
        // Hydration and start occurs automatically during manager initialization,
        // but we can enforce a refresh check of diagnostics here
        const currentDiagnostics = SessionDiagnostics.run(get().currentSession, get().sessionState);
        set({ diagnostics: currentDiagnostics });
      },

      forceRecovery: async () => {
        set({ error: null });
        try {
          const success = await SessionManager.getLifecycleManager().forceRecovery();
          if (!success) {
            set({ error: 'Session recovery could not be completed at this time.' });
          }
          return success;
        } catch (err: any) {
          set({ error: err.message || 'An unexpected recovery error occurred.' });
          return false;
        }
      },

      recordActivity: () => {
        SessionManager.getLifecycleManager().recordLocalActivity();
      },

      clearError: () => {
        set({ error: null });
      },

      runDiagnostics: () => {
        const currentDiagnostics = SessionDiagnostics.run(get().currentSession, get().sessionState);
        set({ diagnostics: currentDiagnostics });
      },
    };
  },
});

export default useSessionStore;
