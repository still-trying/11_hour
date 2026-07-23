/**
 * MicroStepChecklist — Interactive AI-generated step checklist
 *
 * Displays the AI-generated steps for a task with checkboxes.
 * Steps can be toggled completed, and progress is shown.
 */

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { AiStep } from '@/types';

interface MicroStepChecklistProps {
  steps: AiStep[];
  onToggleStep: (stepId: string) => void;
}

export function MicroStepChecklist({
  steps,
  onToggleStep,
}: MicroStepChecklistProps): React.JSX.Element {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-border-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-emerald rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-mono text-text-muted whitespace-nowrap">
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-1">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onToggleStep(step.id)}
            className={`
              flex items-start gap-3 p-3 rounded-sys-md text-left transition-all duration-200
              ${
                step.completed
                  ? 'bg-accent-emerald/5 border border-accent-emerald/20'
                  : 'bg-bg-primary border border-border-muted hover:border-accent-amber/30'
              }
            `}
          >
            {step.completed ? (
              <CheckCircle2 size={18} className="text-accent-emerald mt-0.5 flex-shrink-0" />
            ) : (
              <Circle size={18} className="text-text-muted/40 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-text-muted mr-2">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className={`text-sm ${step.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}
              >
                {step.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MicroStepChecklist;
