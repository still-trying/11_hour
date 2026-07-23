# 11_HOUR Application State Platform (`src/stores/platform/`)

This directory houses the unified, highly resilient, and type-safe state platform that powers the Vibe2Ship **11_HOUR** productivity ecosystem. Built upon **Zustand** and **Zod**, it serves as the core cognitive and state buffer for stress-laden deadline-driven environments.

---

## 🏗️ Architecture Overview

The state platform is designed around strict separation of concerns, complete decoupling of logical states, and offline-first recovery capabilities. It features:

```
[ Presentation Layer / Views ]
             │   ▲
             │   └── Subscriptions (useStore / auto-selectors)
             ▼
    [ Custom Store Hooks ]  ◄── [ Store Factory (factory.ts) ]
             │                             │
             │ (Dispatches Mutations)      ├── [ Custom Middlewares (middleware.ts) ]
             ▼                             │     - stateLogger (transitions)
  [ Zustand Internal Engine ]              │     - stateValidator (Zod Schema protection)
             │                             │     - stateErrorBoundary (rollback & trace IDs)
             ▼                             ▼
  [ Multi-Tier Cache Layer ] <─── [ Persistence Adapters (persistence.ts) ]
  (Memory / Session / Local)               │
                                           ▼
                           [ FirestoreSyncAdapter (sync queue) ]
```

---

## 📂 Core Files

| File               | Purpose                                                                                     |
| :----------------- | :------------------------------------------------------------------------------------------ |
| `constants.ts`     | Global store identifiers, versions, storage engines, and logging prefixes.                  |
| `contracts.ts`     | Strongly-typed generic interfaces for state, actions, configs, and registry items.          |
| `storeRegistry.ts` | Centralized registry managing store lifecycle, global resets, and hydration state.          |
| `persistence.ts`   | Memory, Session, and Local storage adapters, hydration hooks, and Firestore sync queues.    |
| `middleware.ts`    | Layered middlewares for logging transitions, Zod schema validation, and error rollback.     |
| `factory.ts`       | Core store initializer (`createStateStore`) with boilerplate automated injection.           |
| `utils.ts`         | High-efficiency automatic selector generator and reactive component state slice validators. |
| `eventBus.ts`      | Asynchronous, decoupled, typed event dispatcher for cross-store side-effects.               |

---

## 🛠️ Developer Integration Guide

### 1. Creating a New Store

When building any future domain store (e.g., `SettingsStore` or `RescueStore`), developers must use `createStateStore` from the factory.

```typescript
import { z } from 'zod';
import { createStateStore } from './platform/factory';
import { createSelectors } from './platform/utils';
import { STORE_NAMES, StorageType } from './platform/constants';

// 1. Define State Schema (Zod)
export const settingsStateSchema = z.object({
  preferredFocusDuration: z.number().min(5).max(60),
  enablePushNotifications: z.boolean(),
});

export type SettingsState = z.infer<typeof settingsStateSchema>;

// 2. Define Custom Actions
export interface SettingsActions {
  updateFocusDuration: (minutes: number) => void;
  toggleNotifications: () => void;
}

// 3. Instantiate the Store using the State Platform Factory
const settingsStoreHook = createStateStore<SettingsState, SettingsActions>({
  name: STORE_NAMES.SETTINGS,
  initialState: {
    preferredFocusDuration: 25,
    enablePushNotifications: true,
  },
  storageType: StorageType.LOCAL, // Persists in localStorage
  version: 1,
  middleware: {
    schema: settingsStateSchema, // Runtime validation
    enableLogging: true, // Transition logs
  },
  actions: (set, get) => ({
    updateFocusDuration: (minutes) => {
      set({ preferredFocusDuration: minutes });
    },
    toggleNotifications: () => {
      const current = get().enablePushNotifications;
      set({ enablePushNotifications: !current });
    },
  }),
});

// 4. Generate Automatic Primite Selectors
export const useSettingsStore = createSelectors(settingsStoreHook);
```

### 2. Consuming Stores in UI Components

Always utilize the auto-generated selectors `.use.property()` to restrict re-renders to only when that specific primitive value changes.

```tsx
import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export const SettingsCard: React.FC = () => {
  // Renders ONLY when 'preferredFocusDuration' changes
  const duration = useSettingsStore.use.preferredFocusDuration();
  const updateDuration = useSettingsStore.use.updateFocusDuration();

  return (
    <div>
      <p>Active Focus Block: {duration} minutes</p>
      <button onClick={() => updateDuration(30)}>Set to 30 mins</button>
    </div>
  );
};
```

### 3. Monitoring Store Hydration globally

To prevent layout shifting or unauthorized page flashing during app boots, display a full-screen loading skeleton until all stores are hydrated.

```tsx
import React from 'react';
import { useStoreHydration } from '@/stores/platform/persistence';

export const AppSplashGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydrated = useStoreHydration();

  if (!isHydrated) {
    return <div className="loading-screen">Hydrating offline storage...</div>;
  }

  return <>{children}</>;
};
```

### 4. Performing System-Wide Resets (Signout / Emergency)

Use the central `StoreRegistry` to instantly clear and reset all registered state layers during logouts or emergency cache repair actions.

```typescript
import { StoreRegistry } from '@/stores/platform/storeRegistry';

export function handleSignout() {
  // Instantly resets all registered stores to initial states and purges localStorage caches
  StoreRegistry.resetAll();
}
```

### 5. Decoupled Store Communication via Event Bus

To eliminate circular store imports, communicate store state changes across domains asynchronously using the typed `AppEventBus`.

```typescript
import { AppEventBus } from '@/stores/platform/eventBus';

// Inside Auth Store on login complete:
AppEventBus.publish('USER_SIGNED_IN', { uid: 'user_123', email: 'user@example.com' });

// Inside Analytics Store / Analytics page to listen to login events:
useEffect(() => {
  const unsubscribe = AppEventBus.subscribe('USER_SIGNED_IN', ({ uid }) => {
    console.log('User logged in! Loading metrics from cloud databases...', uid);
  });
  return unsubscribe;
}, []);
```

---

## 🛡️ Robust Fail-Safe Features

### 🔒 Runtime State Validator

All state mutations are validated against the store's optional Zod schema before writing. If a mutation attempts to introduce corrupt or malformed fields, the write is automatically blocked, and a detailed console log containing a trace Correlation ID is generated.

### 🚨 Mutation Error Boundary

If an action causes a synchronous crash during state calculation, the state boundary catches the exception, generates a Correlation ID, logs details to the console, and restores the store instantly to its last stable snapshot.

### 🔄 Schema Migrations

Persistent stores are versioned. If a user returns with an older cached state, the factory automatically routes the old state through the sorted schema migrations array, upgrading the fields step-by-step to prevent structural breakages.
