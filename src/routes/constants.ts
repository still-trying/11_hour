/**
 * 11_HOUR - Routing Constants & Route Registry Metadata
 *
 * Centralizes all application route path definitions and static SEO/page metadata,
 * preventing hardcoded path strings across components.
 */

import { RouteMeta } from './types';

export const ROUTES = {
  LANDING: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  EMERGENCY: '/emergency',
  RESCUE_CREATE: '/rescue/create',
  RESCUE_WORKSPACE: '/rescue/:id',
  REFLECTION: '/reflection/:id',
  HABITS: '/habits',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  WILDCARD: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Centrally declared Route Registry mapping each path to its functional metadata,
 * layouts, and access policies.
 */
export const ROUTE_METADATA_REGISTRY: Record<string, RouteMeta> = {
  [ROUTES.LANDING]: {
    title: 'The Last-Minute Life Saver',
    description:
      'A cognitive buffer and execution intelligence engine to rescue high-urgency deadlines.',
    requiresAuth: false,
    layout: 'public',
    analyticsName: 'landing',
  },
  [ROUTES.AUTH]: {
    title: 'Secure Gateways',
    description: 'Frictionless authentication portal to unlock deep execution tools.',
    requiresAuth: false,
    layout: 'public',
    analyticsName: 'auth',
  },
  [ROUTES.DASHBOARD]: {
    title: 'Workspace Hub',
    description: 'Overview of high-urgency rescue tasks, stats trackers, and rapid setup triggers.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'dashboard',
  },
  [ROUTES.EMERGENCY]: {
    title: 'Emergency Dashboard',
    description:
      'Red-alert view showing only meltdown, critical, and overdue tasks with live countdowns.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'emergency',
  },
  [ROUTES.RESCUE_CREATE]: {
    title: 'Brain Dump Portal',
    description: 'Deposit raw deadline objectives and attachments for AI decomposition.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'rescue_create',
  },
  [ROUTES.RESCUE_WORKSPACE]: {
    title: 'Active Execution Board',
    description: 'High-contrast focused workspace displaying current active countdown micro-steps.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'rescue_workspace',
  },
  [ROUTES.REFLECTION]: {
    title: 'Victory Retrospective',
    description: 'Celebrate completion, analyze cognitive metrics, and download victory summaries.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'reflection',
  },
  [ROUTES.HABITS]: {
    title: 'Habit Tracker',
    description: 'Daily habit tracking with weekly grid view and streak monitoring.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'habits',
  },
  [ROUTES.ANALYTICS]: {
    title: 'Performance & History',
    description: 'Deep analytical analytics tracking long-term momentum and focus streaks.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'analytics',
  },
  [ROUTES.SETTINGS]: {
    title: 'Settings Center',
    description: 'Configure customizable focus blocks, system alerts, and visual modes.',
    requiresAuth: true,
    layout: 'protected',
    analyticsName: 'settings',
  },
};

/**
 * Shared layout navigation configuration items
 */
export const NAVIGATION_CONFIG = {
  primary: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      iconName: 'LayoutDashboard',
      requiresAuth: true,
    },
    {
      id: 'emergency',
      label: '🚨 Emergency',
      path: ROUTES.EMERGENCY,
      iconName: 'Siren',
      requiresAuth: true,
    },
    {
      id: 'habits',
      label: 'Habits',
      path: ROUTES.HABITS,
      iconName: 'LayoutDashboard',
      requiresAuth: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: ROUTES.ANALYTICS,
      iconName: 'BarChart2',
      requiresAuth: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      path: ROUTES.SETTINGS,
      iconName: 'Settings',
      requiresAuth: true,
    },
  ],
  public: [
    {
      id: 'landing',
      label: 'Home',
      path: ROUTES.LANDING,
      requiresAuth: false,
    },
    {
      id: 'login',
      label: 'Get Started',
      path: ROUTES.AUTH,
      requiresAuth: false,
    },
  ],
};
