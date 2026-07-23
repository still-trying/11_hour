/**
 * 11_HOUR - Theme Engine Context & Hooks
 *
 * This file creates the React Theme Context and defines the 'useTheme' hook,
 * allowing UI components to easily read and manipulate theme state safely.
 */

import { createContext, useContext } from 'react';
import { ThemeContextValue } from './types';

/**
 * React Context for the Theme Engine.
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Custom hook to consume the Theme Engine state and controllers.
 * Enforces usage strictly within the bounds of a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      '[Theme Engine] useTheme must be consumed within a valid <ThemeProvider> component.',
    );
  }
  return context;
}
