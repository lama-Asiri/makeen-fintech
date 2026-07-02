import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { reason: string; details: string }) => void;
  onLearnMore?: () => void;
}

const FEEDBACK_OPTIONS = [
  'Incorrect or incomplete',
  'Not what I asked for',
  'Slow or buggy',
  'Style or tone',
  'Safety or legal concern',
  'Other',
];

export function FeedbackModal({ isOpen, onClose, onSubmit, onLearnMore }: FeedbackModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason('');
      setDetails('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Focus trap - basic implementation
  useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('feedback-modal');
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement?.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if submit should be enabled
  const isSubmitEnabled = selectedReason && (selectedReason !== 'Other' || details.trim().length > 0);

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      onSubmit({ reason: selectedReason, details });
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        id="feedback-modal"
        className="bg-[#2c2c2c] rounded-[16px] w-[90vw] max-w-[770px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[28px] pt-[26px] pb-[20px] flex items-start justify-between">
          <div>
            <p className="text-[#7760bd] text-[11px] font-sans font-semibold uppercase tracking-[0.2em] mb-[10px]">
              Feedback
            </p>
            <h2 className="font-sans font-semibold text-[1.25rem] text-[#fffcfe]">
              Share feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] -mt-1 -mr-1 flex items-center justify-center rounded-[6px] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-[18px] h-[18px] text-[#9e9e9e]" />
          </button>
        </div>

        <div className="h-px bg-white/[0.08]" />

        {/* Content */}
        <div className="px-[28px] pt-[26px] pb-[28px] flex flex-col gap-[24px]">
          {/* Chip group */}
          <div className="flex flex-wrap gap-[12px]">
            {FEEDBACK_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedReason(option)}
                className={`px-[20px] h-[40px] rounded-full border transition-colors cursor-pointer font-sans font-medium text-[0.875rem] ${
                  selectedReason === option
                    ? 'bg-[#7760bd]/15 border-[#7760bd] text-[#fffcfe]'
                    : 'bg-transparent border-[rgba(255,255,255,0.14)] text-[#9e9e9e] hover:border-[rgba(255,255,255,0.3)] hover:text-[#fffcfe]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Details input */}
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Share details (optional)"
            className="w-full min-h-[100px] px-[16px] py-[12px] bg-transparent border border-[rgba(255,255,255,0.14)] rounded-[8px] text-[#fffcfe] text-[0.875rem] font-sans placeholder:text-[#6b6963] outline-none focus:border-[#7760bd]/60 transition-colors resize-none"
            rows={3}
          />

          {/* Info bar */}
          <div>
            <div className="h-px bg-white/[0.08] mb-[16px]" />
            <p className="text-[0.8125rem] text-[#9e9e9e] font-sans">
              Your conversation will be included with your feedback to help improve our service.{' '}
              <a
                href="#"
                className="text-[#7760bd] hover:text-[#8a75d4] underline transition-colors"
                onClick={(e) => { e.preventDefault(); onLearnMore?.(); }}
              >
                Learn more
              </a>
            </p>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!isSubmitEnabled}
              className={`px-[26px] h-[44px] rounded-full font-sans font-semibold text-[13px] uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                isSubmitEnabled
                  ? 'bg-[#7760bd] hover:bg-[#8a75d4] text-[#141414]'
                  : 'bg-[#3a3a3a] text-[#6b6963] cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
