import { UseBoundStore, StoreApi } from 'zustand';
import { z } from 'zod';

type SelectorBuilder<S> = {
  use: {
    [K in keyof S]: () => S[K];
  };
};

/**
 * Automatic Selector Generator Utility
 * Wraps any global Zustand store hook to automatically expose single-key selectors,
 * protecting React views from heavy re-render cascades.
 * 
 * Example Usage:
 *   const useAuthStore = createStateStore(...);
 *   const auth = createSelectors(useAuthStore);
 *   const user = auth.use.user(); // Re-renders only when the 'user' field mutates.
 */
export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(
  store: S
): S & SelectorBuilder<ReturnType<S['getState']>> {
  const storeWithSelectors = store as any;
  storeWithSelectors.use = {};

  for (const key of Object.keys(store.getState())) {
    storeWithSelectors.use[key] = () => store((state: any) => state[key]);
  }

  return storeWithSelectors;
}

/**
 * State Validation Hook
 * Reactively extracts a slice of global state and validates it against a target Zod schema.
 * Keeps presentation layers secure and displays clean helper validations on schema deviations.
 * Computes validation status synchronously on render to avoid cascading state effects.
 */
export function useValidatedSlice<S, V>(
  useStore: UseBoundStore<StoreApi<S>>,
  selector: (state: S) => V,
  schema: z.ZodSchema<V>
) {
  const targetValue = useStore(selector);

  const validationResult = schema.safeParse(targetValue);
  if (validationResult.success) {
    return {
      data: validationResult.data,
      isValid: true,
      errors: null as z.ZodFormattedError<V> | null,
    };
  } else {
    return {
      data: targetValue,
      isValid: false,
      errors: validationResult.error.format() as z.ZodFormattedError<V> | null,
    };
  }
}
