import React from 'react';
import { Hourglass } from 'lucide-react';

export function AuthHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-accent-amber/10 rounded-sys-md border border-accent-amber/20 flex items-center justify-center">
          <Hourglass className="text-accent-amber" size={18} />
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-text-primary">
          11_HOUR
        </span>
      </div>
      <p className="text-xs font-sans text-text-muted mt-1 leading-relaxed">
        The Last-Minute Life Saver. Turn deadline panic into calm, structured momentum.
      </p>
    </div>
  );
}

export default AuthHeader;
