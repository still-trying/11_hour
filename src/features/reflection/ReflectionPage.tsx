import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function ReflectionPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Award size={14} className="text-accent-emerald" />
          <span>COGNITIVE RETROSPECTIVE // ID: {id || 'CURRENT'}</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Reflection Summary
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Celebrate deadline completion and review timeline efficiencies. Graphic vector cards and PNG summaries 
          will be compiled during the Reflection & Victory Card (Slice 6).
        </p>
      </div>

      <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-sm items-center justify-center min-h-[250px]">
        <Sparkles size={32} className="text-text-muted/40 animate-pulse" />
        <span className="font-mono text-sm text-text-muted mt-2">Retrospective Skeletons Loaded</span>
      </div>
    </div>
  );
}
