/**
 * 11_HOUR - Theme Engine Utilities and Helpers
 *
 * Implements low-level browser interactions, safe local storage persistence,
 * system media query detections, and semantic theme tokens mapping.
 */

import { ResolvedTheme, ThemeMode, ColorTokens } from './types';

/**
 * Safely retrieves stored ThemeMode from LocalStorage.
 * Handles server-side rendering (SSR) environments and sandboxed iframe environments.
 */
export function getStoredThemeMode(key: string, defaultMode: ThemeMode): ThemeMode {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultMode;
    }
    const stored = window.localStorage.getItem(key);
    if (stored && ['light', 'dark', 'system', 'high-contrast'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn(`[Theme Engine] Failed to retrieve stored theme:`, error);
  }
  return defaultMode;
}

/**
 * Safely persists selected ThemeMode to LocalStorage.
 */
export function setStoredThemeMode(key: string, mode: ThemeMode): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, mode);
    }
  } catch (error) {
    console.warn(`[Theme Engine] Failed to persist theme selection:`, error);
  }
}

/**
 * Checks system preference for prefers-color-scheme media query.
 */
export function detectSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'; // Fallback to our default theme under stress
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Checks system preference for prefers-reduced-motion media query.
 */
export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Resolves a selected ThemeMode to the concrete ResolvedTheme.
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  switch (mode) {
    case 'light':
      return 'light';
    case 'high-contrast':
      return 'high-contrast';
    case 'dark':
      return 'dark';
    case 'system':
    default:
      return detectSystemTheme();
  }
}

/**
 * Synchronizes the resolved theme class on the document root (<html> element).
 * Clears old overrides and applies the matching class.
 */
export function syncThemeClass(resolvedTheme: ResolvedTheme): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;

  // Define class overrides from index.css
  const lightClass = 'theme-light';
  const highContrastClass = 'theme-high-contrast';

  // Toggle class overrides based on resolution
  if (resolvedTheme === 'light') {
    root.classList.add(lightClass);
    root.classList.remove(highContrastClass);
  } else if (resolvedTheme === 'high-contrast') {
    root.classList.add(highContrastClass);
    root.classList.remove(lightClass);
  } else {
    // Dark mode is default, clear overrides
    root.classList.remove(lightClass);
    root.classList.remove(highContrastClass);
  }
}

/**
 * Programmatic map of design token structures for runtime querying of semantic colors.
 * This ensures that JS-based drawings (e.g., SVG, Canvas, or Canvas retro victory card builders)
 * can access actual, correct color tokens depending on the resolved theme.
 */
export const SEMANTIC_THEME_MAPPING: Record<ResolvedTheme, ColorTokens> = {
  dark: {
    bg: {
      primary: '#0B0C0E',   // Deep Obsidian Black
      secondary: '#131518', // Soothing Charcoal Card
    },
    border: {
      muted: '#1F2226',     // Low-contrast Divider
    },
    text: {
      primary: '#F3F4F6',   // High-contrast Warm White
      muted: '#8E96A0',     // Soothing Slate Gray
    },
    accent: {
      amber: '#F59E0B',     // Adrenaline-fueling Focus Yellow
      emerald: '#10B981',   // Completed State Green
      blue: '#3B82F6',      // Focused Emergency Blue
    },
  },
  light: {
    bg: {
      primary: '#F9FAFB',   // Clean light grey
      secondary: '#FFFFFF', // High-contrast clean white card
    },
    border: {
      muted: '#E5E7EB',     // Soothing grey divider
    },
    text: {
      primary: '#111827',   // Highly-visible deep grey text
      muted: '#6B7280',     // Soft slate grey text
    },
    accent: {
      amber: '#D97706',     // Accessible dark amber focus
      emerald: '#059669',   // Accessible dark emerald completion
      blue: '#2563EB',      // Accessible deep blue emergency
    },
  },
  'high-contrast': {
    bg: {
      primary: '#000000',   // Absolute Black backdrop
      secondary: '#000000', // Absolute Black card
    },
    border: {
      muted: '#FFFFFF',     // Pure White borders
    },
    text: {
      primary: '#FFFFFF',   // Pure White text
      muted: '#D1D5DB',     // Light grey secondary text
    },
    accent: {
      amber: '#FCD34D',     // Ultra-vibrant highlight yellow
      emerald: '#34D399',   // High-luminance emerald green
      blue: '#60A5FA',      // High-luminance sky blue
    },
  },
};

/**
 * Programmatically retrieves semantic colors based on resolved theme.
 * Enforces strict typing.
 */
export function getSemanticColor<
  C extends keyof ColorTokens,
  V extends keyof ColorTokens[C]
>(resolvedTheme: ResolvedTheme, category: C, variant: V): string {
  return SEMANTIC_THEME_MAPPING[resolvedTheme][category][variant] as string;
}
