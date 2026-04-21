import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginInput } from './LoginInput';
import { LoginButton } from './LoginButton';
import { SuccessModal } from './SuccessModal';
import { KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage('');

    // Extract tokens from URL hash if present
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }

    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await supabase.auth.signOut();
    setShowSuccessModal(true);
  };

  const handleLoginClick = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  // Check if button should be enabled
  const isButtonEnabled = password && confirmPassword && password === confirmPassword && !errors.password;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4 text-center">
        <div className="w-16 h-16 bg-[#7760bd]/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#7760bd]/20">
          <KeyRound className="w-8 h-8 text-[#7760bd]" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Set new password</h2>
          <p className="text-[#999] text-base font-normal max-w-sm mx-auto">
            Your new password must be different from previously used passwords.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <LoginInput
          label="New Password"
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
          error={
            errors.confirmPassword?.message ||
            (confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : undefined)
          }
          {...register('confirmPassword', {
            required: 'Please confirm your password.',
            validate: (value) => value === password || 'Passwords do not match.',
          })}
        />

        {errorMessage && (
          <p className="text-[#dc2626] text-sm text-center">{errorMessage}</p>
        )}

        <LoginButton
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          disabled={!isButtonEnabled}
        >
          Reset password
        </LoginButton>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onLogin={handleLoginClick}
      />
    </div>
  );
}
