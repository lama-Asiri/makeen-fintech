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
          className="relative bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-full max-w-[440px] z-[201]"
        >
          {/* Header */}
          <div className="px-[26px] pt-[24px] pb-[18px] flex items-center justify-between">
            <h2
              id="coming-soon-title"
              className="font-sans font-bold text-[1.25rem] text-[#fffcfe]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#9e9e9e] hover:text-[#fffcfe] transition-colors p-2 -mr-2 rounded-lg hover:bg-[#3a3a3a] active:bg-[#444] focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
              aria-label="Close modal"
            >
              <X className="w-[20px] h-[20px]" />
            </button>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Content */}
          <div className="px-[26px] py-[24px]">
            <p className="font-sans text-[0.9375rem] text-[#d8d6cf] leading-[1.6]">
              {message}
            </p>
          </div>

          {/* Accent line at bottom — understated, single hairline of gold */}
          <div className="h-px bg-[#7760bd]/25 rounded-b-[16px]" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
