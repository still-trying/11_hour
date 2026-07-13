/// <reference types="vite/client" />

/**
 * 11_HOUR - Firebase Infrastructure Constants
 *
 * This file maintains immutable constants, emulator configurations, path specifications,
 * and unified logging tags.
 */

export const FIREBASE_LOG_PREFIX = '[11_HOUR FIREBASE INFRASTRUCTURE]';

export const FIREBASE_ERRORS = {
  UNCONFIGURED: 'Firebase is not initialized or configured correctly.',
  PERMISSION_DENIED: 'Missing or insufficient permissions.',
  QUOTA_EXCEEDED: 'Quota exceeded for Firebase units.',
  CONNECTION_FAILED: 'Failed to establish connection with Firestore.',
  INVALID_CONFIG: 'Provided Firebase configuration failed verification.',
};

export const EMULATOR_CONFIGS = {
  USE_EMULATORS: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
  AUTH_PORT: 9099,
  FIRESTORE_PORT: 8080,
  STORAGE_PORT: 9199,
  HOST: 'localhost',
};

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['text/plain', 'application/pdf', 'image/png'],
};

export const PATHS = {
  USER_EPISODES: (uid: string) => `users/${uid}/episodes`,
  USER_UPLOADS: (uid: string, fileId: string) => `users/${uid}/uploads/${fileId}`,
  USER_EXPORTS: (uid: string, exportId: string) => `users/${uid}/exports/${exportId}.png`,
  ADMINS_COLLECTION: 'admins',
};
