import { ChevronRight, CreditCard, Palette, Settings, LifeBuoy, LogOut, FileText, Bug, Keyboard } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DefaultAvatar } from '@/app/components/DefaultAvatar';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  email: string;
  avatarUrl: string;
  onProfileClick: () => void;
  onSubscriptionClick?: () => void;
  onPersonalizationClick: () => void;
  onSettingsClick: () => void;
  onTermsClick?: () => void;
  onKeyboardShortcutsClick?: () => void;
  onReportBugClick?: () => void;
  onHelpCenterClick?: () => void;
  onLogoutClick: () => void;
  triggerRect?: DOMRect;
}

export function AccountDropdown({
  isOpen,
  onClose,
  displayName,
  email,
  avatarUrl,
  onProfileClick,
  onSubscriptionClick,
  onPersonalizationClick,
  onSettingsClick,
  onTermsClick,
  onKeyboardShortcutsClick,
  onReportBugClick,
  onHelpCenterClick,
  onLogoutClick,
  triggerRect,
}: AccountDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const helpItemRef = useRef<HTMLButtonElement>(null);
  const [showHelpSubmenu, setShowHelpSubmenu] = useState(false);
  const [helpSubmenuPosition, setHelpSubmenuPosition] = useState({ top: 0, left: 0 });
  const [isProfileRowActive, setIsProfileRowActive] = useState(false);
  const helpCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (showHelpSubmenu && helpItemRef.current) {
      const rect = helpItemRef.current.getBoundingClientRect();
      setHelpSubmenuPosition({
        top: rect.top,
        left: rect.right + 4,
      });
    }
  }, [showHelpSubmenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (helpCloseTimeoutRef.current) {
        clearTimeout(helpCloseTimeoutRef.current);
      }
    };
  }, []);

  const handleHelpMouseEnter = () => {
    // Clear any pending close timeout
    if (helpCloseTimeoutRef.current) {
      clearTimeout(helpCloseTimeoutRef.current);
      helpCloseTimeoutRef.current = null;
    }
    setShowHelpSubmenu(true);
  };

  const handleHelpMouseLeave = () => {
    // Add a small delay before closing to allow smooth navigation
    helpCloseTimeoutRef.current = setTimeout(() => {
      setShowHelpSubmenu(false);
    }, 200);
  };

  if (!isOpen) return null;

  const style: React.CSSProperties = triggerRect
    ? {
        position: 'fixed',
        bottom: `${window.innerHeight - triggerRect.top + 8}px`,
        left: `${triggerRect.left}px`,
        minWidth: `${triggerRect.width}px`,
      }
    : {};

  return (
    <>
      <div
        ref={dropdownRef}
        style={style}
        className="bg-[#2c2c2c] rounded-[12px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.4)] py-[8px] min-w-[280px] z-50"
      >
        {/* Profile Row */}
        <button
          onClick={() => {
            onProfileClick();
            onClose();
          }}
          onMouseEnter={() => setIsProfileRowActive(true)}
          onMouseLeave={() => setIsProfileRowActive(false)}
          className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
        >
          {avatarUrl ? (
            <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
              <img className="w-full h-full object-cover" alt="Profile" src={avatarUrl} />
            </div>
          ) : (
            <DefaultAvatar displayName={displayName} size={40} />
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="font-sans font-semibold text-[0.875rem] text-[#fffcfe] truncate">
              {displayName}
            </p>
            <p className="font-sans text-[0.75rem] text-[#9e9e9e] truncate">
              {email}
            </p>
          </div>
          <ChevronRight className="w-[16px] h-[16px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
        </button>

        {/* Divider */}
        <div className="h-[1px] bg-[rgba(255,255,255,0.08)] my-[8px]" />

        {/* Subscription */}
        {onSubscriptionClick && (
          <button
            onClick={() => {
              onSubscriptionClick();
              onClose();
            }}
            className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
          >
            <CreditCard className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
            <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
              Subscription
            </p>
          </button>
        )}

        {/* Personalization */}
        <button
          onClick={() => {
            onPersonalizationClick();
            onClose();
          }}
          className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
        >
          <Palette className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
          <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
            Personalization
          </p>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            onSettingsClick();
            onClose();
          }}
          className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
        >
          <Settings className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
          <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
            Settings
          </p>
        </button>

        {/* Divider */}
        <div className="h-[1px] bg-[rgba(255,255,255,0.08)] my-[8px]" />

        {/* Help with Submenu */}
        <button
          ref={helpItemRef}
          onMouseEnter={handleHelpMouseEnter}
          onMouseLeave={handleHelpMouseLeave}
          className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
        >
          <LifeBuoy className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
          <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
            Help
          </p>
          <ChevronRight className="w-[16px] h-[16px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
        </button>

        {/* Log out */}
        <button
          onClick={() => {
            onLogoutClick();
            onClose();
          }}
          className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group text-left"
        >
          <LogOut className="w-[18px] h-[18px] text-[#e05a5a] group-hover:text-[#e05a5a] flex-shrink-0 transition-colors" />
          <p className="font-sans text-[0.875rem] text-[#e05a5a] flex-1 text-left">
            Log out
          </p>
        </button>
      </div>

      {/* Help Submenu */}
      {showHelpSubmenu && (
        <div
          style={{
            position: 'fixed',
            top: `${helpSubmenuPosition.top}px`,
            left: `${helpSubmenuPosition.left}px`,
          }}
          onMouseEnter={handleHelpMouseEnter}
          onMouseLeave={handleHelpMouseLeave}
          className="bg-[#2c2c2c] rounded-[12px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.4)] py-[8px] min-w-[220px] z-50"
        >
          {/* Help center */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Close submenu and dropdown first
              setShowHelpSubmenu(false);
              onClose();
              
              // Use requestAnimationFrame to ensure state updates after close
              requestAnimationFrame(() => {
                if (onHelpCenterClick) {
                  onHelpCenterClick();
                }
              });
            }}
            className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
          >
            <LifeBuoy className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
            <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
              Help center
            </p>
          </button>

          {/* Terms & policies */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Close submenu and dropdown first
              setShowHelpSubmenu(false);
              onClose();
              
              // Use requestAnimationFrame to ensure state updates after close
              requestAnimationFrame(() => {
                if (onTermsClick) {
                  onTermsClick();
                }
              });
            }}
            className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
          >
            <FileText className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
            <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
              Terms & policies
            </p>
          </button>

          {/* Report Bug */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Close submenu and dropdown first
              setShowHelpSubmenu(false);
              onClose();
              
              // Use requestAnimationFrame to ensure state updates after close
              requestAnimationFrame(() => {
                if (onReportBugClick) {
                  onReportBugClick();
                }
              });
            }}
            className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
          >
            <Bug className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
            <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
              Report Bug
            </p>
          </button>

          {/* Keyboard shortcuts */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Close submenu and dropdown first
              setShowHelpSubmenu(false);
              onClose();

              // Use requestAnimationFrame to ensure state updates after close
              requestAnimationFrame(() => {
                if (onKeyboardShortcutsClick) {
                  onKeyboardShortcutsClick();
                }
              });
            }}
            className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
          >
            <Keyboard className="w-[18px] h-[18px] text-[#9e9e9e] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
            <p className="font-sans text-[0.875rem] text-[#fffcfe] flex-1 text-left">
              Keyboard shortcuts
            </p>
          </button>
        </div>
      )}
    </>
  );
}