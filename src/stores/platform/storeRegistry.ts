import { StoreName } from './constants';
import { RegistryEntry } from './contracts';

/**
 * Centralized Store Registry
 * Manages the lifecycle of all global Zustand stores, provides a universal state reset,
 * coordinates hydration monitoring, and handles state exporting.
 */
class StoreRegistryClass {
  private registry = new Map<StoreName, RegistryEntry>();
  private hydrationListeners = new Set<(hydrated: boolean) => void>();

  /**
   * Registers a store in the centralized state platform registry.
   */
  register(entry: RegistryEntry): void {
    this.registry.set(entry.name, entry);
    this.notifyHydrationChange();
  }

  /**
   * Retrieves a registered store by its name.
   */
  get(name: StoreName): RegistryEntry | undefined {
    return this.registry.get(name);
  }

  /**
   * Returns a list of all currently registered store names.
   */
  getRegisteredStoreNames(): StoreName[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Verifies if all registered stores are fully hydrated.
   */
  isAllHydrated(): boolean {
    for (const entry of this.registry.values()) {
      if (!entry.isHydrated()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Performs an absolute, system-wide reset of all registered stores.
   * Purges local user states instantly on signout or emergency cache corruption events.
   */
  resetAll(): void {
    console.warn('⚠️ [StoreRegistry] Emergency Reset requested! Purging all active registered stores.');
    for (const entry of this.registry.values()) {
      try {
        entry.reset();
      } catch (error) {
        console.error(`❌ [StoreRegistry] Failed to reset store "${entry.name}":`, error);
      }
    }
  }

  /**
   * Subscribes to changes in the overall platform hydration state.
   * Emits `true` only when all registered stores have successfully finished loading from client caches.
   */
  subscribeToHydration(callback: (hydrated: boolean) => void): () => void {
    this.hydrationListeners.add(callback);
    callback(this.isAllHydrated());

    return () => {
      this.hydrationListeners.delete(callback);
    };
  }

  /**
   * Serializes the current runtime states of all registered stores into a single object.
   * Highly useful for telemetry logs, support tickets, and debugging.
   */
  exportState(): Record<string, any> {
    const stateSnapshot: Record<string, any> = {};
    for (const [name, entry] of this.registry.entries()) {
      stateSnapshot[name] = entry.getState();
    }
    return stateSnapshot;
  }

  /**
   * Helper called by hydration systems to force a global state re-check.
   */
  triggerHydrationCheck(): void {
    this.notifyHydrationChange();
  }

  /**
   * Notifies all hydration listeners of the current global hydration state.
   */
  private notifyHydrationChange(): void {
    const allHydrated = this.isAllHydrated();
    this.hydrationListeners.forEach((listener) => {
      try {
        listener(allHydrated);
      } catch (error) {
        console.error('❌ [StoreRegistry] Hydration listener failed:', error);
      }
    });
  }
}

export const StoreRegistry = new StoreRegistryClass();
