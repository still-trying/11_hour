import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LogIn, ArrowLeft, Mail, Lock, ShieldAlert } from 'lucide-react';
import { AuthFormShell } from './AuthFormShell';
import { GoogleButton } from './SharedAuthComponents';

interface SignInScreenProps {
  onNavigate: (mode: 'welcome' | 'signup' | 'forgot') => void;
}

export function SignInScreen({ onNavigate }: SignInScreenProps): React.JSX.Element {
  const navigate = useNavigate();
  const { signIn, isLoading, error: storeError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!email.includes('@')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validate()) return;

    const success = await signIn(email, password);
    if (success) {
      console.info('🔄 [SignInScreen] Redirecting to protected workspace (/dashboard).');
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    // Simulate google oauth transition
    const mockAuthStore = (await import('@/stores/authStore')).useAuthStore.getState();
    mockAuthStore.signUp('google.user@example.com', 'secure_oauth_pass', 'Google User');
    navigate('/dashboard');
  };

  return (
    <Card className="flex flex-col gap-sys-lg bg-bg-secondary border border-border-muted" padding="lg">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            clearError();
            onNavigate('welcome');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-amber p-1 rounded-sys-sm"
          aria-label="Back to welcome screen"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <span className="font-mono text-[10px] text-text-muted/40 uppercase tracking-wider">
          Secure Core Sign-In
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-display font-semibold text-xl tracking-tight text-text-primary">
          Access Your Execution Hub
        </h2>
        <p className="text-xs text-text-muted">
          Provide your credentials or link instantly with Google to retrieve your active crunches.
        </p>
      </div>

      {/* Global Store Errors (Form alert presentation) */}
      {storeError && (
        <div
          role="alert"
          className="p-sys-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sys-md flex items-start gap-2.5 animate-fadeIn"
        >
          <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-500" />
          <div className="flex flex-col">
            <span className="font-semibold">Authentication Barrier</span>
            <span className="mt-0.5 leading-relaxed">{storeError}</span>
          </div>
        </div>
      )}

      {/* Auth Form Shell */}
      <AuthFormShell onSubmit={handleSubmit}>
        <div className="flex flex-col gap-sys-md">
          <Input
            label="EMAIL ADDRESS"
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (localErrors.email) setLocalErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={localErrors.email}
            disabled={isLoading}
            leftIcon={<Mail size={14} />}
            autoComplete="email"
            id="signin-email"
          />

          <div className="flex flex-col gap-1">
            <Input
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localErrors.password) setLocalErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={localErrors.password}
              disabled={isLoading}
              leftIcon={<Lock size={14} />}
              autoComplete="current-password"
              id="signin-password"
            />
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => onNavigate('forgot')}
                className="text-xs text-accent-amber hover:underline hover:text-amber-400 font-sans cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-amber rounded-sys-sm px-1 py-0.5"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-sys-sm h-11"
          leftIcon={<LogIn size={16} />}
          isLoading={isLoading}
        >
          Access Vault
        </Button>
      </AuthFormShell>

      {/* Social login divider */}
      <div className="relative flex items-center justify-center py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-muted/50" />
        </div>
        <span className="relative bg-bg-secondary px-3 font-mono text-[9px] text-text-muted/40 uppercase tracking-widest">
          or link securely via
        </span>
      </div>

      <GoogleButton onClick={handleGoogleSignIn} disabled={isLoading} />

      {/* Onboarding swap */}
      <div className="text-center mt-1">
        <p className="text-xs text-text-muted">
          Don't have an active key?{' '}
          <button
            type="button"
            onClick={() => {
              clearError();
              onNavigate('signup');
            }}
            className="text-accent-amber hover:underline hover:text-amber-400 font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-amber rounded-sys-sm px-1 py-0.5"
            disabled={isLoading}
          >
            Create Account
          </button>
        </p>
      </div>
    </Card>
  );
}

export default SignInScreen;
