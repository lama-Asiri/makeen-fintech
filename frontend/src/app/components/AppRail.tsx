import type { RefObject } from 'react';
import imgImage39 from '@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png';
import { Tooltip } from '@/app/components/Tooltip';
import { DefaultAvatar } from '@/app/components/DefaultAvatar';

// Slim, persistent nav rail — separate from Chat.tsx's own (chat-specific) sidebar,
// so switching between Dashboard/Chat never requires touching that sidebar's logic.
// Mounted at all breakpoints (not hidden behind a mobile hamburger like Chat's
// history drawer is) since Dashboard/Chat switching should always be reachable.

const RAIL_WIDTH = 72;
export { RAIL_WIDTH };

// Only the pieces AppRail's account button actually needs — deliberately narrower than
// AccountMenuState so both Dashboard's full useAccountMenu() hook and Chat's own inline
// dropdown state (which pre-dates that hook) can each satisfy this by structural typing.
interface AccountMenuTrigger {
  accountTriggerRef: RefObject<HTMLButtonElement | null>;
  openAccountDropdown: () => void;
  avatarUrl: string;
  displayName: string;
}

interface AppRailProps {
  active: 'dashboard' | 'chat';
  onNavigateDashboard: () => void;
  onNavigateChat: () => void;
  // The account trigger button only renders when this is passed — every screen using
  // AppRail wires up its own account menu state and passes the trigger through here.
  accountMenu?: AccountMenuTrigger;
}

export function AppRail({ active, onNavigateDashboard, onNavigateChat, accountMenu }: AppRailProps) {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-30 bg-[#141414] border-r border-white/[0.08] flex flex-col items-center py-[20px] gap-[8px]"
      style={{ width: RAIL_WIDTH }}
    >
      <div className="w-[36px] h-[36px] rounded-[6px] overflow-hidden mb-[12px]">
        <img alt="Makeen" className="w-full h-full object-cover" src={imgImage39} />
      </div>

      <Tooltip text="Dashboard" position="right">
        <button
          onClick={onNavigateDashboard}
          className={`w-[44px] h-[44px] rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ${
            active === 'dashboard'
              ? 'bg-[#7760bd]/10 border-l-2 border-[#7760bd] text-[#7760bd]'
              : 'text-[#9e9e9e] hover:bg-[#2c2c2c] hover:text-white'
          }`}
          aria-label="Dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </button>
      </Tooltip>

      <Tooltip text="Chat" position="right">
        <button
          onClick={onNavigateChat}
          className={`w-[44px] h-[44px] rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ${
            active === 'chat'
              ? 'bg-[#7760bd]/10 border-l-2 border-[#7760bd] text-[#7760bd]'
              : 'text-[#9e9e9e] hover:bg-[#2c2c2c] hover:text-white'
          }`}
          aria-label="Chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-3.155-.502l-4.345 2.17v-3.233C3.612 15.55 3 13.86 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>
      </Tooltip>

      {accountMenu && (
        <div className="mt-auto">
          <Tooltip text="Account" position="right">
            <button
              ref={accountMenu.accountTriggerRef}
              onClick={accountMenu.openAccountDropdown}
              className="w-[40px] h-[40px] rounded-full hover:ring-2 hover:ring-[#7760bd] transition-all cursor-pointer"
              aria-label="Account"
            >
              {accountMenu.avatarUrl ? (
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img alt="User" className="w-full h-full object-cover" src={accountMenu.avatarUrl} />
                </div>
              ) : (
                <DefaultAvatar displayName={accountMenu.displayName} size={40} />
              )}
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
