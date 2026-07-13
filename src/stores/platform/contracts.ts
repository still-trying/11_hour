import { z } from 'zod';
import { StoreName, StorageType } from './constants';

/**
 * Base State that all store states must conform to.
 */
export interface BaseState {
  _version: number;
  _hydrated: boolean;
  _lastUpdated: string | null;
}

/**
 * Base Actions that all stores must implement.
 */
export interface BaseActions {
  reset: () => void;
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Interface representing a migration for schema evolution.
 */
export interface Migration<S = any> {
  version: number;
  migrate: (persistedState: any) => S | Promise<S>;
}

/**
 * Middleware Configuration for individual stores.
 */
export interface StoreMiddlewareOptions<S = any> {
  enableLogging?: boolean;
  enableDevTools?: boolean;
  schema?: z.ZodSchema<S>;
}

/**
 * Configuration for creating a State Platform Store.
 */
export interface StoreConfig<S, A> {
  name: StoreName;
  initialState: S;
  actions: (
    set: (
      partial: S | Partial<S> | ((state: S & BaseState & BaseActions) => S | Partial<S> | void),
      replace?: boolean
    ) => void,
    get: () => S & BaseState & BaseActions
  ) => A;
  storageType?: StorageType;
  version?: number;
  migrations?: Migration<S>[];
  middleware?: StoreMiddlewareOptions<S>;
}

/**
 * Store Registry item for state platform management.
 */
export interface RegistryEntry {
  name: StoreName;
  reset: () => void;
  isHydrated: () => boolean;
  getState: () => any;
  subscribe: (listener: (state: any, prevState: any) => void) => () => void;
}
