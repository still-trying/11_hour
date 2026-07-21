/**
 * 11_HOUR - Main Application Bootstrapper
 *
 * This component initializes the global React tree. It mounts the core runtime engine,
 * theme engine provider, and React Router dom tree to begin navigating the Experience OS.
 * Leverages central dynamic provider composition.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme';
import { AppRoutes } from '@/routes/AppRoutes';
import { RuntimeProvider, ProviderComposer, ProviderEntry } from '@/runtime';
import { AuthorizationProvider } from '@/context/AuthorizationContext';
import { QueryProvider } from '@/lib/query/QueryProvider';

const coreProviders: ProviderEntry[] = [
  { id: 'runtime-provider', component: RuntimeProvider },
  { id: 'theme-provider', component: ThemeProvider },
  { id: 'router-provider', component: BrowserRouter },
  { id: 'authz-provider', component: AuthorizationProvider },
  { id: 'query-provider', component: QueryProvider },
];

export default function App(): React.JSX.Element {
  return (
    <ProviderComposer providers={coreProviders}>
      <AppRoutes />
    </ProviderComposer>
  );
}

