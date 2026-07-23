/**
 * 11_HOUR - Recovery Strategy Registry & Recovery Manager
 *
 * Implements recovery strategies, automatic self-healing actions, exponential backoff retries,
 * cache sanitization, and hooks for future telemetry and crash reporting systems.
 */

import { BaseResilienceError, FailureCategory, ErrorSeverity, classifyError } from './errors';
import { StoreRegistry } from '@/stores/platform/storeRegistry';
import { supabase } from '@/lib/supabase/client';

export enum RecoveryStrategyType {
  RETRY = 'RETRY', // Retry action with backoff
  OFFLINE_MODE = 'OFFLINE_MODE', // Degrade to client-side localStorage/offline
  FALLBACK_PLAN = 'FALLBACK_PLAN', // Serve static backup/Pomodoro plans
  REBOOT = 'REBOOT', // Reset bootstrap state and restart bootloader
  LOG_ONLY = 'LOG_ONLY', // Silently log and alert user via passive notification
  ESCALATE = 'ESCALATE', // Pass to Global Fallback UI for fatal crashes
}

/**
 * Maps a failure category to its default, recommended recovery strategy.
 */
export const RECOVERY_STRATEGY_REGISTRY: Record<FailureCategory, RecoveryStrategyType> = {
  [FailureCategory.RUNTIME]: RecoveryStrategyType.ESCALATE, // Render crashed, reboot sandbox
  [FailureCategory.NETWORK]: RecoveryStrategyType.OFFLINE_MODE, // Transition to offline mode
  [FailureCategory.DATABASE]: RecoveryStrategyType.RETRY, // Retry, then degrade to local storage
  [FailureCategory.AI]: RecoveryStrategyType.FALLBACK_PLAN, // Build default static timeline
  [FailureCategory.VALIDATION]: RecoveryStrategyType.LOG_ONLY, // Inform user of bad schema, continue
  [FailureCategory.PERMISSION]: RecoveryStrategyType.ESCALATE, // Block view, require re-auth
  [FailureCategory.UNKNOWN]: RecoveryStrategyType.ESCALATE, // Standard escalation
};

/**
 * Generic retry function utilizing exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000,
  multiplier: number = 2,
  onRetry?: (attempt: number, error: unknown) => void,
): Promise<T> {
  let attempt = 1;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      if (onRetry) {
        onRetry(attempt, error);
      }

      console.warn(
        `⚡ [Resilience] Operation failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`,
        error,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
      delay *= multiplier;
    }
  }
}

/**
 * Future Crash Reporting Integration Point
 */
export function reportCrash(error: BaseResilienceError): void {
  const payload = {
    correlationId: error.correlationId,
    name: error.name,
    message: error.message,
    category: error.category,
    severity: error.severity,
    timestamp: error.timestamp,
    stack: error.stack,
    details: error.details,
    originalError:
      error.originalError instanceof Error
        ? error.originalError.stack
        : String(error.originalError),
  };

  console.error(
    '📊 [CRASH_REPORTER] (Integration Point) Sentry/LogRocket target payload:',
    JSON.stringify(payload, null, 2),
  );

  // Future hook:
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { tags: { correlationId: error.correlationId, category: error.category } });
  // }
}

/**
 * Future Telemetry Integration Point
 */
export function logTelemetry(metricName: string, details: Record<string, unknown>): void {
  const payload = {
    timestamp: new Date().toISOString(),
    metricName,
    ...details,
  };

  console.info('📈 [TELEMETRY] (Integration Point) Analytics dispatch:', JSON.stringify(payload));

  // Future hook:
  // if (import.meta.env.PROD) {
  //   analytics.logEvent(metricName, details);
  // }
}

class RuntimeRecoveryManagerClass {
  /**
   * Evaluates an error, logs telemetry, dispatches crash reports, and returns
   * the appropriate strategy type to handle the exception.
   */
  public handleFailure(error: unknown, context?: Record<string, unknown>): RecoveryStrategyType {
    const classified = classifyError(error);

    // 1. Log telemetry of failure
    logTelemetry('FAILURE_DETECTED', {
      category: classified.category,
      severity: classified.severity,
      correlationId: classified.correlationId,
      message: classified.message,
      ...context,
    });

    // 2. Report crash if severity is high or fatal
    if (classified.severity === ErrorSeverity.HIGH || classified.severity === ErrorSeverity.FATAL) {
      reportCrash(classified);
    }

    // 3. Look up strategy mapping
    const defaultStrategy = RECOVERY_STRATEGY_REGISTRY[classified.category];

    console.info(
      `⚡ [RecoveryManager] Classifying exception. Category: ${classified.category}, Severity: ${classified.severity}. Default Strategy: ${defaultStrategy}. (ID: ${classified.correlationId})`,
    );

    return defaultStrategy;
  }

  /**
   * Executes a self-healing patch on the container environment.
   */
  public async executeSelfHealingRoutine(): Promise<boolean> {
    logTelemetry('SELF_HEALING_INITIATED', {});
    console.info('⚡ [RecoveryManager] Initiating standard self-healing routines...');

    try {
      // 1. Storage sanitization: check for corrupted temporary values and clear them
      if (typeof window !== 'undefined' && window.localStorage) {
        console.info('⚡ [RecoveryManager] Purging stale workspace temporary caches...');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('__temp_') || key.startsWith('tmp_'))) {
            localStorage.removeItem(key);
          }
        }
      }

      // 2. Sync state platform hydration
      StoreRegistry.triggerHydrationCheck();

      // 3. Re-verify Supabase pipeline connectivity
      let dbConnected = false;
      try {
        const { data } = await supabase.auth.getSession();
        dbConnected = !!data.session;
      } catch {
        dbConnected = false;
      }

      const success = StoreRegistry.isAllHydrated();
      logTelemetry('SELF_HEALING_COMPLETED', { success, dbConnected });

      return success;
    } catch (err) {
      console.error('❌ [RecoveryManager] Self-healing routine failed:', err);
      logTelemetry('SELF_HEALING_FAILED', { error: String(err) });
      return false;
    }
  }

  /**
   * Resets and purges non-persistent stores to clean memory leaks or corrupted scopes.
   */
  public clearVolatileStateCaches(): void {
    console.warn('⚡ [RecoveryManager] Purging non-persistent platform stores...');
    logTelemetry('STATE_CACHE_PURGED', {});

    const storeNames = StoreRegistry.getRegisteredStoreNames();
    storeNames.forEach((name) => {
      // Keep Auth store safe during cache purges
      if (name !== 'auth-store') {
        try {
          const entry = StoreRegistry.get(name);
          if (entry) {
            entry.reset();
          }
        } catch (e) {
          console.error(`Failed to reset store ${name}:`, e);
        }
      }
    });
  }
}

export const RuntimeRecoveryManager = new RuntimeRecoveryManagerClass();
