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
            className="relative bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,252,254,0.1)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-full max-w-[520px] z-[201]"
          >
            {/* Header */}
            <div className="border-b border-[rgba(255,252,254,0.1)] px-[24px] py-[20px] flex items-center justify-between">
              <h2
                id="enterprise-contact-title"
                className="font-['Roboto:Bold',sans-serif] font-bold text-[1.25rem] text-[#fffcfe]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Contact Us - Enterprise Plan
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
            <form onSubmit={handleSubmit} className="px-[24px] py-[24px]">
              <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#b0b0b0] mb-[20px] leading-[1.6]">
                Interested in our Enterprise plan? Fill out the form below and our team will get in touch with you shortly.
              </p>

              <div className="space-y-[16px]">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#e0e0e0] mb-[6px]"
                  >
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#333] text-white rounded-[8px] px-[14px] py-[10px] border border-[#555] focus:outline-none focus:border-[#7760bd] focus:ring-1 focus:ring-[#7760bd] transition-colors font-['Roboto:Regular',sans-serif] text-[0.875rem]"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#e0e0e0] mb-[6px]"
                  >
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#333] text-white rounded-[8px] px-[14px] py-[10px] border border-[#555] focus:outline-none focus:border-[#7760bd] focus:ring-1 focus:ring-[#7760bd] transition-colors font-['Roboto:Regular',sans-serif] text-[0.875rem]"
                    placeholder="your.email@company.com"
                  />
                </div>

                {/* Company Field */}
                <div>
                  <label
                    htmlFor="contact-company"
                    className="block font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#e0e0e0] mb-[6px]"
                  >
                    Company *
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#333] text-white rounded-[8px] px-[14px] py-[10px] border border-[#555] focus:outline-none focus:border-[#7760bd] focus:ring-1 focus:ring-[#7760bd] transition-colors font-['Roboto:Regular',sans-serif] text-[0.875rem]"
                    placeholder="Your company name"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#e0e0e0] mb-[6px]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#333] text-white rounded-[8px] px-[14px] py-[10px] border border-[#555] focus:outline-none focus:border-[#7760bd] focus:ring-1 focus:ring-[#7760bd] transition-colors font-['Roboto:Regular',sans-serif] text-[0.875rem] resize-none"
                    placeholder="Tell us about your needs..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-[12px] mt-[24px]">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-[#7760bd] text-[#7760bd] rounded-[10px] px-[20px] py-[12px] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.875rem] hover:bg-[#7760bd]/10 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7760bd] text-white rounded-[10px] px-[20px] py-[12px] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.875rem] hover:bg-[#8870cd] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
                >
                  Send Inquiry
                </button>
              </div>
            </form>

            {/* Accent gradient line at bottom */}
            <div 
              className="h-[2px] rounded-b-[16px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #7760bd, transparent)'
              }}
            />
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