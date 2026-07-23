/**
 * 11_HOUR - Runtime & Bootstrap Module Entry Point
 *
 * Consolidates all exports for the application runtime environment,
 * bootstrap orchestration engine, diagnostics suite, and central provider registry.
 */

export * from './types';
export { RUNTIME_LOG_PREFIX, RUNTIME_VERSION, PHASE_DESCRIPTIONS } from './constants';
export { loadRuntimeConfig } from './config';
export {
  validateEnvironment,
  getStatePlatformDiagnostics,
  getDiagnosticReport,
  attemptSelfHealing,
} from './diagnostics';
export { ProviderComposer, ProviderRegistry } from './providerRegistry';
export { BootstrapEngine, BootstrapEngineClass } from './bootstrapEngine';
export { RuntimeProvider, useRuntime } from './RuntimeContext';
// Resilience, Failure Classification & Recovery exports
export * from './resilience/errors';
export * from './resilience/recovery';
