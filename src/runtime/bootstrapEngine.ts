/**
 * 11_HOUR - Application Bootstrap Engine
 *
 * Coordinates the deterministic, sequential execution of application startup phases.
 * Tracks performance latencies, integrates connectivity validation, hooks store hydration,
 * and publishes startup events.
 */

import { StartupPhase, RuntimeState, PhaseMetric, RuntimeConfig } from './types';
import { STARTUP_PHASES_ORDER, RUNTIME_LOG_PREFIX } from './constants';
import { loadRuntimeConfig } from './config';
import { validateEnvironment } from './diagnostics';
import { supabase } from '@/lib/supabase/client';
import { StoreRegistry } from '@/stores/platform/storeRegistry';
import { AppEventBus } from '@/stores/platform/eventBus';

type StateChangeListener = (state: RuntimeState) => void;

class BootstrapEngineClass {
  private state: RuntimeState = {
    status: 'idle',
    currentPhase: null,
    completedPhases: [],
    phaseMetrics: [],
    config: null,
    error: null,
    failedPhase: null,
  };

  private listeners = new Set<StateChangeListener>();
  private initializationPromise: Promise<RuntimeConfig> | null = null;

  /**
   * Subscribes a listener to engine state mutations.
   */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Retrieves the current immutable state snapshot.
   */
  getState(): RuntimeState {
    return { ...this.state };
  }

  /**
   * Triggers the full, sequential bootstrapping process.
   */
  async run(): Promise<RuntimeConfig> {
    if (this.initializationPromise) {
      console.info(
        `${RUNTIME_LOG_PREFIX} Bootstrap already initiated or completed. Reusing active thread.`,
      );
      return this.initializationPromise;
    }

    this.initializationPromise = this.executeBootstrap();
    return this.initializationPromise;
  }

  /**
   * Forces an absolute engine reset, allowing a complete bootstrap retry.
   */
  reset(): void {
    console.warn(`${RUNTIME_LOG_PREFIX} Resetting Bootstrap Engine state...`);
    this.initializationPromise = null;
    this.state = {
      status: 'idle',
      currentPhase: null,
      completedPhases: [],
      phaseMetrics: [],
      config: null,
      error: null,
      failedPhase: null,
    };
    this.notify();
  }

  private async executeBootstrap(): Promise<RuntimeConfig> {
    this.state.status = 'running';
    this.state.error = null;
    this.state.failedPhase = null;
    this.notify();

    console.info(`${RUNTIME_LOG_PREFIX} Initiating secure Bootstrap sequence...`);
    const totalStart = performance.now();

    for (const phase of STARTUP_PHASES_ORDER) {
      this.state.currentPhase = phase;
      this.notify();

      console.info(`${RUNTIME_LOG_PREFIX} Starting Phase: ${phase}...`);
      const phaseStart = performance.now();

      try {
        await this.runPhaseLogic(phase);

        const phaseDuration = performance.now() - phaseStart;
        this.recordMetric(phase, phaseDuration, 'success');
        this.state.completedPhases.push(phase);

        console.info(
          `${RUNTIME_LOG_PREFIX} Completed Phase: ${phase} in ${phaseDuration.toFixed(1)}ms`,
        );
      } catch (err) {
        const phaseDuration = performance.now() - phaseStart;
        const errMsg = err instanceof Error ? err.message : String(err);
        this.recordMetric(phase, phaseDuration, 'failed', errMsg);

        this.state.status = 'failed';
        this.state.failedPhase = phase;
        this.state.error = `Bootstrap failed at phase "${phase}": ${errMsg}`;
        this.notify();

        console.error(`${RUNTIME_LOG_PREFIX} CRITICAL FAILURE at phase ${phase}:`, err);
        throw err;
      }
    }

    const totalDuration = performance.now() - totalStart;
    this.state.status = 'completed';
    this.state.currentPhase = null;
    this.notify();

    console.info(
      `${RUNTIME_LOG_PREFIX} Application successfully bootstrapped in ${totalDuration.toFixed(1)}ms!`,
    );

    try {
      AppEventBus.publish('APP_STARTED', undefined);
    } catch (e) {
      console.error(`${RUNTIME_LOG_PREFIX} Failed to publish APP_STARTED event:`, e);
    }

    return this.state.config!;
  }

  private async runPhaseLogic(phase: StartupPhase): Promise<void> {
    switch (phase) {
      case StartupPhase.ENVIRONMENT:
        if (!validateEnvironment()) {
          throw new Error(
            'System-level browser context validation failed (LocalStorage disabled or unavailable).',
          );
        }
        break;

      case StartupPhase.CONFIGURATION: {
        const config = loadRuntimeConfig();
        this.state.config = config;
        break;
      }

      case StartupPhase.DATA_PLATFORM:
        // Verify Supabase endpoint is reachable
        try {
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.warn(
              `${RUNTIME_LOG_PREFIX} Supabase session check returned a warning, continuing with offline capabilities.`,
              error,
            );
          }
        } catch (err) {
          console.warn(
            `${RUNTIME_LOG_PREFIX} Supabase connection verification skipped, continuing with offline capabilities.`,
            err,
          );
        }
        break;

      case StartupPhase.THEME_ENGINE:
        if (typeof window === 'undefined') {
          throw new Error('Theme engine initialized outside standard DOM window boundaries.');
        }
        break;

      case StartupPhase.STATE_PLATFORM:
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn(
              `${RUNTIME_LOG_PREFIX} Store hydration exceeded 200ms fallback time. Continuing startup process offline.`,
            );
            unsubscribe();
            resolve();
          }, 200);

          const unsubscribe = StoreRegistry.subscribeToHydration((allHydrated) => {
            if (allHydrated) {
              clearTimeout(timeout);
              console.info(
                `${RUNTIME_LOG_PREFIX} All registered state stores successfully hydrated from caches.`,
              );
              resolve();
            }
          });
        });
        break;

      case StartupPhase.ROUTER:
        if (typeof window !== 'undefined' && !window.history) {
          throw new Error('Browser navigation engine (history API) is entirely unavailable.');
        }
        break;

      case StartupPhase.RUNTIME_CONTEXT:
        break;

      case StartupPhase.APPLICATION_MOUNT:
        if (typeof document !== 'undefined' && !document.getElementById('root')) {
          throw new Error('HTML Entry Node containing id="root" could not be located in the DOM.');
        }
        break;

      case StartupPhase.APPLICATION_READY:
        break;

      default:
        throw new Error(`Unrecognized startup sequence phase requested: ${phase}`);
    }
  }

  private recordMetric(
    phase: StartupPhase,
    durationMs: number,
    status: 'success' | 'failed',
    error?: string,
  ): void {
    const metric: PhaseMetric = {
      phase,
      durationMs,
      status,
      error,
    };
    this.state.phaseMetrics = this.state.phaseMetrics.filter((m) => m.phase !== phase);
    this.state.phaseMetrics.push(metric);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.state });
      } catch (e) {
        console.error(`${RUNTIME_LOG_PREFIX} Failed to dispatch state update to listener:`, e);
      }
    });
  }
}

export const BootstrapEngine = new BootstrapEngineClass();
export { BootstrapEngineClass };
