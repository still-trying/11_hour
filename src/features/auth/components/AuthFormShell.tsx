import React from 'react';
import { cn } from '@/lib/utils';

interface AuthFormShellProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function AuthFormShell({
  children,
  className,
  onSubmit,
  ...props
}: AuthFormShellProps): React.JSX.Element {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn('flex flex-col gap-sys-lg w-full', className)}
      {...props}
    >
      {children}
    </form>
  );
}

export default AuthFormShell;
