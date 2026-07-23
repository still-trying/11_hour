/**
 * FloatingActionButton — Persistent quick-add trigger
 *
 * A fixed-position button (bottom-right) that opens the QuickAddModal
 * for rapid task creation. Uses the amber gradient from the design system.
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { QuickAddModal } from './QuickAddModal';
import { soundEngine } from '@/lib/utils/sounds';

export function FloatingActionButton(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for keyboard shortcut event to open the modal
  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener('11hour:open-quick-add', handler);
    return () => window.removeEventListener('11hour:open-quick-add', handler);
  }, []);

  return (
    <>
      <div className="fab-container">
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsModalOpen(true);
          }}
          className="fab-button"
          aria-label="Create urgent task"
          title="Quick-add task"
        >
          <Plus
            size={24}
            strokeWidth={2.5}
            className={`transition-transform duration-200 ${isModalOpen ? 'rotate-45' : ''}`}
          />
        </button>
      </div>

      <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default FloatingActionButton;
