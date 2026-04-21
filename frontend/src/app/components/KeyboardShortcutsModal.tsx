import { X } from 'lucide-react';
import { useRef, useMemo, useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Detect platform for correct modifier key display
  const isMac = useMemo(() => {
    return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }, []);

  const mod = isMac ? '⌘' : 'Ctrl';

  // Generate shortcuts dynamically based on platform
  const shortcuts = useMemo(() => [
    { action: 'Search chats', keys: `${mod} + K` },
    { action: 'New chat', keys: `${mod} + Shift + O` },
    { action: 'Toggle sidebar', keys: `${mod} + Shift + S` },
    { action: 'Focus chat input', keys: 'Shift + Esc' },
    { action: 'Upload file', keys: `${mod} + U` },
    { action: 'Open Help Center', keys: `${mod} + H` },
    { action: 'Open Subscription', keys: `${mod} + P` },
    { action: 'Stop generating', keys: 'Esc' },
  ], [mod]);

  if (!isOpen) return null;

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
        aria-labelledby="shortcuts-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,252,254,0.1)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-[90%] max-w-[520px] z-[101]"
      >
        {/* Header */}
        <div className="bg-[#2c2c2c] border-b border-[rgba(255,252,254,0.1)] px-[24px] py-[20px] flex items-center justify-between rounded-t-[16px]">
          <h2
            id="shortcuts-modal-title"
            className="font-['Roboto:Bold',sans-serif] font-bold text-[20px] text-[#fffcfe]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Keyboard shortcuts
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
          <div className="space-y-[12px]">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-[8px]">
                <span className="font-['Roboto:Regular',sans-serif] text-[15px] text-[#fffcfe]">
                  {shortcut.action}
                </span>
                <kbd className="font-['Roboto:Medium',sans-serif] text-[13px] text-[#999] bg-[#1a1a1a] px-[12px] py-[6px] rounded-[6px] border border-[rgba(255,252,254,0.15)] min-w-[120px] text-center">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}