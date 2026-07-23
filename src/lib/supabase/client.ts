import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables - works in both Vite and Node contexts
const getEnvVar = (key: string): string => {
  // For Vite/Vite React apps (these are prefixed with VITE_)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`] as string;
  }

  // For Node.js environment (when running scripts directly)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // Fallback to direct keys (for cases where VITE_ prefix is not used)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }

  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

// Check if credentials are provided
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [Supabase] Missing Supabase environment variables. ' +
      'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
  );
}

/**
 * Proxy-wrapped Supabase client that provides safe error messages
 * instead of crashing when credentials are missing.
 */
function createSafeClient(): SupabaseClient {
  if (supabaseUrl && supabaseAnonKey) {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }

  // Return a proxy that throws helpful errors instead of null reference crashes
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'auth') {
        return new Proxy(
          {},
          {
            get(_t, authProp) {
              if (authProp === 'getUser') {
                return async () => ({ data: { user: null }, error: null });
              }
              if (authProp === 'onAuthStateChange') {
                return (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } });
              }
              return () => {
                throw new Error(
                  'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
                );
              };
            },
          },
        );
      }
      if (prop === 'from') {
        return () => {
          throw new Error(
            'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
          );
        };
      }
      if (prop === 'channel') {
        return () => ({
          on: function () {
            return this;
          },
          subscribe: () => ({}),
        });
      }
      if (prop === 'removeChannel') {
        return () => {};
      }
      return undefined;
    },
  };

  return new Proxy({}, handler) as unknown as SupabaseClient;
}

console.debug('🔑 [SupabaseClient] Using URL:', supabaseUrl ? supabaseUrl.substring(0,30)+'...' : 'MISSING');
console.debug('🔑 [SupabaseClient] Using anon key:', supabaseAnonKey ? supabaseAnonKey.substring(0,40)+'...' : 'MISSING');

// Create and export the Supabase client (always safe, never null)
export const supabase: SupabaseClient = createSafeClient();

// For backward compatibility with existing code that calls createClient()
export function createClient(): SupabaseClient {
  return supabase;
}
