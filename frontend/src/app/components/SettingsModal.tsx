import svgPathsSettings from '@/imports/svg-92ly2gkslu';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Palette, Shield, Database, Settings as SettingsIcon, X, ChevronRight, ArrowLeft, Eye, EyeOff, Key } from 'lucide-react';
import { DefaultAvatar } from '@/app/components/DefaultAvatar';
import { Toast } from '@/app/components/Toast';
import { PasswordInput } from '@/app/components/PasswordInput';
import { CustomSelect } from '@/app/components/CustomSelect';
import { ColorSelect } from '@/app/components/ColorSelect';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'general' | 'security' | 'data' | 'personalization';
  onTabChange: (tab: 'general' | 'security' | 'data' | 'personalization') => void;
  onLogout?: () => void;
  onViewPlansClick?: () => void;
  displayName?: string;
  userEmail?: string;
  avatarUrl?: string;
  onEditProfile?: () => void;
  saveChatHistory?: boolean;
  onSaveChatHistoryChange?: (value: boolean) => void;
  highlightSaveChatHistory?: boolean;
  onDeleteAllChats?: () => void;
}

export function SettingsModal({ isOpen, onClose, activeTab, onTabChange, onViewPlansClick, displayName, userEmail, avatarUrl, onEditProfile, saveChatHistory = true, onSaveChatHistoryChange, highlightSaveChatHistory = false, onDeleteAllChats }: SettingsModalProps) {
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showClearContextConfirm, setShowClearContextConfirm] = useState(false);
  const [responseLength, setResponseLength] = useState('Balanced (Default)');
  const [tone, setTone] = useState('Neutral (Default)');
  const [formattingPref, setFormattingPref] = useState('Balanced (Default)');
  const [theme, setTheme] = useState('Dark');
  const [accentColor, setAccentColor] = useState('Purple (Default)');
  const [autoSummarize, setAutoSummarize] = useState(false);
  const [askBeforeUse, setAskBeforeUse] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState('Balanced');
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(
    () => (localStorage.getItem('fontSizePreference') as 'small' | 'medium' | 'large') || 'medium'
  );

  const applyFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('fontSizePreference', size);
    document.documentElement.setAttribute('data-font-size', size);
  };
  
  // Security section navigation state
  const [securityView, setSecurityView] = useState<'overview' | 'changePassword'>('overview');
  
  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordFocused, setCurrentPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Security feedback states
  const [saveChatHistoryFeedback, setSaveChatHistoryFeedback] = useState<string | null>(null);
  const [clearContextSuccess, setClearContextSuccess] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);
  
  // Data Management states
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [showDeleteAllChatsConfirm, setShowDeleteAllChatsConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [clearCacheSuccess, setClearCacheSuccess] = useState(false);
  const [deleteAllChatsSuccess, setDeleteAllChatsSuccess] = useState(false);
  
  // Ref for save chat history card
  const saveChatHistoryRef = useRef<HTMLDivElement>(null);
  
  // Mock usage data (visual only)
  const usageData = {
    datasetsUsed: 3,
    datasetsLimit: 5,
    exportsUsed: 7,
    exportsLimit: 20,
    savedChats: 2,
    savedChatsLimit: 10,
  };
  
  // Auto-scroll to Save chat history when highlighted
  useEffect(() => {
    if (highlightSaveChatHistory && saveChatHistoryRef.current && activeTab === 'security') {
      setTimeout(() => {
        saveChatHistoryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300); // Delay to ensure modal is fully rendered
    }
  }, [highlightSaveChatHistory, activeTab]);
  
  // Live validation for password fields
  useEffect(() => {
    if (currentPasswordTouched) {
      validateCurrentPassword();
    }
  }, [currentPassword, currentPasswordTouched]);
  
  useEffect(() => {
    if (newPasswordTouched) {
      validateNewPassword();
    }
  }, [newPassword, newPasswordTouched, currentPassword]);
  
  useEffect(() => {
    if (confirmPasswordTouched) {
      validateConfirmPassword();
    }
  }, [confirmPassword, confirmPasswordTouched, newPassword]);
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    // Save settings logic here
    onClose();
  };
  
  // Password validation functions
  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required.';
    }
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return 'Password must include uppercase, lowercase, number, and a special character.';
    }
    
    return undefined;
  };
  
  // Individual field validation handlers
  const validateCurrentPassword = () => {
    if (!currentPasswordTouched) return;
    
    if (!currentPassword) {
      setPasswordErrors(prev => ({ ...prev, currentPassword: 'Current password is required.' }));
    } else {
      setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
    }
  };
  
  const validateNewPassword = () => {
    if (!newPasswordTouched) return;
    
    const error = validatePassword(newPassword);
    if (error) {
      setPasswordErrors(prev => ({ ...prev, newPassword: error }));
    } else if (newPassword === currentPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: 'New password must be different from current password.' }));
    } else {
      setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
    }
  };
  
  const validateConfirmPassword = () => {
    if (!confirmPasswordTouched) return;
    
    if (!confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Confirm password is required.' }));
    } else if (confirmPassword !== newPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    } else {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };
  
  const validateChangePasswordForm = () => {
    const errors: typeof passwordErrors = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }
    
    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      } else if (newPassword === currentPassword) {
        errors.newPassword = 'New password must be different from current password.';
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isPasswordFormValid = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return false;
    if (newPassword !== confirmPassword) return false;
    if (newPassword === currentPassword) return false;
    const passwordError = validatePassword(newPassword);
    return !passwordError;
  };
  
  const handlePasswordSubmit = async () => {
    if (!validateChangePasswordForm()) return;
    setIsSubmittingPassword(true);

    // Verify current password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail ?? '',
      password: currentPassword,
    });

    if (signInError) {
      setPasswordToast({ type: 'error', message: 'Current password is incorrect.' });
      setTimeout(() => setPasswordToast(null), 3000);
      setIsSubmittingPassword(false);
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setPasswordToast({ type: 'error', message: updateError.message });
      setTimeout(() => setPasswordToast(null), 3000);
      setIsSubmittingPassword(false);
      return;
    }

    setPasswordToast({ type: 'success', message: 'Password updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
    setTimeout(() => {
      setPasswordToast(null);
      setSecurityView('overview');
    }, 2000);

    setIsSubmittingPassword(false);
  };
  
  const handleCancelPasswordChange = () => {
    setSecurityView('overview');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
    setPasswordToast(null);
  };
  
  // Reset security view when switching tabs
  const handleTabChange = (tab: 'general' | 'security' | 'data' | 'personalization') => {
    if (tab !== 'security') {
      setSecurityView('overview');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      setPasswordToast(null);
    }
    onTabChange(tab);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-[12px] sm:p-[24px]">
      <div className="bg-[#262626] rounded-[16px] w-full max-w-[690px] h-[90vh] max-h-[514px] flex shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        {/* Left Sidebar */}
        <div className="bg-[#2c2c2c] w-[89px] rounded-l-[16px] flex flex-col items-center py-[18px] flex-shrink-0 relative">
          <div className="flex flex-col items-center gap-[24px] pt-[3px]">
            {/* General Settings Icon */}
            <div className="relative group">
              <button
                onClick={() => handleTabChange('general')}
                className={`w-[46px] h-[46px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${
                  activeTab === 'general' ? 'bg-[#484848]' : 'bg-[#2c2c2c] hover:bg-[#333]'
                }`}
                aria-label="General settings"
              >
                <SettingsIcon className={`w-[20px] h-[20px] ${activeTab === 'general' ? 'text-[#7760bd]' : 'text-[#FFFCFE]'}`} strokeWidth={2} />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-[12px] top-1/2 -translate-y-1/2 px-[12px] py-[6px] bg-[#1a1a1a] text-white text-[0.75rem] rounded-[6px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-lg z-50">
                General
              </div>
            </div>

            {/* Security Icon */}
            <div className="relative group">
              <button
                onClick={() => handleTabChange('security')}
                className={`w-[46px] h-[46px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all ${
                  activeTab === 'security' ? 'bg-[#484848]' : 'bg-[#2c2c2c] hover:bg-[#333]'
                }`}
                aria-label="Security settings"
              >
                <Shield className={`w-[20px] h-[20px] ${activeTab === 'security' ? 'text-[#7760bd]' : 'text-[#FFFCFE]'}`} strokeWidth={2} />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-[12px] top-1/2 -translate-y-1/2 px-[12px] py-[6px] bg-[#1a1a1a] text-white text-[0.75rem] rounded-[6px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-lg z-50">
                Security
              </div>
            </div>

            {/* Data Management Icon */}
            <div className="relative group">
              <button
                onClick={() => handleTabChange('data')}
                className={`w-[46px] h-[46px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all ${
                  activeTab === 'data' ? 'bg-[#484848]' : 'bg-[#2c2c2c] hover:bg-[#333]'
                }`}
                aria-label="Data management settings"
              >
                <Database className={`w-[20px] h-[20px] ${activeTab === 'data' ? 'text-[#7760bd]' : 'text-[#FFFCFE]'}`} strokeWidth={2} />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-[12px] top-1/2 -translate-y-1/2 px-[12px] py-[6px] bg-[#1a1a1a] text-white text-[0.75rem] rounded-[6px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-lg z-50">
                Data Management
              </div>
            </div>

            {/* Personalization Icon */}
            <div className="relative group">
              <button
                onClick={() => handleTabChange('personalization')}
                className={`w-[46px] h-[46px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all ${
                  activeTab === 'personalization' ? 'bg-[#484848]' : 'bg-[#2c2c2c] hover:bg-[#333]'
                }`}
                aria-label="Personalization settings"
              >
                <Palette className={`w-[20px] h-[20px] ${activeTab === 'personalization' ? 'text-[#7760bd]' : 'text-[#FFFCFE]'}`} strokeWidth={2} />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-[12px] top-1/2 -translate-y-1/2 px-[12px] py-[6px] bg-[#1a1a1a] text-white text-[0.75rem] rounded-[6px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-lg z-50">
                Personalization
              </div>
            </div>
          </div>
          
          {/* Profile Avatar at Bottom */}
          <button
            onClick={() => {
              if (onEditProfile) {
                onEditProfile();
              }
            }}
            className="absolute bottom-[16px] w-full px-[8px] cursor-pointer group"
          >
            <div className="flex flex-col items-center gap-[8px] p-[8px] rounded-[8px] hover:bg-[#333] transition-colors">
              {avatarUrl ? (
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden border border-[rgba(255,252,254,0.15)]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Profile avatar"
                    src={avatarUrl}
                  />
                </div>
              ) : (
                <DefaultAvatar displayName={displayName || 'User'} size={40} />
              )}
            </div>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-[#262626] rounded-r-[16px] min-w-0">
          {/* Header */}
          <div className="bg-[#262626] h-[64px] px-[24px] flex items-center justify-between rounded-tr-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0">
            <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[1.25rem] leading-[28px] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {activeTab === 'general' && 'General'}
              {activeTab === 'security' && 'Security & Privacy'}
              {activeTab === 'data' && 'Data Management'}
              {activeTab === 'personalization' && 'Personalization'}
            </p>
            {/* Close X button */}
            <button
              onClick={onClose}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-[#333] transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-[20px] h-[20px] text-[#999] hover:text-[#fffcfe]" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto relative">
            {/* General Tab Content */}
            {activeTab === 'general' && (
              <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">
                {/* Language Card */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <div className="flex items-center justify-between gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Language</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Choose your preferred language</p>
                    </div>
                    <CustomSelect
                      value={language}
                      onChange={(value) => {
                        if (value !== 'English') {
                          setComingSoonMessage('Coming soon');
                          setTimeout(() => setLanguage('English'), 0);
                        } else {
                          setLanguage(value);
                        }
                      }}
                      options={['English']}
                      lockedOptions={['Arabic']}
                      onLockedClick={() => setComingSoonMessage('Coming soon')}
                    />
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                    <div className="flex items-start justify-between mb-[16px]">
                      <div>
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>Subscription</p>
                        <div className="flex items-center gap-[12px] mt-[6px]">
                          <span className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#b0b0b0]">Current plan: <span className="text-[#fffcfe]">Free</span></span>
                          <span className="px-[8px] py-[2px] rounded-[4px] bg-[#7760bd]/20 border border-[#7760bd]/30 font-['Roboto:Regular',sans-serif] text-[0.6875rem] text-[#a89bd9] uppercase tracking-wide">Active</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Usage Summary */}
                    <div className="space-y-[12px] mb-[16px]">
                      <div className="flex items-center justify-between">
                        <span className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#999]">Applicant pools analyzed</span>
                        <span className="font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#fffcfe]">{usageData.datasetsUsed} / {usageData.datasetsLimit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#999]">Risk reports exported</span>
                        <span className="font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#fffcfe]">{usageData.exportsUsed} / {usageData.exportsLimit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#999]">Credit assessments saved</span>
                        <span className="font-['Roboto:Medium',sans-serif] font-medium text-[0.8125rem] text-[#fffcfe]">{usageData.savedChats} / {usageData.savedChatsLimit}</span>
                      </div>
                    </div>

                    {/* View Plans Button */}
                    {onViewPlansClick && (
                      <button
                        onClick={() => {
                          onViewPlansClick();
                          onClose();
                        }}
                        className="w-full bg-[#7760bd] hover:bg-[#8870cd] text-white rounded-[6px] px-[16px] py-[10px] transition-colors font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem]"
                      >
                        View Plans
                      </button>
                    )}
                  </div>

                {/* Toast for General section */}
                {comingSoonMessage && (
                  <Toast 
                    message={comingSoonMessage}
                    onClose={() => setComingSoonMessage(null)}
                  />
                )}
              </div>
            )}

            {/* Security Tab Content */}
            {activeTab === 'security' && (
              <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">
                {/* Security Overview */}
                {securityView === 'overview' && (
                  <>
                    <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                      <div className="flex flex-col gap-[14px]">
                        <div className="flex items-center justify-between">
                          <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Change Password</p>
                          <button
                            onClick={() => setSecurityView('changePassword')}
                            className="bg-[#7760bd] hover:bg-[#8870cd] text-white rounded-[6px] px-[16px] py-[10px] transition-colors font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem]"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save chat history */}
                    <div 
                      ref={saveChatHistoryRef}
                      className={`bg-[#2c2c2c] rounded-[8px] border p-[20px] transition-all duration-300 ${
                        highlightSaveChatHistory 
                          ? 'border-[#7760bd] shadow-[0_0_0_3px_rgba(119,96,189,0.5)]' 
                          : 'border-[rgba(255,252,254,0.1)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-[16px]">
                        <div className="flex-1 min-w-0">
                          <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Save chat history</p>
                          <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">When off, chats are not stored in history.</p>
                        </div>
                        <label className="relative inline-block w-[44px] h-[24px] cursor-pointer flex-shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={saveChatHistory} 
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              setSaveChatHistoryFeedback(newValue ? 'Saved' : 'Not saved');
                              if (onSaveChatHistoryChange) {
                                onSaveChatHistoryChange(newValue);
                              }
                            }} 
                          />
                          <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#7760bd] transition-colors"></span>
                          <span className="absolute left-[2px] top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform peer-checked:translate-x-[20px]"></span>
                        </label>
                      </div>
                    </div>

                    {/* Clear conversation context */}
                    <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                      <div className="flex items-center justify-between gap-[16px]">
                        <div className="flex-1 min-w-0">
                          <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Clear conversation context</p>
                          <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Resets the current conversation memory in this session.</p>
                        </div>
                        <button
                          onClick={() => setShowClearContextConfirm(true)}
                          className="bg-[#333] hover:bg-[#444] text-white rounded-[6px] px-[16px] py-[8px] border border-[#555] cursor-pointer transition-colors text-[0.875rem] flex-shrink-0"
                        >
                          Clear context
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Save chat history feedback toast */}
                {saveChatHistoryFeedback && (
                  <Toast 
                    message={saveChatHistoryFeedback}
                    onClose={() => setSaveChatHistoryFeedback(null)}
                  />
                )}

                {/* Clear context success feedback toast */}
                {clearContextSuccess && (
                  <Toast 
                    message="Context cleared"
                    onClose={() => setClearContextSuccess(false)}
                  />
                )}

                {/* Coming Soon toast */}
                {comingSoonMessage && (
                  <Toast 
                    message={comingSoonMessage}
                    onClose={() => setComingSoonMessage(null)}
                  />
                )}
                
                {/* Change Password Section */}
                {securityView === 'changePassword' && (
                  <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                    <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-white mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>Change Password</p>
                    <div className="flex flex-col gap-[8px]">
                      <PasswordInput
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        error={passwordErrors.currentPassword}
                        isFocused={currentPasswordFocused}
                        onFocus={() => setCurrentPasswordFocused(true)}
                        onBlur={() => {
                          setCurrentPasswordFocused(false);
                          setCurrentPasswordTouched(true);
                          validateCurrentPassword();
                        }}
                      />
                      
                      <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        error={passwordErrors.newPassword}
                        isFocused={newPasswordFocused}
                        onFocus={() => setNewPasswordFocused(true)}
                        onBlur={() => {
                          setNewPasswordFocused(false);
                          setNewPasswordTouched(true);
                          validateNewPassword();
                        }}
                      />
                      
                      <PasswordInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        error={passwordErrors.confirmPassword}
                        isFocused={confirmPasswordFocused}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => {
                          setConfirmPasswordFocused(false);
                          setConfirmPasswordTouched(true);
                          validateConfirmPassword();
                        }}
                      />
                    </div>
                    
                    {/* Submit and Cancel Buttons */}
                    <div className="flex justify-end gap-[12px] mt-[20px]">
                      <button
                        onClick={handleCancelPasswordChange}
                        className="border border-[#555] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-all"
                      >
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe]">Cancel</p>
                      </button>
                      <button
                        onClick={handlePasswordSubmit}
                        className={`rounded-[8px] px-[20px] h-[40px] flex items-center justify-center transition-all ${
                          isSubmittingPassword || !isPasswordFormValid()
                            ? 'bg-[#7760bd]/40 cursor-not-allowed'
                            : 'bg-[#7760bd] cursor-pointer hover:bg-[#8870cd]'
                        }`}
                        disabled={isSubmittingPassword || !isPasswordFormValid()}
                      >
                        {isSubmittingPassword ? (
                          <svg className="w-[20px] h-[20px] animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#FFFCFE" strokeWidth="4" />
                            <path className="opacity-75" fill="#FFFCFE" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z" />
                          </svg>
                        ) : (
                          <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#fffcfe]">Confirm</p>
                        )}
                      </button>
                    </div>
                    
                    {/* Password Change Toast */}
                    {passwordToast && (
                      <div
                        className={`absolute left-1/2 bottom-[20px] -translate-x-1/2 px-[16px] py-[10px] rounded-[8px] text-[0.875rem] font-['Roboto:Regular',sans-serif] ${
                          passwordToast.type === 'success' ? 'bg-[#16a34a] text-[#fffcfe]' : 'bg-[#dc2626] text-[#fffcfe]'
                        }`}
                      >
                        {passwordToast.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Data Management Tab Content */}
            {activeTab === 'data' && (
              <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">
                {/* Card 1: Clear local cache */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <div className="flex items-center justify-between gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Clear local cache</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Removes temporary files and cached previews from this device. Your chats won't be deleted.</p>
                    </div>
                    <button
                      onClick={() => setShowClearCacheConfirm(true)}
                      className="bg-[#333] hover:bg-[#444] text-white rounded-[6px] px-[16px] py-[8px] border border-[#555] cursor-pointer transition-colors text-[0.875rem] flex-shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Card 2: Delete all chats */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <div className="flex items-center justify-between gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Delete all chats</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Permanently removes all saved conversations from your account.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteAllChatsConfirm(true)}
                      className="bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-[6px] px-[16px] py-[8px] cursor-pointer transition-colors text-[0.875rem] flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Cache cleared success toast */}
                {clearCacheSuccess && (
                  <Toast 
                    message="Cache cleared"
                    onClose={() => setClearCacheSuccess(false)}
                  />
                )}
                
                {/* Delete all chats success toast */}
                {deleteAllChatsSuccess && (
                  <Toast 
                    message="All chats deleted"
                    onClose={() => setDeleteAllChatsSuccess(false)}
                  />
                )}
              </div>
            )}

            {/* Personalization Tab Content */}
            {activeTab === 'personalization' && (
              <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">

                {/* 0) Font Size */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-white mb-[4px]" style={{ fontVariationSettings: "'wdth' 100" }}>Font Size</p>
                  <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mb-[16px]">Controls the size of message text across the chat.</p>
                  <div className="flex gap-[10px]">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => applyFontSize(size)}
                        className={`flex-1 py-[10px] rounded-[8px] border transition-all cursor-pointer flex flex-col items-center gap-[6px] ${
                          fontSize === size
                            ? 'bg-[#7760bd]/20 border-[#7760bd] text-white'
                            : 'bg-transparent border-white/10 text-[#999] hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <span style={{ fontSize: size === 'small' ? '12px' : size === 'medium' ? '15px' : '19px' }}>Aa</span>
                        <span className="text-[0.6875rem] capitalize font-['Roboto:Medium',sans-serif]">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1) Theme / Appearance */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-white mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>Theme / Appearance</p>
                  <div className="flex flex-col gap-[16px]">
                    {/* Row A - Theme */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Theme</p>
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Choose the overall app theme.</p>
                      </div>
                      <CustomSelect
                        value={theme}
                        onChange={(value) => {
                          if (value !== 'Dark') {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setTheme('Dark'), 0);
                          } else {
                            setTheme(value);
                          }
                        }}
                        options={['Dark']}
                        lockedOptions={['Light']}
                        onLockedClick={() => setComingSoonMessage('Coming soon')}
                      />
                    </div>

                    {/* Row B - Accent Color */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Accent Color</p>
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Changes buttons, highlights, and active states.</p>
                      </div>
                      <ColorSelect
                        value={accentColor}
                        onChange={(value) => {
                          if (value !== 'Purple (Default)') {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setAccentColor('Purple (Default)'), 0);
                          } else {
                            setAccentColor(value);
                          }
                        }}
                        options={[{ label: 'Purple (Default)', value: '#7760BC' }]}
                        lockedOptions={[
                          { label: 'Yellow', value: '#F5EA92' },
                          { label: 'Orange', value: '#D9876B' }
                        ]}
                        onLockedClick={() => setComingSoonMessage('Coming soon')}
                      />
                    </div>
                  </div>
                </div>

                {/* 2) Response Style */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-white mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>Response Style</p>
                  <div className="flex flex-col gap-[16px]">
                    {/* Row A - Response Length */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Response Length</p>
                      </div>
                      <CustomSelect
                        value={responseLength}
                        onChange={(value) => {
                          if (value !== 'Balanced (Default)') {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setResponseLength('Balanced (Default)'), 0);
                          } else {
                            setResponseLength(value);
                          }
                        }}
                        options={['Balanced (Default)']}
                        lockedOptions={['More', 'Less']}
                        onLockedClick={() => setComingSoonMessage('Coming soon')}
                      />
                    </div>
                    <div className="pl-[16px] border-l-2 border-[#555]">
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999]">More: Use clear formatting and lists</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Balanced: Balanced formatting</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Less: More paragraphs instead of lists</p>
                    </div>

                    {/* Row B - Tone */}
                    <div className="flex items-center justify-between gap-[16px] mt-[8px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Tone</p>
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Controls the writing tone of answers.</p>
                      </div>
                      <CustomSelect
                        value={tone}
                        onChange={(value) => {
                          if (value !== 'Neutral (Default)') {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setTone('Neutral (Default)'), 0);
                          } else {
                            setTone(value);
                          }
                        }}
                        options={['Neutral (Default)']}
                        lockedOptions={['Friendly', 'Professional']}
                        onLockedClick={() => setComingSoonMessage('Coming soon')}
                      />
                    </div>
                  </div>
                </div>

                {/* 3) Headers & Lists */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-white mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>Headers & Lists</p>
                  <div className="flex flex-col gap-[16px]">
                    {/* Row - Formatting Preference */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Formatting Preference</p>
                      </div>
                      <CustomSelect
                        value={formattingPref}
                        onChange={(value) => {
                          if (value !== 'Balanced (Default)') {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setFormattingPref('Balanced (Default)'), 0);
                          } else {
                            setFormattingPref(value);
                          }
                        }}
                        options={['Balanced (Default)']}
                        lockedOptions={['More lists', 'More paragraphs']}
                        onLockedClick={() => setComingSoonMessage('Coming soon')}
                      />
                    </div>
                    <div className="pl-[16px] border-l-2 border-[#555]">
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999]">More lists: Use clear formatting and lists</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Balanced: Balanced formatting</p>
                      <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">More paragraphs: More paragraphs instead of lists</p>
                    </div>
                  </div>
                </div>

                {/* 4) File-related Behavior */}
                <div className="bg-[#2c2c2c] rounded-[8px] border border-[rgba(255,252,254,0.1)] p-[20px]">
                  <p className="font-['Roboto:Medium',sans-serif] font-medium text-[1rem] text-white mb-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>File-related Behavior</p>
                  <div className="flex flex-col gap-[16px]">
                    {/* Row A - Auto-summarize uploaded files */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Auto-summarize applicant profiles</p>
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Generate a risk summary after applicant data upload.</p>
                      </div>
                      <label className="relative inline-block w-[44px] h-[24px] cursor-pointer flex-shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={autoSummarize} onChange={(e) => {
                          if (e.target.checked) {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setAutoSummarize(false), 0);
                          } else {
                            setAutoSummarize(false);
                          }
                        }} />
                        <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#7760bd] transition-colors"></span>
                        <span className="absolute left-[2px] top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform peer-checked:translate-x-[20px]"></span>
                      </label>
                    </div>

                    {/* Row B - Ask before using file data */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Ask before using file data</p>
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Ask for confirmation before referencing uploaded data.</p>
                      </div>
                      <label className="relative inline-block w-[44px] h-[24px] cursor-pointer flex-shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={askBeforeUse} onChange={(e) => {
                          if (e.target.checked) {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setAskBeforeUse(false), 0);
                          } else {
                            setAskBeforeUse(false);
                          }
                        }} />
                        <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#7760bd] transition-colors"></span>
                        <span className="absolute left-[2px] top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform peer-checked:translate-x-[20px]"></span>
                      </label>
                    </div>

                    {/* Row C - Preferred analysis depth */}
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-white">Preferred risk analysis depth</p>
                        <p className="font-['Roboto:Regular',sans-serif] text-[0.75rem] text-[#999] mt-[4px]">Controls how detailed credit risk analysis should be.</p>
                      </div>
                      <CustomSelect
                        value={analysisDepth}
                        onChange={(value) => {
                          if (value !== 'Balanced') {
                            setComingSoonMessage('Coming soon');
                            setTimeout(() => setAnalysisDepth('Balanced'), 0);
                          } else {
                            setAnalysisDepth(value);
                          }
                        }}
                        options={['Balanced']}
                        lockedOptions={['Quick', 'Deep']}
                        onLockedClick={() => setComingSoonMessage('Coming soon')}
                      />
                    </div>
                  </div>
                </div>

                {/* Coming Soon toast for Personalization */}
                {comingSoonMessage && (
                  <Toast 
                    message={comingSoonMessage}
                    onClose={() => setComingSoonMessage(null)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Context Confirmation Modal */}
      {showClearContextConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#2c2c2c] rounded-[16px] w-[400px] p-[24px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[1.125rem] text-white mb-[12px]">Clear conversation context?</p>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999] mb-[24px]">This will reset the current session context.</p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setShowClearContextConfirm(false)}
                className="border border-[#555] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-all"
              >
                <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe]">Cancel</p>
              </button>
              <button
                onClick={() => {
                  setShowClearContextConfirm(false);
                  setClearContextSuccess(true);
                  // Clear context logic here
                }}
                className="bg-[#7760bd] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#8870cd] transition-all"
              >
                <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#fffcfe]">Clear</p>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Cache Confirmation Modal */}
      {showClearCacheConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#2c2c2c] rounded-[16px] w-[400px] p-[24px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[1.125rem] text-white mb-[12px]">Clear local cache?</p>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999] mb-[24px]">This will remove temporary files from this device. Your chats will not be affected.</p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setShowClearCacheConfirm(false)}
                className="border border-[#555] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-all"
              >
                <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe]">Cancel</p>
              </button>
              <button
                onClick={() => {
                  setShowClearCacheConfirm(false);
                  localStorage.removeItem('makeen_chats');
                  localStorage.removeItem('makeen_active_chat_id');
                  setClearCacheSuccess(true);
                  setTimeout(() => window.location.reload(), 1000);
                }}
                className="bg-[#7760bd] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#8870cd] transition-all"
              >
                <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#fffcfe]">Clear</p>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete All Chats Confirmation Modal */}
      {showDeleteAllChatsConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#2c2c2c] rounded-[16px] w-[440px] p-[24px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[1.125rem] text-white mb-[12px]">Delete all chats?</p>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999] mb-[16px]">This action cannot be undone. All your saved conversations will be permanently removed.</p>
            <div className="mb-[24px]">
              <p className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#999] mb-[8px]">Type <span className="font-['Roboto:SemiBold',sans-serif] text-white">DELETE</span> to confirm:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#555] rounded-[6px] px-[12px] py-[10px] text-white font-['Roboto:Regular',sans-serif] text-[0.875rem] focus:outline-none focus:border-[#dc2626] transition-colors"
                placeholder="Type DELETE"
              />
            </div>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => {
                  setShowDeleteAllChatsConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="border border-[#555] rounded-[8px] px-[20px] h-[40px] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-all"
              >
                <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#fffcfe]">Cancel</p>
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmText === 'DELETE') {
                    setShowDeleteAllChatsConfirm(false);
                    setDeleteConfirmText('');
                    setDeleteAllChatsSuccess(true);
                    // Delete all chats logic here
                    setTimeout(() => setDeleteAllChatsSuccess(false), 2500);
                    if (onDeleteAllChats) {
                      onDeleteAllChats();
                    }
                  }
                }}
                className={`rounded-[8px] px-[20px] h-[40px] flex items-center justify-center transition-all ${
                  deleteConfirmText === 'DELETE'
                    ? 'bg-[#dc2626] hover:bg-[#ef4444] cursor-pointer'
                    : 'bg-[#dc2626]/40 cursor-not-allowed'
                }`}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <p className="font-['Roboto:Medium',sans-serif] font-medium text-[0.875rem] text-[#fffcfe]">Delete All</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}