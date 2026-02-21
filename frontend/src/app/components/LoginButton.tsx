import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';

interface LoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'google' | 'apple' | 'secondary';
  isLoading?: boolean;
}

export function LoginButton({
  children,
  variant = 'primary',
  isLoading,
  disabled,
  className = '',
  ...props
}: LoginButtonProps) {
  const baseStyles = "flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed w-full h-12 relative overflow-hidden";
  
  const variants = {
    primary: "bg-[#7760bd] text-white hover:bg-[#8b7dd8] active:scale-[0.98] disabled:bg-[#4a3c7a] disabled:opacity-50 shadow-lg shadow-[#7760bd]/20",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98] disabled:opacity-50",
    google: "bg-white text-[#333] hover:bg-[#f5f5f5] active:scale-[0.98] disabled:opacity-50 shadow-sm",
    apple: "bg-black text-white hover:bg-[#1a1a1a] active:scale-[0.98] disabled:opacity-50 border border-white/10 shadow-sm"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Please wait...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {variant === 'google' && (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {variant === 'apple' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.653 11.32c-.013-2.364 1.92-3.498 2.01-3.553-1.1-1.603-2.802-1.821-3.407-1.847-1.44-.148-2.812.848-3.543.848-.731 0-1.869-.831-3.07-.807-1.576.024-3.033.918-3.845 2.327-1.638 2.843-.418 7.039 1.166 9.331.776 1.119 1.698 2.375 2.913 2.33 1.17-.044 1.613-.755 3.027-.755s1.81.755 3.048.733c1.258-.023 2.06-1.133 2.829-2.257.889-1.3 1.256-2.557 1.278-2.624-.027-.012-2.453-.941-2.478-3.733zM15.326 4.718c.646-.782 1.088-1.871.97-2.959-.933.038-2.067.623-2.737 1.405-.6.698-1.077 1.811-.935 2.875 1.045.081 2.061-.543 2.702-1.321z" />
            </svg>
          )}
          <span className="text-base">{children || variant.charAt(0).toUpperCase() + variant.slice(1)}</span>
        </div>
      )}
    </motion.button>
  );
}
