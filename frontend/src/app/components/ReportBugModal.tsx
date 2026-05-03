import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import { supabase } from '@/lib/supabase';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type IssueType = 'Bug / Crash' | 'UI issue' | 'Performance' | 'Feature request' | 'Wrong answer' | 'Other';

const issueTypes: IssueType[] = [
  'Bug / Crash',
  'UI issue',
  'Performance',
  'Feature request',
  'Wrong answer',
  'Other',
];

export function ReportBugModal({ isOpen, onClose, onSuccess }: ReportBugModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ issueType: '', description: '' });

  const handleSend = () => {
    const newErrors = { issueType: '', description: '' };
    let hasError = false;

    if (!selectedIssueType) {
      newErrors.issueType = 'Please select an issue type.';
      hasError = true;
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe the issue.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Track event
    trackEvent('report_bug_submitted', { issueType: selectedIssueType });

    // Wire to /auth/reportBug — sends the bug report to the DB.
    // Gets the session token from Supabase so the backend can identify the user.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const params = new URLSearchParams({
        category: selectedIssueType!,
        comment: description,
      });
      fetch(`${import.meta.env.VITE_API_URL}/auth/reportBug?${params.toString()}`, {
        method: 'POST',
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      }).catch((err) => console.error('[reportBug] Failed:', err));
    });

    // Reset form
    setSelectedIssueType(null);
    setDescription('');
    setErrors({ issueType: '', description: '' });

    // Close modal
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleClose = () => {
    // Reset form on close
    setSelectedIssueType(null);
    setDescription('');
    setErrors({ issueType: '', description: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[100]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-bug-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,252,254,0.1)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-[90%] max-w-[520px] z-[101]"
      >
        {/* Header */}
        <div className="bg-[#2c2c2c] border-b border-[rgba(255,252,254,0.1)] px-[24px] py-[20px] flex items-center justify-between rounded-t-[16px]">
          <h2
            id="report-bug-modal-title"
            className="font-['Roboto:Bold',sans-serif] font-bold text-[1.25rem] text-[#fffcfe]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Report a bug
          </h2>
          <button
            onClick={handleClose}
            className="text-[#999] hover:text-[#fffcfe] transition-colors p-2 -mr-2 rounded-lg hover:bg-[#333] active:bg-[#3a3a3a]"
            aria-label="Close modal"
          >
            <X className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-[24px] py-[24px]">
          {/* Issue Type */}
          <div className="mb-[20px]">
            <div className="flex flex-wrap gap-[8px] mb-[8px]">
              {issueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedIssueType(type);
                    setErrors((prev) => ({ ...prev, issueType: '' }));
                  }}
                  className={`px-[16px] py-[8px] rounded-[8px] font-['Roboto:Medium',sans-serif] text-[0.875rem] transition-all ${
                    selectedIssueType === type
                      ? 'bg-[#7760bd] text-[#fffcfe] border border-[#7760bd]'
                      : 'bg-[#1a1a1a] text-[#999] border border-[rgba(255,252,254,0.15)] hover:border-[#7760bd] hover:text-[#fffcfe]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.issueType && (
              <p className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#dc2626] mt-[4px]">
                {errors.issueType}
              </p>
            )}
          </div>

          {/* Description Textarea */}
          <div className="mb-[20px]">
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              placeholder="Tell us about the issue you encountered"
              className="w-full bg-[#1a1a1a] border border-[rgba(255,252,254,0.15)] rounded-[8px] px-[16px] py-[12px] font-['Roboto:Regular',sans-serif] text-[0.9375rem] text-[#fffcfe] placeholder:text-[#666] resize-none focus:outline-none focus:border-[#7760bd] transition-colors min-h-[120px]"
              rows={5}
            />
            <div className="flex items-center justify-between mt-[8px]">
              <div>
                {errors.description && (
                  <p className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#dc2626]">
                    {errors.description}
                  </p>
                )}
              </div>
              <p className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#666]">
                {description.length} / 2000
              </p>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              className="px-[24px] py-[10px] bg-[#7760bd] hover:bg-[#6952a8] active:bg-[#5b4691] text-[#fffcfe] font-['Roboto:Medium',sans-serif] text-[0.9375rem] rounded-[8px] transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}