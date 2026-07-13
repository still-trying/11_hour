/// <reference types="vite/client" />

import { FirebaseConfig, firebaseConfigSchema } from './types';
import { FIREBASE_LOG_PREFIX } from './constants';
import rawConfig from './firebase-applet-config.json';

/**
 * Validates and returns the appropriate Firebase SDK configuration.
 *
 * Prioritizes environment variables (VITE_ prefixed) for dynamic containers,
 * falling back to the bundled firebase-applet-config.json config.
 */
export function buildFirebaseConfig(): FirebaseConfig {
  // Dynamically resolve configuration from env variables if provided
  const envConfig = {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey,
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain,
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId,
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket,
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId,
    appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig.appId,
    firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId || '(default)',
  };

  // Enforce validation via Zod
  const result = firebaseConfigSchema.safeParse(envConfig);

  if (!result.success) {
    console.error(
      `${FIREBASE_LOG_PREFIX} Configuration Validation Failed! Details:`,
      result.error.format()
    );
    throw new Error(
      `Firebase configuration failed verification. Please execute the 'set_up_firebase' flow.`
    );
  }

  const validatedConfig = result.data;

  // Detect and log if using fallback mock configuration
  if (validatedConfig.apiKey.includes('mock-api-key')) {
    console.warn(
      `${FIREBASE_LOG_PREFIX} WARNING: Running with a local MOCK configuration. Persistent live Cloud connections will be inactive until 'set_up_firebase' is run.`
    );
  } else {
    console.info(
      `${FIREBASE_LOG_PREFIX} Configuration successfully verified for project: "${validatedConfig.projectId}"`
    );
  }

  return validatedConfig;
}

/**
 * Checks if Firebase configuration is utilizing mock tokens.
 */
export function isMockConfiguration(config: FirebaseConfig): boolean {
  return config.apiKey.includes('mock-api-key');
}
