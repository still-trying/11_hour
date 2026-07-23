import React from 'react';

export function AuthFooter(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 w-full text-center sm:text-left pt-sys-md border-t border-border-muted/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] font-mono text-text-muted/60">
        <span>CLIENT SHELL // V1.0.0-PROTOTYPE</span>
        <span>SECURITY ENFORCED // SECURE GRAPH</span>
      </div>
      <p className="text-[10px] text-text-muted/40 font-sans leading-normal">
        By continuing, you agree to our terms of deep work focus. Under extreme deadline crunches,
        11_HOUR prioritizes task delivery above general administrative overhead.
      </p>
    </div>
  );
}

export default AuthFooter;
