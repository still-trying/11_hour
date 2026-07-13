/**
 * 11_HOUR - Central Provider Registry & Composition Engine
 *
 * Implements a centralized composition system that nests React context providers
 * in a deterministic order, bypassing deep nesting boilerplate.
 */

import React from 'react';
import { ProviderEntry } from './types';

interface ProviderComposerProps {
  providers: ProviderEntry[];
  children: React.ReactNode;
}

/**
 * Iteratively reduces the Provider Registry list into a single, nested React tree.
 * Renders providers from top-to-bottom (first entry wraps all subsequent entries).
 */
export function ProviderComposer({ providers, children }: ProviderComposerProps): React.JSX.Element {
  return providers.reduceRight((acc, provider) => {
    const Component = provider.component;
    return <Component {...(provider.props || {})}>{acc}</Component>;
  }, children as React.JSX.Element);
}

/**
 * Global Registry class to support dynamic runtime provider registration.
 */
class ProviderRegistryClass {
  private providers: ProviderEntry[] = [];

  /**
   * Registers a new provider wrapper into the central registry.
   */
  register(entry: ProviderEntry): void {
    if (this.providers.some((p) => p.id === entry.id)) {
      console.warn(`⚠️ [ProviderRegistry] Provider with ID "${entry.id}" is already registered. Overwriting.`);
      this.providers = this.providers.map((p) => (p.id === entry.id ? entry : p));
    } else {
      this.providers.push(entry);
    }
  }

  /**
   * Clears all registered providers (mostly for testing and resets).
   */
  clear(): void {
    this.providers = [];
  }

  /**
   * Retrieves all registered providers in registered order.
   */
  getProviders(): ProviderEntry[] {
    return [...this.providers];
  }
}

export const ProviderRegistry = new ProviderRegistryClass();
