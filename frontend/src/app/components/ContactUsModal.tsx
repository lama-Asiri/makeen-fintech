import { X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { trackEvent } from '@/utils/analytics';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
}

export function ContactUsModal({ isOpen, onClose, onSuccess, userEmail }: ContactUsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [subjectError, setSubjectError] = useState('');
  const [messageError, setMessageError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setMessage('');
      setEmail(userEmail || '');
      setSubjectError('');
      setMessageError('');
    }
  }, [isOpen, userEmail]);

  // Handle Esc key
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

  const handleSend = () => {
    let isValid = true;

    // Validate subject
    if (!subject.trim()) {
      setSubjectError('Subject is required.');
      isValid = false;
    } else {
      setSubjectError('');
    }

    // Validate message
    if (!message.trim()) {
      setMessageError('Message is required.');
      isValid = false;
    } else {
      setMessageError('');
    }

    if (!isValid) return;

    // Track event
    trackEvent('contact_submitted', {});

    // Mock send (demo)
    onSuccess();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,252,254,0.1)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-[90%] max-w-[520px] z-[101]"
      >
        {/* Header */}
        <div className="bg-[#2c2c2c] border-b border-[rgba(255,252,254,0.1)] px-[24px] py-[20px] flex items-center justify-between rounded-t-[16px]">
          <h2
            id="contact-modal-title"
            className="font-['Roboto:Bold',sans-serif] font-bold text-[1.25rem] text-[#fffcfe]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Contact us
          </h2>
          <button
            onClick={onClose}
            className="text-[#999] hover:text-[#fffcfe] transition-colors p-2 -mr-2 rounded-lg hover:bg-[#333] active:bg-[#3a3a3a]"
            aria-label="Close modal"
          >
            <X className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-[24px] py-[24px]">
          <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999] mb-[20px]">
            Send us your question and we'll get back to you.
          </p>

          {/* Email Field (Optional) */}
          <div className="mb-[16px]">
            <label
              htmlFor="contact-email"
              className="block font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#fffcfe] mb-[8px]"
            >
              Email <span className="text-[#666]">(optional)</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full bg-[#1a1a1a] border border-[rgba(255,252,254,0.15)] rounded-[8px] px-[12px] py-[10px] font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe] placeholder:text-[#666] focus:outline-none focus:border-[#7760bd] focus:shadow-[0_0_0_3px_rgba(119,96,189,0.1)] transition-all"
            />
          </div>

          {/* Subject Field */}
          <div className="mb-[16px]">
            <label
              htmlFor="contact-subject"
              className="block font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#fffcfe] mb-[8px]"
            >
              Subject <span className="text-[#dc2626]">*</span>
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (subjectError) setSubjectError('');
              }}
              placeholder="What can we help you with?"
              className={`w-full bg-[#1a1a1a] border rounded-[8px] px-[12px] py-[10px] font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe] placeholder:text-[#666] focus:outline-none transition-all ${
                subjectError
                  ? 'border-[#dc2626] focus:border-[#dc2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                  : 'border-[rgba(255,252,254,0.15)] focus:border-[#7760bd] focus:shadow-[0_0_0_3px_rgba(119,96,189,0.1)]'
              }`}
            />
            {subjectError && (
              <p className="mt-[6px] font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#dc2626]">
                {subjectError}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="mb-[24px]">
            <label
              htmlFor="contact-message"
              className="block font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#fffcfe] mb-[8px]"
            >
              Message <span className="text-[#dc2626]">*</span>
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (messageError) setMessageError('');
              }}
              placeholder="Describe your question or issue in detail"
              rows={6}
              className={`w-full bg-[#1a1a1a] border rounded-[8px] px-[12px] py-[10px] font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe] placeholder:text-[#666] focus:outline-none transition-all resize-none ${
                messageError
                  ? 'border-[#dc2626] focus:border-[#dc2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                  : 'border-[rgba(255,252,254,0.15)] focus:border-[#7760bd] focus:shadow-[0_0_0_3px_rgba(119,96,189,0.1)]'
              }`}
            />
            {messageError && (
              <p className="mt-[6px] font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#dc2626]">
                {messageError}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-[12px]">
            <button
              onClick={onClose}
              className="px-[20px] py-[10px] font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#fffcfe] bg-[#1a1a1a] hover:bg-[#242424] active:bg-[#2a2a2a] border border-[rgba(255,252,254,0.15)] rounded-[8px] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-[20px] py-[10px] font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#fffcfe] bg-[#7760bd] hover:bg-[#6952a8] active:bg-[#5b4691] rounded-[8px] transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}