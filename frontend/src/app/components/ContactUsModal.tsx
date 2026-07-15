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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-[90%] max-w-[520px] z-[101]"
      >
        {/* Header */}
        <div className="px-[28px] pt-[26px] pb-[20px]">
          <div className="flex items-start justify-between gap-[16px]">
            <div>
              <p className="text-[#7760bd] text-[11px] font-sans font-semibold uppercase tracking-[0.2em] mb-[10px]">
                Support
              </p>
              <h2
                id="contact-modal-title"
                className="font-sans font-bold text-[1.25rem] text-[#fffcfe]"
              >
                Contact us
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#9e9e9e] hover:text-[#fffcfe] transition-colors p-2 -mr-2 -mt-1 rounded-lg hover:bg-[#3a3a3a] active:bg-[#444]"
              aria-label="Close modal"
            >
              <X className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        {/* Content */}
        <div className="px-[28px] py-[26px]">
          <p className="font-sans text-[0.875rem] text-[#9e9e9e] mb-[28px]">
            Send us your question and we'll get back to you.
          </p>

          <div className="flex flex-col gap-[24px]">
            {/* Email Field (Optional) */}
            <div>
              <label
                htmlFor="contact-email"
                className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
              >
                Email <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-transparent border-0 border-b border-[rgba(255,255,255,0.14)] px-0 py-[10px] font-sans text-[0.9375rem] text-[#fffcfe] placeholder:text-[#6b6963] focus:outline-none focus:border-[#7760bd] transition-colors"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor="contact-subject"
                className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
              >
                Subject <span className="text-[#e05a5a]">*</span>
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
                className={`w-full bg-transparent border-0 border-b px-0 py-[10px] font-sans text-[0.9375rem] text-[#fffcfe] placeholder:text-[#6b6963] focus:outline-none transition-colors ${
                  subjectError
                    ? 'border-[#e05a5a] focus:border-[#e05a5a]'
                    : 'border-[rgba(255,255,255,0.14)] focus:border-[#7760bd]'
                }`}
              />
              {subjectError && (
                <p className="mt-[8px] font-sans text-[0.8125rem] text-[#e05a5a]">
                  {subjectError}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="contact-message"
                className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]"
              >
                Message <span className="text-[#e05a5a]">*</span>
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
                className={`w-full bg-transparent border rounded-[8px] px-[14px] py-[12px] font-sans text-[0.9375rem] text-[#fffcfe] placeholder:text-[#6b6963] focus:outline-none transition-colors resize-none ${
                  messageError
                    ? 'border-[#e05a5a] focus:border-[#e05a5a]'
                    : 'border-[rgba(255,255,255,0.14)] focus:border-[#7760bd]'
                }`}
              />
              {messageError && (
                <p className="mt-[8px] font-sans text-[0.8125rem] text-[#e05a5a]">
                  {messageError}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-[12px] mt-[32px]">
            <button
              onClick={onClose}
              className="px-[22px] py-[11px] font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-white/80 bg-transparent hover:text-[#7760bd] border border-white/20 hover:border-[#7760bd]/60 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-[26px] py-[11px] font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-[#141414] bg-[#7760bd] hover:bg-[#8a75d4] rounded-full transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
