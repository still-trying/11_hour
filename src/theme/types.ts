/**
 * 11_HOUR - Theme Engine Type Definitions
 *
 * This file contains all the core types and interfaces required by the Theme Engine.
 * It enforces type safety across theme states, contexts, and configurations.
 */

/**
 * Supported theme modes for the user to select.
 * - 'light': Manual override for Light Theme.
 * - 'dark': Manual override for default System Slate Theme.
 * - 'system': Reactive theme bound to the OS color scheme.
 * - 'high-contrast': Manual override for High Contrast (pure black & high luminance borders).
 */
export type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast';

/**
 * Resolved theme representing the actual visual theme applied to the document root.
 * Future-ready for High Contrast mode.
 */
export type ResolvedTheme = 'light' | 'dark' | 'high-contrast';

/**
 * Configuration options for the Theme Engine.
 */
export interface ThemeConfig {
  /**
   * The default theme mode if none is stored in persistence.
   */
  defaultThemeMode: ThemeMode;
  /**
   * The local storage key used to persist the theme choice.
   */
  storageKey: string;
  /**
   * Whether to listen to OS-level prefers-color-scheme changes.
   */
  enableSystemListener: boolean;
  /**
   * Whether to listen to OS-level prefers-reduced-motion changes.
   */
  enableReducedMotionListener: boolean;
}

/**
 * Detailed metadata for registered themes.
 */
export interface ThemeMetadata {
  id: ThemeMode;
  name: string;
  description: string;
  isAccessibilityFocused: boolean;
}

/**
 * Strongly-typed interface representing semantic color keys.
 * This decouples theme overrides from literal const values in tokens.ts.
 */
export interface ColorTokens {
  bg: {
    primary: string;
    secondary: string;
  };
  border: {
    muted: string;
  };
  text: {
    primary: string;
    muted: string;
  };
  accent: {
    amber: string;
    emerald: string;
    blue: string;
  };
}

/**
 * Interface representing the current state of the Theme Engine.
 */
export interface ThemeState {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  reducedMotion: boolean;
}

/**
 * The complete React Context value exposed to the application.
 */
export interface ThemeContextValue {
  /**
   * The current selected theme mode (light, dark, system, or high-contrast).
   */
  themeMode: ThemeMode;
  /**
   * The actual resolved theme currently applied ('light', 'dark', or 'high-contrast').
   */
  resolvedTheme: ResolvedTheme;
  /**
   * Active status of OS-level reduced motion setting.
   */
  reducedMotion: boolean;
  /**
   * Update the current theme mode.
   */
  setThemeMode: (mode: ThemeMode) => void;
  /**
   * Helper function to cycle through theme modes (light -> dark -> high-contrast -> system).
   */
  toggleTheme: () => void;
  /**
   * Helper flag indicating whether the theme is dynamically tracking the system settings.
   */
  isSystem: boolean;
}
