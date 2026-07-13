import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/theme/ThemeContext';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = 'md', isInteractive = false, onClick, ...props }, ref) => {
    const { reducedMotion } = useTheme();

    const baseStyles = cn(
      'bg-bg-secondary border border-border-muted rounded-sys-lg shadow-md overflow-hidden relative',
      isInteractive && 'cursor-pointer hover:border-border-muted/80'
    );

    const paddings = {
      none: 'p-0',
      sm: 'p-sys-sm',
      md: 'p-sys-md',
      lg: 'p-sys-lg',
    };

    const animationProps = isInteractive && !reducedMotion
      ? {
          whileHover: { y: -2, scale: 1.005 },
          transition: { type: 'spring', stiffness: 350, damping: 25 },
        }
      : {};

    const Component = isInteractive ? motion.div : 'div';

    return (
      <Component
        ref={ref as any}
        onClick={onClick}
        className={cn(baseStyles, paddings[padding], className)}
        {...(animationProps as any)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';
