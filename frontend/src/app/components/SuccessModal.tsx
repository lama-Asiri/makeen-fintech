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
        className="relative bg-[#262626] w-[90vw] max-w-[700px] rounded-[16px] shadow-[0px_4px_12px_rgba(0,0,0,0.4)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-[32px] items-center px-[57px] py-[55px]">
          {/* Logo + Title + Description */}
          <div className="flex flex-col gap-[16px] items-center w-full">
            {/* Logo Row */}
            <div className="flex items-end justify-center gap-[8px]">
              <div className="h-[56px] w-[60px] rounded-[6px] shrink-0">
                <img 
                  src={imgMakeenLogo} 
                  alt="Makeen Logo" 
                  className="w-full h-full object-cover rounded-[6px]"
                />
              </div>
              <p 
                className="css-4hzbpn font-['Roboto:SemiBold',sans-serif] font-semibold leading-[32px] text-[#fffcfe] text-[24px] text-center"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Makeen
              </p>
            </div>
            
            {/* Title and Description */}
            <div className="flex flex-col items-center justify-center text-center w-full">
              <p 
                className="css-4hzbpn font-['Roboto:SemiBold',sans-serif] font-semibold leading-[28px] text-white text-[20px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Successful password reset
              </p>
              <p 
                className="css-4hzbpn font-['Roboto:Regular',sans-serif] font-normal leading-[24px] text-white text-[16px] mt-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                You can now use your new password to login to your account
              </p>
            </div>
          </div>
          
          {/* Login Button */}
          <button
            onClick={onLogin}
            className="bg-[#7760bd] flex h-[56px] items-center justify-center px-[24px] py-[16px] rounded-[8px] w-[344px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#8b7dd8] hover:shadow-[0_8px_24px_rgba(119,96,189,0.4)] hover:scale-[1.01] active:bg-[#5b4692] focus:outline-none focus:ring-2 focus:ring-[#7760bd]/60 focus:ring-offset-2 focus:ring-offset-[#262626]"
          >
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] text-[16px] text-black text-center">
              Login
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
