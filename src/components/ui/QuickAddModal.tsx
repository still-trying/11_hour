/**
 * QuickAddModal — Rapid task creation modal
 *
 * Minimal-friction task creation: single text input with smart defaults
 * (importance=5, deadline=1 hour from now). Designed for "last minute"
 * emergency task capture.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Zap, Brain, Clock, Star, RefreshCw } from 'lucide-react';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { soundEngine } from '@/lib/utils/sounds';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps): React.JSX.Element | null {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState(5);
  const [deadlineHours, setDeadlineHours] = useState(1);
  const [useAi, setUseAi] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createTask, isCreating } = useTasksQuery();

  // Focus input on open
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Reset on close — component stays mounted (returns null), so state must be cleared explicitly
  useEffect(() => {
    if (!isOpen) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle('');
      setDescription('');
      setImportance(5);
      setDeadlineHours(1);
      setIsExpanded(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + deadlineHours);

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        importance,
        deadline: deadline.toISOString(),
        estimated_minutes: 30,
        useAi,
      });
      soundEngine.playSwoosh();
      onClose();
    } catch {
      // Error is handled by the mutation's onError
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1200]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[1300]">
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-border-muted rounded-sys-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-muted">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-accent-amber" />
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                RAPID CAPTURE
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary rounded-sys-sm transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3">
            {/* Title Input */}
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done urgently?"
              className="
                w-full px-3 py-3 bg-bg-primary border border-border-muted rounded-sys-md
                text-text-primary text-base font-medium placeholder:text-text-muted/50
                focus:outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber/30
                transition-all
              "
              autoComplete="off"
            />

            {/* Quick Options Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Deadline Quick Select */}
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-text-muted" />
                {[1, 2, 4, 8].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setDeadlineHours(hours)}
                    className={`
                      px-2 py-1 text-xs font-mono rounded-sys-sm transition-colors
                      ${
                        deadlineHours === hours
                          ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30'
                          : 'text-text-muted hover:text-text-primary hover:bg-bg-primary'
                      }
                    `}
                  >
                    {hours}h
                  </button>
                ))}
              </div>

              {/* Importance */}
              <div className="flex items-center gap-1 ml-auto">
                <Star size={12} className="text-text-muted" />
                {[3, 4, 5].map((imp) => (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setImportance(imp)}
                    className={`
                      px-2 py-1 text-xs font-mono rounded-sys-sm transition-colors
                      ${
                        importance === imp
                          ? 'bg-defcon-elevated/20 text-defcon-elevated border border-defcon-elevated/30'
                          : 'text-text-muted hover:text-text-primary hover:bg-bg-primary'
                      }
                    `}
                  >
                    P{imp}
                  </button>
                ))}
              </div>
            </div>

            {/* Expand for description */}
            {!isExpanded ? (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="text-xs text-text-muted hover:text-accent-amber font-mono transition-colors text-left"
              >
                + Add description
              </button>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details..."
                rows={2}
                className="
                  w-full px-3 py-2 bg-bg-primary border border-border-muted rounded-sys-md
                  text-text-primary text-sm placeholder:text-text-muted/50 resize-none
                  focus:outline-none focus:border-accent-amber
                "
              />
            )}

            {/* AI Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`
                w-8 h-4 rounded-full transition-colors relative
                ${useAi ? 'bg-accent-amber' : 'bg-border-muted'}
              `}
              >
                <div
                  className={`
                  absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
                  ${useAi ? 'translate-x-4' : 'translate-x-0.5'}
                `}
                />
              </div>
              <Brain size={12} className={useAi ? 'text-accent-amber' : 'text-text-muted'} />
              <span className="text-xs font-mono text-text-muted">AI auto-steps</span>
            </label>
          </div>

          {/* Submit */}
          <div className="p-4 pt-0">
            <button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="
                w-full py-3 bg-accent-amber text-black font-mono font-bold text-sm
                rounded-sys-md transition-all
                hover:bg-accent-amber/90 hover:shadow-lg hover:shadow-accent-amber/20
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isCreating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Create Urgent Task
                </>
              )}
            </button>
            <p className="text-[10px] text-text-muted text-center mt-2 font-mono">
              Deadline: {deadlineHours}h from now • Priority {importance}/5 • Press Enter to submit
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default QuickAddModal;
