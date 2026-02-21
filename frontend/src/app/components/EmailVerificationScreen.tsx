import { EmailVerificationForm } from './EmailVerificationForm';
import { AuthLayout } from './AuthLayout';

interface EmailVerificationScreenProps {
  onBack: () => void;
  onVerify?: (code: string) => void;
  email?: string;
}

export function EmailVerificationScreen({ onBack, onVerify, email }: EmailVerificationScreenProps) {
  return (
    <AuthLayout onClose={onBack}>
      <EmailVerificationForm onBack={onBack} onVerify={onVerify} email={email} />
    </AuthLayout>
  );
}
