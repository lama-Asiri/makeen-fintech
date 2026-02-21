import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { LoginInput } from './LoginInput';
import { LoginButton } from './LoginButton';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess?: (email: string) => void;
}

export function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Reset password for:', data.email);
    
    // Navigate immediately to email verification
    if (onSuccess) {
      onSuccess(data.email);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Forgot password?</h2>
        <p className="text-[#999] text-base font-normal">No worries, we'll send you reset instructions.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
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

        <LoginButton
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
        >
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
