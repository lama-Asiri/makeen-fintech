import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const LoginInput = forwardRef<HTMLInputElement, LoginInputProps>(
  ({ label, error, showPasswordToggle, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-2 w-full group">
        {/* Label */}
        <label
          className={`text-sm font-medium transition-colors duration-200 ${
            error ? 'text-red-400' : isFocused ? 'text-[#7760bd]' : 'text-[#999]'
          }`}
        >
          {label}
        </label>

        {/* Input Container */}
        <div className="relative">
          <div
            className={`flex items-center rounded-xl border transition-all duration-200 overflow-hidden ${
              error
                ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                : isFocused
                ? 'border-[#7760bd]/50 bg-[#7760bd]/5 shadow-[0_0_15px_rgba(119,96,189,0.15)]'
                : 'border-white/10 bg-white/5 group-hover:border-white/20'
            }`}
          >
            <input
              ref={ref}
              type={inputType}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full h-12 px-4 bg-transparent outline-none text-white text-base placeholder:text-[#666] font-normal"
              {...props}
            />
            
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 h-full text-[#666] hover:text-white transition-colors focus:outline-none cursor-pointer flex items-center justify-center border-l border-white/5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        <div className="h-5">
          {error && (
            <p className="text-red-400 text-xs font-normal animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

LoginInput.displayName = 'LoginInput';
