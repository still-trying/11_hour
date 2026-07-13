import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function RescueCreatePage(): React.JSX.Element {

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <MessageSquare size={14} className="text-accent-amber" />
          <span>REQUIREMENTS INGESTION</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Brain Dump Workspace
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Deposit unstructured notes, project syllabi, or raw developer logs. The deep requirement parsing 
          and file drop controllers will be wired up during The Brain Dump Workspace (Slice 3).
        </p>
      </div>

      <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-md">
        <div className="h-40 border-2 border-dashed border-border-muted rounded-sys-md flex flex-col items-center justify-center gap-sys-sm bg-bg-primary/20 text-center p-sys-md">
          <Sparkles size={24} className="text-border-muted animate-pulse" />
          <div>
            <p className="text-sm font-medium text-text-primary">Drag-and-Drop Requirements</p>
            <p className="text-xs text-text-muted mt-1">Upload PDF, text, or screenshots (Slice 3 feature)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
