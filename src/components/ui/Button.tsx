import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/theme/ThemeContext';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { reducedMotion } = useTheme();
    const isDisabled = disabled || isLoading;

    // Semantic visual class mappings
    const baseStyles = cn(
      'inline-flex items-center justify-center font-sans font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
      'rounded-sys-md'
    );

    const variants = {
      primary: 'bg-accent-amber text-bg-primary hover:bg-amber-600 focus-visible:ring-accent-amber active:bg-amber-700 font-semibold',
      secondary: 'bg-bg-secondary text-text-primary border border-border-muted hover:bg-border-muted focus-visible:ring-text-muted',
      glass: 'bg-bg-secondary/40 backdrop-blur-md text-text-primary border border-border-muted/60 hover:bg-bg-secondary/60 focus-visible:ring-accent-blue',
      ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary/30 focus-visible:ring-text-muted',
    };

    const sizes = {
      sm: 'px-sys-sm py-1.5 text-xs gap-sys-xs h-8',
      md: 'px-sys-md py-sys-sm text-sm gap-sys-sm h-10',
      lg: 'px-sys-lg py-3 text-base gap-sys-md h-12',
    };

    // Motion parameters (disabled in reduced-motion mode)
    const animationProps = reducedMotion
      ? {}
      : {
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
        };

    return (
      <motion.button
        ref={ref as any}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...animationProps}
        {...(props as any)}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="flex shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
