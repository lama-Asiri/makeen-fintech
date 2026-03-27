import { SignUpForm } from './SignUpForm';
import { AuthLayout } from './AuthLayout';

interface SignUpScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onClose: () => void;
}

export function SignUpScreen({ onBack, onClose }: SignUpScreenProps) {
  return (
    <AuthLayout onClose={onClose}>
      <SignUpForm
        onLogin={onBack}
      />
    </AuthLayout>
  );
}
