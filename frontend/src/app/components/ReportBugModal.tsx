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
                id="report-bug-modal-title"
                className="font-sans font-bold text-[1.25rem] text-[#fffcfe]"
              >
                Report a bug
              </h2>
            </div>
            <button
              onClick={handleClose}
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
          {/* Issue Type */}
          <div className="mb-[24px]">
            <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[12px]">
              Issue type
            </p>
            <div className="flex flex-wrap gap-[10px]">
              {issueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedIssueType(type);
                    setErrors((prev) => ({ ...prev, issueType: '' }));
                  }}
                  className={`px-[18px] py-[9px] rounded-full font-sans text-[0.8125rem] font-medium transition-colors ${
                    selectedIssueType === type
                      ? 'bg-[#7760bd] text-[#141414] border border-[#7760bd]'
                      : 'bg-transparent text-[#9e9e9e] border border-[rgba(255,255,255,0.14)] hover:border-[#7760bd] hover:text-[#fffcfe]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.issueType && (
              <p className="font-sans text-[0.8125rem] text-[#e05a5a] mt-[8px]">
                {errors.issueType}
              </p>
            )}
          </div>

          {/* Description Textarea */}
          <div className="mb-[28px]">
            <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[12px]">
              Description
            </p>
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              placeholder="Tell us about the issue you encountered"
              className="w-full bg-transparent border border-[rgba(255,255,255,0.14)] rounded-[8px] px-[16px] py-[12px] font-sans text-[0.9375rem] text-[#fffcfe] placeholder:text-[#6b6963] resize-none focus:outline-none focus:border-[#7760bd] transition-colors min-h-[120px]"
              rows={5}
            />
            <div className="flex items-center justify-between mt-[10px]">
              <div>
                {errors.description && (
                  <p className="font-sans text-[0.8125rem] text-[#e05a5a]">
                    {errors.description}
                  </p>
                )}
              </div>
              <p className="font-tabular text-[0.8125rem] text-[#6b6963]">
                {description.length} / 2000
              </p>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              className="px-[26px] py-[11px] bg-[#7760bd] hover:bg-[#8a75d4] text-[#141414] font-sans font-semibold text-[13px] uppercase tracking-[0.08em] rounded-full transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
