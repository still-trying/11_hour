/**
 * 11_HOUR - State Platform UI & Runtime Status Store
 *
 * Coordinates application states (Starting, Initializing, Ready, Offline,
 * Recovering, Maintenance, Fatal Error), offline detection transitions,
 * maintenance flags, and development diagnostics.
 */

import { createStateStore } from './platform/factory';
import { STORE_NAMES, StorageType } from './platform/constants';
import { useNotificationStore } from './notificationStore';
import { RuntimeRecoveryManager } from '@/runtime/resilience/recovery';

export enum RuntimeStatus {
  STARTING = 'Starting',
  INITIALIZING = 'Initializing',
  READY = 'Ready',
  OFFLINE = 'Offline',
  RECOVERING = 'Recovering',
  MAINTENANCE = 'Maintenance',
  FATAL_ERROR = 'Fatal Error',
}

export interface UIState {
  status: RuntimeStatus;
  isOnline: boolean;
  isMaintenance: boolean;
  fatalError: { message: string; correlationId: string; category: string; stack?: string } | null;
  showDiagnosticOverlay: boolean;
}

export interface UIActions {
  setStatus: (status: RuntimeStatus) => void;
  setOnline: (online: boolean) => void;
  setMaintenance: (maintenance: boolean) => void;
  triggerFatalCrash: (error: any) => void;
  recoverFromCrash: () => Promise<boolean>;
  toggleDiagnosticOverlay: () => void;
  initializeOfflineDetection: () => () => void;
}

const initialState: UIState = {
  status: RuntimeStatus.STARTING,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isMaintenance: false,
  fatalError: null,
  showDiagnosticOverlay: false,
};

export const useUIStore = createStateStore<UIState, UIActions>({
  name: STORE_NAMES.UI,
  storageType: StorageType.SESSION, // Persist status across refreshes within session
  initialState,
  actions: (set, get) => {
    const actions: UIActions = {
      setStatus: (status) => {
        console.info(`🔄 [RuntimeStatus] Transitioning: ${get().status} ➔ ${status}`);
        set({ status });
      },

      setOnline: (online) => {
        const prevOnline = get().isOnline;
        if (prevOnline === online) return;

        set({ isOnline: online });
        const notifStore = useNotificationStore.getState();

        if (online) {
          notifStore.addNotification('Network connection successfully restored.', 'success', 4000);
          // If we were offline, return to Ready (or Maintenance if active)
          if (get().status === RuntimeStatus.OFFLINE) {
            actions.setStatus(get().isMaintenance ? RuntimeStatus.MAINTENANCE : RuntimeStatus.READY);
          }
        } else {
          notifStore.addNotification('Offline Mode Active. Progress will save locally.', 'error', 0); // persistent
          if (get().status === RuntimeStatus.READY || get().status === RuntimeStatus.INITIALIZING) {
            actions.setStatus(RuntimeStatus.OFFLINE);
          }
        }
      },

      setMaintenance: (maintenance) => {
        set({ isMaintenance: maintenance });
        if (maintenance) {
          actions.setStatus(RuntimeStatus.MAINTENANCE);
        } else if (get().status === RuntimeStatus.MAINTENANCE) {
          actions.setStatus(get().isOnline ? RuntimeStatus.READY : RuntimeStatus.OFFLINE);
        }
      },

      triggerFatalCrash: (error) => {
        const correlationId = error?.correlationId || `ERR-${Math.floor(Math.random() * 1000000)}`;
        set({
          status: RuntimeStatus.FATAL_ERROR,
          fatalError: {
            message: error?.message || String(error),
            correlationId,
            category: error?.category || 'RUNTIME',
            stack: error?.stack,
          },
        });
        console.error(`🚨 [FatalError] Application halted due to uncaught crash. Correlation ID: ${correlationId}`);
      },

      recoverFromCrash: async () => {
        if (get().status !== RuntimeStatus.FATAL_ERROR) return false;

        actions.setStatus(RuntimeStatus.RECOVERING);
        useNotificationStore.getState().addNotification('Initializing automated container self-healing...', 'info', 3000);

        // Clear non-persistent stores
        RuntimeRecoveryManager.clearVolatileStateCaches();

        // Trigger self healing routine
        const success = await RuntimeRecoveryManager.executeSelfHealingRoutine();

        if (success) {
          set({ fatalError: null });
          actions.setStatus(RuntimeStatus.READY);
          useNotificationStore.getState().addNotification('System core stabilized. Execution resumed.', 'success', 4000);
          return true;
        } else {
          actions.setStatus(RuntimeStatus.FATAL_ERROR);
          useNotificationStore.getState().addNotification('Automated recovery failed. Manual reboot required.', 'error', 5000);
          return false;
        }
      },

      toggleDiagnosticOverlay: () => {
        set({ showDiagnosticOverlay: !get().showDiagnosticOverlay });
      },

      initializeOfflineDetection: () => {
        if (typeof window === 'undefined') return () => {};

        const handleOnline = () => actions.setOnline(true);
        const handleOffline = () => actions.setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Return a clean teardown function
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      },
    };

    return actions;
  },
});
