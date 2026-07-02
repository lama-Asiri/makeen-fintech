import { useState, useRef, useEffect } from 'react';
import { Camera, Pencil, Trash2 } from 'lucide-react';
import { DefaultAvatar } from '@/app/components/DefaultAvatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisplayName: string;
  currentEmail: string;
  currentAvatarUrl: string;
  onSave: (displayName: string, email: string, avatarUrl: string) => void;
  onAvatarChange?: (avatarUrl: string) => void; // Immediate update callback
}

export function EditProfileModal({ isOpen, onClose, currentDisplayName, currentEmail, currentAvatarUrl, onSave, onAvatarChange }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [hasChanges, setHasChanges] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevIsOpenRef = useRef(false);

  // Sync internal state only when modal transitions from closed → open
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (justOpened) {
      setDisplayName(currentDisplayName);
      setAvatarUrl(currentAvatarUrl);
      setHasChanges(false);
    }
  }, [isOpen, currentDisplayName, currentAvatarUrl]);

  // Handle outside click to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    setHasChanges(value !== currentDisplayName || avatarUrl !== currentAvatarUrl);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarUrl = reader.result as string;
        setAvatarUrl(newAvatarUrl);
        setHasChanges(displayName !== currentDisplayName || newAvatarUrl !== currentAvatarUrl);
        if (onAvatarChange) {
          onAvatarChange(newAvatarUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const canSave = hasChanges && displayName.trim() !== '';

  const handleSave = () => {
    if (canSave) {
      onSave(displayName, currentEmail, avatarUrl);
      onClose();
    }
  };

  const handleCancel = () => {
    setDisplayName(currentDisplayName);
    setAvatarUrl(currentAvatarUrl);
    setHasChanges(false);
    onClose();
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setHasChanges(displayName !== currentDisplayName || avatarUrl !== '');
    setShowRemoveConfirm(false);
    if (onAvatarChange) {
      onAvatarChange('');
    }
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowAvatarMenu(!showAvatarMenu);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#2c2c2c] rounded-[16px] w-[480px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="px-[32px] pt-[30px] pb-[22px]">
          <p className="text-[#7760bd] text-[11px] font-sans font-semibold uppercase tracking-[0.2em] mb-[10px]">
            Profile
          </p>
          <h2 className="font-sans font-semibold text-[1.5rem] text-[#fffcfe]">
            Edit profile
          </h2>
        </div>

        <div className="h-px bg-white/[0.08]" />

        {/* Content */}
        <div className="px-[32px] pt-[28px] pb-[28px]">
          {/* Avatar Section */}
          <div className="flex justify-center mb-[36px]">
            <div className="relative">
              {avatarUrl ? (
                <div className="w-[96px] h-[96px] rounded-full bg-[#d9d9d9] overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Profile avatar"
                    src={avatarUrl}
                  />
                </div>
              ) : (
                <DefaultAvatar displayName={displayName} size={96} />
              )}
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Edit Avatar Button (Pencil) */}
              <button
                ref={buttonRef}
                onClick={handleMenuClick}
                className="absolute bottom-0 right-0 w-[32px] h-[32px] bg-[#7760bd] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#8a75d4] transition-colors shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
              >
                <Pencil className="w-[16px] h-[16px] text-[#141414]" />
              </button>

              {/* Avatar Edit Menu */}
              {showAvatarMenu && (
                <div
                  ref={menuRef}
                  className="absolute bottom-[40px] right-0 w-[200px] bg-[#2c2c2c] rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] overflow-hidden z-10"
                >
                  {/* Change photo */}
                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      handleAvatarClick();
                    }}
                    className="w-full px-[16px] py-[12px] flex items-center gap-[12px] text-left hover:bg-[#3a3a3a] transition-colors"
                  >
                    <Camera className="w-[16px] h-[16px] text-[#fffcfe]" />
                    <span className="font-sans text-[0.875rem] text-[#fffcfe]">Change photo</span>
                  </button>

                  {/* Remove photo - only show if avatar exists */}
                  {avatarUrl && (
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        setShowRemoveConfirm(true);
                      }}
                      className="w-full px-[16px] py-[12px] flex items-center gap-[12px] text-left hover:bg-[#e05a5a]/10 transition-colors border-t border-[rgba(255,255,255,0.08)]"
                    >
                      <Trash2 className="w-[16px] h-[16px] text-[#e05a5a]" />
                      <span className="font-sans text-[0.875rem] text-[#e05a5a]">Remove photo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col gap-[24px]">
            {/* Display Name */}
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]">
                Display name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  className="w-full bg-transparent text-[#fffcfe] px-0 py-[10px] pr-[28px] border-0 border-b border-[rgba(255,255,255,0.14)] focus:outline-none focus:border-[#7760bd] font-sans text-[1rem] transition-colors"
                  placeholder="Enter your display name"
                />
                <Pencil className={`absolute right-0 top-1/2 -translate-y-1/2 w-[16px] h-[16px] pointer-events-none transition-colors ${isNameFocused ? 'text-[#7760bd]' : 'text-[#9e9e9e]'}`} />
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.1em] text-[#9e9e9e] mb-[10px]">
                Email
              </label>
              <div className="w-full bg-transparent text-[#9e9e9e] px-0 py-[10px] border-0 border-b border-[rgba(255,255,255,0.08)] font-sans text-[1rem] cursor-not-allowed">
                {currentEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(255,255,255,0.08)] px-[32px] py-[20px] rounded-b-[16px] flex justify-end gap-[12px]">
          <button
            onClick={handleCancel}
            className="border border-white/20 rounded-full px-[24px] h-[44px] flex items-center justify-center cursor-pointer hover:border-[#7760bd]/60 transition-colors"
          >
            <p className="font-sans font-semibold text-[13px] uppercase tracking-[0.08em] text-white/80">
              Cancel
            </p>
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`rounded-full px-[24px] h-[44px] flex items-center justify-center transition-colors ${
              canSave
                ? 'bg-[#7760bd] hover:bg-[#8a75d4] cursor-pointer'
                : 'bg-[#3a3a3a] cursor-not-allowed opacity-50'
            }`}
          >
            <p className={`font-sans font-semibold text-[13px] uppercase tracking-[0.08em] ${canSave ? 'text-[#141414]' : 'text-[#fffcfe]'}`}>
              Save
            </p>
          </button>
        </div>
      </div>

      {/* Remove Avatar Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#2c2c2c] rounded-[16px] w-[400px] p-[24px] border border-[rgba(255,255,255,0.08)] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.6)]">
            <p className="font-sans font-semibold text-[1.125rem] text-[#fffcfe] mb-[12px]">Remove profile photo?</p>
            <p className="font-sans text-[0.875rem] text-[#9e9e9e] mb-[24px]">Your photo will be removed and replaced with a default avatar.</p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="border border-white/20 rounded-full px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
              >
                <p className="font-sans font-semibold text-[13px] uppercase tracking-[0.08em] text-white/80">Cancel</p>
              </button>
              <button
                onClick={handleRemoveAvatar}
                className="bg-[#e05a5a] rounded-full px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#d15b53] transition-colors"
              >
                <p className="font-sans font-semibold text-[13px] uppercase tracking-[0.08em] text-[#fffcfe]">Remove</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
