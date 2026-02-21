import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginInput } from './LoginInput';
import { LoginButton } from './LoginButton';
import { LoginCheckbox } from './LoginCheckbox';
import { Toast } from './Toast';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

interface SignUpFormProps {
  onSuccess: () => void;
  onLogin: () => void;
  onGoogleSignUp: () => void;
  onAppleSignUp: () => void;
}

export function SignUpForm({
  onSuccess,
  onLogin,
  onGoogleSignUp,
  onAppleSignUp,
}: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      agreeToTerms: false,
    },
  });

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Sign up data:', data);
    onSuccess();
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGoogleLoading(false);
    onGoogleSignUp();
  };

  const handleAppleSignUp = () => {
    // Show Coming Soon feedback as a toast
    setShowComingSoon(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">Create an account</h2>
        <p className="text-[#999] text-base font-normal">Experience explainability like never before!</p>
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

        <LoginButton
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
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

      <p className="text-center text-sm text-[#999] mt-2">
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
