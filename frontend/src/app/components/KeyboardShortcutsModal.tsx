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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2c2c2c] rounded-[16px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)] w-[90%] max-w-[520px] z-[101]"
      >
        {/* Header */}
        <div className="px-[28px] pt-[26px] pb-[20px] flex items-center justify-between">
          <h2
            id="shortcuts-modal-title"
            className="font-sans font-bold text-[1.25rem] text-[#fffcfe]"
          >
            Keyboard shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-[#9e9e9e] hover:text-[#fffcfe] transition-colors p-2 -mr-2 rounded-lg hover:bg-[#3a3a3a] active:bg-[#444]"
            aria-label="Close modal"
          >
            <X className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* Content — editorial list, rows separated by hairline dividers */}
        <div className="px-[28px] pb-[10px]">
          <div className="h-px bg-white/[0.08]" />
          {shortcuts.map((shortcut, index) => (
            <div key={index}>
              <div className="flex items-center justify-between py-[16px]">
                <span className="font-sans text-[0.9375rem] text-[#fffcfe]">
                  {shortcut.action}
                </span>
                <kbd className="font-tabular text-[0.8125rem] text-[#9e9e9e] bg-[#3a3a3a] px-[12px] py-[6px] rounded-[6px] border border-[rgba(255,255,255,0.1)] min-w-[120px] text-center">
                  {shortcut.keys}
                </kbd>
              </div>
              {index < shortcuts.length - 1 && <div className="h-px bg-white/[0.08]" />}
            </div>
          ))}
          <div className="h-px bg-white/[0.08]" />
        </div>
        <div className="pb-[18px]" />
      </div>
    </>
  );
}
