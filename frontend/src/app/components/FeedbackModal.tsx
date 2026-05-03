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
        className="bg-[#2c2c2c] rounded-[16px] w-[90vw] max-w-[770px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.5)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] pb-[16px]">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[1.25rem] text-white">
            Share feedback
          </h2>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-[18px] h-[18px] text-[#B0B0B0]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-[24px] pb-[24px] flex flex-col gap-[20px]">
          {/* Chip group */}
          <div className="flex flex-wrap gap-[12px]">
            {FEEDBACK_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedReason(option)}
                className={`px-[20px] h-[40px] rounded-full border transition-all cursor-pointer font-['Inter:Semi_Bold',sans-serif] font-medium text-[0.875rem] ${
                  selectedReason === option
                    ? 'bg-[#7760bd]/20 border-[#7760bd] text-white'
                    : 'bg-transparent border-white/20 text-[#B0B0B0] hover:bg-[#3a3a3a] hover:border-white/30'
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
            className="w-full min-h-[100px] px-[16px] py-[12px] bg-[#1a1a1a] border border-white/20 rounded-[8px] text-white text-[0.875rem] font-['Inter:Semi_Bold',sans-serif] placeholder:text-[#808080] outline-none focus:border-[#7760bd]/50 focus:ring-2 focus:ring-[#7760bd]/20 transition-all resize-none"
            rows={3}
          />

          {/* Info bar */}
          <div className="bg-[#1a1a1a] rounded-[8px] px-[16px] py-[12px]">
            <p className="text-[0.8125rem] text-[#B0B0B0] font-['Inter:Semi_Bold',sans-serif]">
              Your conversation will be included with your feedback to help improve our service.{' '}
              <a
                href="#"
                className="text-[#7760bd] hover:text-[#9580d4] underline transition-colors"
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
              className={`px-[24px] h-[44px] rounded-[8px] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.9375rem] transition-all cursor-pointer ${
                isSubmitEnabled
                  ? 'bg-[#7760bd] hover:bg-[#8970c7] text-white'
                  : 'bg-[#3a3a3a] text-[#666] cursor-not-allowed'
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
