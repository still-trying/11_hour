import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';

export default function LandingPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-sys-md text-center">
      <div className="flex flex-col items-center gap-sys-sm max-w-2xl">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sys-full text-xs font-mono font-medium bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
          <Sparkles size={12} />
          <span>Vibe2Ship Entrypoint</span>
        </span>
        <h1 className="font-display text-xxxl sm:text-xxxxl font-bold tracking-tight text-text-primary">
          11_HOUR
        </h1>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed">
          An execution intelligence platform designed to absorb cognitive anxiety and rescue last-minute deadlines. 
          By decomposing complex objectives into high-focus, single-step execution blocks.
        </p>
        <button
          id="landing-cta-btn"
          onClick={() => navigate(ROUTES.AUTH)}
          className="mt-sys-md inline-flex items-center gap-2 px-6 py-3 rounded-sys-lg bg-accent-amber text-black hover:bg-accent-amber/90 font-medium transition-all duration-150 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
        >
          <span>Get Started</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
