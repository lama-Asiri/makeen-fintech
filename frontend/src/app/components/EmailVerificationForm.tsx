import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { OTPInput, SlotProps } from 'input-otp';
import { LoginButton } from './LoginButton';
import { toast } from 'sonner';

interface EmailVerificationFormProps {
  onBack: () => void;
  onVerify?: (code: string) => void;
  email?: string;
}

function Slot(props: SlotProps) {
  return (
    <div
      className={`
        relative w-16 h-20 
        bg-white/5 
        border border-white/10 
        rounded-xl 
        flex items-center justify-center
        transition-all duration-200
        ${props.isActive ? 'border-[#7760bd] ring-4 ring-[#7760bd]/10' : ''}
      `}
    >
      <div className="text-white font-serif font-medium text-3xl">
        {props.char !== null && <div>{props.char}</div>}
        {props.char === null && props.hasFakeCaret && <FakeCaret />}
      </div>
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="animate-caret-blink w-[2px] h-[30px] bg-[#7760bd]" />
  );
}

export function EmailVerificationForm({ onBack, onVerify, email }: EmailVerificationFormProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    // Navigate to Reset Password immediately
    if (onVerify) {
      onVerify(otp);
    }
  };

  const handleResend = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOtp('');
    toast.success("Verification code resent", {
      description: `A new 4-digit code has been sent to ${email || 'your email'}.`
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4 text-center">
        <div className="w-16 h-16 bg-[#7760bd]/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#7760bd]/20">
          <Mail className="w-8 h-8 text-[#7760bd]" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-serif font-medium text-3xl text-white tracking-tight">Check your email</h2>
          <p className="text-[#9e9e9e] text-base font-normal max-w-sm mx-auto">
            We sent a verification code to <span className="text-white font-medium">{email || 'your email'}</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 items-center">
        <OTPInput
          value={otp}
          onChange={setOtp}
          maxLength={4}
          render={({ slots }) => (
            <div className="flex gap-4">
              {slots.map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          )}
        />

        <div className="w-full flex flex-col gap-4 mt-4">
          <LoginButton
            variant="primary"
            type="button"
            onClick={handleVerify}
            isLoading={isLoading}
            disabled={otp.length !== 4}
          >
            Verify code
          </LoginButton>

          <div className="flex flex-col gap-4 items-center">
            <p className="text-sm text-[#9e9e9e]">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-[#7760bd] hover:text-[#8b7dd8] transition-colors hover:underline focus:outline-none"
              >
                Resend code
              </button>
            </p>

            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-[#9e9e9e] hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
