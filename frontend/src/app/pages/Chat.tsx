import { useState, useRef, useEffect } from 'react';
import { PenSquare, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from '@/imports/svg-i4pd84glzg';
import svgPathsAnswer from '@/imports/svg-durn51uks6';
import svgPathsSettings from '@/imports/svg-92ly2gkslu';
import imgImage39 from '@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Tooltip } from '@/app/components/Tooltip';
import { FeedbackModal } from '@/app/components/FeedbackModal';
import { SettingsModal } from '@/app/components/SettingsModal';
import { EditProfileModal } from '@/app/components/EditProfileModal';
import { AccountDropdown } from '@/app/components/AccountDropdown';
import { TermsModal } from '@/app/components/TermsModal';
import { KeyboardShortcutsModal } from '@/app/components/KeyboardShortcutsModal';
import { ReportBugModal } from '@/app/components/ReportBugModal';
import { HelpCenter } from '@/app/pages/HelpCenter';
import { TermsAndPolicies } from '@/app/pages/TermsAndPolicies';
import { SubscriptionPage } from '@/app/pages/Subscription';
import { DefaultAvatar } from '@/app/components/DefaultAvatar';
import { WelcomeHeader } from '@/app/components/WelcomeHeader';
import { Toast } from '@/app/components/Toast';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { addChatAPI, viewHistoryAPI, deleteChatAPI, deleteAllChatsAPI, saveMessageAPI, getMessagesAPI, uploadFileAPI, renameChatAPI, updateFileColumnAPI } from '@/lib/chatApi';

// Typewriter effect component for AI responses
function TypewriterText({ 
  text, 
  messageId, 
  isLatest, 
  onTypingStart, 
  onTypingComplete,
  shouldStop 
}: { 
  text: string; 
  messageId: string; 
  isLatest: boolean;
  onTypingStart?: () => void;
  onTypingComplete?: () => void;
  shouldStop?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState(isLatest ? '' : text);
  const [currentIndex, setCurrentIndex] = useState(isLatest ? 0 : text.length);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Only animate if this is the latest message
    if (!isLatest) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // Reset and start animation for new message
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
    onTypingStart?.();
  }, [messageId, isLatest, text]);

  useEffect(() => {
    // Stop typing if shouldStop is true
    if (shouldStop && isTyping) {
      setDisplayedText(text); // Show full text immediately
      setCurrentIndex(text.length);
      setIsTyping(false);
      onTypingComplete?.();
      return;
    }

    if (!isLatest || currentIndex >= text.length) {
      if (isTyping && currentIndex >= text.length) {
        setIsTyping(false);
        onTypingComplete?.();
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, 20); // Speed: 20ms per character (adjust for faster/slower typing)

    return () => clearTimeout(timeout);
  }, [currentIndex, text, isLatest, shouldStop, isTyping]);

  return <>{displayedText}</>;
}

interface ChatPageProps {
  onLogout?: () => void;
  entryMode?: 'login' | 'signup' | null; // Indicates if user just logged in or signed up
}

interface XaiData {
  prediction: string;
  shapValues: Record<string, number>; // feature → SHAP value (positive = pushes toward prediction)
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'up' | 'down' | null;
  edited?: boolean;
  xaiData?: XaiData; // populated by real pipeline; mock data used until #15 is wired
  backendResponseId?: number; // RESPONSE_ID from DB — stored after saveMessageAPI so /auth/addRating can reference it
  suggestions?: string[]; // populated when backend returns UNCLEAR — shown as clickable buttons
}

interface FileAttachment {
  name: string;
  type: 'csv' | 'xlsx';
  size?: number;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUsedAt: Date;
  fileAttachment: FileAttachment | null;
  targetColumn?: string;  // The column the user selected for AI analysis
  columns?: string[];     // All column names from the uploaded file — used for mid-chat column switching
  shareId?: string;
  isPersisted?: boolean; // Track if chat should be saved to localStorage
  backendId?: number;   // CHAT_ID returned by the backend DB — used for delete/rename API calls
}

const MAX_CHATS = 3; // Backend enforces this limit — matches POST /auth/addChat constraint

// Seed data with pre-populated chats
const getInitialChats = (): Chat[] => [
  {
    id: '4',
    title: 'Sales Forecast Analysis',
    isPersisted: true,
    messages: [
      {
        id: '4-msg-1',
        role: 'user',
        content: 'Please analyze this sales data and provide forecasting recommendations for Q2 2025.',
        timestamp: new Date(2025, 0, 21, 10, 30),
      },
      {
        id: '4-msg-2',
        role: 'assistant',
        content: 'Based on the analysis of your sales data:\n\n1. Product A shows a 23% growth trend over the last quarter\n2. Product B has stabilized with consistent monthly revenue\n3. Product C is declining and may need marketing intervention\n\nRecommendation: Increase inventory for Product A by 30% for Q2 to meet projected demand. Consider a promotional campaign for Product C to reverse the declining trend.',
        timestamp: new Date(2025, 0, 21, 10, 31),
      },
      {
        id: '4-msg-3',
        role: 'user',
        content: 'What about seasonal trends? Should we prepare differently for summer months?',
        timestamp: new Date(2025, 0, 21, 10, 35),
      },
      {
        id: '4-msg-4',
        role: 'assistant',
        content: 'Excellent question. Looking at the historical patterns:\n\nSummer months (June-August) typically show:\n- 15% increase in Product A sales\n- 8% decrease in Product B sales\n- Product C remains stable\n\nRecommendation: Adjust your Q2 strategy to front-load Product A inventory in May, and reduce Product B stock levels starting mid-June to optimize warehouse costs.',
        timestamp: new Date(2025, 0, 21, 10, 36),
      },
      // TEST ONLY — remove before go-live
      {
        id: '4-msg-5',
        role: 'assistant',
        content: "I'm not sure what you mean. Did you mean one of these?",
        timestamp: new Date(2025, 0, 21, 10, 37),
        suggestions: [
          'How many customers churned last month?',
          'What factors drive customer churn?',
          'Will this customer churn?',
        ],
      },
    ],
    createdAt: new Date(2025, 0, 21),
    lastUsedAt: new Date(2025, 0, 21),
    fileAttachment: {
      name: 'Sales_Data_Q1_2025.xlsx',
      type: 'xlsx',
      size: 2048,
    },
  },
  {
    id: '5',
    title: 'Production Planning',
    isPersisted: true,
    messages: [
      {
        id: '5-msg-1',
        role: 'user',
        content: 'Which product should we prioritize in our production schedule this week?',
        timestamp: new Date(2025, 0, 22, 14, 15),
      },
      {
        id: '5-msg-2',
        role: 'assistant',
        content: 'Increase chocolate cake production because it\'s selling the fastest and running out the most often.\n\nBased on Column A (showing high demand) and Column B (showing low production cost), it\'s recommended to increase chocolate cake production by 40% this week. This will help meet customer demand while maintaining optimal profit margins.',
        timestamp: new Date(2025, 0, 22, 14, 16),
      },
      {
        id: '5-msg-3',
        role: 'user',
        content: 'What about vanilla cake? Should we reduce its production?',
        timestamp: new Date(2025, 0, 22, 14, 20),
      },
      {
        id: '5-msg-4',
        role: 'assistant',
        content: 'Yes, vanilla cake production can be reduced by 15-20%. The data shows:\n\n- Current inventory levels are high\n- Sales velocity is slower compared to chocolate\n- Production costs are similar\n\nThis reallocation will free up production capacity and reduce inventory holding costs while focusing on your best-selling product.',
        timestamp: new Date(2025, 0, 22, 14, 21),
      },
    ],
    createdAt: new Date(2025, 0, 22),
    lastUsedAt: new Date(2025, 0, 22),
    fileAttachment: {
      name: 'CakeFactory_data.csv',
      type: 'csv',
      size: 1536,
    },
  },
];

// Helper to save to localStorage
const saveToLocalStorage = (chats: Chat[], activeChatId: string | null) => {
  // Only save persisted chats to localStorage
  const persistedChats = chats.filter(chat => chat.isPersisted !== false);
  localStorage.setItem('makeen_chats', JSON.stringify(persistedChats));
  localStorage.setItem('makeen_active_chat_id', activeChatId || '');
};

// Helper to save/load saveChatHistory setting
const saveChatHistoryToLocalStorage = (value: boolean) => {
  localStorage.setItem('makeen_save_chat_history', JSON.stringify(value));
};

const loadChatHistoryFromLocalStorage = (): boolean => {
  try {
    const saved = localStorage.getItem('makeen_save_chat_history');
    return saved !== null ? JSON.parse(saved) : true; // Default to true
  } catch {
    return true;
  }
};

// Helper to load from localStorage
const loadFromLocalStorage = (): { chats: Chat[]; activeChatId: string | null } => {
  try {
    const chatsData = localStorage.getItem('makeen_chats');
    const activeChatId = localStorage.getItem('makeen_active_chat_id');
    
    if (chatsData) {
      const chats = JSON.parse(chatsData, (key, value) => {
        // Convert date strings back to Date objects
        if (key === 'createdAt' || key === 'timestamp' || key === 'lastUsedAt') {
          return new Date(value);
        }
        return value;
      });
      // Ensure all chats have lastUsedAt and isPersisted for backward compatibility
      const chatsWithLastUsed = chats.map((chat: Chat) => ({
        ...chat,
        lastUsedAt: chat.lastUsedAt || chat.createdAt || new Date(),
        isPersisted: chat.isPersisted !== undefined ? chat.isPersisted : true,
      }));
      return { chats: chatsWithLastUsed, activeChatId: activeChatId || null };
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  
  // Return default sample chats if nothing in storage
  return {
    chats: getInitialChats(),
    activeChatId: null,
  };
};

export function ChatPage({ onLogout, entryMode = null }: ChatPageProps) {
  const { user, session } = useAuth();
  // Load initial state from localStorage
  const initialState = loadFromLocalStorage();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHoveredOverToggle, setIsHoveredOverToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>(initialState.chats);
  const [activeChatId, setActiveChatId] = useState<string | null>(initialState.activeChatId);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(
    initialState.chats.length === 0 || initialState.activeChatId === null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isChatHistoryExpanded, setIsChatHistoryExpanded] = useState(true);
  const [chatMenuOpenId, setChatMenuOpenId] = useState<string | null>(null);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ chat: Chat; index: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareModalChat, setShareModalChat] = useState<Chat | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [shareMessageModal, setShareMessageModal] = useState<{ messageId: string; content: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageValue, setEditMessageValue] = useState('');
  const [pendingNewChat, setPendingNewChat] = useState<Chat | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  // Upload modal step: 'file' = drop zone, 'loading' = uploading, 'columns' = pick target column
  const [uploadStep, setUploadStep] = useState<'file' | 'loading' | 'columns'>('file');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [sendPulse, setSendPulse] = useState(false);
  const [feedbackModalMessageId, setFeedbackModalMessageId] = useState<string | null>(null);
  const feedbackWasSubmittedRef = useRef(false); // true when modal closed via Submit, false when closed via X
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'security' | 'data' | 'personalization'>('general');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [accountDropdownRect, setAccountDropdownRect] = useState<DOMRect | undefined>(undefined);
  const [displayName, setDisplayName] = useState(() => user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'User');
  const [userEmail, setUserEmail] = useState(() => user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState(''); // Empty by default - shows first letter of username
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showReportBugModal, setShowReportBugModal] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [helpCenterInitialSection, setHelpCenterInitialSection] = useState<string | undefined>(undefined);
  const [showTermsAndPolicies, setShowTermsAndPolicies] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [welcomeMessageIndex, setWelcomeMessageIndex] = useState(0);
  const [entryGreetingShown, setEntryGreetingShown] = useState(false);
  const [welcomeMode, setWelcomeMode] = useState<'entry-login' | 'entry-signup' | 'rotating'>('rotating');
  const [saveChatHistory, setSaveChatHistory] = useState(loadChatHistoryFromLocalStorage());
  const [showChatHistoryBanner, setShowChatHistoryBanner] = useState(!loadChatHistoryFromLocalStorage());
  const [highlightSaveChatHistory, setHighlightSaveChatHistory] = useState(false);
  const [latestAiMessageId, setLatestAiMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldStopTyping, setShouldStopTyping] = useState(false);
  const userCardRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regeneratingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const columnPickerRef = useRef<HTMLDivElement>(null);
  // Set to true when handleFileUpload is called but addChatAPI hasn't resolved yet.
  // The useEffect below watches chats for backendId and auto-triggers upload when it arrives.
  const waitingForBackendIdRef = useRef(false);

  // Handle entry greeting mode (shown once per session)
  useEffect(() => {
    if (entryMode && !entryGreetingShown) {
      // Set mode based on entry type (will persist until New Chat is clicked)
      setWelcomeMode(entryMode === 'login' ? 'entry-login' : 'entry-signup');
    }
  }, [entryMode, entryGreetingShown]);

  // Debug: Monitor keyboard shortcuts modal state
  useEffect(() => {
    console.log('[DEBUG] showKeyboardShortcuts state changed to:', showKeyboardShortcuts);
  }, [showKeyboardShortcuts]);

  // Get active chat (check pending new chat first)
  const activeChat = pendingNewChat && pendingNewChat.id === activeChatId 
    ? pendingNewChat 
    : chats.find((chat) => chat.id === activeChatId) || null;

  // Filter chats based on search query, persistence, and sort by lastUsedAt
  const filteredChats = chats
    .filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
      chat.isPersisted !== false // Only show persisted chats in sidebar
    )
    .sort((a, b) => a.lastUsedAt.getTime() - b.lastUsedAt.getTime());

  // On mount, fetch the user's real chat list from the backend and use it as
  // the source of truth. This replaces any seed/localStorage data so the sidebar
  // always reflects what's actually saved in the DB.
  // Messages are preserved from localStorage by matching on CHAT_ID (stored as backendId).
  useEffect(() => {
    if (!session?.access_token) return;
    viewHistoryAPI(session.access_token)
      .then((backendChats) => {
        if (backendChats.length === 0) {
          // No chats in DB — clear sidebar so seed data doesn't show
          setChats([]);
          return;
        }
        // Load any locally saved messages from localStorage
        const localRaw = localStorage.getItem('makeen_chats');
        const localChats: Chat[] = localRaw ? JSON.parse(localRaw, (key, value) => {
          if (key === 'createdAt' || key === 'timestamp' || key === 'lastUsedAt') return new Date(value);
          return value;
        }) : [];

        // Map backend chats to the Chat interface, merging in any local messages
        const merged: Chat[] = backendChats.map((bc) => {
          const local = localChats.find((lc) => lc.backendId === bc.CHAT_ID);
          return {
            id: local?.id ?? bc.CHAT_ID.toString(),
            backendId: bc.CHAT_ID,
            title: bc.Title,
            messages: local?.messages ?? [],
            createdAt: new Date(bc.Created_at),
            lastUsedAt: local?.lastUsedAt ?? new Date(bc.Created_at),
            // Restore file chip and target column from localStorage if available,
            // otherwise fall back to DB File join (source of truth after logout).
            fileAttachment: local?.fileAttachment ?? (bc.File ? { name: bc.File.name, type: bc.File.filetype as 'csv' | 'xlsx' } : null),
            targetColumn: local?.targetColumn ?? bc.File?.target_column ?? undefined,
            isPersisted: true,
          };
        });
        setChats(merged);
      })
      .catch((err) => console.error('[viewHistory] Failed to load from backend:', err));
  }, [session?.access_token]);

  // Load profile (username + avatar) from DB on mount
  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`${import.meta.env.VITE_API_URL}/auth/user/profile`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.username) setDisplayName(data.username);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      })
      .catch(() => {});
  }, [session?.access_token]);

  // Save to localStorage whenever chats or activeChatId changes
  useEffect(() => {
    saveToLocalStorage(chats, activeChatId);
  }, [chats, activeChatId]);

  // When the user switches to a chat, load its messages from the DB.
  // This ensures messages persist across page refreshes and different devices.
  // We skip loading if messages are already in memory (already loaded this session).
  useEffect(() => {
    if (!activeChatId || !session?.access_token) return;
    const activeChat = chats.find((c) => c.id === activeChatId);
    if (!activeChat?.backendId || activeChat.messages.length > 0) return;

    getMessagesAPI(session.access_token, activeChat.backendId)
      .then((backendMessages) => {
        if (backendMessages.length === 0) return;
        // Convert backend Query+Response rows into the frontend Message format
        const messages: Message[] = [];
        backendMessages.forEach((q) => {
          // User message
          messages.push({
            id: `q-${q.QUERY_ID}`,
            role: 'user',
            content: q.query_text,
            timestamp: new Date(q.created_at),
          });
          // AI response (Response is an array from the join)
          const response = Array.isArray(q.Response) ? q.Response[0] : q.Response;
          if (response) {
            // Restore xaiData from the explanation field (saved as JSON string when the message was first created)
            // Restore backendResponseId so thumbs up/down ratings work after login
            let xaiData: XaiData | undefined;
            try {
              if (response.explanation) xaiData = JSON.parse(response.explanation);
            } catch {
              xaiData = undefined;
            }
            messages.push({
              id: `r-${q.QUERY_ID}`,
              role: 'assistant',
              content: response.answer,
              timestamp: new Date(response.created_at),
              xaiData,
              backendResponseId: response.RESPONSE_ID,
            });
          }
        });
        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, messages } : c))
        );
      })
      .catch((err) => console.error('[getMessages] Failed to load messages:', err));
  }, [activeChatId, session?.access_token]);

  // Determine if we should show the upload modal.
  // Skip if we're in the loading/columns step — the modal must stay open for the column picker.
  useEffect(() => {
    if (uploadStep !== 'file') return;
    if (activeChat) {
      // If logged in, wait until backendId is ready before opening modal.
      // addChatAPI is async — if we open the modal before it resolves, backendId will be
      // undefined when the user clicks Send, causing the column picker to be skipped.
      if (session?.access_token && activeChat.backendId === undefined) return;
      // Show upload modal if chat has no file and no messages
      setShowUploadModal(!activeChat.fileAttachment && activeChat.messages.length === 0);
    } else if (!isProcessing) {
      // If no active chat and not processing, show upload modal (New Chat state)
      setShowUploadModal(true);
    }
  }, [activeChat, isProcessing, uploadStep]);

  // When handleFileUpload was called while addChatAPI was still in-flight (backendId not ready),
  // it sets waitingForBackendIdRef and returns early showing a loading spinner.
  // This effect watches chats — when the active chat's backendId finally arrives, it auto-proceeds.
  useEffect(() => {
    if (!waitingForBackendIdRef.current) return;
    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat?.backendId || !selectedFile || !session?.access_token) return;
    waitingForBackendIdRef.current = false;
    uploadFileAPI(session.access_token, selectedFile, chat.backendId)
      .then((columns) => {
        setAvailableColumns(columns);
        setChats((prev) => prev.map((c) => c.id === activeChatId ? { ...c, columns } : c));
        setSelectedColumn(columns.length > 0 ? columns[columns.length - 1] : '');
        setUploadStep('columns');
      })
      .catch((err) => {
        console.error('[uploadFile] Backend upload failed (delayed):', err);
        setUploadStep('file');
        setShowUploadModal(false);
        setSelectedFile(null);
        setToastMessage('File upload failed. Please try again.');
      });
  }, [chats]);

  // Close column picker dropdown when clicking outside
  useEffect(() => {
    if (!showColumnPicker) return;
    const handler = (e: MouseEvent) => {
      if (columnPickerRef.current && !columnPickerRef.current.contains(e.target as Node)) {
        setShowColumnPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColumnPicker]);

  // Cycle through pipeline stages while processing
  useEffect(() => {
    if (!isProcessing) {
      setProcessingStage(0);
      return;
    }
    // Stage durations (ms): advances every 2s for demo — swap to [5000,10000,10000] when real pipeline is wired
    const delays = [2000, 2000, 2000];
    let stage = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    delays.forEach((delay, i) => {
      const accumulated = delays.slice(0, i + 1).reduce((a, b) => a + b, 0);
      timers.push(setTimeout(() => {
        stage = i + 1;
        setProcessingStage(stage);
      }, accumulated));
    });
    return () => timers.forEach(clearTimeout);
  }, [isProcessing]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, isProcessing, isRegenerating]);

  // Toast auto-hide is now handled by the Toast component itself

  // Global keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      // Check if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow certain shortcuts even when typing
      const alwaysAllowedShortcuts = 
        (cmdOrCtrl && e.key === 'k') || // Ctrl/⌘ + K
        (cmdOrCtrl && (e.key === '/' || e.key === '?')) || // Ctrl/⌘ + / or ?
        (cmdOrCtrl && e.key === ',') || // Ctrl/⌘ + ,
        (cmdOrCtrl && e.key === 'u') || // Ctrl/⌘ + U
        (cmdOrCtrl && e.key.toLowerCase() === 'h') || // Ctrl/⌘ + H
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'o') || // Ctrl/⌘ + Shift + O
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's'); // Ctrl/⌘ + Shift + S

      // Skip if typing and not an allowed shortcut
      if (isTyping && !alwaysAllowedShortcuts) {
        // Still handle Escape for stopping generation
        if (e.key === 'Escape') {
          if (isProcessing || isRegenerating || isTyping) {
            e.preventDefault();
            stopGeneration();
            setToastMessage('Stopped generating');
          }
        }
        return;
      }

      // Escape key priority handling
      if (e.key === 'Escape') {
        e.preventDefault();
        // Priority 1: Stop generation if streaming
        if (isProcessing || isRegenerating || isTyping) {
          stopGeneration();
          setToastMessage('Stopped generating');
          return;
        }
        // Priority 2: Close modal if open
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
          return;
        }
        if (showSettingsModal) {
          setShowSettingsModal(false);
          return;
        }
        if (showTermsModal) {
          setShowTermsModal(false);
          return;
        }
        if (feedbackModalMessageId) {
          setFeedbackModalMessageId(null);
          return;
        }
        if (showEditProfileModal) {
          setShowEditProfileModal(false);
          return;
        }
        if (shareModalChat) {
          setShareModalChat(null);
          return;
        }
        if (shareMessageModal) {
          setShareMessageModal(null);
          return;
        }
        if (showLogoutModal) {
          setShowLogoutModal(false);
          return;
        }
        if (showFilePreview) {
          setShowFilePreview(false);
          return;
        }
        if (showHelpCenter) {
          setShowHelpCenter(false);
          return;
        }
        if (showTermsAndPolicies) {
          setShowTermsAndPolicies(false);
          return;
        }
        if (showSubscription) {
          setShowSubscription(false);
          return;
        }
        if (showReportBugModal) {
          setShowReportBugModal(false);
          return;
        }
        return;
      }

      // Shift + Esc: Focus message input (only if no modal open)
      if (e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        // Don't focus if any modal is open
        if (!showKeyboardShortcuts && !showSettingsModal && !showTermsModal && !feedbackModalMessageId && !showEditProfileModal && !shareModalChat && !shareMessageModal && !showLogoutModal && !showFilePreview && !showHelpCenter && !showTermsAndPolicies && !showSubscription && !showReportBugModal) {
          textareaRef.current?.focus();
        }
        return;
      }

      // Ctrl/⌘ + K: Search chats
      if (cmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Ctrl/⌘ + /: Show keyboard shortcuts (works with / or ?)
      if (cmdOrCtrl && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        console.log('[DEBUG] Keyboard shortcut Ctrl+/ pressed');
        setShowKeyboardShortcuts(true);
        console.log('[DEBUG] setShowKeyboardShortcuts(true) executed from shortcut');
        return;
      }

      // Ctrl/⌘ + Shift + O: New chat
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleNewChat();
        // Focus textarea after a brief delay
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
        return;
      }

      // Ctrl/⌘ + Shift + S: Toggle sidebar
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
        return;
      }

      // Ctrl/⌘ + ,: Open settings
      if (cmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setShowSettingsModal(true);
        return;
      }

      // Ctrl/⌘ + R: Regenerate last response
      if (cmdOrCtrl && e.key === 'r') {
        e.preventDefault();
        if (activeChat && activeChat.messages.length > 0) {
          const lastMessage = activeChat.messages[activeChat.messages.length - 1];
          if (lastMessage.role === 'assistant') {
            handleRetryMessage(lastMessage.id);
          }
        }
        return;
      }

      // Ctrl/⌘ + U: Upload file
      if (cmdOrCtrl && e.key === 'u') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      // Ctrl/⌘ + H: Open Help Center
      if (cmdOrCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowHelpCenter(true);
        return;
      }

      // Ctrl/⌘ + P: Open Subscription/Pricing
      if (cmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowSubscription(true);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isProcessing,
    isRegenerating,
    showKeyboardShortcuts,
    showSettingsModal,
    showTermsModal,
    feedbackModalMessageId,
    showEditProfileModal,
    isSidebarCollapsed,
    activeChat,
    shareModalChat,
    shareMessageModal,
    showLogoutModal,
    showFilePreview,
    showHelpCenter,
    showTermsAndPolicies,
    showSubscription,
    showReportBugModal,
  ]);

  const handleFileUpload = async () => {
    if (!selectedFile && !activeChat && !pendingNewChat) return;

    const fileAttachment: FileAttachment = selectedFile
      ? {
          name: selectedFile.name,
          type: selectedFile.name.endsWith('.csv') ? 'csv' : 'xlsx',
          size: selectedFile.size,
        }
      : {
          name: 'CakeFactory_data.csv',
          type: 'csv',
          size: 1024,
        };

    let backendId = pendingNewChat?.backendId ?? activeChat?.backendId;

    // CASE: pendingNewChat exists but no backendId.
    // This happens when handleNewChat ran before session was ready (addChatAPI was never called),
    // OR when addChatAPI is still in-flight. Either way, call addChatAPI now and wait for the ID.
    if (selectedFile && session?.access_token && pendingNewChat && pendingNewChat.backendId === undefined) {
      setUploadStep('loading');
      const capturedTitle = pendingNewChat.title;
      const capturedChatId = pendingNewChat.id;
      // Move to chats so the .then() below can update it with backendId
      setChats((prev) => [...prev, { ...pendingNewChat, fileAttachment, lastUsedAt: new Date() }]);
      setPendingNewChat(null);
      waitingForBackendIdRef.current = true;
      addChatAPI(session.access_token, capturedTitle)
        .then((backendId) => {
          setChats((prev) => prev.map((c) => c.id === capturedChatId ? { ...c, backendId } : c));
          // useEffect watching chats will fire and trigger uploadFileAPI
        })
        .catch((err) => {
          let message = 'Failed to create chat.';
          try { const p = JSON.parse(err.message); if (p?.detail) message = p.detail; } catch { message = err.message; }
          setToastMessage(message);
          setChats((prev) => prev.filter((c) => c.id !== capturedChatId));
          waitingForBackendIdRef.current = false;
          setUploadStep('file');
        });
      return;
    }

    // CASE: No chat exists yet (first-page state — no pendingNewChat, no activeChat).
    // Create a chat now, await backendId, then proceed with upload.
    if (selectedFile && session?.access_token && backendId === undefined && !pendingNewChat && !activeChat) {
      console.log('[DEBUG upload] → taking first-page path (no chat exists yet)');
      setUploadStep('loading');
      const newChatId = Date.now().toString();
      const chatNumbers = chats
        .filter((c) => c.isPersisted !== false && c.title.match(/^Chat \d+$/))
        .map((c) => parseInt(c.title.replace('Chat ', ''), 10));
      const nextNumber = chatNumbers.length > 0 ? Math.max(...chatNumbers) + 1 : 1;
      const newChat: Chat = {
        id: newChatId,
        title: `Chat ${nextNumber}`,
        messages: [],
        createdAt: new Date(),
        lastUsedAt: new Date(),
        fileAttachment: null,
        isPersisted: saveChatHistory,
      };
      try {
        backendId = await addChatAPI(session.access_token, newChat.title);
        const chatWithFile = { ...newChat, backendId, fileAttachment, lastUsedAt: new Date() };
        setChats((prev) => [...prev, chatWithFile]);
        setActiveChatId(newChatId);
      } catch (err: unknown) {
        let message = 'Failed to create chat.';
        try { const parsed = JSON.parse((err as Error).message); if (parsed?.detail) message = parsed.detail; } catch { message = (err as Error).message; }
        setToastMessage(message);
        setUploadStep('file');
        return;
      }
    } else {
      // Add file to local chat state immediately (optimistic update)
      if (pendingNewChat) {
        setChats((prevChats) => [...prevChats, { ...pendingNewChat, fileAttachment, lastUsedAt: new Date() }]);
        setPendingNewChat(null);
      } else if (activeChat) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId ? { ...chat, fileAttachment, lastUsedAt: new Date() } : chat
          )
        );
      }
    }

    // Upload file to backend, then show column picker so user selects the target column.
    // If no real file is selected (e.g. sample data fallback), skip to closing the modal.
    if (selectedFile && backendId !== undefined && session?.access_token) {
      setUploadStep('loading');
      uploadFileAPI(session.access_token, selectedFile, backendId)
        .then((columns) => {
          setAvailableColumns(columns);
          // Save columns on the chat so they're available for mid-chat column switching
          setChats((prev) => prev.map((c) => c.id === activeChatId ? { ...c, columns } : c));
          // Default selection: last column (most commonly the target in tabular datasets)
          setSelectedColumn(columns.length > 0 ? columns[columns.length - 1] : '');
          setUploadStep('columns');
        })
        .catch((err) => {
          console.error('[uploadFile] Backend upload failed:', err);
          // Upload failed — close modal anyway so user isn't stuck
          setUploadStep('file');
          setShowUploadModal(false);
          setSelectedFile(null);
          setToastMessage('File upload failed. Please try again.');
        });
    } else {
      // No real file — close modal immediately (sample data fallback)
      setSelectedFile(null);
      setShowUploadModal(false);
      setToastMessage(`File "${fileAttachment.name}" uploaded successfully!`);
    }
  };

  // Called when user picks a new target column from the mid-chat dropdown in the file bar.
  // New messages will use the new column; old messages keep their original context (Option A).
  const handleChangeColumn = (newColumn: string) => {
    if (!activeChatId) return;
    setShowColumnPicker(false);
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, targetColumn: newColumn } : c))
    );
    const chat = chats.find((c) => c.id === activeChatId);
    if (chat?.backendId !== undefined && session?.access_token) {
      updateFileColumnAPI(session.access_token, chat.backendId, newColumn)
        .catch((err) => console.error('[changeColumn] Failed to save to backend:', err));
    }
  };

  // Called when user confirms their target column selection in step 2 of the upload modal.
  // Saves the column locally and persists it to the DB so it survives logout/login.
  const handleConfirmColumn = () => {
    const chat = chats.find((c) => c.id === activeChatId);
    if (selectedColumn && activeChatId) {
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, targetColumn: selectedColumn } : c))
      );
      // Persist to DB so it's restored after logout — File table has a target_column column
      if (chat?.backendId !== undefined && session?.access_token) {
        updateFileColumnAPI(session.access_token, chat.backendId, selectedColumn)
          .catch((err) => console.error('[updateFileColumn] Failed to save to backend:', err));
      }
    }
    setUploadStep('file');
    setAvailableColumns([]);
    setSelectedColumn('');
    setSelectedFile(null);
    setShowUploadModal(false);
    setToastMessage('File uploaded successfully!');
  };

  const handleFileSelect = (file: File) => {
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xlsx'];
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setToastMessage('Invalid file type. Please upload a CSV or XLSX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setToastMessage('File size too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setToastMessage(`File "${file.name}" selected. Click Send to upload.`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Copy to clipboard with fallback for when Clipboard API is blocked
  const copyToClipboard = (text: string): Promise<void> => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => {
        // If it fails, use fallback
        return fallbackCopyToClipboard(text);
      });
    }
    // Use fallback if Clipboard API is not available
    return fallbackCopyToClipboard(text);
  };

  const fallbackCopyToClipboard = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleNewChat = () => {
    // Check if we've reached the limit
    if (chats.length >= MAX_CHATS) {
      setToastMessage(`You reached the maximum number of chats (${MAX_CHATS}). Please delete a chat to create a new one.`);
      return;
    }

    const newChatId = Date.now().toString();
    
    // Find the next available "Chat X" number - only count PERSISTED chats
    const chatNumbers = chats
      .filter((chat) => chat.isPersisted !== false && chat.title.match(/^Chat \d+$/))
      .map((chat) => parseInt(chat.title.replace('Chat ', ''), 10));
    
    const nextNumber = chatNumbers.length > 0 ? Math.max(...chatNumbers) + 1 : 1;
    
    const newChat: Chat = {
      id: newChatId,
      title: `Chat ${nextNumber}`,
      messages: [],
      createdAt: new Date(),
      lastUsedAt: new Date(),
      fileAttachment: null,
      isPersisted: saveChatHistory, // Respect the current setting
    };

    // Save the new chat to the backend so it gets a real DB CHAT_ID.
    // We store the returned ID in backendId so deleteChat/renameChat can reference it later.
    // If the backend rejects (e.g. 3-chat limit), show a toast and abort.
    // Mark entry greeting as shown (if it was the first time)
    if (!entryGreetingShown) {
      setEntryGreetingShown(true);
    }

    // Increment welcome message index for rotation
    setWelcomeMessageIndex((prev) => prev + 1);

    // Switch to rotating mode
    setWelcomeMode('rotating');

    // Show banner if save chat history is OFF
    if (!saveChatHistory) {
      setShowChatHistoryBanner(true);
    }

    // Set as pending immediately so the UI switches to the new chat
    setPendingNewChat(newChat);
    setActiveChatId(newChatId);

    if (session?.access_token) {
      // Get the backendId BEFORE opening the upload modal.
      // If the modal opened immediately, the user could click Send before backendId arrived
      // and the column picker would be skipped (backendId check in handleFileUpload would fail).
      addChatAPI(session.access_token, newChat.title)
        .then((backendId) => {
          setPendingNewChat((prev) => prev?.id === newChatId ? { ...prev, backendId } : prev);
          setChats((prev) => prev.map((c) => (c.id === newChatId ? { ...c, backendId } : c)));
          setShowUploadModal(true); // ← open AFTER backendId is ready
        })
        .catch((err) => {
          let message = 'Failed to create chat.';
          try {
            const parsed = JSON.parse(err.message);
            if (parsed?.detail) message = parsed.detail;
          } catch { message = err.message; }
          setToastMessage(message);
          setChats((prev) => prev.filter((c) => c.id !== newChatId));
          setPendingNewChat(null);
          // Reset upload state so user isn't stuck on loading spinner
          waitingForBackendIdRef.current = false;
          setUploadStep('file');
        });
    } else {
      // Not logged in — open modal immediately (no backend call needed)
      setShowUploadModal(true);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sendMessage = (overrideContent?: string) => {
    const content = overrideContent ?? inputValue;
    if (content.trim() === '' || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
    };

    if (activeChat) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages: [...chat.messages, userMessage], lastUsedAt: new Date() } : chat
        )
      );
    }
    if (!overrideContent) setInputValue('');
    setIsProcessing(true);
    setShouldStopTyping(false); // Reset stop flag for new message

    // Simulate AI processing and response (~8s to let all 4 stages cycle through)
    // TODO: replace this with the real LLM API call (TODO #15) once Reem builds it
    processingTimeoutRef.current = setTimeout(() => {
      const aiContent = activeChat?.fileAttachment
        ? `Based on your data, I recommend increasing chocolate cake production — it has the highest demand and lowest stock levels.\n\nThe model predicts this product will sell out within 3 days unless restocked.`
        : 'I can help you with that. Please upload a CSV or Excel file first to analyze the data.';

      // Mock XAI data — replace with real pipeline response (TODO #15)
      const mockXaiData: XaiData | undefined = activeChat?.fileAttachment ? {
        prediction: 'High Demand',
        shapValues: {
          'Sales Velocity':  0.38,
          'Stock Level':    -0.27,
          'Price Point':     0.18,
          'Seasonality':     0.11,
          'Region':          0.06,
        },
      } : undefined;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        feedback: null,
        xaiData: mockXaiData,
      };
      if (activeChat) {
        setLatestAiMessageId(aiMessage.id); // Track for typewriter effect
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId ? { ...chat, messages: [...chat.messages, aiMessage] } : chat
          )
        );

        // Save the user message + AI response to the DB so they persist across sessions.
        // We save after the AI responds (not before) so we always store a complete Q&A pair.
        // Changed: now reads the returned responseId and stores it on the assistant message
        // so the thumbs up/down rating buttons can pass it to /auth/addRating.
        if (session?.access_token && activeChat.backendId !== undefined) {
          // Pass xaiData so it's saved as JSON in the explanation column and restored after login
          saveMessageAPI(session.access_token, activeChat.backendId, userMessage.content, aiContent, aiMessage.xaiData)
            .then(({ responseId }) => {
              setChats((prev) =>
                prev.map((chat) =>
                  chat.id === activeChatId
                    ? {
                        ...chat,
                        messages: chat.messages.map((msg) =>
                          msg.id === aiMessage.id ? { ...msg, backendResponseId: responseId } : msg
                        ),
                      }
                    : chat
                )
              );
            })
            .catch((err) => console.error('[saveMessage] Failed to save to backend:', err));
        }
      }
      setIsProcessing(false);
      processingTimeoutRef.current = null;
    }, 8000);
  };

  const stopGeneration = () => {
    // Clear processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
      setIsProcessing(false);
    }
    // Clear regenerating timeout
    if (regeneratingTimeoutRef.current) {
      clearTimeout(regeneratingTimeoutRef.current);
      regeneratingTimeoutRef.current = null;
      setIsRegenerating(false);
    }
    // Stop typewriter effect
    if (isTyping) {
      setShouldStopTyping(true);
      setTimeout(() => setShouldStopTyping(false), 100); // Reset after a brief moment
    }
  };

  const handleFeedback = (messageId: string, feedbackType: 'up' | 'down') => {
    if (!activeChat) return;

    const message = activeChat.messages.find(m => m.id === messageId);

    // For dislike
    if (feedbackType === 'down') {
      // If already disliked, toggle it off (don't open modal)
      if (message?.feedback === 'down') {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === activeChatId) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.id === messageId && msg.role === 'assistant') {
                    return { ...msg, feedback: null };
                  }
                  return msg;
                }),
              };
            }
            return chat;
          })
        );
      } else {
        // Set dislike immediately (ChatGPT behavior)
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === activeChatId) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.id === messageId && msg.role === 'assistant') {
                    return { ...msg, feedback: 'down' as const };
                  }
                  return msg;
                }),
              };
            }
            return chat;
          })
        );
        // Open feedback modal (optional)
        setFeedbackModalMessageId(messageId);
      }
      return;
    }

    // For like, toggle directly
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) => {
              if (msg.id === messageId && msg.role === 'assistant') {
                // Toggle: if clicking the same feedback, remove it; otherwise set new feedback
                const newFeedback = msg.feedback === feedbackType ? null : feedbackType;
                return { ...msg, feedback: newFeedback };
              }
              return msg;
            }),
          };
        }
        return chat;
      })
    );

    // Show toast feedback
    setToastMessage('Thanks for your feedback!');

    // Wire thumbs-up to /auth/addRating with response_type=Good.
    // Only called when toggling ON (newFeedback === 'up'), not when toggling off.
    if (feedbackType === 'up') {
      const message = activeChat?.messages.find((m) => m.id === messageId);
      const responseId = message?.backendResponseId;
      if (responseId !== undefined && session?.access_token) {
        fetch(
          `${import.meta.env.VITE_API_URL}/auth/addRating?response_type=Good&response_id=${responseId}`,
          { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } }
        ).catch((err) => console.error('[addRating] Failed:', err));
      }
    }
  };

  const handleFeedbackSubmit = (feedback: { reason: string; details: string }) => {
    if (!feedbackModalMessageId) return;

    // Update the message with down feedback
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) => {
              if (msg.id === feedbackModalMessageId && msg.role === 'assistant') {
                return { ...msg, feedback: 'down' as const };
              }
              return msg;
            }),
          };
        }
        return chat;
      })
    );

    // Show toast
    setToastMessage('Thanks for your feedback!');

    // Wire thumbs-down modal submit to /auth/addRating with response_type=Bad + category + comment.
    const message = activeChat?.messages.find((m) => m.id === feedbackModalMessageId);
    const responseId = message?.backendResponseId;
    if (responseId !== undefined && session?.access_token) {
      const params = new URLSearchParams({
        response_type: 'Bad',
        response_id: String(responseId),
        category: feedback.reason,
        ...(feedback.details ? { comment: feedback.details } : {}),
      });
      fetch(`${import.meta.env.VITE_API_URL}/auth/addRating?${params.toString()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch((err) => console.error('[addRating] Failed:', err));
    }

    // Mark as submitted so onClose knows not to revert the thumbs-down highlight
    feedbackWasSubmittedRef.current = true;
    setFeedbackModalMessageId(null);
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    copyToClipboard(content).then(() => {
      // Show checkmark icon for 2 seconds (ChatGPT behavior)
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    }).catch((err) => {
      console.error('Copy failed:', err);
      setToastMessage('Failed to copy message');
    });
  };

  const handleRetryMessage = (messageId: string) => {
    if (!activeChat) return;

    // Cancel any active streaming/processing
    setIsProcessing(false);
    setIsRegenerating(false);

    // Find the assistant message to regenerate
    const messageIndex = activeChat.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex >= 0) {
      // Find the previous user message
      const previousUserMessage = messageIndex > 0 ? activeChat.messages[messageIndex - 1] : null;
      if (previousUserMessage && previousUserMessage.role === 'user') {
        // Truncate all messages after (and including) the target assistant message
        // This is ChatGPT-like behavior - remove everything after this point
        const truncatedMessages = activeChat.messages.slice(0, messageIndex);
        
        // Update chat with truncated messages (UI reflects immediately)
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === activeChatId) {
              return {
                ...chat,
                messages: truncatedMessages,
              };
            }
            return chat;
          })
        );

        // Now regenerate the response
        setIsRegenerating(true);
        setShouldStopTyping(false); // Reset stop flag for new message
        regeneratingTimeoutRef.current = setTimeout(() => {
          const aiMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: activeChat?.fileAttachment
              ? `Increase chocolate cake production because it's selling the fastest and running out the most often.\n\nBased on Column A (showing high demand), Column B (showing low production cost), it's recommended to increase chocolate cake production.`
              : 'I can help you with that. Please upload a CSV or Excel file first to analyze the data.',
            timestamp: new Date(),
            feedback: null,
          };
          setLatestAiMessageId(aiMessage.id); // Track for typewriter effect
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === activeChatId ? { ...chat, messages: [...chat.messages, aiMessage], lastUsedAt: new Date() } : chat
            )
          );
          setIsRegenerating(false);
          regeneratingTimeoutRef.current = null;
        }, 2000);
      }
    }
  };

  const handleDeleteChat = (chat: Chat) => {
    // If there's a pending delete, finalize it immediately
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      setPendingDelete(null);
      setShowDeleteToast(false);
    }

    // Find the chat's current index
    const chatIndex = chats.findIndex((c) => c.id === chat.id);
    if (chatIndex === -1) return;

    // Optimistically remove the chat from the list
    setChats((prevChats) => prevChats.filter((c) => c.id !== chat.id));
    
    // If the deleted chat was active, clear active chat
    if (activeChatId === chat.id) {
      setActiveChatId(null);
    }

    // Set up the 8-second undo timer.
    // We only call the backend AFTER the undo window closes — avoids deleting
    // from DB and then having to re-insert if the user clicks undo.
    const timer = setTimeout(() => {
      setPendingDelete(null);
      setShowDeleteToast(false);
      // Finalize deletion in the backend using the DB-assigned backendId
      if (session?.access_token && chat.backendId !== undefined) {
        deleteChatAPI(session.access_token, chat.backendId)
          .catch((err) => console.error('[deleteChat] Backend delete failed:', err));
      }
    }, 8000);

    // Store pending delete state
    setPendingDelete({ chat, index: chatIndex, timer });
    setShowDeleteToast(true);
  };

  const handleUndoDelete = () => {
    if (!pendingDelete) return;

    // Clear the timer
    clearTimeout(pendingDelete.timer);

    // Restore the chat at its original position
    setChats((prevChats) => {
      const newChats = [...prevChats];
      newChats.splice(pendingDelete.index, 0, pendingDelete.chat);
      return newChats;
    });

    // Clear pending delete state
    setPendingDelete(null);
    setShowDeleteToast(false);
  };

  const handleStartRename = (chat: Chat) => {
    setRenamingChatId(chat.id);
    setRenameValue(chat.title);
    setChatMenuOpenId(null);
    
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 10);
  };

  const handleSaveRename = () => {
    if (!renamingChatId) return;

    const trimmedValue = renameValue.trim();
    
    // If empty, cancel and revert
    if (trimmedValue === '') {
      setRenamingChatId(null);
      setRenameValue('');
      return;
    }

    // Update the chat title locally first so the UI feels instant
    const targetChat = chats.find((c) => c.id === renamingChatId);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === renamingChatId ? { ...chat, title: trimmedValue } : chat
      )
    );

    // Persist the new title to the DB if this chat has a backendId
    if (targetChat?.backendId !== undefined && session?.access_token) {
      renameChatAPI(session.access_token, targetChat.backendId, trimmedValue)
        .catch((err) => console.error('[renameChat] Failed to save to backend:', err));
    }

    setRenamingChatId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingChatId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  // Generate or get shareId for a chat
  const getShareId = (chatId: string): string => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat?.shareId) {
      return chat.shareId;
    }

    // Generate new shareId
    const newShareId = 'share-' + Math.random().toString(36).substring(2, 15);
    
    // Update chat with shareId
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === chatId ? { ...c, shareId: newShareId } : c))
    );

    return newShareId;
  };

  const handleOpenShareModal = (chat: Chat) => {
    setShareModalChat(chat);
    setChatMenuOpenId(null);
  };

  const handleCloseShareModal = () => {
    setShareModalChat(null);
  };

  const handleShareLink = () => {
    if (!shareModalChat) return;

    const shareId = getShareId(shareModalChat.id);
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;

    copyToClipboard(shareUrl).then(() => {
      setToastMessage('Link copied');
      handleCloseShareModal();
    }).catch(() => {
      setToastMessage('Failed to copy link');
    });
  };

  const buildChatTranscript = (chat: Chat): string => {
    let transcript = `${chat.title}\n\n`;
    
    if (chat.fileAttachment) {
      transcript += `Attached file: ${chat.fileAttachment.name}\n\n`;
    }

    transcript += '---\n\n';

    chat.messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'User' : 'AI';
      transcript += `${role}: ${msg.content}\n\n`;
    });

    return transcript;
  };

  const handleCopyText = () => {
    if (!shareModalChat) return;

    const transcript = buildChatTranscript(shareModalChat);
    copyToClipboard(transcript).then(() => {
      setToastMessage('Chat copied');
      handleCloseShareModal();
    }).catch(() => {
      setToastMessage('Failed to copy');
    });
  };

  const handleDownload = () => {
    if (!shareModalChat) return;

    const transcript = buildChatTranscript(shareModalChat);
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makeen-chat-${shareModalChat.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage('Download started');
    handleCloseShareModal();
  };

  const handleSystemShare = async () => {
    if (!shareModalChat || !navigator.share) return;

    const shareId = getShareId(shareModalChat.id);
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;

    try {
      await navigator.share({
        title: shareModalChat.title,
        text: `Check out this chat: ${shareModalChat.title}`,
        url: shareUrl,
      });
      handleCloseShareModal();
    } catch (err) {
      // User cancelled or error
      console.error('Share failed:', err);
    }
  };

  const handleShareEmail = () => {
    // Demo mode - show coming soon toast
    setToastMessage('Coming soon');
    handleCloseShareModal();
  };

  // Handle "Turn on" button in banner
  const handleTurnOnChatHistory = () => {
    setShowSettingsModal(true);
    setActiveSettingsTab('security');
    setHighlightSaveChatHistory(true);
    setShowChatHistoryBanner(false);
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setHighlightSaveChatHistory(false);
    }, 2000);
  };

  // Handle save chat history setting change
  const handleSaveChatHistoryChange = (newValue: boolean) => {
    setSaveChatHistory(newValue);
    saveChatHistoryToLocalStorage(newValue);
    
    // Show appropriate toast and control banner
    if (newValue) {
      setToastMessage('Saved');
      setShowChatHistoryBanner(false);
      setHighlightSaveChatHistory(false);
      // Auto-hide "Saved" toast after 3 seconds (Toast component handles this with autoHideDuration)
    } else {
      setToastMessage('Not saved — Chat history is off.');
      setShowChatHistoryBanner(true);
    }
    
    // Only update the CURRENT chat when turning ON
    if (newValue && activeChatId) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, isPersisted: true }
            : chat // Keep other chats unchanged
        )
      );
    }
    
    // Update pending new chat if it exists
    if (pendingNewChat) {
      setPendingNewChat({
        ...pendingNewChat,
        isPersisted: newValue,
      });
    }
  };

  // Handle delete all chats
  const handleDeleteAllChats = () => {
    // Clear all local state and localStorage
    setChats([]);
    setActiveChatId(null);
    setPendingNewChat(null);
    localStorage.removeItem('makeen_chats');
    localStorage.removeItem('makeen_active_chat_id');
    // Delete all chats from the backend DB as well
    if (session?.access_token) {
      deleteAllChatsAPI(session.access_token)
        .catch((err) => console.error('[deleteAllChats] Backend delete failed:', err));
    }
    // Don't auto-create a new chat here — the sidebar will show "No chats found"
    // and the user can click "New Chat" when they're ready to start fresh.
  };

  // On first load, ensure we always have a valid state (New Chat or active chat)
  useEffect(() => {
    if (chats.length === 0 && !pendingNewChat && !activeChatId) {
      // No chats at all - create a new pending chat
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        lastUsedAt: new Date(),
        fileAttachment: null,
        isPersisted: saveChatHistory,
      };
      setPendingNewChat(newChat);
      setActiveChatId(newChatId);
    } else if (chats.length > 0 && !activeChatId && !pendingNewChat) {
      // We have chats but no active chat - create a new pending chat for New Chat state
      const newChatId = Date.now().toString();
      const chatNumbers = chats
        .filter((chat) => chat.title.match(/^Chat \\d+$/))
        .map((chat) => parseInt(chat.title.replace('Chat ', ''), 10));
      const nextNumber = chatNumbers.length > 0 ? Math.max(...chatNumbers) + 1 : chats.length + 1;
      
      const newChat: Chat = {
        id: newChatId,
        title: `Chat ${nextNumber}`,
        messages: [],
        createdAt: new Date(),
        lastUsedAt: new Date(),
        fileAttachment: null,
      };
      setPendingNewChat(newChat);
      setActiveChatId(newChatId);
    }
  }, []);

  // Message share handlers
  const handleOpenMessageShareModal = (messageId: string, content: string) => {
    setShareMessageModal({ messageId, content });
  };

  const handleCloseMessageShareModal = () => {
    setShareMessageModal(null);
  };

  const handleCopyMessageLink = () => {
    if (!shareMessageModal) return;
    const shareUrl = `https://makeen.app/share/demo-chat-${shareMessageModal.messageId}`;
    copyToClipboard(shareUrl).then(() => {
      setToastMessage('Link copied');
      handleCloseMessageShareModal();
    }).catch(() => {
      setToastMessage('Failed to copy link');
    });
  };

  const handleCopyConversationText = () => {
    if (!shareMessageModal || !activeChat) return;
    const transcript = buildChatTranscript(activeChat);
    copyToClipboard(transcript).then(() => {
      setToastMessage('Copied');
      handleCloseMessageShareModal();
    }).catch(() => {
      setToastMessage('Failed to copy');
    });
  };

  const handleDownloadTXT = () => {
    if (!activeChat) return;
    const transcript = buildChatTranscript(activeChat);
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage('Downloaded');
    handleCloseMessageShareModal();
  };

  const handleShareMessageEmail = () => {
    setToastMessage('Email share (demo)');
    handleCloseMessageShareModal();
  };

  // Handle message edit confirmation with regeneration
  const handleConfirmEdit = (editedMessageId: string) => {
    if (!activeChat) return;

    const messageIndex = activeChat.messages.findIndex((msg) => msg.id === editedMessageId);
    if (messageIndex === -1) return;

    // Update the edited message and mark it as edited
    const updatedMessages = activeChat.messages.slice(0, messageIndex + 1).map((msg) =>
      msg.id === editedMessageId ? { ...msg, content: editMessageValue, edited: true } : msg
    );

    // Update the chat with truncated messages
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: updatedMessages,
              lastUsedAt: new Date(),
            }
          : chat
      )
    );

    // Clear edit state
    setEditingMessageId(null);
    setEditMessageValue('');
    setToastMessage('Message updated');

    // Start regeneration if the edited message wasn't the last message
    if (messageIndex < activeChat.messages.length - 1) {
      setIsRegenerating(true);
      setShouldStopTyping(false); // Reset stop flag for new message

      // Simulate regeneration delay
      regeneratingTimeoutRef.current = setTimeout(() => {
        // Generate new assistant response based on the edited message
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: generateResponseBasedOnMessage(editMessageValue, activeChat.fileAttachment),
          timestamp: new Date(),
          feedback: null,
        };

        // Add the regenerated message
        setLatestAiMessageId(newAssistantMessage.id); // Track for typewriter effect
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: [...updatedMessages, newAssistantMessage],
                  lastUsedAt: new Date(),
                }
              : chat
          )
        );

        setIsRegenerating(false);
        regeneratingTimeoutRef.current = null;
      }, 1500);
    }
  };

  // Generate a demo response based on message content
  const generateResponseBasedOnMessage = (userMessage: string, fileAttachment: FileAttachment | null): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // If no file is attached, prompt for upload
    if (!fileAttachment) {
      return 'I can help you with that. Please upload a CSV or Excel file first so I can analyze the data and provide specific insights.';
    }
    
    if (lowerMsg.includes('forecast') || lowerMsg.includes('predict')) {
      return `Based on the uploaded data, I've analyzed the trends and patterns. Here are the key forecasting insights:\n\n1. **Growth Trajectory**: The data shows a consistent upward trend with seasonal variations.\n2. **Key Metrics**: Peak performance is observed during specific periods.\n3. **Recommendations**: Consider adjusting resource allocation based on these patterns.\n\nWould you like me to dive deeper into any specific aspect?`;
    } else if (lowerMsg.includes('production') || lowerMsg.includes('manufacturing')) {
      return `After analyzing the production data, here are my recommendations:\n\n1. **Efficiency Opportunities**: Several optimization points were identified in the workflow.\n2. **Resource Allocation**: Current distribution can be improved for better output.\n3. **Cost Analysis**: Potential savings identified in material usage.\n\nShall I provide a detailed breakdown of any particular area?`;
    } else if (lowerMsg.includes('sales') || lowerMsg.includes('revenue')) {
      return `I've examined the sales data and here's what stands out:\n\n1. **Top Performers**: Identified products/categories with highest revenue.\n2. **Growth Areas**: Emerging opportunities for expansion.\n3. **Action Items**: Strategic recommendations to maximize sales potential.\n\nLet me know if you'd like more detailed analytics on specific segments.`;
    } else if (lowerMsg.includes('analyze') || lowerMsg.includes('analysis')) {
      return `I've completed the analysis of your data. Here are the key findings:\n\n1. **Data Quality**: The dataset is comprehensive with ${Math.floor(Math.random() * 500) + 100} relevant records.\n2. **Main Insights**: Several significant patterns and correlations identified.\n3. **Next Steps**: Recommendations for actionable strategies based on the findings.\n\nWhat specific aspect would you like to explore further?`;
    } else {
      return `Thank you for your question. Based on the data you've provided:\n\n1. I've processed the information and identified key patterns.\n2. The analysis reveals several important insights relevant to your query.\n3. I can provide more detailed breakdowns of specific areas if needed.\n\nFeel free to ask for clarification or deeper analysis on any particular point.`;
    }
  };

  return (
    <>
      {/* Help Center Page (Full Screen Overlay) */}
      {showHelpCenter && (
        <HelpCenter
          onClose={() => {
            setShowHelpCenter(false);
            setHelpCenterInitialSection(undefined);
          }}
          source="shortcut"
          initialSection={helpCenterInitialSection}
        />
      )}

      {/* Terms & Policies Page (Full Screen Overlay) */}
      {showTermsAndPolicies && (
        <TermsAndPolicies
          onClose={() => setShowTermsAndPolicies(false)}
        />
      )}

      {/* Subscription Page (Full Screen Overlay) */}
      {showSubscription && (
        <SubscriptionPage
          onBack={() => setShowSubscription(false)}
          onOpenHelpCenter={() => {
            setShowSubscription(false);
            setHelpCenterInitialSection('subscriptions');
            setShowHelpCenter(true);
          }}
        />
      )}

      {/* Main Chat Page */}
      <div className="bg-[#1e1e1e] relative w-full h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={`absolute left-0 top-0 bottom-0 bg-[#2c2c2c] rounded-[16px] flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-[80px]' : 'w-[300px]'
        }`}
      >
        {/* Top Section - Fixed */}
        <div
          className={`flex-shrink-0 p-[24px] flex flex-col ${
            isSidebarCollapsed ? 'gap-[16px] items-center' : 'gap-[24px]'
          }`}
        >
          {/* Brand Header */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {isSidebarCollapsed ? (
              <Tooltip text="Open sidebar" position="right">
                <button
                  onClick={toggleSidebar}
                  className="p-[4px] hover:bg-[#333] rounded-[4px] transition-colors cursor-pointer relative"
                  onMouseEnter={() => setIsHoveredOverToggle(true)}
                  onMouseLeave={() => setIsHoveredOverToggle(false)}
                >
                  {isHoveredOverToggle ? (
                    <svg className="w-[28.5px] h-[28.5px]" fill="none" viewBox="0 0 28.5 28.5">
                      <path d="M24.9375 11.875H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 7.125H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 16.625H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 21.375H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ) : (
                    <div className="w-[40px] h-[40px]">
                      <img
                        alt="Makeen Logo"
                        className="w-full h-full object-cover rounded-[4px]"
                        src={imgImage39}
                      />
                    </div>
                  )}
                </button>
              </Tooltip>
            ) : (
              <>
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-[8px] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-[56px] h-[56px] rounded-[6px] overflow-hidden">
                    <img
                      alt="Makeen Logo"
                      className="w-full h-full object-cover"
                      src={imgImage39}
                    />
                  </div>
                  <p
                    className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[24px] text-[#fffcfe]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Makeen
                  </p>
                </button>
                <Tooltip text="Close sidebar" position="right">
                  <button
                    onClick={toggleSidebar}
                    className="p-[4px] hover:bg-[#333] rounded-[4px] transition-colors cursor-pointer"
                  >
                    <svg className="w-[28.5px] h-[28.5px]" fill="none" viewBox="0 0 28.5 28.5">
                      <path d="M24.9375 11.875H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 7.125H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 16.625H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 21.375H3.5625" stroke="#9E9E9E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}
          </div>

          {/* Search Field */}
          {isSidebarCollapsed ? (
            <Tooltip text="Search" position="right">
              <button className="bg-[#333] flex items-center rounded-[8px] cursor-pointer hover:bg-[#3a3a3a] transition-colors p-[12px] justify-center">
                <svg className="w-[20.5px] h-[20.5px] shrink-0" fill="none" viewBox="0 0 20.5 20.5">
                  <path d={svgPaths.p39117340} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d={svgPaths.p11970080} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </Tooltip>
          ) : (
            <div className="relative group/search">
              
              {/* ORIGINAL Highlight - Sharp gradient border */}
              <div 
                className="absolute inset-[-2px] rounded-[10px] opacity-0 group-focus-within/search:opacity-60 transition-opacity duration-[180ms] pointer-events-none"
                style={{
                  background: '#7760bd',
                  padding: '2px',
                }}
              >
                <div className="h-full w-full bg-transparent rounded-[8px]"></div>
              </div>
              
              {/* ORIGINAL Highlight - Blurred glow */}
              <div 
                className="absolute inset-[-3px] rounded-[11px] opacity-0 group-focus-within/search:opacity-25 transition-opacity duration-[180ms] pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #7760bd 0%, #9580d4 25%, #FFC107 50%, #E59866 75%, #7760bd 100%)',
                  filter: 'blur(18px)',
                }}
              />
              

              <div className="relative bg-[#333] flex items-center gap-[16px] p-[16px] rounded-[8px] transition-all">
                <svg className="w-[20.5px] h-[20.5px] shrink-0" fill="none" viewBox="0 0 20.5 20.5">
                  <path d={svgPaths.p39117340} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d={svgPaths.p11970080} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white placeholder:text-[#9e9e9e] outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:bg-[#444] rounded-[4px] p-[4px] transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                      <path d="M12 4L4 12M4 4L12 12" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* New Chat Button — disabled when user already has 3 chats */}
          <Tooltip
            text={chats.length >= MAX_CHATS ? 'Delete a chat to create a new one' : 'New chat'}
            position="right"
            disabled={!isSidebarCollapsed && chats.length < MAX_CHATS}
          >
            <button
              onClick={handleNewChat}
              disabled={chats.length >= MAX_CHATS}
              className={`flex items-center rounded-[8px] transition-colors ${
                chats.length >= MAX_CHATS
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-[#333]'
              } ${isSidebarCollapsed ? 'p-[12px] justify-center' : 'gap-[16px] p-[16px] w-full'}`}
            >
              <PenSquare className="w-[20px] h-[20px] shrink-0 stroke-white" strokeWidth={2} />
              {!isSidebarCollapsed && (
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#9e9e9e]">New Chat</p>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Middle Section - Scrollable Chat List */}
        {!isSidebarCollapsed && (
          <>
            {/* Divider */}
            <div className="mx-[24px] h-[1px] bg-white opacity-20" />

            {/* Chat History Header - Dropdown */}
            <div className="px-[24px] pt-[16px]">
              <button 
                onClick={() => setIsChatHistoryExpanded(!isChatHistoryExpanded)}
                className="flex gap-[12px] items-center p-[16px] hover:bg-[#333] rounded-[8px] transition-colors cursor-pointer w-full"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p16599900} fill="white" />
                </svg>
                <p className="flex-1 text-left font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#9e9e9e]">Chat history</p>
                {isChatHistoryExpanded ? (
                  <ChevronDown className="w-[16px] h-[16px] stroke-[#9e9e9e] transition-transform" strokeWidth={2} />
                ) : (
                  <ChevronRight className="w-[16px] h-[16px] stroke-[#9e9e9e] transition-transform" strokeWidth={2} />
                )}
              </button>
            </div>

            {/* Chat History List */}
            {isChatHistoryExpanded && (
              <div className="flex-1 overflow-y-auto overflow-x-visible px-[24px] pb-[16px] pt-[4px]">
                <div className="flex flex-col gap-[12px] pl-[18px]">
                  {filteredChats.length > 0 ? (
                    [...filteredChats].reverse().map((chat) => (
                      <div
                        key={chat.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                      >
                        <div className="flex items-center gap-[8px] min-w-0">
                          {renamingChatId === chat.id ? (
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={handleRenameKeyDown}
                              onBlur={handleSaveRename}
                              className="flex-1 min-w-0 max-w-full bg-[#333] text-white font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] px-[8px] py-[4px] rounded-[6px] outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setActiveChatId(chat.id);
                              }}
                              className={`flex-1 font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-left transition-all cursor-pointer ${
                                activeChatId === chat.id ? 'text-[#7760bd]' : 'text-[#fffcfe] hover:text-[#7760bd]'
                              } ${
                                hoveredChatId === chat.id ? 'bg-[#7760bd]/5 px-[8px] py-[4px] rounded-[6px]' : ''
                              }`}
                            >
                              {chat.title}
                            </button>
                          )}
                          {/* Three Dots Menu */}
                          {hoveredChatId === chat.id && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChatMenuOpenId(chatMenuOpenId === chat.id ? null : chat.id);
                                }}
                                className="p-[4px] hover:bg-[#333] rounded-[4px] transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-[16px] h-[16px] stroke-[#9e9e9e]" strokeWidth={2} />
                              </button>
                              {/* Dropdown Menu */}
                              {chatMenuOpenId === chat.id && (
                                <div className="absolute right-0 top-full mt-[4px] bg-[#1a1a1a] rounded-[8px] shadow-lg py-[4px] min-w-[140px] z-20">
                                  <button
                                    className="w-full px-[16px] py-[8px] text-left text-white text-[14px] hover:bg-[#7760bd]/20 transition-colors cursor-pointer flex items-center gap-[8px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenShareModal(chat);
                                    }}
                                  >
                                    <span>Share</span>
                                  </button>
                                  <button
                                    className="w-full px-[16px] py-[8px] text-left text-white text-[14px] hover:bg-[#7760bd]/20 transition-colors cursor-pointer flex items-center gap-[8px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartRename(chat);
                                    }}
                                  >
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    className="w-full px-[16px] py-[8px] text-left text-red-400 text-[14px] hover:bg-red-400/20 transition-colors cursor-pointer flex items-center gap-[8px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setChatMenuOpenId(null);
                                      handleDeleteChat(chat);
                                    }}
                                  >
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#808080] italic">
                      No chats found
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Section - Fixed */}
        <div className="flex-shrink-0 mt-auto p-[24px]">
          {/* Profile Widget / Account Trigger */}
          {isSidebarCollapsed ? (
            <button 
              ref={userCardRef}
              onClick={() => {
                const rect = userCardRef.current?.getBoundingClientRect();
                setAccountDropdownRect(rect);
                setShowAccountDropdown(!showAccountDropdown);
              }}
              className="w-[40px] h-[40px] rounded-full hover:ring-2 hover:ring-[#7760bd] transition-all cursor-pointer"
            >
              {avatarUrl ? (
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    alt="User Profile"
                    className="w-full h-full object-cover"
                    src={avatarUrl}
                  />
                </div>
              ) : (
                <DefaultAvatar displayName={displayName} size={40} />
              )}
            </button>
          ) : (
            <button
              ref={userCardRef}
              onClick={() => {
                const rect = userCardRef.current?.getBoundingClientRect();
                setAccountDropdownRect(rect);
                setShowAccountDropdown(!showAccountDropdown);
              }}
              className="bg-[#333] flex items-center gap-[16px] px-[16px] py-[16px] rounded-[8px] hover:bg-[#3a3a3a] transition-colors cursor-pointer w-full"
            >
              {avatarUrl ? (
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
                  <img
                    alt="User Profile"
                    className="w-full h-full object-cover"
                    src={avatarUrl}
                  />
                </div>
              ) : (
                <DefaultAvatar displayName={displayName} size={40} />
              )}
              <div className="flex flex-col gap-[4px] flex-1 min-w-0 text-left">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#fffcfe] truncate text-left">{displayName}</p>
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] text-[#808080] truncate text-left">{userEmail}</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`h-full flex flex-col relative transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-[80px]' : 'ml-[300px]'
        }`}
      >
        {/* Upload Modal Overlay */}
        {showUploadModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-[16px] md:p-[24px]">
            <div className="w-full max-w-[700px] flex flex-col gap-[32px]">
              {/* Welcome Header */}
              <WelcomeHeader displayName={displayName} messageIndex={welcomeMessageIndex} mode={welcomeMode} />
              
              {/* Upload Card */}
              <div className="bg-[#2c2c2c] rounded-[8px] w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col">
                {/* Modal Header — title changes per step */}
                <div className="bg-[#2c2c2c] px-[20px] md:px-[24px] py-[14px] md:py-[16px] rounded-t-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] md:text-[18px] text-white">
                    {uploadStep === 'columns' ? 'Select Target Column' : 'File Upload'}
                  </p>
                </div>

                {/* ── Step 1: File drop zone ── */}
                {uploadStep === 'file' && (
                  <div className="px-[20px] md:px-[24px] py-[20px] md:py-[26px] flex flex-col gap-[14px] md:gap-[16px]">
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      aria-label="Upload CSV or XLSX file"
                      accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {/* Upload Drop Zone */}
                    <div
                      onClick={handleDropZoneClick}
                      className={`bg-[#262626] border-2 border-dashed rounded-[8px] px-[20px] md:px-[80px] py-[24px] md:py-[32px] flex flex-col gap-[10px] md:gap-[12px] items-center text-center cursor-pointer transition-all ${
                        isDragging ? 'border-[#7760bd] bg-[#2a2a2a]' : 'border-[#bebebe] hover:border-[#7760bd] hover:bg-[#2a2a2a]'
                      } ${selectedFile ? 'border-[#08B839] bg-[#08B839]/10' : ''}`}
                      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p2fe12e80} stroke={selectedFile ? '#08B839' : 'white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M9 15L12 12L15 15" stroke={selectedFile ? '#08B839' : 'white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M12 12V21" stroke={selectedFile ? '#08B839' : 'white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      <p className={`font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] ${selectedFile ? 'text-[#08B839]' : 'text-white'}`}>
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or drag file to this area to upload'}
                      </p>
                    </div>

                    <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#ccc]">Formats accepted are .csv and .xlsx</p>
                    <div className="h-[1px] bg-black opacity-20" />
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#f5f5f5]">If you do not have a file you can use the sample below:</p>
                    <button
                      onClick={() => setShowFilePreview(true)}
                      className="bg-[#262626] border border-[#d0d0d0] rounded-[8px] px-[16px] md:px-[24px] h-[40px] md:h-[44px] flex gap-[8px] items-center justify-center cursor-pointer hover:bg-[#2a2a2a] hover:border-[#7760bd] transition-all"
                    >
                      <svg className="w-[20px] md:w-[24px] h-[20px] md:h-[24px]" fill="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p2c7f0600} stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        <path d={svgPaths.p18d48b80} stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        <path d="M8 11H16V18H8V11Z" stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        <path d="M8 15H16" stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        <path d="M11 11V18" stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#e9e9e9] truncate">Download Sample Template</p>
                    </button>
                  </div>
                )}

                {/* ── Step 2: Uploading / parsing spinner ── */}
                {uploadStep === 'loading' && (
                  <div className="px-[24px] py-[48px] flex flex-col items-center gap-[16px]">
                    <div className="w-[40px] h-[40px] border-4 border-[#7760bd] border-t-transparent rounded-full animate-spin" />
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#ccc]">Uploading and parsing your file…</p>
                  </div>
                )}

                {/* ── Step 3: Column picker ── */}
                {uploadStep === 'columns' && (
                  <div className="px-[20px] md:px-[24px] py-[20px] md:py-[26px] flex flex-col gap-[16px]">
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#ccc]">
                      Choose the column you want the AI to predict or analyze. This is usually the last column in your dataset.
                    </p>
                    <select
                      title="Target column"
                      value={selectedColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="bg-[#262626] border border-[#bebebe] text-white rounded-[8px] px-[14px] h-[44px] text-[15px] focus:outline-none focus:border-[#7760bd] cursor-pointer"
                    >
                      {availableColumns.map((col) => (
                        <option key={col} value={col} className="bg-[#262626]">{col}</option>
                      ))}
                    </select>
                    <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#888]">
                      {availableColumns.length} column{availableColumns.length !== 1 ? 's' : ''} detected in your file
                    </p>
                  </div>
                )}

              {/* Modal Footer — button changes per step */}
              <div className="bg-[#2c2c2c] border-t border-black px-[20px] md:px-[24px] py-[10px] md:py-[12px] rounded-b-[8px] flex justify-end">
                {uploadStep === 'columns' ? (
                  <button
                    onClick={handleConfirmColumn}
                    disabled={!selectedColumn}
                    className="bg-[#7760bd] disabled:opacity-50 rounded-[8px] px-[24px] md:px-[28px] h-[38px] md:h-[42px] flex items-center justify-center cursor-pointer hover:bg-[#8870cd] hover:shadow-[0_0_20px_rgba(119,96,189,0.5)] hover:scale-105 transition-all"
                  >
                    <p className="font-['Roboto:Medium',sans-serif] font-medium text-[14px] md:text-[16px] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Confirm
                    </p>
                  </button>
                ) : (
                  <button
                    onClick={handleFileUpload}
                    disabled={uploadStep === 'loading'}
                    className="bg-[#7760bd] disabled:opacity-50 rounded-[8px] px-[24px] md:px-[28px] h-[38px] md:h-[42px] flex items-center justify-center cursor-pointer hover:bg-[#8870cd] hover:shadow-[0_0_20px_rgba(119,96,189,0.5)] hover:scale-105 transition-all"
                  >
                    <p className="font-['Roboto:Medium',sans-serif] font-medium text-[14px] md:text-[16px] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Send
                    </p>
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Chat Interface (shown when file is uploaded) */}
        {!showUploadModal && activeChat?.fileAttachment && (
          <div className="h-full flex flex-col p-[16px] md:p-[40px]">
            {/* File bar — max width capped, right-aligned, shrinks on small screens */}
            <div className="mb-[24px] flex justify-end">
            <div className="w-full max-w-[480px] bg-[#333] border border-[#555] rounded-[8px] px-[16px] py-[12px] flex items-center gap-[12px] shadow-lg">
              {/* File icon + name — clicking opens file preview */}
              <button
                onClick={() => setShowFilePreview(true)}
                className="flex gap-[12px] items-center flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <svg className="w-[24px] h-[24px] flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p2c7f0600} stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d={svgPaths.p18d48b80} stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M8 11H16V18H8V11Z" stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M8 15H16" stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M11 11V18" stroke="#08B839" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
                <div className="flex flex-col min-w-0 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white truncate">{activeChat.fileAttachment.name}</p>
                  <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#9e9e9e]">{activeChat.fileAttachment.type.toUpperCase()}</p>
                </div>
              </button>

              {/* Target column — clickable to change mid-chat (#13b) */}
              {activeChat.targetColumn && (
                <>
                  <div className="w-[1px] h-[32px] bg-[#555] flex-shrink-0" />
                  <div className="relative flex-shrink-0" ref={columnPickerRef}>
                    <button
                      type="button"
                      onClick={() => activeChat.columns?.length ? setShowColumnPicker((v) => !v) : undefined}
                      className={`flex flex-col items-end ${activeChat.columns?.length ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
                      title={activeChat.columns?.length ? 'Change target column' : undefined}
                    >
                      <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#7760bd] uppercase tracking-wide">Target Column</p>
                      <div className="flex items-center gap-[4px]">
                        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[13px] text-white">{activeChat.targetColumn}</p>
                        {activeChat.columns?.length && (
                          <svg
                            className={`w-[12px] h-[12px] text-[#9e9e9e] transition-transform duration-200 ${showColumnPicker ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                    {showColumnPicker && activeChat.columns && (
                      <motion.div
                        className="absolute right-0 top-[calc(100%+8px)] bg-[#2c2c2c] border border-[#444] rounded-[8px] shadow-xl z-50 min-w-[160px] max-h-[200px] overflow-y-auto"
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <p className="px-[12px] pt-[10px] pb-[6px] font-['Inter:Regular',sans-serif] text-[10px] text-[#666] uppercase tracking-wide">Select column</p>
                        {activeChat.columns.map((col) => (
                          <button
                            type="button"
                            key={col}
                            onClick={() => handleChangeColumn(col)}
                            className={`w-full text-left px-[12px] py-[8px] text-[13px] transition-colors hover:bg-[#3a3a3a] ${
                              col === activeChat.targetColumn
                                ? 'text-[#7760bd] font-semibold'
                                : 'text-white font-normal'
                            }`}
                          >
                            {col}
                            {col === activeChat.targetColumn && (
                              <span className="ml-[6px] text-[10px] text-[#7760bd]">✓</span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
            </div>


            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto pr-[4px] md:pr-[8px]" ref={chatContainerRef}>
              <div className="px-[12px] md:px-[40px]">
              {activeChat.messages.map((message, index) => (
                <motion.div 
                  key={message.id} 
                  className="mb-[24px]"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  {message.role === 'user' ? (
                    /* User Message Bubble - Right Aligned */
                    <div className="flex flex-col items-end group/user">
                      {editingMessageId === message.id ? (
                        /* Edit Mode */
                        <div className="bg-[#5e4a99] rounded-[16px] px-[24px] py-[12px] max-w-[700px] w-full">
                          <textarea
                            className="w-full bg-transparent text-white font-['Roboto:Regular',sans-serif] text-[16px] leading-[24px] resize-none outline-none border-none placeholder:text-white/70"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                            value={editMessageValue}
                            onChange={(e) => setEditMessageValue(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-[8px] mt-[8px] justify-end">
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditMessageValue('');
                              }}
                              className="p-[6px] rounded-[6px] hover:bg-[#444] transition-colors"
                              title="Cancel"
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                                <path d="M12 4L4 12M4 4L12 12" stroke="#B0B0B0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleConfirmEdit(message.id)}
                              className="p-[6px] rounded-[6px] bg-[#7760bd] hover:bg-[#8870cd] transition-colors"
                              title="Confirm"
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                                <path d="M13 4L6 11L3 8" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Display Mode */
                        <>
                          <div className="bg-[#5e4a99] rounded-[16px] px-[24px] py-[12px] max-w-[700px] overflow-x-hidden">
                            <p
                              className="font-['Roboto:Regular',sans-serif] text-[16px] leading-[24px] text-white"
                              style={{ 
                                fontVariationSettings: "'wdth' 100",
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word'
                              }}
                            >
                              {message.content}
                            </p>
                            {message.edited && (
                              <p className="font-['Inter:Regular',sans-serif] text-[12px] text-white/70 mt-[6px] italic">
                                (edited)
                              </p>
                            )}
                          </div>
                          {/* Hover Actions */}
                          <div className="flex gap-[8px] mt-[6px] opacity-0 group-hover/user:opacity-100 transition-opacity">
                            {/* Copy */}
                            <button
                              onClick={() => {
                                copyToClipboard(message.content).then(() => {
                                  setCopiedMessageId(message.id);
                                  setTimeout(() => {
                                    setCopiedMessageId(null);
                                  }, 2000);
                                }).catch(() => {
                                  setToastMessage('Failed to copy');
                                });
                              }}
                              className="p-[4px] rounded-[6px] hover:bg-[#333] transition-colors"
                              title={copiedMessageId === message.id ? "Copied" : "Copy"}
                            >
                              {copiedMessageId === message.id ? (
                                /* Checkmark Icon */
                                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 18 18">
                                  <path d="M3 9L7 13L15 5" stroke="#7760bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                /* Copy Icon */
                                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 18 18">
                                  <rect x="6" y="6" width="10" height="10" rx="2" stroke="#B0B0B0" strokeWidth="1.5" fill="none" />
                                  <path d="M12 6V4C12 2.89543 11.1046 2 10 2H4C2.89543 2 2 2.89543 2 4V10C2 11.1046 2.89543 12 4 12H6" stroke="#B0B0B0" strokeWidth="1.5" fill="none" />
                                </svg>
                              )}
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => {
                                if (!isRegenerating) {
                                  setEditingMessageId(message.id);
                                  setEditMessageValue(message.content);
                                }
                              }}
                              className={`p-[4px] rounded-[6px] transition-colors ${
                                isRegenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#333] cursor-pointer'
                              }`}
                              title={isRegenerating ? 'Cannot edit while regenerating' : 'Edit'}
                              disabled={isRegenerating}
                            >
                              <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 18 18" stroke="#B0B0B0" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l-1.261-1.261a2.5 2.5 0 00-3.536 0l-9.5 9.5a1 1 0 00-.293.707V16.5h3.067a1 1 0 00.707-.293l9.5-9.5a2.5 2.5 0 000-3.536z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 6.5l3 3" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* AI Message - Left Aligned with Action Icons */
                    <div className="flex flex-col items-start">
                      <div className="max-w-[700px]">
                        <p
                          className="font-['Roboto:Regular',sans-serif] text-[16px] leading-[24px] text-[#fffcfe] whitespace-pre-line"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          <TypewriterText
                            text={message.content}
                            messageId={message.id}
                            isLatest={message.id === latestAiMessageId}
                            onTypingStart={() => setIsTyping(true)}
                            onTypingComplete={() => setIsTyping(false)}
                            shouldStop={shouldStopTyping}
                          />
                        </p>
                      </div>

                      {/* UNCLEAR suggestions — shown when backend couldn't classify the question */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-[12px] flex flex-col gap-[8px] max-w-[700px]">
                          {message.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setInputValue('');
                                sendMessage(suggestion);
                              }}
                              className="text-left px-[16px] py-[10px] rounded-[10px] border border-[#7760bd]/40 text-[14px] text-[#ccc] hover:bg-[#7760bd]/15 hover:border-[#7760bd]/70 hover:text-white transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* XAI Results Card — shown when pipeline data is available */}
                      {message.xaiData && (
                        <motion.div
                          className="mt-[16px] w-full max-w-[520px] bg-[#2c2c2c] border border-[#3a3a3a] rounded-[12px] overflow-hidden"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                        >
                          {/* Header */}
                          <div className="px-[20px] py-[12px] border-b border-[#3a3a3a] flex items-center justify-between">
                            <div className="flex items-center gap-[8px]">
                              <svg className="w-[16px] h-[16px] text-[#7760bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                              </svg>
                              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[13px] text-white">XAI Explanation</p>
                            </div>
                            {/* Prediction badge */}
                            <div className="bg-[#7760bd]/20 border border-[#7760bd]/40 rounded-full px-[10px] py-[3px]">
                              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] text-[#7760bd]">
                                {message.xaiData.prediction}
                              </p>
                            </div>
                          </div>

                          {/* SHAP Feature Importance Chart */}
                          <div className="px-[20px] py-[14px]">
                            <p className="font-['Inter:Regular',sans-serif] text-[11px] text-[#666] uppercase tracking-wide mb-[12px]">Feature Importance (SHAP)</p>
                            {(() => {
                              const entries = Object.entries(message.xaiData.shapValues);
                              const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)));
                              return entries
                                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                                .map(([feature, value]) => {
                                  const pct = (Math.abs(value) / maxAbs) * 100;
                                  const positive = value >= 0;
                                  return (
                                    <div key={feature} className="flex items-center gap-[10px] mb-[8px] last:mb-0">
                                      <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#9e9e9e] w-[110px] flex-shrink-0 truncate text-right">{feature}</p>
                                      <div className="flex-1 h-[8px] bg-[#3a3a3a] rounded-full overflow-hidden">
                                        <motion.div
                                          className={`h-full rounded-full ${positive ? 'bg-[#7760bd]' : 'bg-[#e05a5a]'}`}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${pct}%` }}
                                          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                                        />
                                      </div>
                                      <p className={`font-['Inter:Regular',sans-serif] text-[11px] w-[36px] flex-shrink-0 text-right ${positive ? 'text-[#7760bd]' : 'text-[#e05a5a]'}`}>
                                        {positive ? '+' : ''}{value.toFixed(2)}
                                      </p>
                                    </div>
                                  );
                                });
                            })()}
                          </div>

                          {/* Footer */}
                          <div className="px-[20px] py-[8px] border-t border-[#3a3a3a] flex items-center gap-[6px]">
                            <svg className="w-[12px] h-[12px] text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-['Inter:Regular',sans-serif] text-[11px] text-[#555]">Powered by SHAP — purple bars push toward prediction, red bars push against</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Icons */}
                      <div className="flex gap-[12px] mt-[12px]">
                        {/* Copy Button */}
                        <Tooltip text={copiedMessageId === message.id ? "Copied" : "Copy"} position="top">
                          <button
                            className="p-[6px] rounded-[6px] hover:bg-[#333] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            aria-label="Copy"
                            onClick={() => handleCopyMessage(message.content, message.id)}
                          >
                            {copiedMessageId === message.id ? (
                              /* Checkmark Icon */
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path d="M3 9L7 13L15 5" stroke="#7760bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              /* Copy Icon */
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <rect x="6" y="6" width="10" height="10" rx="2" stroke="#B0B0B0" strokeWidth="1.5" fill="none" />
                                <path d="M12 6V4C12 2.89543 11.1046 2 10 2H4C2.89543 2 2 2.89543 2 4V10C2 11.1046 2.89543 12 4 12H6" stroke="#B0B0B0" strokeWidth="1.5" fill="none" />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        {/* Retry/Regenerate Button - Only show for last assistant message */}
                        {(() => {
                          // Find the last assistant message index
                          const lastAssistantIndex = activeChat.messages.map((m, i) => ({ m, i })).reverse().find(({ m }) => m.role === 'assistant')?.i;
                          return lastAssistantIndex === index;
                        })() && (
                          <Tooltip text="Regenerate" position="top">
                            <button
                              className="p-[6px] rounded-[6px] hover:bg-[#333] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                              aria-label="Regenerate"
                              onClick={() => handleRetryMessage(message.id)}
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path d="M2 9C2 5.13401 5.13401 2 9 2C11.3869 2 13.5056 3.16667 14.7513 4.96493M16 9C16 12.866 12.866 16 9 16C6.61311 16 4.49437 14.8333 3.24868 13.0351" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M14 2V5H11" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 16V13H7" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </Tooltip>
                        )}

                        {/* Like Button - Hide when disliked */}
                        {message.feedback !== 'down' && (
                          <Tooltip text="Good response" position="top">
                            <button
                              className={`p-[6px] rounded-[6px] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50 ${
                                message.feedback === 'up'
                                  ? 'bg-[#7760bd]/20 hover:bg-[#7760bd]/30'
                                  : 'hover:bg-[#333]'
                              }`}
                              onClick={() => handleFeedback(message.id, 'up')}
                              aria-label="Good response"
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path
                                  d={svgPathsAnswer.p6226600}
                                  fill={message.feedback === 'up' ? '#7760bd' : '#B0B0B0'}
                                />
                                <path
                                  d="M4.73413 6.94358V17.2287"
                                  stroke={message.feedback === 'up' ? '#7760bd' : '#B0B0B0'}
                                  strokeWidth="2.5"
                                />
                              </svg>
                            </button>
                          </Tooltip>
                        )}

                        {/* Dislike Button - Hide when liked */}
                        {message.feedback !== 'up' && (
                          <Tooltip text="Bad response" position="top">
                            <button
                              className={`p-[6px] rounded-[6px] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50 ${
                                message.feedback === 'down'
                                  ? 'bg-[#7760bd]/20 hover:bg-[#7760bd]/30'
                                  : 'hover:bg-[#333]'
                              }`}
                              onClick={() => handleFeedback(message.id, 'down')}
                              aria-label="Bad response"
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path
                                  d={svgPathsAnswer.p115b4180}
                                  fill={message.feedback === 'down' ? '#7760bd' : '#B0B0B0'}
                                />
                                <path
                                  d="M4.84912 11V0.999976"
                                  stroke={message.feedback === 'down' ? '#7760bd' : '#B0B0B0'}
                                  strokeWidth="2"
                                />
                              </svg>
                            </button>
                          </Tooltip>
                        )}

                        {/* Share Button */}
                        <Tooltip text="Share" position="top">
                          <button
                            className="p-[6px] rounded-[6px] hover:bg-[#333] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            aria-label="Share"
                            onClick={() => handleOpenMessageShareModal(message.id, message.content)}
                          >
                            <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 20 19.995">
                              <path d={svgPathsAnswer.p123ea5e0} fill="#B0B0B0" />
                            </svg>
                          </button>
                        </Tooltip>

                        {/* Read Aloud Button (Coming Soon) */}
                        <Tooltip text="Read aloud" position="top">
                          <button
                            className="p-[6px] rounded-[6px] hover:bg-[#333] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            aria-label="Read aloud"
                            onClick={() => setToastMessage('Coming soon')}
                          >
                            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="#B0B0B0" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Processing Indicator */}
              <AnimatePresence>
              {isProcessing && (() => {
                const stages = [
                  { label: 'Parsing data',          icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { label: 'Training model',         icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
                  { label: 'Computing SHAP values',  icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
                  { label: 'Generating explanation', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                ];
                return (
                  <motion.div
                    className="mb-[24px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="max-w-[480px] bg-[#2c2c2c] border border-[#3a3a3a] rounded-[12px] px-[20px] py-[16px]">
                      {/* Stage steps */}
                      <div className="flex flex-col gap-[10px] mb-[14px]">
                        {stages.map((s, i) => {
                          const done = i < processingStage;
                          const active = i === processingStage;
                          return (
                            <div key={i} className="flex items-center gap-[10px]">
                              {/* Icon circle */}
                              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                done   ? 'bg-[#7760bd]' :
                                active ? 'bg-[#7760bd]/20 border border-[#7760bd]' :
                                         'bg-[#333] border border-[#444]'
                              }`}>
                                {done ? (
                                  <svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className={`w-[14px] h-[14px] ${active ? 'text-[#7760bd]' : 'text-[#555]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                                  </svg>
                                )}
                              </div>
                              {/* Label */}
                              <p className={`font-['Inter:Regular',sans-serif] text-[13px] transition-colors duration-500 ${
                                done   ? 'text-[#7760bd] line-through' :
                                active ? 'text-white' :
                                         'text-[#555]'
                              }`}>{s.label}</p>
                              {/* Spinner on active step */}
                              {active && (
                                <svg className="w-[14px] h-[14px] text-[#7760bd] animate-spin ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Progress bar */}
                      <div className="h-[3px] w-full bg-[#3a3a3a] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#7760bd] rounded-full"
                          animate={{ width: `${(processingStage / (stages.length - 1)) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
              </AnimatePresence>

              {/* Regenerating Indicator */}
              <AnimatePresence>
              {isRegenerating && (
                <motion.div 
                  className="mb-[24px] flex flex-col items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="max-w-[700px] bg-[#2c2c2c] rounded-[12px] px-[24px] py-[16px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="flex gap-[6px]">
                        <div className="w-[8px] h-[8px] bg-[#7760bd] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-[8px] h-[8px] bg-[#7760bd] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-[8px] h-[8px] bg-[#7760bd] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#9e9e9e]">
                        Regenerating response...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input Bar */}
            <div className="mt-auto pb-[16px]">
              {/* ChatInputGlowShell - Premium multi-layer glow container */}
              <div className="relative group/composer">
                
                {/* ORIGINAL Search Highlight - Sharp gradient border (only on focus) */}
                <div 
                  className="absolute inset-[-2px] rounded-[18px] opacity-0 group-focus-within/composer:opacity-60 transition-opacity duration-[180ms] pointer-events-none"
                  style={{
                    background: '#7760bd',
                    padding: '2px',
                  }}
                >
                  <div className="h-full w-full bg-transparent rounded-[16px]"></div>
                </div>
                
                {/* ORIGINAL Search Highlight - Blurred glow (only on focus) */}
                <div 
                  className="absolute inset-[-3px] rounded-[19px] opacity-0 group-focus-within/composer:opacity-25 transition-opacity duration-[180ms] pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #7760bd 0%, #9580d4 25%, #FFC107 50%, #E59866 75%, #7760bd 100%)',
                    filter: 'blur(18px)',
                  }}
                />
                
                {/* AuraGlow - Soft radial background bloom with breathing animation */}
                <div 
                  className="absolute inset-0 rounded-[16px] pointer-events-none transition-all duration-300 ease-in-out animate-[breathe_3s_ease-in-out_infinite]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(119, 96, 189, 0.35) 0%, rgba(255, 193, 7, 0.18) 35%, transparent 70%)',
                    opacity: 0.28,
                    filter: 'blur(35px)',
                  }}
                />
                
                {/* AuraGlow Enhanced on Hover/Focus */}
                <div 
                  className="absolute inset-0 rounded-[16px] pointer-events-none transition-all duration-300 ease-in-out opacity-0 group-hover/composer:group-[:not(:focus-within)]:opacity-[0.15] group-focus-within/composer:opacity-[0.30]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(119, 96, 189, 0.4) 0%, rgba(255, 193, 7, 0.22) 40%, transparent 70%)',
                    filter: 'blur(45px)',
                    boxShadow: '0 0 60px 20px rgba(119, 96, 189, 0.20)',
                  }}
                />
                
                {/* GlowStrokeBlur - Thick blurred gradient edge (creates aura edge) */}
                <div 
                  className="absolute inset-0 rounded-[16px] pointer-events-none transition-all duration-300 ease-in-out group-hover/composer:group-[:not(:focus-within)]:opacity-[0.45] group-focus-within/composer:opacity-[0.60]"
                  style={{
                    background: 'linear-gradient(135deg, #7760bd 0%, #9580d4 20%, #FFC107 40%, #E59866 60%, #9580d4 80%, #7760bd 100%)',
                    opacity: 0.35,
                    padding: '8px',
                    filter: 'blur(14px)',
                  }}
                >
                  <div className="h-full w-full bg-transparent rounded-[8px]" />
                </div>
                
                {/* GradientStrokeLayer - Sharp 3px gradient border */}
                <div 
                  className="absolute inset-0 rounded-[16px] p-[3px] pointer-events-none transition-all duration-300 ease-in-out group-hover/composer:group-[:not(:focus-within)]:opacity-100 group-focus-within/composer:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, #7760bd 0%, #9580d4 20%, #FFC107 40%, #E59866 60%, #9580d4 80%, #7760bd 100%)',
                    opacity: 0.95,
                  }}
                >
                  <div className="h-full w-full bg-[#1a1a1a] rounded-[13px]" />
                </div>
                
                {/* ShimmerOverlay - Animated subtle shimmer */}
                <div 
                  className="absolute inset-0 rounded-[16px] pointer-events-none overflow-hidden"
                  style={{
                    opacity: 0.15,
                  }}
                >
                  <div 
                    className="absolute inset-0 animate-[shimmer_6s_linear_infinite]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(119, 96, 189, 0.5) 45%, rgba(255, 193, 7, 0.4) 50%, rgba(119, 96, 189, 0.5) 55%, transparent 100%)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                </div>
                  
                  {/* Main Composer Container - FIXED dimensions */}
                  <div className="relative bg-[#333] rounded-[16px] px-[20px] py-[14px] flex flex-col gap-[12px]">
                    {/* Top Section: Text Area */}
                    <TextareaAutosize
                      ref={textareaRef}
                      placeholder="Ask away"
                      className="bg-transparent text-[16px] text-white placeholder:text-[#9e9e9e] outline-none font-['Inter:Regular',sans-serif] resize-none max-w-full overflow-x-hidden"
                      style={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        overflowY: 'auto',
                      }}
                      minRows={1}
                      maxRows={10}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isProcessing && !isRegenerating) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={isProcessing || isRegenerating}
                    />
                    
                    {/* Bottom Section: Fixed Control Bar */}
                    <div className="flex gap-[12px] items-center justify-end relative z-10">
                      {/* Dictate Button */}
                      <button
                        className={`p-[8px] rounded-[8px] transition-all cursor-pointer focus:outline-none ${
                          isDictating ? 'bg-[#FFC107]/20' : 'hover:bg-[#444]'
                        }`}
                        onClick={() => {
                          setIsDictating(!isDictating);
                          setToastMessage('Coming soon');
                        }}
                        aria-label="Dictate"
                      >
                        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke={isDictating ? "#FFC107" : "#B0B0B0"} strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button
                        className={`bg-[#7760bd] rounded-[8px] px-[28px] py-[12px] transition-all cursor-pointer ${
                          isProcessing || isRegenerating || isTyping
                            ? 'hover:bg-[#8870cd]'
                            : 'hover:bg-[#8870cd] hover:shadow-[0_0_20px_rgba(119,96,189,0.5)] hover:scale-105'
                        }`}
                        onClick={(isProcessing || isRegenerating || isTyping) ? stopGeneration : () => sendMessage()}
                      >
                        {(isProcessing || isRegenerating || isTyping) ? (
                          /* Stop Icon - White Square */
                          <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="2" width="12" height="12" rx="2" fill="white" />
                          </svg>
                        ) : (
                          <p className="font-['Roboto:Medium',sans-serif] font-medium text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Send
                          </p>
                        )}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast 
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          autoHideDuration={toastMessage === 'Saved' ? 3000 : 4000}
        />
      )}

      {/* Chat History Off Toast */}
      {showChatHistoryBanner && (
        <div className="fixed top-[24px] left-1/2 -translate-x-1/2 z-[9999] animate-[slideDown_0.3s_ease-out]">
          <div 
            className="w-[560px] max-w-[92vw] min-h-[72px] bg-[#2c2c2c] border border-[#7760bd] rounded-[14px] px-[20px] py-[16px] shadow-[0_4px_20px_rgba(119,96,189,0.4)] flex items-start gap-[12px]"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" stroke="#7760bd" strokeWidth="2" />
                <path d="M10 6V10" stroke="#7760bd" strokeLinecap="round" strokeWidth="2" />
                <circle cx="10" cy="14" r="1" fill="#7760bd" />
              </svg>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-['Inter:SemiBold',sans-serif] font-semibold text-[15px] text-white mb-[2px]">
                Chat history is off
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#ccc]">
                This chat won't be saved. Turn it on in Settings → Security.
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-[8px] flex-shrink-0">
              {/* Turn on button */}
              <button
                onClick={handleTurnOnChatHistory}
                className="h-[34px] px-[14px] bg-[#7760bd] hover:bg-[#8870cd] text-white rounded-[10px] font-['Inter:Medium',sans-serif] font-medium text-[13px] transition-colors"
              >
                Turn on
              </button>
              
              {/* Close button */}
              <button
                onClick={() => setShowChatHistoryBanner(false)}
                className="hover:bg-[#333] rounded-[4px] p-[2px] transition-colors"
                aria-label="Close"
              >
                <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Toast with Undo */}
      {showDeleteToast && pendingDelete && (
        <div className="fixed bottom-[24px] left-1/2 transform -translate-x-1/2 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="bg-[#2c2c2c] border border-[#555] rounded-[8px] px-[24px] py-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center gap-[16px]">
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-white">
              Chat deleted
            </p>
            <button
              onClick={handleUndoDelete}
              className="bg-[#7760bd] hover:bg-[#8870cd] rounded-[6px] px-[16px] py-[6px] transition-colors cursor-pointer"
            >
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white">
                Undo
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalChat && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleCloseShareModal}
        >
          <div
            className="bg-[#1a1a1a] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[480px] max-w-[90vw] border border-[#333] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[32px] pt-[32px] pb-[16px] border-b border-[#333]">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[24px] text-white mb-[8px]">
                Share chat
              </h2>
            </div>

            {/* Share Options */}
            <div className="px-[32px] py-[24px] flex flex-col gap-[12px]">
              {/* Share Link */}
              <button
                onClick={handleShareLink}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Share Link
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Copy shareable link to clipboard
                  </p>
                </div>
              </button>

              {/* Copy Chat Text */}
              <button
                onClick={handleCopyText}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Copy Chat Text
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Copy full transcript to clipboard
                  </p>
                </div>
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Download (.txt)
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Download chat as text file
                  </p>
                </div>
              </button>

              {/* Share via Email */}
              <button
                onClick={handleShareEmail}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Share via Email (demo)
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Opens email compose / demo action
                  </p>
                </div>
              </button>

              {/* System Share - Only show if supported */}
              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleSystemShare}
                  className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
                >
                  <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                    <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                      More... (System Share)
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                      Share using system menu
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-[32px] pb-[32px] pt-[8px] flex justify-end">
              <button
                onClick={handleCloseShareModal}
                className="bg-[#2c2c2c] hover:bg-[#333] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white">
                  Close
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[400px] max-w-[90vw] border border-[#333] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-[32px] pt-[32px] pb-[24px]">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[24px] text-white mb-[12px]">
                Log out?
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#9e9e9e]">
                Are you sure you want to log out?
              </p>
            </div>
            <div className="px-[32px] pb-[32px] flex justify-end gap-[12px]">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#2c2c2c] hover:bg-[#333] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white">
                  Cancel
                </p>
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  if (onLogout) {
                    onLogout();
                  }
                }}
                className="bg-[#7760bd] hover:bg-[#6956a7] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white">
                  Log out
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Share Modal */}
      {shareMessageModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleCloseMessageShareModal}
        >
          <div
            className="bg-[#1a1a1a] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[480px] max-w-[90vw] border border-[#333] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[32px] pt-[32px] pb-[16px] border-b border-[#333]">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[24px] text-white mb-[8px]">
                Share chat
              </h2>
            </div>

            {/* Share Options */}
            <div className="px-[32px] py-[24px] flex flex-col gap-[12px]">
              {/* Share Link */}
              <button
                onClick={handleCopyMessageLink}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Share Link
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Copy shareable link to clipboard
                  </p>
                </div>
              </button>

              {/* Copy Chat Text */}
              <button
                onClick={handleCopyConversationText}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Copy Chat Text
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Copy full transcript to clipboard
                  </p>
                </div>
              </button>

              {/* Download */}
              <button
                onClick={handleDownloadTXT}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Download (.txt)
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Download chat as text file
                  </p>
                </div>
              </button>

              {/* Share via Email */}
              <button
                onClick={handleShareMessageEmail}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#333] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white">
                    Share via Email (demo)
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#9e9e9e]">
                    Opens email compose / demo action
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-[32px] pb-[32px] pt-[8px] flex justify-end">
              <button
                onClick={handleCloseMessageShareModal}
                className="bg-[#2c2c2c] hover:bg-[#333] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white">
                  Close
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowFilePreview(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[600px] max-w-[90vw] border border-[#333] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[32px] pt-[32px] pb-[16px] border-b border-[#333]">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[24px] text-white">
                {activeChat?.fileAttachment ? 'File Preview (Demo)' : 'Sample Template Preview'}
              </h2>
            </div>

            {/* File Info */}
            <div className="px-[32px] py-[24px]">
              <div className="bg-[#2c2c2c] rounded-[12px] p-[20px] mb-[20px]">
                <div className="flex items-start gap-[12px]">
                  <svg className="w-[32px] h-[32px] flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="#08B839" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 2v7h7" stroke="#08B839" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-white mb-[4px]">
                      {activeChat?.fileAttachment ? activeChat.fileAttachment.name : 'Sample_Template.csv'}
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#9e9e9e]">
                      Type: {activeChat?.fileAttachment ? activeChat.fileAttachment.type.toUpperCase() : 'CSV'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="bg-[#2c2c2c] rounded-[12px] p-[24px] min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-[48px] h-[48px] mx-auto mb-[12px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#9e9e9e] leading-[20px]">
                    Preview will be available when<br />backend is connected.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-[32px] pb-[32px] flex justify-end">
              <button
                onClick={() => setShowFilePreview(false)}
                className="bg-[#7760bd] hover:bg-[#8870cd] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white">
                  Close
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalMessageId !== null}
        onClose={() => {
          // Only revert the thumbs-down highlight if the modal was dismissed (X or overlay click).
          // If the user submitted, feedbackWasSubmittedRef is true — keep the highlight.
          if (feedbackModalMessageId && !feedbackWasSubmittedRef.current) {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg) =>
                        msg.id === feedbackModalMessageId ? { ...msg, feedback: null } : msg
                      ),
                    }
                  : chat
              )
            );
          }
          feedbackWasSubmittedRef.current = false;
          setFeedbackModalMessageId(null);
        }}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        activeTab={activeSettingsTab}
        onTabChange={setActiveSettingsTab}
        onLogout={() => setShowLogoutModal(true)}
        onViewPlansClick={() => {
          setShowSettingsModal(false);
          setShowSubscription(true);
        }}
        displayName={displayName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        onEditProfile={() => {
          setShowSettingsModal(false);
          setShowEditProfileModal(true);
        }}
        saveChatHistory={saveChatHistory}
        onSaveChatHistoryChange={handleSaveChatHistoryChange}
        highlightSaveChatHistory={highlightSaveChatHistory}
        onDeleteAllChats={handleDeleteAllChats}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentDisplayName={displayName}
        currentEmail={userEmail}
        currentAvatarUrl={avatarUrl}
        onSave={async (newDisplayName, newEmail, newAvatarUrl) => {
          setDisplayName(newDisplayName);
          setUserEmail(newEmail);
          setAvatarUrl(newAvatarUrl);
          if (!session?.access_token || !user) return;

          let finalAvatarUrl = newAvatarUrl;

          // If avatar is a base64 image, upload to Supabase Storage
          if (newAvatarUrl?.startsWith('data:')) {
            const res = await fetch(newAvatarUrl);
            const blob = await res.blob();
            const ext = blob.type.split('/')[1] ?? 'jpg';
            const path = `avatars/${user.id}.${ext}`;
            const { error } = await supabase.storage
              .from('user-files')
              .upload(path, blob, { upsert: true, contentType: blob.type });
            console.log('[AVATAR] storage upload error:', error?.message ?? 'none');
            if (!error) {
              const { data } = supabase.storage.from('user-files').getPublicUrl(path);
              finalAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
              setAvatarUrl(finalAvatarUrl);
            }
          }

          await fetch(`${import.meta.env.VITE_API_URL}/auth/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ username: newDisplayName, avatar_url: finalAvatarUrl || null }),
          });
        }}
        onAvatarChange={(newAvatarUrl) => {
          setAvatarUrl(newAvatarUrl);
        }}
      />

      {/* Account Dropdown */}
      <AccountDropdown
        isOpen={showAccountDropdown}
        onClose={() => setShowAccountDropdown(false)}
        displayName={displayName}
        email={userEmail}
        avatarUrl={avatarUrl}
        onProfileClick={() => setShowEditProfileModal(true)}
        onSubscriptionClick={() => setShowSubscription(true)}
        onPersonalizationClick={() => {
          setActiveSettingsTab('personalization');
          setShowSettingsModal(true);
        }}
        onSettingsClick={() => {
          setActiveSettingsTab('general');
          setShowSettingsModal(true);
        }}
        onTermsClick={() => setShowTermsAndPolicies(true)}
        onKeyboardShortcutsClick={() => {
          console.log('[DEBUG] onKeyboardShortcutsClick callback called');
          setShowKeyboardShortcuts(true);
          console.log('[DEBUG] setShowKeyboardShortcuts(true) executed');
        }}
        onReportBugClick={() => setShowReportBugModal(true)}
        onHelpCenterClick={() => setShowHelpCenter(true)}
        onLogoutClick={() => setShowLogoutModal(true)}
        triggerRect={accountDropdownRect}
      />

      {/* Terms and Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setShowTermsModal(false);
          setToastMessage('Terms and conditions accepted');
        }}
        readOnly={true}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => {
          console.log('[DEBUG] Keyboard shortcuts modal closing');
          setShowKeyboardShortcuts(false);
        }}
      />

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={showReportBugModal}
        onClose={() => setShowReportBugModal(false)}
        onSuccess={() => setToastMessage('Bug report sent successfully')}
      />
    </div>
    </>
  );
}