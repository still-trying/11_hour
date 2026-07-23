/**
 * 11_HOUR - State Platform Notification Store
 *
 * Implements the Runtime Notifications Infrastructure using Vibe2Ship's
 * central State Platform composition models. Supports info, success, warning,
 * and error alerts with automatic dismissal.
 */

import { createStateStore } from './platform/factory';
import { STORE_NAMES, StorageType } from './platform/constants';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  durationMs: number;
}

export interface NotificationState {
  notifications: ToastNotification[];
}

export interface NotificationActions {
  addNotification: (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
    durationMs?: number,
  ) => string;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
}

const initialState: NotificationState = {
  notifications: [],
};

export const useNotificationStore = createStateStore<NotificationState, NotificationActions>({
  name: STORE_NAMES.NOTIFICATION,
  storageType: StorageType.MEMORY, // Keeping toasts in volatile memory
  initialState,
  actions: (set, get) => {
    const actions: NotificationActions = {
      addNotification: (message, type, durationMs = 5000) => {
        const id = `NOTIF-${Math.floor(Math.random() * 1000000)}`;
        const newNotification: ToastNotification = {
          id,
          message,
          type,
          createdAt: new Date().toISOString(),
          durationMs,
        };

        set({
          notifications: [...get().notifications, newNotification],
        });

        // Handle automatic dismissal
        if (durationMs > 0) {
          setTimeout(() => {
            actions.dismissNotification(id);
          }, durationMs);
        }

        return id;
      },

      dismissNotification: (id) => {
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    };

    return actions;
  },
});
