import { useState, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { AccountDropdown } from '@/app/components/AccountDropdown';
import { SettingsModal } from '@/app/components/SettingsModal';
import { EditProfileModal } from '@/app/components/EditProfileModal';
import { TermsModal } from '@/app/components/TermsModal';
import { KeyboardShortcutsModal } from '@/app/components/KeyboardShortcutsModal';
import { ReportBugModal } from '@/app/components/ReportBugModal';
import { HelpCenter } from '@/app/pages/HelpCenter';
import { TermsAndPolicies } from '@/app/pages/TermsAndPolicies';
import { SubscriptionPage } from '@/app/pages/Subscription';
import { supabase } from '@/lib/supabase';

// Shared account/settings menu state + overlays, extracted so any top-level screen
// (Dashboard, Chat, ...) can offer the same account menu without re-implementing
// 15 pieces of state and 7 modals each. Chat.tsx currently manages an identical
// set of state inline (pre-dates this hook) — migrating it here is a clean future
// refactor, not required for this to work correctly today.

export function useAccountMenu(user: User | null, session: Session | null) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'security' | 'data' | 'personalization'>('general');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [accountDropdownRect, setAccountDropdownRect] = useState<DOMRect | undefined>(undefined);
  const [displayName, setDisplayName] = useState(() => user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'User');
  const [userEmail, setUserEmail] = useState(() => user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showReportBugModal, setShowReportBugModal] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [helpCenterInitialSection, setHelpCenterInitialSection] = useState<string | undefined>(undefined);
  const [showTermsAndPolicies, setShowTermsAndPolicies] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const accountTriggerRef = useRef<HTMLButtonElement>(null);

  const openAccountDropdown = () => {
    const rect = accountTriggerRef.current?.getBoundingClientRect();
    setAccountDropdownRect(rect);
    setShowAccountDropdown((v) => !v);
  };

  const openSettings = (tab: 'general' | 'security' | 'data' | 'personalization' = 'general') => {
    setActiveSettingsTab(tab);
    setShowSettingsModal(true);
  };

  return {
    user, session,
    showSettingsModal, setShowSettingsModal,
    activeSettingsTab, setActiveSettingsTab,
    showEditProfileModal, setShowEditProfileModal,
    showTermsModal, setShowTermsModal,
    showAccountDropdown, setShowAccountDropdown,
    accountDropdownRect, setAccountDropdownRect,
    displayName, setDisplayName,
    userEmail, setUserEmail,
    avatarUrl, setAvatarUrl,
    showKeyboardShortcuts, setShowKeyboardShortcuts,
    showReportBugModal, setShowReportBugModal,
    showHelpCenter, setShowHelpCenter,
    helpCenterInitialSection, setHelpCenterInitialSection,
    showTermsAndPolicies, setShowTermsAndPolicies,
    showSubscription, setShowSubscription,
    showLogoutModal, setShowLogoutModal,
    accountTriggerRef,
    openAccountDropdown,
    openSettings,
  };
}

export type AccountMenuState = ReturnType<typeof useAccountMenu>;

interface AccountMenuOverlaysProps {
  menu: AccountMenuState;
  onLogoutClick: () => void;
  onDeleteAllChats?: () => void;
  saveChatHistory?: boolean;
  onSaveChatHistoryChange?: (value: boolean) => void;
  highlightSaveChatHistory?: boolean;
}

export function AccountMenuOverlays({
  menu,
  onLogoutClick,
  onDeleteAllChats,
  saveChatHistory,
  onSaveChatHistoryChange,
  highlightSaveChatHistory,
}: AccountMenuOverlaysProps) {
  return (
    <>
      {/* Help Center Page (Full Screen Overlay) */}
      {menu.showHelpCenter && (
        <HelpCenter
          onClose={() => {
            menu.setShowHelpCenter(false);
            menu.setHelpCenterInitialSection(undefined);
          }}
          source="shortcut"
          initialSection={menu.helpCenterInitialSection}
        />
      )}

      {/* Terms & Policies Page (Full Screen Overlay) */}
      {menu.showTermsAndPolicies && (
        <TermsAndPolicies onClose={() => menu.setShowTermsAndPolicies(false)} />
      )}

      {/* Subscription Page (Full Screen Overlay) */}
      {menu.showSubscription && (
        <SubscriptionPage
          onBack={() => menu.setShowSubscription(false)}
          onOpenHelpCenter={() => {
            menu.setShowSubscription(false);
            menu.setHelpCenterInitialSection('subscriptions');
            menu.setShowHelpCenter(true);
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={menu.showSettingsModal}
        onClose={() => menu.setShowSettingsModal(false)}
        activeTab={menu.activeSettingsTab}
        onTabChange={menu.setActiveSettingsTab}
        onLogout={() => menu.setShowLogoutModal(true)}
        onViewPlansClick={() => {
          menu.setShowSettingsModal(false);
          menu.setShowSubscription(true);
        }}
        displayName={menu.displayName}
        userEmail={menu.userEmail}
        avatarUrl={menu.avatarUrl}
        onEditProfile={() => {
          menu.setShowSettingsModal(false);
          menu.setShowEditProfileModal(true);
        }}
        saveChatHistory={saveChatHistory}
        onSaveChatHistoryChange={onSaveChatHistoryChange}
        highlightSaveChatHistory={highlightSaveChatHistory}
        onDeleteAllChats={onDeleteAllChats}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={menu.showEditProfileModal}
        onClose={() => menu.setShowEditProfileModal(false)}
        currentDisplayName={menu.displayName}
        currentEmail={menu.userEmail}
        currentAvatarUrl={menu.avatarUrl}
        onSave={async (newDisplayName, newEmail, newAvatarUrl) => {
          menu.setDisplayName(newDisplayName);
          menu.setUserEmail(newEmail);
          menu.setAvatarUrl(newAvatarUrl);
          if (!menu.session?.access_token || !menu.user) return;

          let finalAvatarUrl = newAvatarUrl;

          if (newAvatarUrl?.startsWith('data:')) {
            const res = await fetch(newAvatarUrl);
            const blob = await res.blob();
            const ext = blob.type.split('/')[1] ?? 'jpg';
            const path = `avatars/${menu.user.id}.${ext}`;
            const { error } = await supabase.storage
              .from('user-files')
              .upload(path, blob, { upsert: true, contentType: blob.type });
            if (!error) {
              const { data } = supabase.storage.from('user-files').getPublicUrl(path);
              finalAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
              menu.setAvatarUrl(finalAvatarUrl);
            }
          }

          await fetch(`${import.meta.env.VITE_API_URL}/auth/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${menu.session.access_token}`,
            },
            body: JSON.stringify({ username: newDisplayName, avatar_url: finalAvatarUrl || null }),
          });
        }}
        onAvatarChange={(newAvatarUrl) => {
          menu.setAvatarUrl(newAvatarUrl);
        }}
      />

      {/* Account Dropdown */}
      <AccountDropdown
        isOpen={menu.showAccountDropdown}
        onClose={() => menu.setShowAccountDropdown(false)}
        displayName={menu.displayName}
        email={menu.userEmail}
        avatarUrl={menu.avatarUrl}
        onProfileClick={() => menu.setShowEditProfileModal(true)}
        onSubscriptionClick={() => menu.setShowSubscription(true)}
        onPersonalizationClick={() => menu.openSettings('personalization')}
        onSettingsClick={() => menu.openSettings('general')}
        onTermsClick={() => menu.setShowTermsAndPolicies(true)}
        onKeyboardShortcutsClick={() => menu.setShowKeyboardShortcuts(true)}
        onReportBugClick={() => menu.setShowReportBugModal(true)}
        onHelpCenterClick={() => menu.setShowHelpCenter(true)}
        onLogoutClick={() => menu.setShowLogoutModal(true)}
        triggerRect={menu.accountDropdownRect}
      />

      {/* Terms and Conditions Modal */}
      <TermsModal
        isOpen={menu.showTermsModal}
        onClose={() => menu.setShowTermsModal(false)}
        onAccept={() => menu.setShowTermsModal(false)}
        readOnly={true}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={menu.showKeyboardShortcuts}
        onClose={() => menu.setShowKeyboardShortcuts(false)}
      />

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={menu.showReportBugModal}
        onClose={() => menu.setShowReportBugModal(false)}
        onSuccess={() => {}}
      />

      {/* Logout Confirmation Modal */}
      {menu.showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => menu.setShowLogoutModal(false)}
        >
          <div
            className="bg-[#2c2c2c] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[400px] max-w-[90vw] border border-white/[0.08] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-[32px] pt-[32px] pb-[24px]">
              <h2 className="font-sans font-semibold text-[1.5rem] text-white mb-[12px]">Log out?</h2>
              <p className="font-sans text-[1rem] text-[#9e9e9e]">Are you sure you want to log out?</p>
            </div>
            <div className="px-[32px] pb-[32px] flex justify-end gap-[12px]">
              <button
                onClick={() => menu.setShowLogoutModal(false)}
                className="bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-sans font-semibold text-[0.875rem] text-white">Cancel</p>
              </button>
              <button
                onClick={() => {
                  menu.setShowLogoutModal(false);
                  onLogoutClick();
                }}
                className="bg-[#7760bd] hover:bg-[#8b7dd8] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-sans font-semibold text-[0.875rem] text-white">Log out</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
