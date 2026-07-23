/**
 * HotkeysHelpModal — Keyboard Shortcuts Reference
 *
 * Overlay showing all available keyboard shortcuts, triggered by pressing ? or Shift+?.
 */

import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { HotkeyBinding } from '@/hooks/useHotkeys';

interface HotkeysHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  bindings: HotkeyBinding[];
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    escape: 'Esc',
    ' ': 'Space',
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
    control: 'Ctrl',
    shift: 'Shift',
    alt: 'Alt',
    meta: 'Cmd',
  };
  return map[key.toLowerCase()] || key.toUpperCase();
}

function formatShortcut(keys: string[]): string {
  return keys
    .map((k) => {
      const lower = k.toLowerCase();
      if (lower.startsWith('ctrl') || lower.startsWith('shift') || lower.startsWith('alt')) {
        const parts = k.split('+');
        return parts.map(formatKey).join(' + ');
      }
      return formatKey(k);
    })
    .join(' → ');
}

export function HotkeysHelpModal({ isOpen, onClose, bindings }: HotkeysHelpModalProps): React.JSX.Element | null {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Group bindings by category
  const grouped = bindings.reduce<Record<string, HotkeyBinding[]>>((acc, b) => {
    const cat = b.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    if (b.label) acc[cat].push(b);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1200]" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-[1300] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-bg-secondary border border-border-muted rounded-sys-lg shadow-2xl w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-muted">
            <div className="flex items-center gap-2">
              <Keyboard size={16} className="text-accent-amber" />
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                Keyboard Shortcuts
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary rounded-sys-sm transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
            {Object.entries(grouped).map(([category, categoryBindings]) => (
              <div key={category} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-text-muted/60 uppercase tracking-widest mb-1">
                  {category}
                </span>
                {categoryBindings.map((binding, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded-sys-sm hover:bg-bg-primary/50 transition-colors"
                  >
                    <span className="text-sm text-text-primary">{binding.label}</span>
                    <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-bg-primary border border-border-muted rounded-sys-sm text-xs font-mono text-accent-amber font-semibold">
                      {formatShortcut(binding.keys)}
                    </kbd>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border-muted bg-bg-primary/30">
            <p className="text-[10px] font-mono text-text-muted/50 text-center">
              Press <kbd className="px-1 py-0.5 bg-bg-primary border border-border-muted rounded-sys-sm text-accent-amber text-[9px]">?</kbd> or{' '}
              <kbd className="px-1 py-0.5 bg-bg-primary border border-border-muted rounded-sys-sm text-accent-amber text-[9px]">Shift+?</kbd> at any time to reopen this menu
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default HotkeysHelpModal;
