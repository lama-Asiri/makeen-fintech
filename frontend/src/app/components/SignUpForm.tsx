import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginInput } from './LoginInput';
import { LoginButton } from './LoginButton';
import { LoginCheckbox } from './LoginCheckbox';
import { Toast } from './Toast';
import { supabase } from '../../lib/supabase';

interface SignUpFormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface SignUpFormProps {
  onLogin: () => void;
}

export function SignUpForm({
  onLogin,
}: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    setErrorMessage(null);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        username: data.username,
        full_name: data.fullName,
      }),
    });

    if (!res.ok) {
      const { detail } = await res.json();
      setErrorMessage(detail);
      return;
    }

    setVerificationSent(true);
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    setIsGoogleLoading(false);
  };

  const handleAppleSignUp = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="font-serif font-medium text-3xl text-white tracking-tight">Create an account</h2>
        <p className="text-[#9e9e9e] text-base font-normal">Experience explainability like never before!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <LoginInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register('fullName', {
            required: 'Full name is required.',
          })}
        />

        <LoginInput
          label="Username"
          type="text"
          placeholder="johndoe"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username is required.',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters.',
            },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Username can only contain letters, numbers, and underscores.',
            },
          })}
        />

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
            validate: (value) => {
              const hasUpperCase = /[A-Z]/.test(value);
              const hasLowerCase = /[a-z]/.test(value);
              const hasNumber = /[0-9]/.test(value);
              const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

              if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
                return 'Include uppercase, lowercase, number, and special character.';
              }
              return true;
            },
          })}
        />

        <LoginInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          showPasswordToggle
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password.',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match.',
          })}
        />

        <div className="mt-2">
          <LoginCheckbox
            label="I agree to the Terms of Service and Privacy Policy"
            id="agree-terms"
            {...register('agreeToTerms', {
              required: 'You must agree to the terms.',
            })}
          />
          {errors.agreeToTerms && (
            <p className="text-red-400 text-xs mt-1">{errors.agreeToTerms.message}</p>
          )}
        </div>

        {errorMessage && (
          <p className="text-red-400 text-sm">{errorMessage}</p>
        )}

        {verificationSent && (
          <p className="text-green-400 text-sm">
            Account created! Check your email and click the verification link before signing in.
          </p>
        )}

        <LoginButton
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          disabled={verificationSent}
          className="mt-4"
        >
          Create account
        </LoginButton>
      </form>

      <div className="flex items-center gap-4 py-2">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-xs font-medium text-[#666] uppercase tracking-widest">Or sign up with</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LoginButton
          variant="google"
          type="button"
          onClick={handleGoogleSignUp}
          isLoading={isGoogleLoading}
        >
          Google
        </LoginButton>
        <LoginButton
          variant="apple"
          type="button"
          onClick={handleAppleSignUp}
          isLoading={isAppleLoading}
        >
          Apple
        </LoginButton>
      </div>

      <p className="text-center text-sm text-[#9e9e9e] mt-2">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onLogin}
          className="font-semibold text-[#7760bd] hover:text-[#8b7dd8] transition-colors hover:underline focus:outline-none"
        >
          Sign in instead
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
