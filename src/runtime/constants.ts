/**
 * 11_HOUR - Runtime & Bootstrap Engine Constants
 *
 * Defines static system messages, default configurations, log markers,
 * and phase descriptors for the bootstrap ecosystem.
 */

import { StartupPhase, RuntimeConfig } from './types';

export const RUNTIME_LOG_PREFIX = '🚀 [RuntimeOS]';

export const RUNTIME_VERSION = '1.0.0-rc1';

/**
 * Ordered list of startup phases to enforce deterministic bootstrap execution.
 */
export const STARTUP_PHASES_ORDER: StartupPhase[] = [
  StartupPhase.ENVIRONMENT,
  StartupPhase.CONFIGURATION,
  StartupPhase.FIREBASE_PLATFORM,
  StartupPhase.THEME_ENGINE,
  StartupPhase.STATE_PLATFORM,
  StartupPhase.ROUTER,
  StartupPhase.RUNTIME_CONTEXT,
  StartupPhase.APPLICATION_MOUNT,
  StartupPhase.APPLICATION_READY,
];

/**
 * Human-readable descriptions for each bootstrap phase to display in the loader.
 */
export const PHASE_DESCRIPTIONS: Record<StartupPhase, string> = {
  [StartupPhase.ENVIRONMENT]: 'Verifying system environment variables...',
  [StartupPhase.CONFIGURATION]: 'Assembling and validating application configurations...',
  [StartupPhase.FIREBASE_PLATFORM]: 'Connecting to Firebase Infrastructure Services...',
  [StartupPhase.THEME_ENGINE]: 'Configuring dark mode theme and motion profiles...',
  [StartupPhase.STATE_PLATFORM]: 'Instantiating global Zustand stores & local cache...',
  [StartupPhase.ROUTER]: 'Initializing application navigation routing maps...',
  [StartupPhase.RUNTIME_CONTEXT]: 'Establishing secured application runtime context...',
  [StartupPhase.APPLICATION_MOUNT]: 'Securely mounting presentation layout tree...',
  [StartupPhase.APPLICATION_READY]: 'Launching Life-Saver application framework!',
};

/**
 * Fallback values in case runtime variables are entirely unconfigured.
 */
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  env: 'development',
  version: RUNTIME_VERSION,
  debug: true,
  apiTimeoutMs: 10000,
  firebase: {
    apiKey: 'mock-api-key-Vibe2Ship',
    authDomain: 'mock-auth-domain.firebaseapp.com',
    projectId: 'mock-project-id',
    storageBucket: 'mock-project-id.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef1234567890',
    firestoreDatabaseId: '(default)',
  },
  features: {
    enableAnalytics: false,
    enableDiagnostics: true,
    enableSelfHealing: true,
    enableHotkeys: true,
  },
};
