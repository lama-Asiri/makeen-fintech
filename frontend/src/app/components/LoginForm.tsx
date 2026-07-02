import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginInput } from './LoginInput';
import { LoginButton } from './LoginButton';
import { LoginCheckbox } from './LoginCheckbox';
import { Toast } from './Toast';
import { supabase } from '../../lib/supabase';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function LoginForm({
  onSuccess,
  onForgotPassword,
  onSignUp,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!res.ok) {
      const { detail } = await res.json();
      setErrorMessage(detail);
      return;
    }

    const { access_token, refresh_token } = await res.json();
    await supabase.auth.setSession({ access_token, refresh_token });

    onSuccess();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    setIsGoogleLoading(false);
  };

  const handleAppleLogin = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif font-medium text-3xl text-white tracking-tight">Welcome back!</h2>
        <p className="text-[#9e9e9e] text-base font-normal">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <LoginInput
          label="Email address"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address.',
            },
          })}
        />

        <div className="flex flex-col gap-1">
          <LoginInput
            label="Password"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required.',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters.',
              },
            })}
          />
          <div className="flex justify-end mt-[-12px]">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-[#7760bd] hover:text-[#8b7dd8] transition-colors hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="mt-2">
          <LoginCheckbox 
            label="Keep me signed in for 30 days" 
            id="remember-me" 
            {...register('rememberMe')} 
          />
        </div>

        {errorMessage && (
          <p className="text-red-400 text-sm">{errorMessage}</p>
        )}

        <LoginButton
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          className="mt-4"
        >
          Sign in
        </LoginButton>
      </form>

      <div className="flex items-center gap-4 py-2">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-xs font-medium text-[#666] uppercase tracking-widest">Or continue with</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LoginButton
          variant="google"
          type="button"
          onClick={handleGoogleLogin}
          isLoading={isGoogleLoading}
        >
          Google
        </LoginButton>
        <LoginButton
          variant="apple"
          type="button"
          onClick={handleAppleLogin}
          isLoading={false}
        >
          Apple
        </LoginButton>
      </div>

      <p className="text-center text-sm text-[#9e9e9e] mt-2">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSignUp}
          className="font-semibold text-[#7760bd] hover:text-[#8b7dd8] transition-colors hover:underline focus:outline-none"
        >
          Create an account
        </button>
      </p>

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <Toast 
          message="Coming soon"
          onClose={() => setShowComingSoon(false)}
        />
      )}
    </div>
  );
}
