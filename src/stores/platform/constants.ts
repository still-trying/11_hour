/**
 * Application State Platform Constants
 * Defines core identifiers, versions, and storage keys.
 */

export const PLATFORM_VERSION = '1.0.0';

export enum StorageType {
  MEMORY = 'memory',
  SESSION = 'session',
  LOCAL = 'local',
}

export const STORE_NAMES = {
  AUTH: 'auth-store',
  SESSION: 'session-store',
  UI: 'ui-store',
  THEME: 'theme-store',
  SETTINGS: 'settings-store',
  RESCUE: 'rescue-store',
  AI: 'ai-store',
  ANALYTICS: 'analytics-store',
  NOTIFICATION: 'notification-store',
} as const;

export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

export const STORE_VERSIONS: Record<StoreName, number> = {
  [STORE_NAMES.AUTH]: 1,
  [STORE_NAMES.SESSION]: 1,
  [STORE_NAMES.UI]: 1,
  [STORE_NAMES.THEME]: 1,
  [STORE_NAMES.SETTINGS]: 1,
  [STORE_NAMES.RESCUE]: 1,
  [STORE_NAMES.AI]: 1,
  [STORE_NAMES.ANALYTICS]: 1,
  [STORE_NAMES.NOTIFICATION]: 1,
};

export const PLATFORM_LOG_PREFIX = '⚡ [StatePlatform]';
