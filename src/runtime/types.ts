/**
 * 11_HOUR - Runtime & Bootstrap Engine Types
 *
 * Defines strictly-typed structures for startup phases, diagnostic reports,
 * provider entries, and application context parameters.
 */

import React from 'react';

/**
 * Startup Lifecycle Phases in deterministic order.
 */
export enum StartupPhase {
  ENVIRONMENT = 'ENVIRONMENT',
  CONFIGURATION = 'CONFIGURATION',
  DATA_PLATFORM = 'DATA_PLATFORM',
  THEME_ENGINE = 'THEME_ENGINE',
  STATE_PLATFORM = 'STATE_PLATFORM',
  ROUTER = 'ROUTER',
  RUNTIME_CONTEXT = 'RUNTIME_CONTEXT',
  APPLICATION_MOUNT = 'APPLICATION_MOUNT',
  APPLICATION_READY = 'APPLICATION_READY',
}

/**
 * Startup Progress and Status indicators.
 */
export type BootstrapStatus = 'idle' | 'running' | 'completed' | 'failed';

/**
 * Single Phase metrics recorded during startup.
 */
export interface PhaseMetric {
  phase: StartupPhase;
  durationMs: number;
  status: 'success' | 'failed';
  error?: string;
}

/**
 * Diagnostic metrics captured on demand or during startup.
 */
export interface DiagnosticMetrics {
  timestamp: string;
  healthScore: number; // 0 to 100
  phaseMetrics: PhaseMetric[];
  totalBootstrapTimeMs: number;
  environment: 'development' | 'production' | 'test';
  isOnline: boolean;
  supabaseConnected: boolean;
  isSupabaseMock: boolean;
  registeredStores: string[];
  allStoresHydrated: boolean;
  activeErrors: string[];
  browserAgent: string;
}

/**
 * Dynamic Runtime configuration parameters validated at start.
 */
export interface RuntimeConfig {
  env: 'development' | 'production' | 'test';
  version: string;
  debug: boolean;
  apiTimeoutMs: number;
  supabase: {
    url: string;
    connected: boolean;
  };
  features: {
    enableAnalytics: boolean;
    enableDiagnostics: boolean;
    enableSelfHealing: boolean;
    enableHotkeys: boolean;
  };
}

/**
 * Single dynamic Provider entry used for dynamic central composition.
 */
export interface ProviderEntry {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  props?: Record<string, unknown>;
}

/**
 * Runtime state structure for monitoring progress.
 */
export interface RuntimeState {
  status: BootstrapStatus;
  currentPhase: StartupPhase | null;
  completedPhases: StartupPhase[];
  phaseMetrics: PhaseMetric[];
  config: RuntimeConfig | null;
  error: string | null;
  failedPhase: StartupPhase | null;
}

/**
 * Complete React Context payload distributed to the application.
 */
export interface RuntimeContextValue {
  status: BootstrapStatus;
  currentPhase: StartupPhase | null;
  completedPhases: StartupPhase[];
  config: RuntimeConfig | null;
  error: string | null;
  failedPhase: StartupPhase | null;
  diagnostics: DiagnosticMetrics | null;
  triggerDiagnostics: () => Promise<DiagnosticMetrics>;
  attemptSelfHealing: () => Promise<boolean>;
  restartBootstrap: () => Promise<void>;
}
