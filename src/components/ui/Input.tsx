import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium font-sans text-text-muted tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-text-muted flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={cn(
              error ? errorId : undefined,
              helperText ? helperId : undefined
            )}
            className={cn(
              'w-full bg-bg-primary border text-sm text-text-primary px-3.5 py-2.5 rounded-sys-md h-10 transition-colors font-sans focus:outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber focus-visible:ring-1 focus-visible:ring-accent-amber disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : 'border-border-muted hover:border-text-muted/40',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-text-muted flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-500 font-sans tracking-wide mt-0.5 animate-fadeIn"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={helperId}
            className="text-xs text-text-muted/70 font-sans tracking-wide mt-0.5"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
