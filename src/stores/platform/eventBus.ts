/**
 * Strongly-Typed Event Bus
 * Facilitates fully asynchronous, decoupled communication across distinct global stores
 * and domain controllers, completely preventing circular package/store imports.
 */

export type AppEventPayloads = {
  APP_STARTED: undefined;
  USER_SIGNED_IN: { uid: string; email: string };
  USER_SIGNED_OUT: undefined;
  AI_REQUEST_STARTED: { promptId: string };
  AI_REQUEST_COMPLETED: { promptId: string; durationMs: number };
  TASK_CREATED: { taskId: string; title: string };
  STEP_COMPLETED: { stepId: string; taskId: string };
  SESSION_COMPLETED: { episodeId: string; timeSpent: number };

  // Slice 1.3: Session Platform events
  SESSION_STARTED: { sessionId: string; userId: string; timestamp: string };
  SESSION_HYDRATED: { sessionId: string; userId: string; timestamp: string };
  SESSION_RECOVERED: {
    sessionId: string;
    userId: string;
    timestamp: string;
    previousState: string;
  };
  SESSION_EXPIRED: { sessionId: string; userId: string; timestamp: string };
  SESSION_SIGNED_OUT: { sessionId: string; timestamp: string };
  SESSION_ERROR: { code: string; message: string; correlationId: string; timestamp: string };

  // Slice 1.5: Profile Platform events
  PROFILE_CREATED: { uid: string; timestamp: string };
  PROFILE_HYDRATED: { uid: string; timestamp: string };
  PROFILE_UPDATED: { uid: string; fieldsChanged: string[]; timestamp: string };
  PROFILE_SYNC_STARTED: { uid: string; timestamp: string };
  PROFILE_SYNC_COMPLETED: { uid: string; timestamp: string };
  PROFILE_SYNC_FAILED: { uid: string; error: string; timestamp: string };
  PROFILE_MIGRATED: { uid: string; oldVersion: number; newVersion: number; timestamp: string };
  PROFILE_DELETED: { uid: string; timestamp: string };
  PROFILE_ERROR: { code: string; message: string; correlationId: string; timestamp: string };
};

export type AppEventName = keyof AppEventPayloads;

type EventListener<T> = (payload: T) => void | Promise<void>;

class AppEventBusClass {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Record<string, Set<EventListener<any>>> = {};

  /**
   * Registers a listener callback for a specific platform event channel.
   * Returns a standard un-subscription function.
   */
  subscribe<K extends AppEventName>(
    event: K,
    callback: EventListener<AppEventPayloads[K]>,
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event].add(callback);

    return () => {
      this.listeners[event]?.delete(callback);
    };
  }

  /**
   * Dispatches an event with its strictly typed payload to all active channel listeners.
   */
  publish<K extends AppEventName>(event: K, payload: AppEventPayloads[K]): void {
    console.info(
      `📡 [EventBus] Dispatching "${event}":`,
      payload !== undefined ? payload : '[Void]',
    );

    const channelListeners = this.listeners[event];
    if (channelListeners) {
      channelListeners.forEach((listener) => {
        try {
          const result = listener(payload);
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error(`❌ [EventBus] Async listener failure in channel "${event}":`, error);
            });
          }
        } catch (error) {
          console.error(`❌ [EventBus] Sync listener failure in channel "${event}":`, error);
        }
      });
    }
  }
}

export const AppEventBus = new AppEventBusClass();
