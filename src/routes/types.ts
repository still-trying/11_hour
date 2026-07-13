/**
 * 11_HOUR - Routing & Navigation Types
 *
 * This file declares strongly-typed structures for route configuration, page metadata,
 * breadcrumbs, navigation menus, and navigation guards.
 */

export type LayoutType = 'root' | 'public' | 'protected' | 'none';

export interface RouteMeta {
  title: string;
  description?: string;
  requiresAuth: boolean;
  layout: LayoutType;
  analyticsName?: string;
}

export interface RouteRegistryItem {
  path: string;
  meta: RouteMeta;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName?: string; // Maps to lucide icon names
  requiresAuth: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export interface ScrollPosition {
  x: number;
  y: number;
}
