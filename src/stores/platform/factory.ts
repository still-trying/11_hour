import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StoreConfig, BaseState, BaseActions, RegistryEntry } from './contracts';
import { StoreRegistry } from './storeRegistry';
import { getStorageBackend } from './persistence';
import { stateLogger, stateValidator, stateErrorBoundary } from './middleware';

/**
 * State Platform Store Factory
 * Automatically instantiates global stores with:
 * 1. Deep state isolation (Memory vs Session vs Local).
 * 2. Boilerplate metadata auto-maintenance (_version, _hydrated, _lastUpdated).
 * 3. Layered middlewares (ErrorBoundary -> SchemaValidator -> StateLogger).
 * 4. Stepwise, versioned schema migrations.
 * 5. Instant registration into the centralized StoreRegistry.
 */
export function createStateStore<S extends object, A extends object>(
  config: StoreConfig<S, A>
) {
  const {
    name,
    initialState,
    actions,
    storageType,
    version = 1,
    migrations = [],
    middleware = {},
  } = config;

  const baselineState: BaseState = {
    _version: version,
    _hydrated: false,
    _lastUpdated: null,
  };

  const baselineActions = (
    set: any
  ): BaseActions => ({
    reset: () => {
      set({
        ...initialState,
        ...baselineState,
        _lastUpdated: new Date().toISOString(),
      }, true);
    },
    setHydrated: (hydrated: boolean) => {
      set({ _hydrated: hydrated });
      StoreRegistry.triggerHydrationCheck();
    },
  });

  const stateCreator: StateCreator<S & BaseState & A & BaseActions> = (set, get) => {
    const customSet = (partial: any, replace?: boolean) => {
      const nextPartial = typeof partial === 'function'
        ? (partial as any)(get())
        : partial;

      const updatedPartial = {
        ...nextPartial,
        _lastUpdated: new Date().toISOString(),
      };

      (set as any)(updatedPartial, replace);
    };

    return {
      ...initialState,
      ...baselineState,
      ...baselineActions(customSet),
      ...actions(customSet as any, get as any),
    };
  };

  const withMiddleware = stateErrorBoundary<any>(name)(
    stateValidator<any>(name, middleware.schema)(
      stateLogger<any>(name, middleware.enableLogging ?? true)(
        stateCreator
      )
    )
  );

  let store: any;

  if (storageType) {
    const backend = getStorageBackend(storageType);

    const persistedCreator = persist(withMiddleware, {
      name,
      storage: createJSONStorage(() => backend),
      version,
      migrate: async (persistedState: any, currentVersion: number) => {
        if (!persistedState) return persistedState;
        let migrated = persistedState;

        const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);

        for (const migration of sortedMigrations) {
          const persistedVersion = migrated._version || 0;
          if (migration.version > persistedVersion && migration.version <= currentVersion) {
            console.info(`[StoreFactory:${name}] Migrating schema to version ${migration.version}...`);
            migrated = await migration.migrate(migrated);
            migrated._version = migration.version;
          }
        }
        return migrated;
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error(`❌ [StoreFactory:${name}] Hydration failed:`, error);
          } else if (state) {
            state.setHydrated(true);
            console.info(`[StoreFactory:${name}] Hydrated successfully.`);
          }
        };
      },
    });

    store = create<S & BaseState & A & BaseActions>()(persistedCreator as any);
  } else {
    const nonPersistedStore = create<S & BaseState & A & BaseActions>()(withMiddleware as any);
    store = nonPersistedStore;
    
    // Non-persisted stores are instantly hydrated at start
    setTimeout(() => {
      store.getState().setHydrated(true);
    }, 0);
  }

  const registryEntry: RegistryEntry = {
    name,
    reset: () => store.getState().reset(),
    isHydrated: () => store.getState()._hydrated,
    getState: () => {
      const fullState = store.getState();
      const cleanState: Record<string, any> = {};
      for (const [key, value] of Object.entries(fullState)) {
        if (typeof value !== 'function') {
          cleanState[key] = value;
        }
      }
      return cleanState;
    },
    subscribe: (listener) => store.subscribe(listener),
  };

  StoreRegistry.register(registryEntry);

  return store;
}
