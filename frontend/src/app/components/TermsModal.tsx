import { useState, useEffect, useRef } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  readOnly?: boolean;
  initialTab?: 'terms' | 'privacy';
}

export function TermsModal({ isOpen, onClose, onAccept, readOnly = false, initialTab = 'terms' }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [hasScrolledPrivacy, setHasScrolledPrivacy] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialTab]);

  // Handle scroll detection
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Check if scrolled to bottom (with 2px tolerance)
    if (scrollTop + clientHeight >= scrollHeight - 2) {
      if (activeTab === 'terms') {
        setHasScrolledTerms(true);
      } else {
        setHasScrolledPrivacy(true);
      }
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const canAccept = hasScrolledTerms && hasScrolledPrivacy;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-[2px] bg-[rgba(0,0,0,0.47)]"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      {/* Modal Container */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] w-full max-w-[900px] mx-[20px] md:mx-0 md:h-[600px] h-[80vh] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="px-[24px] md:px-[40px] pt-[32px] pb-[16px]">
          <div className="flex items-center justify-between mb-6">
            <h2 
              id="terms-modal-title"
              className="text-2xl font-semibold text-white"
            >
              Legal Agreements
            </h2>
            {readOnly && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('terms')}
              className={`pb-3 text-sm font-medium transition-all relative ${
                activeTab === 'terms' ? 'text-[#7760bd]' : 'text-[#999] hover:text-white'
              }`}
            >
              Terms of Service
              {activeTab === 'terms' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7760bd]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`pb-3 text-sm font-medium transition-all relative ${
                activeTab === 'privacy' ? 'text-[#7760bd]' : 'text-[#999] hover:text-white'
              }`}
            >
              Privacy Policy
              {activeTab === 'privacy' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7760bd]" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="relative px-[24px] md:px-[40px] flex-1 overflow-hidden pb-6">
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto pr-4 scrollbar-custom text-[#ccc] text-sm leading-relaxed"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#7760bd transparent',
            }}
          >
            {activeTab === 'terms' ? (
              <div className="space-y-4">
                <p className="text-white font-medium mb-2">Terms of Service</p>
                <p>Welcome to Makeen AI. By using our platform, you agree to these terms.</p>
                <p>1. Acceptance of Terms: By accessing or using the platform, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
                <p>2. User Conduct: You agree not to use the service for any unlawful purposes or to engage in any activity that disrupts or interferes with the service.</p>
                <p>3. Intellectual Property: All content, features, and functionality are the exclusive property of Makeen AI and its licensors.</p>
                <p>4. Termination: We reserve the right to terminate or suspend your account at any time for violations of these terms.</p>
                <p>5. Limitation of Liability: Makeen AI shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service.</p>
                <div className="h-4" />
                <p className="text-xs text-[#666]">Last Updated: February 15, 2026</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white font-medium mb-2">Privacy Policy</p>
                <p>Your privacy is important to us. This policy explains how we collect and use your information.</p>
                <p>1. Data Collection: We collect information you provide directly to us when you create an account, use our AI tools, or communicate with us.</p>
                <p>2. Use of Information: We use the information we collect to provide, maintain, and improve our services, and to develop new ones.</p>
                <p>3. Data Sharing: We do not share your personal information with companies, organizations, or individuals outside of Makeen AI except in limited circumstances.</p>
                <p>4. Security: We work hard to protect Makeen AI and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
                <p>5. Your Rights: You have the right to access, update, or delete your personal information at any time.</p>
                <div className="h-4" />
                <p className="text-xs text-[#666]">Last Updated: February 15, 2026</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="px-[24px] md:px-[40px] py-6 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-[#666]">
              {!hasScrolledTerms && activeTab === 'terms' && "Scroll to the bottom of Terms to continue"}
              {!hasScrolledPrivacy && activeTab === 'privacy' && "Scroll to the bottom of Privacy Policy to continue"}
              {hasScrolledTerms && !hasScrolledPrivacy && activeTab === 'terms' && "Terms read. Please check Privacy Policy."}
              {hasScrolledPrivacy && !hasScrolledTerms && activeTab === 'privacy' && "Privacy read. Please check Terms of Service."}
              {canAccept && <span className="text-[#7760bd]">All documents read. You can now accept.</span>}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-[#999] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onAccept}
                disabled={!canAccept}
                className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${
                  canAccept 
                    ? 'bg-[#7760bd] text-white hover:bg-[#8b7dd8] cursor-pointer' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
