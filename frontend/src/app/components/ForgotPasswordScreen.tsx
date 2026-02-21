import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthLayout } from './AuthLayout';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSuccess?: (email: string) => void;
}

export function ForgotPasswordScreen({ onBack, onSuccess }: ForgotPasswordScreenProps) {
  return (
    <AuthLayout onClose={onBack}>
      <ForgotPasswordForm onBack={onBack} onSuccess={onSuccess} />
    </AuthLayout>
  );
}
