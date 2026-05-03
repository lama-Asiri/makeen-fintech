import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function ComingSoonModal({ 
  isOpen, 
  onClose,
  title = "Coming Soon",
  message = "Subscriptions are planned for a future release. Your current plan is Free."
}: ComingSoonModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center px-[16px]"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
          className="relative bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,252,254,0.1)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-full max-w-[440px] z-[201]"
        >
          {/* Header */}
          <div className="border-b border-[rgba(255,252,254,0.1)] px-[24px] py-[20px] flex items-center justify-between">
            <h2
              id="coming-soon-title"
              className="font-['Roboto:Bold',sans-serif] font-bold text-[1.25rem] text-[#fffcfe]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#999] hover:text-[#fffcfe] transition-colors p-2 -mr-2 rounded-lg hover:bg-[#333] active:bg-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
              aria-label="Close modal"
            >
              <X className="w-[20px] h-[20px]" />
            </button>
          </div>

          {/* Content */}
          <div className="px-[24px] py-[24px]">
            <p className="font-['Roboto:Regular',sans-serif] text-[0.9375rem] text-[#e0e0e0] leading-[1.6]">
              {message}
            </p>
          </div>

          {/* Accent gradient line at bottom */}
          <div 
            className="h-[2px] rounded-b-[16px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #7760bd, transparent)'
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
