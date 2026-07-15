import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  onClose: () => void;
  autoHideDuration?: number; // in milliseconds, default 4000
}

export function Toast({ message, onClose, autoHideDuration = 4000 }: ToastProps) {
  // Auto-hide toast after specified duration
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [message, autoHideDuration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-[24px] left-1/2 -translate-x-1/2 z-[9999] animate-[slideDown_0.3s_ease-out]">
      <div 
        className="bg-[#2c2c2c] border border-[#7760bd] rounded-[8px] px-[24px] py-[16px] shadow-[0_4px_20px_rgba(119, 96, 189,0.4)] flex items-center gap-[12px] min-w-[400px]"
      >
        {/* Icon circle */}
        <div className="flex-shrink-0">
          <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" stroke="#7760bd" strokeWidth="2" />
            <path d="M10 6V10" stroke="#7760bd" strokeLinecap="round" strokeWidth="2" />
            <circle cx="10" cy="14" r="1" fill="#7760bd" />
          </svg>
        </div>
        
        {/* Message */}
        <p className="font-sans text-[1rem] text-white flex-1">
          {message}
        </p>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-[#3a3a3a] rounded-[4px] p-[4px] transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
            <path d="M12 4L4 12M4 4L12 12" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}