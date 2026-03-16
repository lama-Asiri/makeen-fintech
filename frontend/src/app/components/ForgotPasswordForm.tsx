import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail } from 'lucide-react';
import { LoginInput } from './LoginInput';
import { LoginButton } from './LoginButton';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess?: (email: string) => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      console.error('Forgot password error:', detail);
      return;
    }
    setSentToEmail(data.email);
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-6 w-full text-center">
        <div className="w-16 h-16 bg-[#7760bd]/10 rounded-2xl flex items-center justify-center border border-[#7760bd]/20">
          <Mail className="w-8 h-8 text-[#7760bd]" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Check your email</h2>
          <p className="text-[#999] text-base">
            We sent a password reset link to <span className="text-white font-medium">{sentToEmail}</span>.
            Click the link in the email to set a new password.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-sm font-medium text-[#999] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to log in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Forgot password?</h2>
        <p className="text-[#999] text-base font-normal">No worries, we'll send you reset instructions.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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

        <LoginButton variant="primary" type="submit" isLoading={isSubmitting}>
          Reset password
        </LoginButton>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-sm font-medium text-[#999] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to log in
        </button>
      </form>
    </div>
  );
}
