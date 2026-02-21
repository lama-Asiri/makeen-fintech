import { SignUpForm } from './SignUpForm';
import { AuthLayout } from './AuthLayout';

interface SignUpScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onClose: () => void;
}

export function SignUpScreen({ onBack, onSuccess, onClose }: SignUpScreenProps) {
  return (
    <AuthLayout onClose={onClose}>
      <SignUpForm
        onSuccess={onSuccess}
        onLogin={onBack}
        onGoogleSignUp={onSuccess}
        onAppleSignUp={onSuccess}
      />
    </AuthLayout>
  );
}
