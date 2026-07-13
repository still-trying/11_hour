import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { ROUTES } from './constants';

export default function NotFoundPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-sys-md text-center animate-fade-in">
      <div className="flex flex-col items-center gap-sys-md max-w-sm">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-full bg-bg-secondary border border-border-muted flex items-center justify-center shadow-lg">
          <Compass size={28} className="text-accent-amber animate-pulse" />
        </div>

        <div className="flex flex-col gap-sys-xs">
          <span className="font-mono text-xs text-accent-amber tracking-widest uppercase font-semibold">
            ERROR CODE // 404
          </span>
          <h1 className="font-display text-xxl font-bold tracking-tight text-text-primary mt-1">
            Viewport Not Mapable
          </h1>
          <p className="text-text-muted text-sm leading-relaxed mt-1">
            The coordinates you requested do not correlate with an active execution layout or routing path.
          </p>
        </div>

        <button
          onClick={() => navigate(ROUTES.LANDING)}
          className="mt-sys-md inline-flex items-center gap-2 px-5 py-2.5 rounded-sys-md bg-bg-secondary border border-border-muted hover:border-text-muted text-text-primary hover:text-text-primary text-sm font-medium transition-all duration-150 cursor-pointer"
        >
          <ArrowLeft size={16} className="text-accent-amber" />
          <span>Return to Workspace</span>
        </button>
      </div>
    </div>
  );
}
