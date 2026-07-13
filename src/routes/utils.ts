import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES, ROUTE_METADATA_REGISTRY } from './constants';
import { BreadcrumbItem, ScrollPosition } from './types';

/**
 * Updates the browser's document title dynamically based on the current page's metadata registry.
 * Appends the standard '11_HOUR' product brand prefix.
 */
export function updateDocumentTitle(path: string): void {
  const meta = ROUTE_METADATA_REGISTRY[path];
  
  // Support dynamic resolution of parameterized paths (like /rescue/:id or /reflection/:id)
  let resolvedTitle: string;
  if (meta?.title) {
    resolvedTitle = meta.title;
  } else if (path.startsWith('/rescue/')) {
    resolvedTitle = 'Active Rescue Board';
  } else if (path.startsWith('/reflection/')) {
    resolvedTitle = 'Retrospective Analysis';
  } else {
    resolvedTitle = 'Resource Hub';
  }

  document.title = `11_HOUR // ${resolvedTitle}`;
}

/**
 * Scroll Restoration Hook: Listens to location changes and resets scrolling positions.
 * Supports standard viewport scrolling preservation to prevent jarring layout jumps during stress periods.
 */
export function useScrollRestoration(): void {
  const { pathname } = useLocation();
  const cache = useRef<Record<string, ScrollPosition>>({});

  useEffect(() => {
    const currentCache = cache.current;

    // Scroll container to absolute top on standard page navigation
    if (currentCache[pathname]) {
      const position = currentCache[pathname];
      window.scrollTo(position.x, position.y);
    } else {
      window.scrollTo(0, 0);
    }

    // Save position before route shift
    return () => {
      currentCache[pathname] = {
        x: window.scrollX,
        y: window.scrollY,
      };
    };
  }, [pathname]);
}

/**
 * Document Title Synchronizer Component: Integrates our Document Title Strategy.
 */
export function DocumentTitleSync(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    updateDocumentTitle(pathname);
  }, [pathname]);

  return null;
}

/**
 * Breadcrumb Generation Utility: Parses the current path segments into highly readable,
 * breadcrumb records, preparing the visual hierarchy for the Layout AppHeader.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === ROUTES.LANDING) {
    return [{ label: '11_HOUR', path: ROUTES.LANDING, isLast: true }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Workspace', path: ROUTES.DASHBOARD, isLast: segments.length === 0 },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Convert url segment to clean uppercase/camelcase readable title
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    if (segment === 'rescue') label = 'Rescue Board';
    if (segment === 'create') label = 'New Plan';
    if (segment === 'reflection') label = 'Victory Retro';
    if (segment === 'analytics') label = 'Focus Journal';
    if (segment === 'settings') label = 'Preferences';

    // Handle numerical/ID parameterized segments
    if (segment.match(/^[a-zA-Z0-9_-]{20,}$/) || segment.length > 10 && !isNaN(Number(segment))) {
      label = `Task ID: ${segment.substring(0, 6)}...`;
    }

    // De-duplicate if workspace route matches
    if (segment === 'dashboard') {
      breadcrumbs[0] = { label: 'Workspace', path: ROUTES.DASHBOARD, isLast };
    } else {
      breadcrumbs.push({ label, path: currentPath, isLast });
    }
  });

  return breadcrumbs;
}
