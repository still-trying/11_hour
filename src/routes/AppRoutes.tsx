import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './constants';

// Layout Structural Scaffolding
import { RootLayout } from '@/components/layout/RootLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

// Guard Skeletons
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Loading Boundaries & Fallbacks
import LoadingBoundary from './LoadingBoundary';

// Lazy-loaded Feature Page Skeletons
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const AuthPage = lazy(() => import('@/features/auth/AuthPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const RescueCreatePage = lazy(() => import('@/features/rescue/RescueCreatePage'));
const RescuePage = lazy(() => import('@/features/rescue/RescuePage'));
const ReflectionPage = lazy(() => import('@/features/reflection/ReflectionPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      {/* Root Layout Boundary enclosing all application routes */}
      <Route element={<RootLayout />}>
        
        {/* ==========================================
           PUBLIC DISCOVERY DOMAIN
           ========================================== */}
        <Route element={<PublicLayout />}>
          {/* Landing/Welcome Screen */}
          <Route
            path={ROUTES.LANDING}
            element={
              <LoadingBoundary>
                <LandingPage />
              </LoadingBoundary>
            }
          />
          {/* Auth Screen */}
          <Route
            path={ROUTES.AUTH}
            element={
              <PublicRoute>
                <LoadingBoundary>
                  <AuthPage />
                </LoadingBoundary>
              </PublicRoute>
            }
          />
        </Route>

        {/* ==========================================
           PROTECTED WORKSPACE DOMAIN
           ========================================== */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <LoadingBoundary>
                <DashboardPage />
              </LoadingBoundary>
            }
          />

          {/* Creation Portal */}
          <Route
            path={ROUTES.RESCUE_CREATE}
            element={
              <LoadingBoundary>
                <RescueCreatePage />
              </LoadingBoundary>
            }
          />

          {/* Execution Workspace (Active Timer countdowns) */}
          <Route
            path={ROUTES.RESCUE_WORKSPACE}
            element={
              <LoadingBoundary>
                <RescuePage />
              </LoadingBoundary>
            }
          />

          {/* Reflection retrospective summary */}
          <Route
            path={ROUTES.REFLECTION}
            element={
              <LoadingBoundary>
                <ReflectionPage />
              </LoadingBoundary>
            }
          />

          {/* Analytics Hub */}
          <Route
            path={ROUTES.ANALYTICS}
            element={
              <LoadingBoundary>
                <AnalyticsPage />
              </LoadingBoundary>
            }
          />

          {/* Settings Center */}
          <Route
            path={ROUTES.SETTINGS}
            element={
              <LoadingBoundary>
                <SettingsPage />
              </LoadingBoundary>
            }
          />
        </Route>

        {/* ==========================================
           EXCEPTION & FALLBACK DIRECTORIES
           ========================================== */}
        {/* Wildcard 404 Route */}
        <Route
          path={ROUTES.WILDCARD}
          element={
            <LoadingBoundary>
              <NotFoundPage />
            </LoadingBoundary>
          }
        />
        
      </Route>
    </Routes>
  );
}

export default AppRoutes;
