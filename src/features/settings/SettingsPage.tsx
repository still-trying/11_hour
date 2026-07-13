import React from 'react';
import { Settings, Sliders } from 'lucide-react';

export default function SettingsPage(): React.JSX.Element {

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Settings size={14} className="text-accent-amber" />
          <span>PREFERENCES ENGINE</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Settings Control Center
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Customize active timer blocks, chime triggers, and accessibility theme modes. Preferences 
          and alert chime setups will be completed in Settings Control Center (Slice 8).
        </p>
      </div>

      <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-sm items-center justify-center min-h-[250px]">
        <Sliders size={32} className="text-text-muted/40" />
        <span className="font-mono text-sm text-text-muted mt-2">Configuration Skeletons Loaded</span>
      </div>
    </div>
  );
}
