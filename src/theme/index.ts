/**
 * 11_HOUR - Theme Engine Module
 *
 * This is the central export hub for the Theme Engine. It aggregates the design token
 * definitions, React context structures, provider, hooks, constants, and utilities.
 */

// Design token definitions
export { sys } from './tokens';
export type { SystemTokens } from './tokens';

// Types & interfaces
export type {
  ThemeMode,
  ResolvedTheme,
  ThemeConfig,
  ThemeMetadata,
  ThemeState,
  ThemeContextValue,
  ColorTokens,
} from './types';

// Constants & registry configurations
export {
  THEME_PERSIST_KEY,
  DEFAULT_THEME_CONFIG,
  THEME_REGISTRY,
  THEME_CYCLE_ORDER,
} from './constants';

// Utilities
export {
  getStoredThemeMode,
  setStoredThemeMode,
  detectSystemTheme,
  detectReducedMotion,
  resolveTheme,
  syncThemeClass,
  SEMANTIC_THEME_MAPPING,
  getSemanticColor,
} from './utils';

// Context, Hooks & Provider
export { ThemeContext, useTheme } from './ThemeContext';
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
