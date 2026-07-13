import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AuthFormShell } from './AuthFormShell';

interface ForgotPasswordScreenProps {
  onNavigate: (mode: 'signin') => void;
}

export function ForgotPasswordScreen({ onNavigate }: ForgotPasswordScreenProps): React.JSX.Element {
  const { sendForgotPasswordReset, isLoading, error: storeError, resetSuccess, clearError, clearResetSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  // Clear states when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      clearResetSuccess();
    };
  }, [clearError, clearResetSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearResetSuccess();

    if (!email) {
      setLocalError('Email address is required.');
      return;
    } else if (!email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    await sendForgotPasswordReset(email);
  };

  if (resetSuccess) {
    return (
      <Card className="flex flex-col gap-sys-lg bg-bg-secondary border border-border-muted text-center py-sys-xl px-sys-lg" padding="lg">
        <div className="flex flex-col items-center justify-center gap-sys-md">
          <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald rounded-full animate-bounce">
            <CheckCircle2 size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display font-semibold text-xl text-text-primary tracking-tight">
              Recovery Link Sent
            </h2>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed mt-1 font-sans">
              We've dispatched a secure recovery token to <strong className="text-text-primary">{email}</strong>. Please check your inbox and spam folders.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full mt-sys-md h-11"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => {
            clearResetSuccess();
            onNavigate('signin');
          }}
        >
          Return to Sign In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-sys-lg bg-bg-secondary border border-border-muted" padding="lg">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            clearError();
            clearResetSuccess();
            onNavigate('signin');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-amber p-1 rounded-sys-sm"
          aria-label="Return to login screen"
        >
          <ArrowLeft size={14} />
          <span>Sign In</span>
        </button>
        <span className="font-mono text-[10px] text-text-muted/40 uppercase tracking-wider">
          Credential Recovery
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-display font-semibold text-xl tracking-tight text-text-primary">
          Restore Access Key
        </h2>
        <p className="text-xs text-text-muted">
          Type in your registered email below, and we will dispatch a secure link to reset your account credentials safely.
        </p>
      </div>

      {storeError && (
        <div
          role="alert"
          className="p-sys-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sys-md flex items-start gap-2.5 animate-fadeIn"
        >
          <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-500" />
          <div className="flex flex-col">
            <span className="font-semibold">Recovery Blocked</span>
            <span className="mt-0.5 leading-relaxed">{storeError}</span>
          </div>
        </div>
      )}

      <AuthFormShell onSubmit={handleSubmit}>
        <Input
          label="EMAIL ADDRESS"
          type="email"
          placeholder="name@domain.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (localError) setLocalError(undefined);
          }}
          error={localError}
          disabled={isLoading}
          leftIcon={<Mail size={14} />}
          autoComplete="email"
          id="forgot-email"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-sys-sm h-11"
          leftIcon={<Send size={14} />}
          isLoading={isLoading}
        >
          Dispatch Recovery Token
        </Button>
      </AuthFormShell>
    </Card>
  );
}

export default ForgotPasswordScreen;
