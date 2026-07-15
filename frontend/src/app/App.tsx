import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { LoginForm } from './components/LoginForm';
import { DashboardScreen } from './components/DashboardScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { EmailVerificationScreen } from './components/EmailVerificationScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { ChatPage } from './pages/Chat';
import { LandingPageWrapper } from './pages/LandingPage';
import { AuthLayout } from './components/AuthLayout';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';

type Screen = 'landing' | 'login' | 'dashboard' | 'forgotPassword' | 'signUp' | 'emailVerification' | 'resetPassword' | 'chat';

function MainApp() {
  const { user, loading, logout, isRecoveryMode } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userEmail] = useState<string>('');
  const [entryMode, setEntryMode] = useState<'login' | 'signup' | null>(null);

  // Apply saved font size preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('fontSizePreference') || 'medium';
    document.documentElement.setAttribute('data-font-size', saved);
  }, []);

  // Restore session on refresh, but not during password recovery.
  // AuthContext's onAuthStateChange fires on every Supabase auth event — including
  // TOKEN_REFRESHED, which Supabase does periodically in the background — and hands
  // back a new `user` object each time even though it's the same logical user. Keying
  // this effect on `user` alone re-ran it on those refreshes and forced the screen back
  // to 'dashboard' mid-session, kicking users out of Chat/Settings/whatever they were
  // doing. Track the last user id we've already navigated for so this only fires on an
  // actual sign-in/session-restore transition, not a token refresh of the same user.
  const lastHandledUserId = useRef<string | null>(null);
  useEffect(() => {
    if (isRecoveryMode) {
      setCurrentScreen('resetPassword');
      return;
    }
    if (loading) return;
    const userId = user?.id ?? null;
    if (userId && userId !== lastHandledUserId.current) {
      lastHandledUserId.current = userId;
      setCurrentScreen('dashboard');
    } else if (!userId) {
      lastHandledUserId.current = null;
    }
  }, [loading, user, isRecoveryMode]);

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="bg-[#141414] min-h-screen w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleLoginSuccess = () => {
    setEntryMode('login');
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await logout();
    setEntryMode(null);
    setCurrentScreen('landing');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const handleSignUp = () => {
    setCurrentScreen('signUp');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  const handleSignUpSuccess = () => {
    setEntryMode('signup');
    setCurrentScreen('dashboard');
  };

  const handleForgotPasswordSuccess = (_email: string) => {
    // Success state is handled inside ForgotPasswordForm
  };

  const handleEmailVerificationSuccess = () => {
    setCurrentScreen('resetPassword');
  };

  const handleResetPasswordSuccess = () => {
    setCurrentScreen('login');
  };

  const handleGoToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleGoToChat = () => {
    setCurrentScreen('chat');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  const pageTransition = {
    duration: 0.3,
    ease: "easeInOut" as const,
  };

  return (
    <div className="bg-[#141414] min-h-screen w-full">
      <Toaster position="top-center" theme="dark" closeButton />
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && (
          <motion.div
            key="landing"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <LandingPageWrapper onLogin={handleGoToLogin} onSignUp={handleSignUp} />
          </motion.div>
        )}

        {currentScreen === 'login' && (
          <motion.div
            key="login"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <AuthLayout onClose={handleBackToLanding}>
              <LoginForm
                onSuccess={handleLoginSuccess}
                onForgotPassword={handleForgotPassword}
                onSignUp={handleSignUp}
              />
            </AuthLayout>
          </motion.div>
        )}


        {currentScreen === 'signUp' && (
          <motion.div
            key="signUp"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <SignUpScreen onBack={handleBackToLogin} onSuccess={handleSignUpSuccess} onClose={handleBackToLanding} />
          </motion.div>
        )}

        {currentScreen === 'forgotPassword' && (
          <motion.div
            key="forgotPassword"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <ForgotPasswordScreen onBack={handleBackToLogin} onSuccess={handleForgotPasswordSuccess} />
          </motion.div>
        )}

        {currentScreen === 'emailVerification' && (
          <motion.div
            key="emailVerification"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <EmailVerificationScreen 
              onBack={handleBackToLogin} 
              onVerify={handleEmailVerificationSuccess} 
              email={userEmail}
            />
          </motion.div>
        )}

        {currentScreen === 'resetPassword' && (
          <motion.div
            key="resetPassword"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <ResetPasswordScreen onSuccess={handleResetPasswordSuccess} onBack={handleBackToLogin} />
          </motion.div>
        )}

        {currentScreen === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <DashboardScreen onLogout={handleLogout} onNavigateChat={handleGoToChat} />
          </motion.div>
        )}

        {currentScreen === 'chat' && (
          <motion.div
            key="chat"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            <ChatPage onLogout={handleLogout} entryMode={entryMode} onNavigateDashboard={handleGoToDashboard} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main app route */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}