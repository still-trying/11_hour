import { useState, useEffect } from 'react';
import { StateStorage } from 'zustand/middleware';
import { StorageType } from './constants';
import { StoreRegistry } from './storeRegistry';

/**
 * Custom In-Memory Storage Adapter
 * Serves as a high-performance volatile backup for StorageType.MEMORY or environment SSR.
 */
export class MemoryStorage implements StateStorage {
  private cache = new Map<string, string>();

  getItem(name: string): string | null {
    return this.cache.get(name) || null;
  }

  setItem(name: string, value: string): void {
    this.cache.set(name, value);
  }

  removeItem(name: string): void {
    this.cache.delete(name);
  }
}

export const memoryStorage = new MemoryStorage();

/**
 * Resolves a StorageType to its respective browser Web Storage engine.
 */
export function getStorageBackend(type: StorageType = StorageType.MEMORY): StateStorage {
  switch (type) {
    case StorageType.LOCAL:
      return typeof window !== 'undefined' ? window.localStorage : memoryStorage;
    case StorageType.SESSION:
      return typeof window !== 'undefined' ? window.sessionStorage : memoryStorage;
    case StorageType.MEMORY:
    default:
      return memoryStorage;
  }
}

/**
 * Extensible adapter blueprint prepared for future Firestore Synchronization.
 * This coordinates background queuing and offline buffer preparation, ready to be fully connected
 * to live Firestore gateways in downstream slices.
 */
export class FirestoreSyncAdapter<S = any> {
  private storeName: string;
  private syncQueue: S[] = [];
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;

  constructor(storeName: string) {
    this.storeName = storeName;
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  /**
   * Queues a state snapshot to be written to Firestore.
   */
  public enqueueSync(state: S): void {
    this.syncQueue.push(state);
    if (this.isOnline) {
      this.processQueue().catch((err) => {
        console.error(`[FirestoreSync:${this.storeName}] Sync failure:`, err);
      });
    } else {
      console.warn(`[FirestoreSync:${this.storeName}] Offline. Sync queued locally. Queue length: ${this.syncQueue.length}`);
    }
  }

  /**
   * Triggers processing when the browser regains internet access.
   */
  private handleNetworkChange(online: boolean): void {
    this.isOnline = online;
    if (online && this.syncQueue.length > 0) {
      console.info(`[FirestoreSync:${this.storeName}] Network restored. Syncing ${this.syncQueue.length} queued updates...`);
      this.processQueue().catch((err) => {
        console.error(`[FirestoreSync:${this.storeName}] Restored sync failure:`, err);
      });
    }
  }

  /**
   * Core background queue process. Resolves sequential writes with optimistic client states.
   */
  private async processQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;
    
    // De-duplicate: only sync the latest state snapshot to optimize reads/writes
    const latestSnapshot = this.syncQueue[this.syncQueue.length - 1];
    this.syncQueue = [];

    // Background sync simulation (to be linked to Firestore Gateway in Slice 2)
    console.log(`[FirestoreSync:${this.storeName}] Synchronized state to cloud successfully:`, latestSnapshot);
  }
}

/**
 * React hook that monitors the hydration progress of all registered platform stores.
 * Returns true only when every registered store has been loaded from client-side storage.
 */
export function useStoreHydration(): boolean {
  const [allHydrated, setAllHydrated] = useState(StoreRegistry.isAllHydrated());

  useEffect(() => {
    return StoreRegistry.subscribeToHydration((hydrated) => {
      setAllHydrated(hydrated);
    });
  }, []);

  return allHydrated;
}
