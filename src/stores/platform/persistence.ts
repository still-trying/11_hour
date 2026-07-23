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
