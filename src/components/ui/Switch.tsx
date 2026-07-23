import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, disabled = false, className, id, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    return (
      <div className={cn('flex items-center justify-between gap-3', className)}>
        {label && (
          <label
            htmlFor={switchId}
            className="text-sm text-text-primary font-sans cursor-pointer select-none"
          >
            {label}
          </label>
        )}
        <button
          ref={ref}
          id={switchId}
          role="switch"
          type="button"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
            checked ? 'bg-accent-amber' : 'bg-border-muted',
          )}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>
    );
  },
);

Switch.displayName = 'Switch';
export default Switch;
