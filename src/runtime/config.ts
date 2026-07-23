/**
 * 11_HOUR - Runtime Configuration Loader
 *
 * Validates environment variables into a typed RuntimeConfig.
 * Validates environment variables into a typed RuntimeConfig using Supabase as the data backend.
 */

import { z } from 'zod';
import { RuntimeConfig } from './types';
import { DEFAULT_RUNTIME_CONFIG, RUNTIME_VERSION } from './constants';

const envSchema = z.enum(['development', 'production', 'test']);

const runtimeConfigSchema = z.object({
  env: envSchema,
  version: z.string(),
  debug: z.boolean(),
  apiTimeoutMs: z.number().min(1000).max(60000),
  supabase: z.object({
    url: z.string().min(1),
    connected: z.boolean(),
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
    const rawEnv = (
      import.meta.env.VITE_APP_ENV ||
      import.meta.env.MODE ||
      'development'
    ).toLowerCase();
    const env = envSchema.safeParse(rawEnv).success
      ? (rawEnv as RuntimeConfig['env'])
      : 'development';

    const debug = import.meta.env.VITE_DEBUG_MODE === 'true' || env !== 'production';
    const apiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000;

    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';

    const configData = {
      env,
      version: RUNTIME_VERSION,
      debug,
      apiTimeoutMs,
      supabase: {
        url: supabaseUrl,
        connected: !!supabaseUrl && !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
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
    console.error(
      '⚠️ [RuntimeConfig] Failed to load configuration, falling back to default:',
      error,
    );
    return DEFAULT_RUNTIME_CONFIG;
  }
}
