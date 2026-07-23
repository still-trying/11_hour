/**
 * 11_HOUR - Design Token System (TypeScript Module)
 *
 * This file contains the strongly-typed TypeScript equivalents of the
 * system design tokens defined in the Experience OS (011_Experience_OS_Architecture).
 * Use these tokens when programmatically styling components, configuring motion curves,
 * or specifying dimensions in JavaScript/TypeScript code.
 *
 * Naming Convention:
 * sys.[category].[variant].[property]
 */

export const sys = {
  color: {
    bg: {
      primary: '#0B0C0E', // Deep Obsidian Black
      secondary: '#131518', // Soothing Charcoal Card
    },
    border: {
      muted: '#1F2226', // Low-contrast Divider
    },
    text: {
      primary: '#F3F4F6', // High-contrast Warm White
      muted: '#8E96A0', // Soothing Slate Gray
    },
    accent: {
      amber: '#F59E0B', // Adrenaline-fueling Focus Yellow
      emerald: '#10B981', // Completed State Green
      blue: '#3B82F6', // Focused Emergency Blue
    },
  },

  font: {
    family: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: '"Space Grotesk", sans-serif',
      mono: '"JetBrains Mono", SFMono-Regular, Consolas, monospace',
    },
    size: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      xxl: '1.5rem', // 24px (2xl)
      xxxl: '1.875rem', // 30px (3xl)
      xxxxl: '2.25rem', // 36px (4xl)
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },

  space: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2.5rem', // 40px
  },

  radius: {
    sm: '4px', // Checkboxes, micro badges
    md: '8px', // Inputs, buttons
    lg: '12px', // Primary cards, focus boards
    full: '9999px', // Circle avatars, fully rounded capsules
  },

  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
    focus: '0 0 0 2px #F59E0B',
  },

  opacity: {
    disabled: 0.5,
    muted: 0.7,
    subtle: 0.4,
    full: 1,
  },

  border: {
    width: {
      thin: '1px',
      thick: '2px',
    },
    style: {
      solid: 'solid',
    },
  },

  motion: {
    duration: {
      fast: 0.15, // 150ms (seconds for Framer Motion)
      standard: 0.3, // 300ms
      soothing: 0.5, // 500ms
    },
    durationMs: {
      fast: 150,
      standard: 300,
      soothing: 500,
    },
    ease: {
      // Numerical values for Framer Motion transitions
      entrance: [0.16, 1, 0.3, 1], // Soothing decelerated sweep
      snap: [0.25, 1, 0.5, 1], // Snappy, responsive trigger
      pulse: [0.4, 0, 0.2, 1], // Soft, repeating breathing wave
    },
  },

  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    toast: 1400,
  },

  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },

  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  icon: {
    size: {
      xs: '0.75rem', // 12px
      sm: '1rem', // 16px
      md: '1.25rem', // 20px
      lg: '1.5rem', // 24px
      xl: '2rem', // 32px
    },
  },
} as const;

export type SystemTokens = typeof sys;
