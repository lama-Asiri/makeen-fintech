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
      <div className="bg-[#262626] rounded-[16px] w-[480px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <div className="px-[32px] pt-[28px] pb-[20px]">
          <h2 className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[1.5rem] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Edit profile
          </h2>
        </div>

        {/* Content */}
        <div className="px-[32px] pb-[28px]">
          {/* Avatar Section */}
          <div className="flex justify-center mb-[32px]">
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
                className="absolute bottom-0 right-0 w-[32px] h-[32px] bg-[#7760bd] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#8870cd] transition-colors shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
              >
                <Pencil className="w-[16px] h-[16px] text-white" />
              </button>
              
              {/* Avatar Edit Menu */}
              {showAvatarMenu && (
                <div
                  ref={menuRef}
                  className="absolute bottom-[40px] right-0 w-[200px] bg-[#2c2c2c] rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.4)] border border-[rgba(255,252,254,0.1)] overflow-hidden z-10"
                >
                  {/* Change photo */}
                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      handleAvatarClick();
                    }}
                    className="w-full px-[16px] py-[12px] flex items-center gap-[12px] text-left hover:bg-[#333] transition-colors"
                  >
                    <Camera className="w-[16px] h-[16px] text-[#fffcfe]" />
                    <span className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe]">Change photo</span>
                  </button>
                  
                  {/* Remove photo - only show if avatar exists */}
                  {avatarUrl && (
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        setShowRemoveConfirm(true);
                      }}
                      className="w-full px-[16px] py-[12px] flex items-center gap-[12px] text-left hover:bg-[#ff4d4f]/10 transition-colors border-t border-[rgba(255,252,254,0.1)]"
                    >
                      <Trash2 className="w-[16px] h-[16px] text-[#ff4d4f]" />
                      <span className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#ff4d4f]">Remove photo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col gap-[20px]">
            {/* Display Name */}
            <div>
              <label className="block font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#ccc] mb-[8px]">
                Display name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  className="w-full bg-[#333] text-white rounded-[8px] px-[16px] py-[12px] pr-[44px] border border-[#555] focus:outline-none focus:border-[#7760bd] font-['Roboto:Regular',sans-serif] text-[1rem]"
                  placeholder="Enter your display name"
                />
                <Pencil className={`absolute right-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] pointer-events-none transition-colors ${isNameFocused ? 'text-[#7760bd]' : 'text-[#999]'}`} />
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#ccc] mb-[8px]">
                Email
              </label>
              <div className="w-full bg-[#2a2a2a] text-[#999] rounded-[8px] px-[16px] py-[12px] border border-[#555] font-['Roboto:Regular',sans-serif] text-[1rem] cursor-not-allowed">
                {currentEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#262626] border-t border-[rgba(255,252,254,0.19)] px-[32px] py-[16px] rounded-b-[16px] flex justify-end gap-[12px]">
          <button
            onClick={handleCancel}
            className="border border-[#555] rounded-[8px] px-[24px] h-[44px] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-all"
          >
            <p className="font-['Roboto:Regular',sans-serif] text-[1rem] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Cancel
            </p>
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`rounded-[8px] px-[24px] h-[44px] flex items-center justify-center transition-all ${
              canSave
                ? 'bg-[#7760bd] hover:bg-[#8870cd] cursor-pointer'
                : 'bg-[#555] cursor-not-allowed opacity-50'
            }`}
          >
            <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Save
            </p>
          </button>
        </div>
      </div>

      {/* Remove Avatar Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#2c2c2c] rounded-[16px] w-[400px] p-[24px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[1.125rem] text-white mb-[12px]">Remove profile photo?</p>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999] mb-[24px]">Your photo will be removed and replaced with a default avatar.</p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="border border-[#555] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-all"
              >
                <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe]">Cancel</p>
              </button>
              <button
                onClick={handleRemoveAvatar}
                className="bg-[#ff4d4f] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#ff787a] transition-all"
              >
                <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#fffcfe]">Remove</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}