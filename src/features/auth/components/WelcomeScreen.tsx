import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LogIn, UserPlus, Sparkles, ShieldAlert } from 'lucide-react';

interface WelcomeScreenProps {
  onNavigate: (mode: 'signin' | 'signup') => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps): React.JSX.Element {
  return (
    <Card className="flex flex-col gap-sys-lg bg-bg-secondary border border-border-muted" padding="lg">
      {/* Dynamic cortisol rescue header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sys-full bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-[10px] font-mono tracking-wider uppercase w-fit">
          <Sparkles size={10} />
          Active Cognitive Relief
        </div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-text-primary mt-1">
          Breathe in. We've got you.
        </h1>
        <p className="text-sm text-text-muted leading-relaxed font-sans mt-1">
          Friction is the enemy, momentum is the cure. Under looming deadlines, 11_HOUR shields you from planning paralysis by turning unstructured panic into immediate, bite-sized starts.
        </p>
      </div>

      {/* Structured core values list */}
      <div className="flex flex-col gap-sys-sm border-y border-border-muted/50 py-sys-md">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-bg-primary rounded-sys-md border border-border-muted text-accent-amber shrink-0 mt-0.5">
            <ShieldAlert size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-primary">
              Immediate Cortisol Reduction
            </span>
            <span className="text-[11px] text-text-muted leading-normal mt-0.5">
              No task managers, folders, or tagging circles. Just throw in your raw requirements and execute.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-bg-primary rounded-sys-md border border-border-muted text-accent-blue shrink-0 mt-0.5">
            <Sparkles size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-primary">
              AI Decomposition Companion
            </span>
            <span className="text-[11px] text-text-muted leading-normal mt-0.5">
              Our specialized prompt execution models generate linear timelines with built-in buffer times.
            </span>
          </div>
        </div>
      </div>

      {/* Main visual triggers */}
      <div className="flex flex-col sm:flex-row items-center gap-sys-md w-full">
        <Button
          variant="primary"
          className="w-full sm:flex-1 h-11"
          leftIcon={<LogIn size={16} />}
          onClick={() => onNavigate('signin')}
        >
          Sign In
        </Button>
        <Button
          variant="secondary"
          className="w-full sm:flex-1 h-11"
          leftIcon={<UserPlus size={16} />}
          onClick={() => onNavigate('signup')}
        >
          Create Account
        </Button>
      </div>
    </Card>
  );
}

export default WelcomeScreen;
