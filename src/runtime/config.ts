/**
 * 11_HOUR - Runtime Configuration Loader
 *
 * Implements Zod validation rules to merge environment variables
 * and Firebase metadata into a validated, immutable RuntimeConfig.
 */

import { z } from 'zod';
import { RuntimeConfig } from './types';
import { buildFirebaseConfig } from '@/firebase/configBuilder';
import { DEFAULT_RUNTIME_CONFIG, RUNTIME_VERSION } from './constants';

const envSchema = z.enum(['development', 'production', 'test']);

const runtimeConfigSchema = z.object({
  env: envSchema,
  version: z.string(),
  debug: z.boolean(),
  apiTimeoutMs: z.number().min(1000).max(60000),
  firebase: z.object({
    apiKey: z.string().min(1),
    authDomain: z.string().min(1),
    projectId: z.string().min(1),
    storageBucket: z.string().min(1),
    messagingSenderId: z.string().min(1),
    appId: z.string().min(1),
    firestoreDatabaseId: z.string().default('(default)'),
  }),
  features: z.object({
    enableAnalytics: z.boolean(),
    enableDiagnostics: z.boolean(),
    enableSelfHealing: z.boolean(),
    enableHotkeys: z.boolean(),
  }),
});

/**
 * Parses and verifies environment variables at runtime.
 */
export function loadRuntimeConfig(): RuntimeConfig {
  try {
    const rawEnv = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development').toLowerCase();
    const env = envSchema.safeParse(rawEnv).success ? (rawEnv as RuntimeConfig['env']) : 'development';

    const debug = import.meta.env.VITE_DEBUG_MODE === 'true' || env !== 'production';
    const apiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000;

    const firebase = buildFirebaseConfig();

    const configData = {
      env,
      version: RUNTIME_VERSION,
      debug,
      apiTimeoutMs,
      firebase,
      features: {
        enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
        enableDiagnostics: import.meta.env.VITE_ENABLE_DIAGNOSTICS !== 'false',
        enableSelfHealing: import.meta.env.VITE_ENABLE_SELF_HEALING !== 'false',
        enableHotkeys: import.meta.env.VITE_ENABLE_HOTKEYS !== 'false',
      },
    };

    const result = runtimeConfigSchema.safeParse(configData);

    if (!result.success) {
      console.error('❌ [RuntimeConfig] Schema Validation Failed:', result.error.format());
      throw new Error('Application configuration schema verification failed.');
    }

    return result.data as RuntimeConfig;
  } catch (error) {
    console.error('⚠️ [RuntimeConfig] Failed to load configuration, falling back to default:', error);
    return DEFAULT_RUNTIME_CONFIG;
  }
}
