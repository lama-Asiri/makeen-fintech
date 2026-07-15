import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { Toast } from '@/app/components/Toast';

interface EnterpriseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnterpriseContactModal({ isOpen, onClose }: EnterpriseContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data
    console.log('Enterprise inquiry submitted:', formData);

    // Close modal immediately
    onClose();

    // Show toast after modal closes
    setTimeout(() => {
      setShowSuccessToast(true);
    }, 200);

    // Reset form after modal animation completes
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        company: '',
        message: ''
      });
    }, 500);
  };

  return (
    <>
      {isOpen && (
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
            aria-labelledby="enterprise-contact-title"
            className="relative bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-full max-w-[520px] z-[201]"
          >
            {/* Header */}
            <div className="px-[28px] pt-[26px] pb-[20px]">
              <div className="flex items-start justify-between gap-[16px]">
                <div>
                  <p className="text-[#7760bd] text-[11px] font-sans font-semibold uppercase tracking-[0.2em] mb-[10px]">
                    Enterprise
                  </p>
                  <h2
                    id="enterprise-contact-title"
                    className="font-sans font-bold text-[1.25rem] text-[#fffcfe]"
                  >
                    Contact Us - Enterprise Plan
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#9e9e9e] hover:text-[#fffcfe] transition-colors p-2 -mr-2 -mt-1 rounded-lg hover:bg-[#3a3a3a] active:bg-[#444] focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
                  aria-label="Close modal"
                >
                  <X className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>

            <div className="h-px bg-white/[0.08]" />

            {/* Content */}
            <form onSubmit={handleSubmit} className="px-[28px] py-[26px]">
              <p className="font-sans text-[0.875rem] text-[#9e9e9e] mb-[28px] leading-[1.6]">
                Interested in our Enterprise plan? Fill out the form below and our team will get in touch with you shortly.
              </p>

              <div className="flex flex-col gap-[22px]">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
                  >
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent text-[#fffcfe] px-0 py-[10px] border-0 border-b border-[rgba(255,255,255,0.14)] focus:outline-none focus:border-[#7760bd] transition-colors font-sans text-[0.9375rem]"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
                  >
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent text-[#fffcfe] px-0 py-[10px] border-0 border-b border-[rgba(255,255,255,0.14)] focus:outline-none focus:border-[#7760bd] transition-colors font-sans text-[0.9375rem]"
                    placeholder="your.email@company.com"
                  />
                </div>

                {/* Company Field */}
                <div>
                  <label
                    htmlFor="contact-company"
                    className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
                  >
                    Company *
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-transparent text-[#fffcfe] px-0 py-[10px] border-0 border-b border-[rgba(255,255,255,0.14)] focus:outline-none focus:border-[#7760bd] transition-colors font-sans text-[0.9375rem]"
                    placeholder="Your company name"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent text-[#fffcfe] rounded-[8px] px-[14px] py-[12px] border border-[rgba(255,255,255,0.14)] focus:outline-none focus:border-[#7760bd] transition-colors font-sans text-[0.9375rem] resize-none"
                    placeholder="Tell us about your needs..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-[12px] mt-[32px]">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-white/20 text-white/80 rounded-full px-[20px] py-[12px] font-sans font-semibold text-[13px] uppercase tracking-[0.08em] hover:text-[#7760bd] hover:border-[#7760bd]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7760bd] text-[#141414] rounded-full px-[20px] py-[12px] font-sans font-semibold text-[13px] uppercase tracking-[0.08em] hover:bg-[#8a75d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Success Toast - renders independently of modal state */}
      {showSuccessToast && (
        <Toast
          message="Inquiry sent successfully"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
}
