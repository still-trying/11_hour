import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage(): React.JSX.Element {

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <LayoutDashboard size={14} className="text-accent-amber" />
          <span>WORKSPACE DIRECTORY</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Workspace Dashboard
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Observe and manage active crunch tasks and performance analytics. Fully interactive collections 
          and subcollection queries will be integrated during the Workspace Dashboard (Slice 2).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-sys-md">
        {[
          { title: 'Active Timelines', value: '0', status: 'Inactive', color: 'text-text-muted' },
          { title: 'Focus Streak', value: '0 Days', status: 'Locked', color: 'text-text-muted' },
          { title: 'Total Rescued', value: '0 Tasks', status: 'Empty', color: 'text-text-muted' },
        ].map((stat, i) => (
          <div key={i} className="p-sys-md bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-xs">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">{stat.title}</span>
            <span className="text-xxl font-semibold font-mono text-text-primary">{stat.value}</span>
            <span className={`text-[10px] font-mono ${stat.color}`}>{stat.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
