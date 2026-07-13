import { StateCreator } from 'zustand';
import { z } from 'zod';
import { StoreName } from './constants';

/**
 * Custom State Logger Middleware
 * Outputs formatted console groups showing previous state, next state, and timestamps for mutations.
 */
export const stateLogger = <T extends object>(
  storeName: StoreName,
  enabled: boolean = true
) => {
  return (config: StateCreator<T>): StateCreator<T> => (set, get, api) => {
    const loggedSet = (partial: any, replace?: boolean) => {
      if (!enabled) {
        return (set as any)(partial, replace);
      }

      const prevState = { ...get() };
      (set as any)(partial, replace);
      const nextState = { ...get() };

      console.groupCollapsed(
        `%c⚡ [State Mutation] ${storeName} @ ${new Date().toLocaleTimeString()}`,
        'color: #0ea5e9; font-weight: bold;'
      );
      console.log('%cPrevious State:', 'color: #94a3b8;', prevState);
      console.log('%cNext State:', 'color: #10b981; font-weight: bold;', nextState);
      console.groupEnd();
    };

    return config(loggedSet as any, get, api);
  };
};

/**
 * Runtime State Validation Middleware
 * Uses Zod schemas to validate candidates before applying mutations, blocking corrupt state from propagating.
 */
export const stateValidator = <T extends object>(
  storeName: StoreName,
  schema?: z.ZodSchema<T>
) => {
  return (config: StateCreator<T>): StateCreator<T> => (set, get, api) => {
    if (!schema) return config(set, get, api);

    const validatedSet = (partial: any, replace?: boolean) => {
      const currentState = get();
      const nextPartial = typeof partial === 'function'
        ? (partial as any)(currentState)
        : partial;

      const candidateState = replace
        ? nextPartial
        : { ...currentState, ...nextPartial };

      // Ensure base properties (like hydration status) don't block validators if schema didn't include them
      const validationResult = schema.safeParse(candidateState);

      if (!validationResult.success) {
        const correlationId = `err-val-${Math.random().toString(36).substring(2, 11)}`;
        console.error(
          `❌ [StateValidator:${storeName}] State validation failed! Mutation blocked. Correlation ID: ${correlationId}\n`,
          `Errors:`, validationResult.error.format(),
          `\nCandidate State:`, candidateState
        );
        return; // Suppress write to protect store stability
      }

      (set as any)(partial, replace);
    };

    return config(validatedSet as any, get, api);
  };
};

/**
 * Store Error Boundary Middleware
 * Catches synchronous mutation crashes, generates tracking Correlation IDs, and rolls back to a stable previous snapshot.
 */
export const stateErrorBoundary = <T extends object>(
  storeName: StoreName
) => {
  return (config: StateCreator<T>): StateCreator<T> => (set, get, api) => {
    const boundedSet = (partial: any, replace?: boolean) => {
      const backupSnapshot = { ...get() };
      try {
        (set as any)(partial, replace);
      } catch (error) {
        const correlationId = `err-set-${Math.random().toString(36).substring(2, 11)}`;
        console.error(
          `🚨 [StateErrorBoundary:${storeName}] Mutation crash! Reverted to last stable state. Correlation ID: ${correlationId}\n`,
          `Error details:`, error
        );
        (set as any)(backupSnapshot, true); // Enforce absolute rollback
      }
    };

    return config(boundedSet as any, get, api);
  };
};
