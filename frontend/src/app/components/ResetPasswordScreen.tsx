import { ResetPasswordForm } from './ResetPasswordForm';
import { AuthLayout } from './AuthLayout';

interface ResetPasswordScreenProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function ResetPasswordScreen({ onSuccess, onBack }: ResetPasswordScreenProps) {
  return (
    <AuthLayout onClose={onBack || (() => {})}>
      <ResetPasswordForm onSuccess={onSuccess} />
    </AuthLayout>
  );
}
