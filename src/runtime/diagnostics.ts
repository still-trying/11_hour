/**
 * 11_HOUR - Runtime Diagnostics Suite
 *
 * Provides deep introspection, connection health check validations,
 * store hydration metrics, and self-healing algorithms for the application container.
 */

import { DiagnosticMetrics, PhaseMetric } from './types';
import { supabase } from '@/lib/supabase/client';
import { StoreRegistry } from '@/stores/platform/storeRegistry';

/**
 * Validates fundamental environment capabilities.
 */
export function validateEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof document === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch {
    console.error('❌ [Diagnostics] LocalStorage is not accessible.');
    return false;
  }

  return true;
}

/**
 * Gathers diagnostics on the global State Platform.
 */
export function getStatePlatformDiagnostics() {
  const registeredStores = StoreRegistry.getRegisteredStoreNames();
  const allStoresHydrated = StoreRegistry.isAllHydrated();
  const hydrationState = StoreRegistry.exportState();

  const storeDetails = registeredStores.map((name) => {
    const entry = StoreRegistry.get(name);
    return {
      name,
      hydrated: entry ? entry.isHydrated() : false,
    };
  });

  return {
    registeredStores,
    allStoresHydrated,
    storeDetails,
    hydrationState,
  };
}

/**
 * Checks Supabase connectivity.
 */
async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('_health').select('*').limit(1);
    return !error;
  } catch {
    // Table may not exist - check auth session instead as fallback
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch {
      return false;
    }
  }
}

/**
 * Assembles a complete diagnostic report and computes a container health score.
 */
export async function getDiagnosticReport(
  phaseMetrics: PhaseMetric[],
  totalBootstrapTimeMs: number,
  activeErrors: string[],
): Promise<DiagnosticMetrics> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Supabase connectivity check
  let supabaseConnected: boolean;
  try {
    supabaseConnected = await checkSupabaseConnection();
  } catch {
    supabaseConnected = false;
  }

  const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL?.length;
  const isSupabaseMock = !hasSupabaseUrl;
  const stateDiag = getStatePlatformDiagnostics();

  // Compute Health Score (0 to 100)
  let healthScore = 100;
  if (!isOnline) healthScore -= 10;
  if (!supabaseConnected && !isSupabaseMock) healthScore -= 30;
  if (!stateDiag.allStoresHydrated && stateDiag.registeredStores.length > 0) healthScore -= 20;
  if (activeErrors.length > 0) healthScore -= Math.min(activeErrors.length * 15, 40);

  const failedPhases = phaseMetrics.filter((m) => m.status === 'failed');
  healthScore -= failedPhases.length * 20;
  healthScore = Math.max(0, healthScore);

  return {
    timestamp: new Date().toISOString(),
    healthScore,
    phaseMetrics,
    totalBootstrapTimeMs,
    environment: (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development') as
      | 'development'
      | 'production'
      | 'test',
    isOnline,
    supabaseConnected,
    isSupabaseMock,
    registeredStores: stateDiag.registeredStores,
    allStoresHydrated: stateDiag.allStoresHydrated,
    activeErrors,
    browserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
  };
}

/**
 * Dynamic Self-Healing Algorithm.
 * Fixes common runtime errors gracefully.
 */
export async function attemptSelfHealing(): Promise<boolean> {
  console.warn('⚡ [Diagnostics] Initializing container self-healing routine...');

  try {
    // 1. Storage sanitization
    if (typeof window !== 'undefined' && window.localStorage) {
      console.info('⚡ [SelfHealing] Sanitizing stale local storage blocks...');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.includes('auth') && !key.includes('rescue')) {
          if (key.startsWith('__temp_') || key.startsWith('tmp_')) {
            localStorage.removeItem(key);
          }
        }
      }
    }

    // 2. Trigger active store hydration checks
    console.info('⚡ [SelfHealing] Auditing and forcing state store hydration updates...');
    StoreRegistry.triggerHydrationCheck();

    // 3. Re-validate Supabase connectivity
    console.info('⚡ [SelfHealing] Re-verifying Supabase pipeline connectivity...');
    const dbConnected = await checkSupabaseConnection();

    // 4. Return success if core issues are stabilized
    const finalState = getStatePlatformDiagnostics();
    const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL?.length;
    const resolved = finalState.allStoresHydrated && (dbConnected || !hasSupabaseUrl);

    if (resolved) {
      console.info('✔ [SelfHealing] Container stabilization was successful.');
    } else {
      console.warn('⚠️ [SelfHealing] Self-healing completed with remaining warnings.');
    }

    return resolved;
  } catch (error) {
    console.error('❌ [SelfHealing] Self-healing routine failed due to an exception:', error);
    return false;
  }
}
