/**
 * useHotkeys — Keyboard Shortcut Hook
 *
 * Lightweight global keyboard shortcut registration with modifier support,
 * sequence detection, and automatic cleanup.
 *
 * Usage:
 *   useHotkeys([
 *     { keys: ['n'], handler: () => openNewTask() },
 *     { keys: ['g', 'd'], handler: () => navigate('/dashboard') },
 *     { keys: ['shift', '/'], handler: () => toggleHelp() },
 *   ]);
 */

import { useEffect, useRef, useCallback } from 'react';

export interface HotkeyBinding {
  keys: string[];
  handler: () => void;
  label?: string;
  category?: string;
  ignoreInputs?: boolean;
}

export function useHotkeys(bindings: HotkeyBinding[]): void {
  const bufferRef = useRef<{ keys: string[]; timeout: ReturnType<typeof setTimeout> | null }>({
    keys: [],
    timeout: null,
  });
  const bindingsRef = useRef(bindings);

  const isInputFocused = useCallback((): boolean => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if ((el as HTMLElement).isContentEditable) return true;
    return false;
  }, []);

  // Keep bindingsRef in sync after every render (no dep array = post-render sync)
  useEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isModifier = key === 'control' || key === 'alt' || key === 'meta' || key === 'shift';

      for (const binding of bindingsRef.current) {
        const seq = binding.keys.map((k) => k.toLowerCase());

        // Single key or modifier combo
        if (seq.length === 1) {
          const expected = seq[0];
          const hasCtrl = expected.includes('ctrl');
          const hasShift = expected.includes('shift');
          const hasAlt = expected.includes('alt');
          const actualKey = hasCtrl || hasShift || hasAlt ? key : e.key.toLowerCase();
          const matchesModifiers =
            (!hasCtrl || e.ctrlKey) &&
            (!hasShift || e.shiftKey) &&
            (!hasAlt || e.altKey);

          if (matchesModifiers && actualKey === (hasCtrl || hasShift || hasAlt ? expected.replace(/^(ctrl|shift|alt)\+/, '') : expected)) {
            if (binding.ignoreInputs && isInputFocused()) continue;
            if (isModifier) continue;
            e.preventDefault();
            binding.handler();
            return;
          }
        }
        // Multi-key sequence (e.g., ['g', 'd'])
        else if (seq.length > 1 && !isModifier) {
          const currentKey = e.key.toLowerCase();
          if (bufferRef.current.keys.length === 0) {
            if (currentKey === seq[0]) {
              bufferRef.current.keys = [currentKey];
              bufferRef.current.timeout = setTimeout(() => {
                bufferRef.current.keys = [];
                bufferRef.current.timeout = null;
              }, 600);
              e.preventDefault();
              return;
            }
          } else if (bufferRef.current.keys.length === 1 && bufferRef.current.keys[0] === seq[0]) {
            if (currentKey === seq[1]) {
              bufferRef.current.keys = [];
              if (bufferRef.current.timeout) {
                clearTimeout(bufferRef.current.timeout);
                bufferRef.current.timeout = null;
              }
              if (binding.ignoreInputs && isInputFocused()) continue;
              e.preventDefault();
              binding.handler();
              return;
            }
          }
        }
      }

      // Reset buffer on non-g key presses
      if (bufferRef.current.keys.length > 0 && !e.key.toLowerCase().startsWith('g')) {
        if (bufferRef.current.timeout) {
          clearTimeout(bufferRef.current.timeout);
        }
        bufferRef.current.keys = [];
        bufferRef.current.timeout = null;
      }
    };      window.addEventListener('keydown', handleKeyDown);

    const buffer = bufferRef.current;
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const timeout = buffer.timeout;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isInputFocused]);
}

export default useHotkeys;
