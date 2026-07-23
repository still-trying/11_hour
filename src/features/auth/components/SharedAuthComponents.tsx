import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/theme/ThemeContext';
import { cn } from '@/lib/utils';
import { ShieldCheck, Info } from 'lucide-react';

interface GoogleButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

interface FacebookButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function FacebookButton({ onClick, disabled = false }: FacebookButtonProps): React.JSX.Element {
  const { reducedMotion } = useTheme();

  const animationProps = !reducedMotion
    ? {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
      }
    : {};

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full inline-flex items-center justify-center gap-sys-sm px-sys-md py-2.5 h-10 border border-border-muted rounded-sys-md font-sans text-sm font-medium text-text-primary bg-[#1877F2] hover:bg-[#166FE5] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white',
      )}
      {...animationProps}
    >
      {/* Facebook SVG Vector */}
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      <span>Connect with Facebook</span>
    </motion.button>
  );
}

export function GoogleButton({ onClick, disabled = false }: GoogleButtonProps): React.JSX.Element {
  const { reducedMotion } = useTheme();

  const animationProps = !reducedMotion
    ? {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
      }
    : {};

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full inline-flex items-center justify-center gap-sys-sm px-sys-md py-2.5 h-10 border border-border-muted rounded-sys-md font-sans text-sm font-medium text-text-primary bg-bg-primary hover:bg-bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
      )}
      {...animationProps}
    >
      {/* Google SVG Vector */}
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span>Connect with Google</span>
    </motion.button>
  );
}

interface AuthBadgeProps {
  label: string;
}

export function AuthBadge({ label }: AuthBadgeProps): React.JSX.Element {
  return (
    <div className="inline-flex items-center gap-1 py-1 px-2.5 rounded-sys-sm bg-bg-primary border border-border-muted text-[10px] font-mono text-text-muted uppercase tracking-wider">
      <ShieldCheck size={11} className="text-accent-emerald shrink-0" />
      <span>{label}</span>
    </div>
  );
}

interface AuthInfoBlockProps {
  children: React.ReactNode;
}

export function AuthInfoBlock({ children }: AuthInfoBlockProps): React.JSX.Element {
  return (
    <div className="p-sys-sm bg-bg-primary/50 border border-border-muted/60 rounded-sys-md flex gap-2.5 items-start">
      <Info size={14} className="text-accent-blue shrink-0 mt-0.5" />
      <p className="text-[11px] text-text-muted leading-relaxed font-sans">{children}</p>
    </div>
  );
}
