/**
 * 11_HOUR - Theme Engine Provider
 *
 * Implements the ThemeProvider component which initializes the theme from persistence,
 * listens dynamically to OS color schemes and reduced motion changes, synchronizes CSS classes,
 * and distributes state through React Context.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeConfig, ThemeMode, ResolvedTheme } from './types';
import { DEFAULT_THEME_CONFIG, THEME_CYCLE_ORDER } from './constants';
import { ThemeContext } from './ThemeContext';
import {
  getStoredThemeMode,
  setStoredThemeMode,
  resolveTheme,
  syncThemeClass,
  detectReducedMotion,
} from './utils';

export interface ThemeProviderProps {
  children: React.ReactNode;
  config?: Partial<ThemeConfig>;
}

export function ThemeProvider({ children, config: customConfig }: ThemeProviderProps): React.JSX.Element {
  // Merge customized configurations with system defaults
  const config = useMemo<ThemeConfig>(() => {
    return {
      ...DEFAULT_THEME_CONFIG,
      ...customConfig,
    };
  }, [customConfig]);

  // Lazy state initializations to guarantee smooth layout loads
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return getStoredThemeMode(config.storageKey, config.defaultThemeMode);
  });

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => {
    return resolveTheme('system') as 'dark' | 'light';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return detectReducedMotion();
  });

  // Resolve active theme as a memoized derivation to prevent cascading re-renders
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (themeMode === 'system') {
      return systemTheme;
    }
    return resolveTheme(themeMode);
  }, [themeMode, systemTheme]);

  // Safe theme updater coordinating both react state and local persistence
  const setThemeMode = useCallback(
    (newMode: ThemeMode) => {
      setThemeModeState(newMode);
      setStoredThemeMode(config.storageKey, newMode);
    },
    [config.storageKey]
  );

  // Snappy theme cyclist: Dark -> Light -> High Contrast -> System
  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const currentIndex = THEME_CYCLE_ORDER.indexOf(prev);
      const nextIndex = (currentIndex + 1) % THEME_CYCLE_ORDER.length;
      const nextMode = THEME_CYCLE_ORDER[nextIndex];
      setStoredThemeMode(config.storageKey, nextMode);
      return nextMode;
    });
  }, [config.storageKey]);

  // Synchronize CSS class lists with any resolved theme mutations
  useEffect(() => {
    syncThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  // React to external system preferences changes dynamically
  useEffect(() => {
    if (!config.enableSystemListener) return;

    const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Modern and older browser compatibility for event listeners
    try {
      systemMediaQuery.addEventListener('change', handleSystemChange);
    } catch {
      // Fallback compatibility for older browsers
      systemMediaQuery.addListener(handleSystemChange);
    }

    return () => {
      try {
        systemMediaQuery.removeEventListener('change', handleSystemChange);
      } catch {
        systemMediaQuery.removeListener(handleSystemChange);
      }
    };
  }, [themeMode, config.enableSystemListener]);

  // React to OS-level reduced motion mutations
  useEffect(() => {
    if (!config.enableReducedMotionListener) return;

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    try {
      motionMediaQuery.addEventListener('change', handleMotionChange);
    } catch {
      motionMediaQuery.addListener(handleMotionChange);
    }

    return () => {
      try {
        motionMediaQuery.removeEventListener('change', handleMotionChange);
      } catch {
        motionMediaQuery.removeListener(handleMotionChange);
      }
    };
  }, [config.enableReducedMotionListener]);

  // Memoize values to prevent unnecessary downstream component re-renders
  const contextValue = useMemo(() => {
    return {
      themeMode,
      resolvedTheme,
      reducedMotion,
      setThemeMode,
      toggleTheme,
      isSystem: themeMode === 'system',
    };
  }, [themeMode, resolvedTheme, reducedMotion, setThemeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
