import React from 'react';
import { BarChart2, Activity } from 'lucide-react';

export default function AnalyticsPage(): React.JSX.Element {

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <BarChart2 size={14} className="text-accent-amber" />
          <span>PERFORMANCE JOURNAL</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Analytics Hub
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Observe historic focus metrics, streak values, and cognitive efficiencies over time. Analytical 
          charts and streak writers will be integrated during the Analytics Hub (Slice 7).
        </p>
      </div>

      <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-sm items-center justify-center min-h-[250px]">
        <Activity size={32} className="text-text-muted/40" />
        <span className="font-mono text-sm text-text-muted mt-2">Analytical Skeletons Loaded</span>
      </div>
    </div>
  );
}
