import { useEffect } from 'react';
import imgMakeenLogo from "@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function SuccessModal({ isOpen, onClose, onLogin }: SuccessModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay with blur and dark background */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.45)]"
        style={{ backdropFilter: 'blur(6px)' }}
      />

      {/* Modal Container */}
      <div
        className="relative bg-[#2c2c2c] w-[90vw] max-w-[700px] rounded-[16px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-[40px] items-center px-[56px] py-[64px]">
          {/* Logo */}
          <div className="flex items-end justify-center gap-[8px]">
            <div className="h-[48px] w-[52px] rounded-[6px] shrink-0">
              <img
                src={imgMakeenLogo}
                alt="Makeen Logo"
                className="w-full h-full object-cover rounded-[6px]"
              />
            </div>
            <p
              className="css-4hzbpn font-sans font-semibold leading-[28px] text-[#fffcfe] text-[1.25rem] text-center"
            >
              Makeen
            </p>
          </div>

          {/* Success Icon */}
          <div className="w-[64px] h-[64px] rounded-full bg-[#08B839]/15 border border-[#08B839]/40 flex items-center justify-center">
            <svg
              className="w-[30px] h-[30px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#08B839"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          {/* Title and Description */}
          <div className="flex flex-col items-center justify-center text-center w-full gap-[10px]">
            <p
              className="css-4hzbpn font-sans font-semibold leading-[28px] text-[#fffcfe] text-[1.25rem]"
            >
              Successful password reset
            </p>
            <p
              className="css-4hzbpn font-sans font-normal leading-[24px] text-[#9e9e9e] text-[1rem]"
            >
              You can now use your new password to login to your account
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={onLogin}
            className="bg-[#7760bd] flex h-[56px] items-center justify-center px-[24px] py-[16px] rounded-full w-[300px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#8a75d4] hover:shadow-[0_8px_24px_rgba(119,96,189,0.35)] hover:scale-[1.01] active:bg-[#a8863f] focus:outline-none focus:ring-2 focus:ring-[#7760bd]/60 focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
          >
            <p className="css-ew64yg font-sans font-semibold uppercase tracking-[0.08em] text-[13px] text-[#141414] text-center">
              Login
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
