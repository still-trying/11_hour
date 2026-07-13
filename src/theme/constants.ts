/**
 * 11_HOUR - Theme Engine Constants and Registry
 *
 * This file centralizes all static configurations, keys, and registered themes
 * for the theme provider, keeping the runtime logic clean and modular.
 */

import { ThemeConfig, ThemeMetadata, ThemeMode } from './types';

/**
 * Key used to store the user's theme mode selection in local storage.
 */
export const THEME_PERSIST_KEY = '11_hour_theme_mode';

/**
 * Default Theme Engine configuration.
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultThemeMode: 'system',
  storageKey: THEME_PERSIST_KEY,
  enableSystemListener: true,
  enableReducedMotionListener: true,
};

/**
 * The Theme Registry contains human-readable names and descriptions
 * for each available theme mode, facilitating dynamic options rendering.
 */
export const THEME_REGISTRY: Record<ThemeMode, ThemeMetadata> = {
  dark: {
    id: 'dark',
    name: 'System Slate (Dark)',
    description: 'Deep obsidian and soothing slate theme, optimized for late-night focus and low eye strain.',
    isAccessibilityFocused: false,
  },
  light: {
    id: 'light',
    name: 'Snow White (Light)',
    description: 'Clean, crisp high-luminosity light layout, optimized for high ambient light environments.',
    isAccessibilityFocused: false,
  },
  system: {
    id: 'system',
    name: 'Dynamic (System)',
    description: 'Automatically aligns with your device OS dark/light color preferences.',
    isAccessibilityFocused: false,
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast (Accessibility)',
    description: 'Pure black backdrop with maximum luminance borders and text (WCAG AAA compliant).',
    isAccessibilityFocused: true,
  },
};

/**
 * Helper array representing the exact order of themes when cycling/toggling.
 */
export const THEME_CYCLE_ORDER: ThemeMode[] = ['dark', 'light', 'high-contrast', 'system'];
