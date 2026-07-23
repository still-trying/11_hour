import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '@/theme/ThemeContext';
import { AuthHeader } from './components/AuthHeader';
import { AuthFooter } from './components/AuthFooter';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignInScreen } from './components/SignInScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { AuthIllustrationContainer } from './components/AuthIllustrationContainer';

type ScreenMode = 'welcome' | 'signin' | 'signup' | 'forgot';

export default function AuthPage(): React.JSX.Element {
  const { reducedMotion } = useTheme();
  const [mode, setMode] = useState<ScreenMode>('welcome');

  // Stagger parameters for entry animations
  const fadeTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: 'easeInOut' as const };

  return (
    <div className="flex w-full items-center justify-center min-h-[calc(100vh-140px)] py-sys-lg">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-sys-xl items-stretch max-w-6xl">
        {/* Left Form Pane (5 cols on lg) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-between gap-sys-lg min-h-[500px]">
          {/* Top header branding */}
          <AuthHeader />

          {/* Form screen switches with AnimatePresence */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {mode === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                  transition={fadeTransition}
                  className="w-full"
                >
                  <WelcomeScreen onNavigate={(next) => setMode(next)} />
                </motion.div>
              )}

              {mode === 'signin' && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                  transition={fadeTransition}
                  className="w-full"
                >
                  <SignInScreen onNavigate={(next) => setMode(next)} />
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                  transition={fadeTransition}
                  className="w-full"
                >
                  <SignUpScreen onNavigate={(next) => setMode(next)} />
                </motion.div>
              )}

              {mode === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                  transition={fadeTransition}
                  className="w-full"
                >
                  <ForgotPasswordScreen onNavigate={(next) => setMode(next)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer details */}
          <AuthFooter />
        </div>

        {/* Right Illustration Pane (7 cols on lg, hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:col-span-7 h-full items-stretch">
          <AuthIllustrationContainer />
        </div>
      </div>
    </div>
  );
}
