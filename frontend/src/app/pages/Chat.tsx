import { useState, useRef, useEffect } from 'react';
import { PenSquare, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from '@/imports/svg-i4pd84glzg';
import svgPathsAnswer from '@/imports/svg-durn51uks6';
import svgPathsSettings from '@/imports/svg-92ly2gkslu';
import imgImage39 from '@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { AppRail } from '@/app/components/AppRail';
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
import { supabase, getToken } from '@/lib/supabase';
import { addChatAPI, viewHistoryAPI, deleteChatAPI, deleteAllChatsAPI, saveMessageAPI, getMessagesAPI, uploadFileAPI, renameChatAPI, parseFileAPI, whatIfAPI, uploadModelAPI, generateReportAPI, type ParseResult, type ReportData } from '@/lib/chatApi';

// Tracks message IDs that have already finished the typewriter animation.
// Module-level so it survives chat switches (component unmount/remount).
const _typedMessageIds = new Set<string>();

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
  const alreadyTyped = isLatest && _typedMessageIds.has(messageId);
  const shouldAnimate = isLatest && !alreadyTyped;

  const [displayedText, setDisplayedText] = useState(shouldAnimate ? '' : text);
  const [currentIndex, setCurrentIndex] = useState(shouldAnimate ? 0 : text.length);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isLatest || alreadyTyped) {
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
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsTyping(false);
      _typedMessageIds.add(messageId);
      onTypingComplete?.();
      return;
    }

    if (!isLatest || alreadyTyped || currentIndex >= text.length) {
      if (isTyping && currentIndex >= text.length) {
        setIsTyping(false);
        _typedMessageIds.add(messageId);
        onTypingComplete?.();
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, 20);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, isLatest, shouldStop, isTyping]);

  return <>{displayedText}</>;
}

// Small tracked-out eyebrow label — same editorial signature used on the landing page,
// reused here to mark data "exhibits" (e.g. the XAI results card) as structured content.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#7760bd] text-[10px] font-sans font-semibold uppercase tracking-[0.2em]">
      {children}
    </p>
  );
}

// Hairline divider — separates list rows (chat history, feature-importance bars)
// instead of boxed cards or hover-only highlighting.
function HairlineDivider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-white/[0.08] ${className}`} />;
}

// ── Sample datasets available in the upload modal ──
const SAMPLE_DATASETS = [
  {
    id: 'german_credit',
    name: 'German Credit Risk',
    filename: 'german_credit.csv',
    description: 'Predict loan approval based on applicant financial and demographic indicators',
    url: '/datasets/german_credit.csv',
    columns: ['applicant_id', 'age', 'credit_history', 'loan_amount', 'employment_years', 'installment_rate', 'housing', 'existing_credits', 'job_type', 'credit_risk'],
    previewRows: [
      ['A001', '67', 'existing paid', '1169', '4', '2', 'own', '2', 'skilled', 'good'],
      ['A002', '22', 'all paid', '5951', '1', '3', 'free', '1', 'unskilled', 'bad'],
      ['A003', '49', 'existing paid', '2096', '7', '1', 'own', '1', 'skilled', 'good'],
      ['A004', '45', 'delayed previously', '7882', '3', '4', 'rent', '1', 'management', 'bad'],
      ['A005', '53', 'existing paid', '4870', '9', '2', 'own', '2', 'skilled', 'good'],
    ],
    suggestedQuestions: [
      'Who is most likely to default on their loan?',
      'What factors most influence loan approval decisions?',
      'Compare credit risk between skilled and unskilled applicants',
      'How does loan amount relate to default risk?',
      'Which housing type has the highest default rate?',
    ],
  },
  {
    id: 'loan_default',
    name: 'Loan Default Prediction',
    filename: 'loan_default.csv',
    description: 'Assess default risk based on borrower income, credit score, and repayment history',
    url: '/datasets/loan_default.csv',
    columns: ['loan_id', 'income', 'loan_amount', 'credit_score', 'months_employed', 'num_credit_lines', 'interest_rate', 'loan_term', 'dti_ratio', 'education', 'default'],
    previewRows: [
      ['L001', '85000', '20000', '720', '60', '4', '5.5', '36', '0.24', 'bachelor', '0'],
      ['L002', '32000', '15000', '580', '12', '2', '12.3', '60', '0.47', 'high_school', '1'],
      ['L003', '110000', '50000', '760', '120', '6', '4.2', '36', '0.18', 'master', '0'],
      ['L004', '47000', '22000', '640', '36', '3', '8.9', '48', '0.35', 'bachelor', '0'],
      ['L005', '29000', '18000', '540', '8', '1', '15.1', '60', '0.62', 'high_school', '1'],
    ],
    suggestedQuestions: [
      'Which borrower profile has the highest default risk?',
      'What is the relationship between credit score and default rate?',
      'Who are the highest risk loan applicants?',
      'How does debt-to-income ratio affect default likelihood?',
      'What are the key factors driving loan default?',
    ],
  },
  {
    id: 'credit_fraud',
    name: 'Credit Card Fraud Detection',
    filename: 'credit_fraud.csv',
    description: 'Detect fraudulent transactions based on spending patterns and account behaviour',
    url: '/datasets/credit_fraud.csv',
    columns: ['transaction_id', 'amount', 'merchant_category', 'hour_of_day', 'day_of_week', 'distance_from_home', 'num_transactions_24h', 'account_age_months', 'avg_transaction_amount', 'is_foreign', 'is_fraud'],
    previewRows: [
      ['T0001', '2.65', 'grocery', '22', '1', '3.67', '1', '45', '4.67', '0', '0'],
      ['T0002', '4823.0', 'online', '2', '6', '312.4', '12', '8', '17.9', '1', '1'],
      ['T0003', '56.3', 'restaurant', '19', '3', '2.1', '2', '72', '32.5', '0', '0'],
      ['T0004', '6100.0', 'electronics', '3', '0', '287.0', '9', '14', '22.1', '1', '1'],
      ['T0005', '12.5', 'gas_station', '8', '2', '0.5', '1', '96', '15.3', '0', '0'],
    ],
    suggestedQuestions: [
      'Which transaction patterns indicate fraud risk?',
      'What is the relationship between transaction amount and fraud?',
      'Who are the highest risk cardholders?',
      'How does distance from home affect fraud likelihood?',
      'What factors most drive fraudulent transactions?',
    ],
  },
];

interface ChatPageProps {
  onLogout?: () => void;
  entryMode?: 'login' | 'signup' | null; // Indicates if user just logged in or signed up
  onNavigateDashboard?: () => void;
}

interface XaiData {
  prediction: string;
  confidence?: number | null;
  mode: 'local_single' | 'local_batch';
  shapValues: Record<string, number>;
  limeValues?: Record<string, number>;
}

interface DatasetInfo {
  rows: number;
  columns: string[];
  idColumns: string[];
  previewRows: string[][];
}

interface TrainingMetrics {
  taskType: 'classification' | 'regression';
  metricKey: 'accuracy' | 'r2_score';
  metricValue: number;
  topFeatures: { name: string; importance: number }[];
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
  stopped?: boolean; // true when user hit Stop mid-stream
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
  datasetInfo?: DatasetInfo;
  trainingMetrics?: TrainingMetrics;
  rawFeatureDefaults?: Record<string, string | number>;
  suggestedQuestions?: string[];
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

export function ChatPage({ onLogout, entryMode = null, onNavigateDashboard }: ChatPageProps) {
  const { user, session } = useAuth();
  // Load initial state from localStorage
  const initialState = loadFromLocalStorage();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const [isHoveredOverToggle, setIsHoveredOverToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>(initialState.chats);
  const [activeChatId, setActiveChatId] = useState<string | null>(initialState.activeChatId);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [shareMessageModal, setShareMessageModal] = useState<{ messageId: string; content: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageValue, setEditMessageValue] = useState('');
  const [pendingNewChat, setPendingNewChat] = useState<Chat | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedSampleDataset, setSelectedSampleDataset] = useState<string | null>(null);
  const [sampleSuggestedQuestions, setSampleSuggestedQuestions] = useState<string[]>([]);
  // Upload modal step: 'file' = drop zone, 'loading' = uploading, 'model-setup' = BYOM column/task/model picker
  const [uploadStep, setUploadStep] = useState<'file' | 'loading' | 'model-setup'>('file');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // BYOM ("bring your own model") — default 'auto' preserves today's self-trained flow
  // untouched; everything below is transient upload-modal state, reset on success/cancel
  // exactly like selectedFile/selectedSampleDataset already are.
  const [uploadMode, setUploadMode] = useState<'auto' | 'byom'>('auto');
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [isModelDragging, setIsModelDragging] = useState(false);
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<'classification' | 'regression'>('classification');
  const [modelUploadError, setModelUploadError] = useState<string | null>(null);
  const [isModelUploading, setIsModelUploading] = useState(false);
  // Captured directly from the /auth/parse result at the moment the BYOM CSV step succeeds —
  // read from local variables in scope there, not re-derived from activeChat.datasetInfo later.
  const [byomColumns, setByomColumns] = useState<string[]>([]);
  const [byomIdColumns, setByomIdColumns] = useState<string[]>([]);
  const [byomBackendId, setByomBackendId] = useState<number | null>(null);
  const [processingStage, setProcessingStage] = useState(0);
  const [isDictating, setIsDictating] = useState(false);
  const [isDatasetCardExpanded, setIsDatasetCardExpanded] = useState(false);
  const [isModelCardExpanded, setIsModelCardExpanded] = useState(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [whatIfValues, setWhatIfValues] = useState<Record<string, string | number>>({});
  const [whatIfResult, setWhatIfResult] = useState<{ prediction: string; confidence: number | null; shapValues: Record<string, number> } | null>(null);
  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);
  const [whatIfOriginalPrediction, setWhatIfOriginalPrediction] = useState<{ prediction: string; confidence: number | null } | null>(null);
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
  const [streamedMessageIds, setStreamedMessageIds] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [shouldStopTyping, setShouldStopTyping] = useState(false);
  const userCardRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelFileInputRef = useRef<HTMLInputElement>(null);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
            datasetInfo: local?.datasetInfo,
            trainingMetrics: local?.trainingMetrics,
            rawFeatureDefaults: local?.rawFeatureDefaults,
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

  // Clear streamed message IDs when switching chats — they're only needed to suppress
  // TypewriterText re-animation and are irrelevant once the chat is out of view.
  useEffect(() => {
    setStreamedMessageIds(new Set());
  }, [activeChatId]);

  // Restore suggested questions chip bar when switching chats.
  useEffect(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    setSampleSuggestedQuestions(chat?.suggestedQuestions ?? []);
  }, [activeChatId]);

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
            // Restore xaiData / suggestions from the explanation field (saved as JSON on first create).
            // Restore backendResponseId so thumbs up/down ratings work after login.
            let xaiData: XaiData | undefined;
            let suggestions: string[] | undefined;
            try {
              if (response.explanation) {
                const parsed = JSON.parse(response.explanation);
                if (Array.isArray(parsed.clarifications)) {
                  suggestions = parsed.clarifications;
                } else {
                  // mode defaults to local_single for old saved records that predate this field
                  xaiData = { ...parsed, mode: parsed.mode ?? 'local_single' };
                }
              }
            } catch {
              xaiData = undefined;
            }
            messages.push({
              id: `r-${q.QUERY_ID}`,
              role: 'assistant',
              content: response.answer,
              timestamp: new Date(response.created_at),
              xaiData,
              suggestions,
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
    const delayedBackendId = chat.backendId;
    const delayedChatId = chat.id;
    (async () => {
      const token = await getToken();
      try {
        await uploadFileAPI(token, selectedFile, delayedBackendId);
        let parseResult: ParseResult | null = null;
        try {
          parseResult = await parseFileAPI(token, delayedBackendId);
          setChats((prev) => prev.map((c) =>
            c.id === delayedChatId
              ? { ...c, datasetInfo: { rows: parseResult!.rows, columns: parseResult!.columns, idColumns: parseResult!.id_columns, previewRows: parseResult!.preview_rows } }
              : c
          ));
        } catch (e) { console.warn('[parse] skipped:', e); }

        if (uploadMode === 'byom') {
          if (parseResult) {
            setByomColumns(parseResult.columns);
            setByomIdColumns(parseResult.id_columns);
            setByomBackendId(delayedBackendId);
            setUploadStep('model-setup');
            setSelectedFile(null);
            setUploadError(null);
          } else {
            // Parse failed — BYOM has no columns to offer and the backend cache isn't
            // populated. Fall back to the same close-modal behavior as 'auto'; self-trained
            // will lazily kick in on the first question, same as it always does.
            setUploadStep('file');
            setSelectedFile(null);
            setShowUploadModal(false); setUploadError(null);
            setToastMessage('File uploaded, but column detection failed — using automatic training instead.');
          }
        } else {
          setUploadStep('file');
          setSelectedFile(null);
          setShowUploadModal(false); setUploadError(null);
          setToastMessage('File uploaded successfully!');
        }
      } catch (err) {
        console.error('[uploadFile] Backend upload failed (delayed):', err);
        setUploadStep('file');
        setShowUploadModal(true);
        setUploadError(parseUploadError(err));
      }
    })();
  }, [chats, uploadMode]);

  // Cycle through pipeline stages while processing
  useEffect(() => {
    if (!isProcessing) {
      setProcessingStage(0);
      return;
    }
    // Stage durations (ms): classifier ~2s, data/ML ~3s, SHAP/LIME ~5s, GPT format runs last
    const delays = [2000, 3000, 5000];
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
  }, [activeChat?.messages, isProcessing]);

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
          if (isProcessing || isTyping) {
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
        if (isProcessing || isTyping) {
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
        setShowKeyboardShortcuts(true);
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
    isProcessing,
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

  const parseUploadError = (err: unknown): string => {
    try {
      const msg = err instanceof Error ? err.message : String(err);
      const parsed = JSON.parse(msg);
      const detail = parsed.detail ?? msg;
      if (typeof detail === 'string' && detail.includes('exp')) return 'Your session expired. Please refresh the page and try again.';
      if (typeof detail === 'string' && detail.includes('10 MB')) return 'File exceeds the 10 MB size limit. Please use a smaller file.';
      if (typeof detail === 'string' && detail.includes('Unauthorized')) return 'Authentication error. Please refresh the page and try again.';
      return typeof detail === 'string' ? detail : msg;
    } catch {
      return err instanceof Error ? err.message : 'Upload failed. Please try again.';
    }
  };

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
          console.error('[addChatAPI] failed (waitingForBackendId branch):', message, err);
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
        console.error('[addChatAPI] failed (handleFileUpload branch):', message, err);
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

    if (selectedFile && backendId !== undefined && session?.access_token) {
      setUploadStep('loading');
      const token = await getToken();
      try {
        // DEBUG — remove after confirming token is fresh
        try {
          const p = JSON.parse(atob(token.split('.')[1]));
          console.log(`📤 [uploadFile] using token exp=${new Date(p.exp*1000).toISOString()} EXPIRED=${Date.now()>p.exp*1000}`);
        } catch { console.log('📤 [uploadFile] could not decode upload token'); }
        await uploadFileAPI(token, selectedFile, backendId);
        let parseResult: ParseResult | null = null;
        try {
          parseResult = await parseFileAPI(token, backendId!);
          setChats((prev) => prev.map((c) =>
            c.id === activeChatId
              ? { ...c, datasetInfo: { rows: parseResult!.rows, columns: parseResult!.columns, idColumns: parseResult!.id_columns, previewRows: parseResult!.preview_rows } }
              : c
          ));
        } catch (e) { console.warn('[parse] skipped:', e); }

        if (uploadMode === 'byom') {
          if (parseResult) {
            setByomColumns(parseResult.columns);
            setByomIdColumns(parseResult.id_columns);
            setByomBackendId(backendId);
            setUploadStep('model-setup');
            setSelectedFile(null);
            setUploadError(null);
          } else {
            // Parse failed — BYOM has no columns to offer and the backend cache isn't
            // populated. Fall back to the same close-modal behavior as 'auto'; self-trained
            // will lazily kick in on the first question, same as it always does.
            setUploadStep('file');
            setSelectedFile(null);
            setShowUploadModal(false); setUploadError(null);
            setToastMessage('File uploaded, but column detection failed — using automatic training instead.');
          }
        } else {
          setUploadStep('file');
          setSelectedFile(null);
          setShowUploadModal(false); setUploadError(null);
          setToastMessage('File uploaded successfully!');
        }
      } catch (err) {
        console.error('[uploadFile] Backend upload failed:', err);
        setUploadStep('file');
        setShowUploadModal(true);
        setUploadError(parseUploadError(err));
      }
    } else {
      // No real file — close modal immediately (sample data fallback)
      setSelectedFile(null);
      setShowUploadModal(false); setUploadError(null);
      setToastMessage(`File "${fileAttachment.name}" uploaded successfully!`);
    }
  };


  const handleFileSelect = (file: File) => {
    setUploadError(null);
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

  // BYOM model file picker — mirrors handleFileSelect but restricted to .pkl/.pickle and
  // the backend's 20MB cap (MODEL_UPLOAD_MAX_BYTES in data_processor.py), not the 10MB CSV cap.
  const handleModelFileSelect = (file: File) => {
    setModelUploadError(null);
    const fileName = file.name.toLowerCase();
    const isValid = fileName.endsWith('.pkl') || fileName.endsWith('.pickle');

    if (!isValid) {
      setToastMessage('Invalid file type. Please upload a .pkl or .pickle file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      // 20MB limit — matches MODEL_UPLOAD_MAX_BYTES on the backend
      setToastMessage('File size too large. Maximum size is 20MB.');
      return;
    }

    setSelectedModelFile(file);
    setToastMessage(`Model file "${file.name}" selected.`);
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

  // BYOM model dropzone — separate state/ref from the CSV dropzone above (isModelDragging,
  // modelFileInputRef), not shared, so nothing here can perturb the CSV path's behavior.
  const handleModelFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleModelFileSelect(file);
    }
  };

  const handleModelDropZoneClick = () => {
    modelFileInputRef.current?.click();
  };

  const handleModelDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsModelDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleModelFileSelect(file);
    }
  };

  const handleModelDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsModelDragging(true);
  };

  const handleModelDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsModelDragging(false);
  };

  // Bail out of BYOM at the model-setup step — the CSV is already uploaded/parsed either
  // way (nothing to undo server-side), so this lands the user in the exact same chat view
  // the default self-trained flow does; training activates lazily on their first question.
  const handleCancelModelSetup = () => {
    setUploadMode('auto');
    setUploadStep('file');
    setSelectedModelFile(null);
    setSelectedTargetColumn(null);
    setSelectedTaskType('classification');
    setModelUploadError(null);
    setByomColumns([]);
    setByomIdColumns([]);
    setByomBackendId(null);
    setShowUploadModal(false);
    setToastMessage('File uploaded successfully!');
  };

  const handleModelUpload = async () => {
    if (!selectedTargetColumn || !selectedModelFile || byomBackendId === null || !session?.access_token) {
      setModelUploadError('Please select a target column and a model file.');
      return;
    }
    setIsModelUploading(true);
    setModelUploadError(null);
    try {
      const token = await getToken();
      await uploadModelAPI(token, byomBackendId, selectedTargetColumn, selectedTaskType, selectedModelFile);
      setIsModelUploading(false);
      setUploadMode('auto');
      setUploadStep('file');
      setSelectedModelFile(null);
      setSelectedTargetColumn(null);
      setSelectedTaskType('classification');
      setByomColumns([]);
      setByomIdColumns([]);
      setByomBackendId(null);
      setShowUploadModal(false);
      setUploadError(null);
      setModelUploadError(null);
      setToastMessage('Model uploaded and ready!');
    } catch (err) {
      console.error('[uploadModel] failed:', err);
      setIsModelUploading(false);
      setModelUploadError(parseUploadError(err));
    }
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
          console.error('[addChatAPI] failed (handleNewChat branch):', message, err);
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

  // skipUserMessage: true when called from handleConfirmEdit — the edited user
  // message is already in the chat, so we skip adding it again.
  const sendMessage = (overrideContent?: string, options?: { skipUserMessage?: boolean }) => {
    const content = overrideContent ?? inputValue;
    if (content.trim() === '' || isProcessing) return;
    if (content.trim().length > 500) {
      setToastMessage('Question is too long. Please keep it under 500 characters.');
      return;
    }

    if (!options?.skipUserMessage) {
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
    }
    setIsProcessing(true);
    setIsRegenerating(!!options?.skipUserMessage);
    setShouldStopTyping(false);

    (async () => {
      // Capture the active chat ID now — it won't change during the stream
      const chatId = activeChatId;

      let aiMessageId: string | null = null;

      try {
        if (!session?.access_token || activeChat?.backendId === undefined) {
          throw new Error('No active session or chat');
        }

        const apiUrl = import.meta.env.VITE_API_URL;
        const token = await getToken();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const res = await fetch(`${apiUrl}/processQuestion`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chat_id: activeChat.backendId, question: content }),
          signal: controller.signal,
        });

        // Non-2xx response: parse the FastAPI detail message and show it in chat
        if (!res.ok) {
          let errorDetail = 'Something went wrong. Please try again.';
          try {
            const errJson = await res.json();
            if (errJson?.detail) errorDetail = errJson.detail;
          } catch {
            const raw = await res.text().catch(() => '');
            if (raw) errorDetail = raw;
          }
          throw new Error(errorDetail);
        }

        // ── Create an empty placeholder message right away ───────────────────
        // The user sees the message bubble appear immediately while tokens stream in.
        aiMessageId = (Date.now() + 1).toString();
        const placeholder: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          feedback: null,
        };
        setLatestAiMessageId(aiMessageId);
        setChats((prev) =>
          prev.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, placeholder] } : c)
        );

        // ── Read the SSE stream ──────────────────────────────────────────────
        // The backend sends three event types:
        //   metadata — structured pipeline data (type, shap_values, prediction…)
        //   token    — one GPT word at a time
        //   done     — stream finished, carries response_id for ratings
        const reader  = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer   = '';       // incomplete SSE line carried across chunks
        let metadata: Record<string, unknown> = {};  // filled by the metadata event

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the raw bytes and append to any leftover from the previous chunk
          buffer += decoder.decode(value, { stream: true });

          // SSE lines are newline-delimited; keep the last incomplete line in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: Record<string, unknown>;
            try { event = JSON.parse(raw); } catch { continue; }

            if (event.event === 'metadata') {
              // Store pipeline metadata for use when the done event arrives
              metadata = event;

            } else if (event.event === 'token') {
              // Append the incoming word to the placeholder message content
              const token = event.content as string;
              // Mark as streamed so TypewriterText is skipped after streaming ends
              if (aiMessageId) setStreamedMessageIds((prev) => new Set(prev).add(aiMessageId!));
              setChats((prev) =>
                prev.map((c) =>
                  c.id === chatId
                    ? { ...c, messages: c.messages.map((m) => m.id === aiMessageId ? { ...m, content: m.content + token } : m) }
                    : c
                )
              );

            } else if (event.event === 'done') {
              // Stream complete — attach metadata fields to the finalized message

              // Build XAI data if this was a local_single prediction with SHAP values
              let xaiData: XaiData | undefined;
              const mode = metadata.mode as string | undefined;
              // local_single uses shap_values; local_batch uses shap_aggregate
              const shapRaw = (mode === 'local_batch'
                ? metadata.shap_aggregate
                : metadata.shap_values) as { feature: string; shap_value: number }[] | undefined;
              if (metadata.type === 'PREDICTION' && (mode === 'local_single' || mode === 'local_batch') && Array.isArray(shapRaw) && shapRaw.length > 0) {
                const shapMap: Record<string, number> = {};
                for (const entry of shapRaw) shapMap[entry.feature] = entry.shap_value;
                const limeRaw = mode === 'local_single' ? metadata.lime_values as { feature: string; impact: number }[] | undefined : undefined;
                const limeMap: Record<string, number> = {};
                if (Array.isArray(limeRaw)) for (const entry of limeRaw) limeMap[entry.feature] = entry.impact;
                xaiData = { prediction: String(metadata.prediction ?? ''), confidence: metadata.confidence as number | null, mode: mode as 'local_single' | 'local_batch', shapValues: shapMap, limeValues: Object.keys(limeMap).length > 0 ? limeMap : undefined };
              }

              // Extract training metrics if backend trained a new model this request
              const tm = metadata.training_metrics as { task_type: string; metric_key: string; metric_value: number; top_features: { name: string; importance: number }[] } | null | undefined;
              const newTrainingMetrics: TrainingMetrics | undefined = tm ? {
                taskType:    tm.task_type as 'classification' | 'regression',
                metricKey:   tm.metric_key as 'accuracy' | 'r2_score',
                metricValue: tm.metric_value,
                topFeatures: tm.top_features,
              } : undefined;

              // Extract raw feature defaults for What-If modal pre-filling
              const rawDefaults = metadata.raw_feature_defaults as Record<string, string | number> | null | undefined;

              // For UNCLEAR, the content comes from metadata.answer (no tokens were streamed)
              const isUnclear = metadata.type === 'UNCLEAR' || metadata.type === 'HISTORY_EXPLANATION';

              setChats((prev) =>
                prev.map((c) =>
                  c.id === chatId
                    ? {
                        ...c,
                        ...(newTrainingMetrics ? { trainingMetrics: newTrainingMetrics } : {}),
                        ...(rawDefaults ? { rawFeatureDefaults: rawDefaults } : {}),
                        // Fallback: if parseFileAPI failed and datasetInfo is missing,
                        // populate columns from rawFeatureDefaults so the card still shows
                        ...(!c.datasetInfo && rawDefaults ? {
                          datasetInfo: { rows: 0, columns: Object.keys(rawDefaults), idColumns: [], previewRows: [] }
                        } : {}),
                        messages: c.messages.map((m) =>
                          m.id === aiMessageId
                            ? {
                                ...m,
                                // For UNCLEAR/HISTORY: use metadata.answer since no tokens were sent
                                content: isUnclear ? (metadata.answer as string || '') : m.content,
                                xaiData,
                                suggestions: metadata.type === 'UNCLEAR' ? (metadata.clarifications as string[]) : undefined,
                                backendResponseId: (event.response_id as number) ?? undefined,
                              }
                            : m
                        ),
                      }
                    : c
                )
              );

            } else if (event.event === 'error') {
              // Backend error mid-stream — show it as the message content
              setChats((prev) =>
                prev.map((c) =>
                  c.id === chatId
                    ? { ...c, messages: c.messages.map((m) => m.id === aiMessageId ? { ...m, content: (event.detail as string) || 'Something went wrong.' } : m) }
                    : c
                )
              );
            }
          }
        }

      } catch (err) {
        // Abort is intentional (user clicked Stop) — mark the partial message as stopped
        if (err instanceof Error && err.name === 'AbortError') {
          if (aiMessageId) {
            const stoppedId = aiMessageId;
            setChats((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? { ...c, messages: c.messages.map((m) => m.id === stoppedId ? { ...m, stopped: true } : m) }
                  : c
              )
            );
          }
          return;
        }
        console.error('[sendMessage] API call failed:', err);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          timestamp: new Date(),
          feedback: null,
        };
        if (activeChat) {
          setLatestAiMessageId(errorMessage.id);
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === chatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat
            )
          );
        }
      } finally {
        abortControllerRef.current = null;
        setIsProcessing(false);
        processingTimeoutRef.current = null;
      }
    })();
  };

  const stopGeneration = () => {
    // Cancel the in-flight network request
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    // Clear any processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    setIsProcessing(false);
    // Stop typewriter effect
    if (isTyping) {
      setShouldStopTyping(true);
      setTimeout(() => setShouldStopTyping(false), 100);
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

    // Find the assistant message to retry
    const messageIndex = activeChat.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex < 0) return;

    // The user message that triggered this AI response is the one before it
    const previousUserMessage = messageIndex > 0 ? activeChat.messages[messageIndex - 1] : null;
    if (!previousUserMessage || previousUserMessage.role !== 'user') return;

    // Remove the old AI response (and everything after it) so the real pipeline
    // can append a fresh one via sendMessage
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: activeChat.messages.slice(0, messageIndex) } : chat
      )
    );

    // Re-send the same user question through the real streaming pipeline.
    // skipUserMessage: true — the user bubble is already in the truncated messages above.
    sendMessage(previousUserMessage.content, { skipUserMessage: true });
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

  const handleOpenShareModal = (chat: Chat) => {
    setShareModalChat(chat);
    setChatMenuOpenId(null);
  };

  const handleCloseShareModal = () => {
    setShareModalChat(null);
  };

  const buildExportHTML = (chat: Chat): string => {
    const lastXai = [...chat.messages].reverse().find((m) => m.xaiData)?.xaiData;
    const shapRows = lastXai
      ? Object.entries(lastXai.shapValues)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .map(
            ([feature, value]) =>
              `<tr><td>${feature}</td><td style="color:${value >= 0 ? '#08B839' : '#e05a5a'}">${value >= 0 ? '+' : ''}${value.toFixed(4)}</td></tr>`
          )
          .join('')
      : '';

    const messagesHTML = chat.messages
      .map(
        (m) =>
          `<div class="${m.role}"><strong>${m.role === 'user' ? 'User' : 'Makeen AI'}:</strong><p>${m.content}</p></div>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Makeen Export — ${chat.title}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #111; }
  h1 { color: #7760bd; } h2 { color: #444; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  .user { background: #f3f4f6; border-radius: 8px; padding: 12px; margin: 8px 0; }
  .assistant { background: #ede9fe; border-radius: 8px; padding: 12px; margin: 8px 0; }
  table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #7760bd; color: white; } .meta { color: #9e9e9e; font-size: 13px; margin-bottom: 24px; }
</style>
</head>
<body>
<h1>Makeen — ${chat.title}</h1>
<p class="meta">Exported on ${new Date().toLocaleString()}${chat.fileAttachment ? ` &nbsp;|&nbsp; File: ${chat.fileAttachment.name}` : ''}${chat.targetColumn ? ` &nbsp;|&nbsp; Target column: ${chat.targetColumn}` : ''}</p>
${lastXai ? `<h2>Prediction Result</h2><p><strong>Prediction:</strong> ${lastXai.prediction}</p><h2>Feature Importance (SHAP Values)</h2><table><thead><tr><th>Feature</th><th>SHAP Value</th></tr></thead><tbody>${shapRows}</tbody></table>` : ''}
<h2>Conversation</h2>${messagesHTML}
</body></html>`;
  };

  const handleExportHTML = () => {
    if (!shareModalChat) return;
    const html = buildExportHTML(shareModalChat);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makeen-${shareModalChat.title.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage('HTML downloaded');
    handleCloseShareModal();
  };

  const handleExportPDF = () => {
    if (!shareModalChat) return;
    const html = buildExportHTML(shareModalChat);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
    setToastMessage('Print dialog opened — save as PDF');
    handleCloseShareModal();
  };

  const handleExportCSV = () => {
    if (!shareModalChat) return;
    const lastXai = [...shareModalChat.messages].reverse().find((m) => m.xaiData)?.xaiData;
    let csv = 'Section,Field,Value\n';
    if (lastXai) {
      csv += `Prediction,Result,"${lastXai.prediction}"\n`;
      Object.entries(lastXai.shapValues)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .forEach(([feature, value]) => {
          csv += `SHAP,${feature},${value}\n`;
        });
    }
    csv += '\nConversation,Role,Message\n';
    shareModalChat.messages.forEach((m) => {
      csv += `,${m.role === 'user' ? 'User' : 'Makeen AI'},"${m.content.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makeen-${shareModalChat.title.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage('CSV downloaded');
    handleCloseShareModal();
  };

  // Full-chat report (all Q&A pairs + AI-written overall summary from the backend) —
  // same header/style block as buildExportHTML for visual consistency. The backend now
  // returns structured cases (query/answer/prediction/shapValues/compliance) instead of
  // a flattened text blob, so feature impact renders as real bar charts here rather than
  // a monospace text dump. All server/LLM-sourced strings are escaped since they're
  // interpolated straight into an HTML string.
  const escapeHtml = (s: string): string =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const buildReportHTML = (chat: Chat, report: ReportData): string => {
    const casesHTML = report.cases
      .map((c) => {
        const maxAbs = Math.max(...c.shapValues.map((f) => Math.abs(f.value)), 0.0001);
        const barsHTML = c.shapValues.length
          ? c.shapValues
              .map((f) => {
                const pct = Math.max((Math.abs(f.value) / maxAbs) * 100, 2);
                const positive = f.value >= 0;
                const color = positive ? '#7760bd' : '#e05a5a';
                return `<div class="bar-row">
                  <span class="bar-label">${escapeHtml(f.feature)}</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
                  <span class="bar-value" style="color:${color}">${positive ? '+' : ''}${f.value.toFixed(3)}</span>
                </div>`;
              })
              .join('')
          : `<p class="no-data">No explainability data available</p>`;

        const complianceHTML = c.compliance.length
          ? `<div class="compliance">
              <h4>Compliance Basis</h4>
              ${c.compliance
                .map(
                  (entry) =>
                    `<div class="compliance-entry"><span class="reg-tag">${escapeHtml(entry.regulation)}</span><p>${escapeHtml(entry.text)}</p></div>`
                )
                .join('')}
            </div>`
          : '';

        return `<section class="case-card">
          <div class="case-header">
            <h3>Case ${c.index}</h3>
            <span class="prediction-badge">${escapeHtml(c.prediction)}</span>
          </div>
          <div class="qa">
            <p class="qa-label">Query</p>
            <p class="qa-text">${escapeHtml(c.query)}</p>
            <p class="qa-label">Answer</p>
            <p class="qa-text">${escapeHtml(c.answer)}</p>
          </div>
          <div class="feature-impact">
            <h4>Feature Impact</h4>
            ${barsHTML}
          </div>
          ${complianceHTML}
        </section>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Makeen Report — ${escapeHtml(chat.title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 860px; margin: 40px auto; color: #1a1a1a; padding: 0 24px; }
  h1 { color: #7760bd; margin-bottom: 4px; }
  .meta { color: #9e9e9e; font-size: 13px; margin-bottom: 28px; }
  .summary { background: #f5f3fb; border-left: 4px solid #7760bd; border-radius: 8px; padding: 18px 20px; margin-bottom: 32px; }
  .summary h2 { margin: 0 0 8px; font-size: 15px; color: #7760bd; text-transform: uppercase; letter-spacing: 0.06em; }
  .summary p { margin: 0; line-height: 1.6; font-size: 14px; white-space: pre-wrap; }
  .case-card { border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px 22px; margin-bottom: 20px; page-break-inside: avoid; }
  .case-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 14px; }
  .case-header h3 { margin: 0; font-size: 16px; color: #333; }
  .prediction-badge { background: #7760bd1a; color: #7760bd; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
  .qa-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #999; margin: 10px 0 2px; }
  .qa-text { margin: 0; font-size: 14px; line-height: 1.5; }
  .feature-impact { margin-top: 18px; }
  .feature-impact h4, .compliance h4 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #777; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
  .bar-label { width: 150px; flex-shrink: 0; font-size: 12px; color: #555; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-track { flex: 1; height: 8px; background: #eee; border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; }
  .bar-value { width: 60px; flex-shrink: 0; font-size: 12px; font-weight: 600; text-align: left; }
  .no-data { font-size: 13px; color: #999; font-style: italic; }
  .compliance { margin-top: 18px; border-top: 1px solid #eee; padding-top: 14px; }
  .compliance-entry { margin-bottom: 10px; }
  .reg-tag { display: inline-block; background: #333; color: #fff; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-bottom: 4px; }
  .compliance-entry p { margin: 4px 0 0; font-size: 12.5px; line-height: 1.5; color: #444; }
  @media print { .case-card { break-inside: avoid; } }
</style>
</head>
<body>
<h1>Makeen — ${escapeHtml(chat.title)}</h1>
<p class="meta">Full report generated on ${new Date().toLocaleString()}${chat.fileAttachment ? ` &nbsp;|&nbsp; File: ${escapeHtml(chat.fileAttachment.name)}` : ''}</p>
<div class="summary">
  <h2>Overall Summary</h2>
  <p>${escapeHtml(report.summary)}</p>
</div>
${casesHTML}
</body></html>`;
  };

  const handleGenerateReport = async () => {
    if (!shareModalChat?.backendId || !session?.access_token) return;
    setIsGeneratingReport(true);
    try {
      const { data: { session: fresh } } = await supabase.auth.refreshSession();
      const token = fresh?.access_token ?? session.access_token;
      const reportData = await generateReportAPI(token, shareModalChat.backendId);
      const html = buildReportHTML(shareModalChat, reportData);
      const win = window.open('', '_blank');
      if (!win) {
        setToastMessage('Could not open report — please allow pop-ups and try again.');
        return;
      }
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
      setToastMessage('Print dialog opened — save as PDF');
      handleCloseShareModal();
    } catch (err) {
      console.error('[generateReport] failed:', err);
      setToastMessage(parseUploadError(err));
    } finally {
      setIsGeneratingReport(false);
    }
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

    // If the edited message wasn't the last one, re-run it through the real pipeline.
    // skipUserMessage: true because the edited user bubble is already in updatedMessages.
    if (messageIndex < activeChat.messages.length - 1) {
      sendMessage(editMessageValue, { skipUserMessage: true });
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
      <div className="bg-[#141414] relative w-full h-screen overflow-hidden">
      <AppRail active="chat" onNavigateDashboard={onNavigateDashboard ?? (() => {})} onNavigateChat={() => {}} />

      {/* Mobile backdrop — tap outside to close sidebar */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed md:absolute left-0 md:left-[72px] top-0 bottom-0 z-50 md:z-20 bg-[#2c2c2c] rounded-[16px] flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-[80px]' : 'translate-x-0 w-[300px]'
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
                  className="p-[4px] hover:bg-[#3a3a3a] rounded-[4px] transition-colors cursor-pointer relative"
                  onMouseEnter={() => setIsHoveredOverToggle(true)}
                  onMouseLeave={() => setIsHoveredOverToggle(false)}
                >
                  {isHoveredOverToggle ? (
                    <svg className="w-[28.5px] h-[28.5px]" fill="none" viewBox="0 0 28.5 28.5">
                      <path d="M24.9375 11.875H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 7.125H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 16.625H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 21.375H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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
                    className="font-serif font-semibold text-[1.5rem] text-[#fffcfe]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Makeen
                  </p>
                </button>
                <Tooltip text="Close sidebar" position="right">
                  <button
                    onClick={toggleSidebar}
                    className="p-[4px] hover:bg-[#3a3a3a] rounded-[4px] transition-colors cursor-pointer"
                  >
                    <svg className="w-[28.5px] h-[28.5px]" fill="none" viewBox="0 0 28.5 28.5">
                      <path d="M24.9375 11.875H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 7.125H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 16.625H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M24.9375 21.375H3.5625" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}
          </div>

          {/* Search Field */}
          {isSidebarCollapsed ? (
            <Tooltip text="Search" position="right">
              <button className="bg-[#3a3a3a] flex items-center rounded-[8px] cursor-pointer hover:bg-[#3a3a3a] transition-colors p-[12px] justify-center">
                <svg className="w-[20.5px] h-[20.5px] shrink-0" fill="none" viewBox="0 0 20.5 20.5">
                  <path d={svgPaths.p39117340} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d={svgPaths.p11970080} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </Tooltip>
          ) : (
            <div className="relative group/search">

              {/* Gold highlight - hairline border on focus */}
              <div
                className="absolute inset-[-2px] rounded-[10px] opacity-0 group-focus-within/search:opacity-60 transition-opacity duration-[180ms] pointer-events-none"
                style={{
                  background: '#7760bd',
                  padding: '2px',
                }}
              >
                <div className="h-full w-full bg-transparent rounded-[8px]"></div>
              </div>

              {/* Gold highlight - restrained blurred glow (single tone, no rainbow) */}
              <div
                className="absolute inset-[-3px] rounded-[11px] opacity-0 group-focus-within/search:opacity-25 transition-opacity duration-[180ms] pointer-events-none"
                style={{
                  background: 'rgba(119, 96, 189, 0.25)',
                  filter: 'blur(18px)',
                }}
              />


              <div className="relative bg-[#3a3a3a] flex items-center gap-[16px] p-[16px] rounded-[8px] transition-all">
                <svg className="w-[20.5px] h-[20.5px] shrink-0" fill="none" viewBox="0 0 20.5 20.5">
                  <path d={svgPaths.p39117340} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d={svgPaths.p11970080} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent font-sans font-semibold text-[1rem] text-white placeholder:text-[#9e9e9e] outline-none"
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
              className={`flex items-center rounded-[8px] border transition-colors ${
                chats.length >= MAX_CHATS
                  ? 'opacity-40 cursor-not-allowed border-white/[0.08]'
                  : 'cursor-pointer border-[#7760bd]/30 hover:border-[#7760bd]/60 hover:bg-[#7760bd]/10'
              } ${isSidebarCollapsed ? 'p-[12px] justify-center' : 'gap-[14px] p-[14px] w-full'}`}
            >
              <PenSquare className={`w-[18px] h-[18px] shrink-0 ${chats.length >= MAX_CHATS ? 'stroke-[#9e9e9e]' : 'stroke-[#7760bd]'}`} strokeWidth={2} />
              {!isSidebarCollapsed && (
                <p className={`font-sans font-semibold uppercase tracking-[0.08em] text-[0.875rem] ${chats.length >= MAX_CHATS ? 'text-[#9e9e9e]' : 'text-[#7760bd]'}`}>New Chat</p>
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
                className="flex gap-[12px] items-center p-[16px] hover:bg-[#3a3a3a] rounded-[8px] transition-colors cursor-pointer w-full"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p16599900} fill="white" />
                </svg>
                <p className="flex-1 text-left font-sans font-semibold text-[0.875rem] text-[#9e9e9e]">Chat history</p>
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
                <div className="flex flex-col pl-[18px]">
                  {filteredChats.length > 0 ? (
                    <>
                      <HairlineDivider />
                      {[...filteredChats].reverse().map((chat) => (
                      <div key={chat.id}>
                      <div
                        className="relative group py-[10px]"
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
                              className="flex-1 min-w-0 max-w-full bg-[#3a3a3a] text-white font-sans font-semibold text-[1rem] px-[8px] py-[4px] rounded-[6px] outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setActiveChatId(chat.id);
                              }}
                              className={`flex-1 font-sans font-semibold text-[1rem] text-left transition-all cursor-pointer ${
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
                                className="p-[4px] hover:bg-[#3a3a3a] rounded-[4px] transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-[16px] h-[16px] stroke-[#9e9e9e]" strokeWidth={2} />
                              </button>
                              {/* Dropdown Menu */}
                              {chatMenuOpenId === chat.id && (
                                <div className="absolute right-0 top-full mt-[4px] bg-[#2c2c2c] rounded-[8px] shadow-lg py-[4px] min-w-[140px] z-20">
                                  <button
                                    className="w-full px-[16px] py-[8px] text-left text-white text-[0.875rem] hover:bg-[#7760bd]/20 transition-colors cursor-pointer flex items-center gap-[8px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenShareModal(chat);
                                    }}
                                  >
                                    <span>Share</span>
                                  </button>
                                  <button
                                    className="w-full px-[16px] py-[8px] text-left text-white text-[0.875rem] hover:bg-[#7760bd]/20 transition-colors cursor-pointer flex items-center gap-[8px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartRename(chat);
                                    }}
                                  >
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    className="w-full px-[16px] py-[8px] text-left text-red-400 text-[0.875rem] hover:bg-red-400/20 transition-colors cursor-pointer flex items-center gap-[8px]"
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
                      <HairlineDivider />
                      </div>
                      ))}
                    </>
                  ) : (
                    <p className="font-sans text-[0.875rem] text-[#9e9e9e] italic py-[12px]">
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
              className="bg-[#3a3a3a] flex items-center gap-[16px] px-[16px] py-[16px] rounded-[8px] hover:bg-[#3a3a3a] transition-colors cursor-pointer w-full"
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
                <p className="font-sans font-semibold text-[0.875rem] text-[#fffcfe] truncate text-left">{displayName}</p>
                <p className="font-sans font-semibold text-[0.75rem] text-[#9e9e9e] truncate text-left">{userEmail}</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`h-full flex flex-col relative transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-0 md:ml-[152px]' : 'ml-0 md:ml-[372px]'
        }`}
      >
        {/* Mobile hamburger — only visible on small screens */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(false)}
          className="md:hidden absolute top-[14px] left-[14px] z-30 bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] p-[8px] transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Upload Modal Overlay */}
        {showUploadModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-[16px] md:p-[24px] overflow-y-auto">
            <div className="w-full max-w-[700px] flex flex-col gap-[32px]">
              {/* Welcome Header */}
              <WelcomeHeader displayName={displayName} messageIndex={welcomeMessageIndex} mode={welcomeMode} />
              
              {/* Upload Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-[#2c2c2c] rounded-[8px] w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col"
              >
                {/* Modal Header — title changes per step */}
                <div className="bg-[#2c2c2c] px-[20px] md:px-[24px] py-[14px] md:py-[16px] rounded-t-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <p className="font-sans font-semibold text-[1rem] md:text-[1.125rem] text-white">
                    File Upload
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

                    {/* Upload error banner */}
                    {uploadError && (
                      <div className="flex items-start gap-[10px] bg-[#e05a5a]/10 border border-[#e05a5a]/40 rounded-[8px] px-[14px] py-[12px]">
                        <svg className="w-[16px] h-[16px] text-[#e05a5a] flex-shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.8125rem] font-semibold text-[#e05a5a] mb-[2px]">Upload failed</p>
                          <p className="text-[0.75rem] text-[#e05a5a]/80 leading-[1.4]">{uploadError}</p>
                        </div>
                        <button onClick={() => setUploadError(null)} className="text-[#e05a5a]/60 hover:text-[#e05a5a] transition-colors flex-shrink-0">
                          <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 16 16">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Train-for-me vs bring-your-own-model choice — defaults to 'auto',
                        which preserves today's flow exactly. */}
                    <div className="flex items-center gap-[8px]">
                      <button
                        type="button"
                        onClick={() => setUploadMode('auto')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setUploadMode('auto');
                          }
                        }}
                        aria-pressed={uploadMode === 'auto'}
                        className={`flex-1 px-[16px] py-[10px] rounded-[8px] font-sans font-semibold text-[0.8125rem] transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] ${
                          uploadMode === 'auto'
                            ? 'bg-[#7760bd]/[0.12] text-[#8a75d4] border-[#7760bd]'
                            : 'bg-transparent text-[#8a8780] border-[#444] hover:border-[#3a3a3f] hover:text-[#9e9e9e]'
                        }`}
                      >
                        Train a model for me
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('byom')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setUploadMode('byom');
                          }
                        }}
                        aria-pressed={uploadMode === 'byom'}
                        className={`flex-1 px-[16px] py-[10px] rounded-[8px] font-sans font-semibold text-[0.8125rem] transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] ${
                          uploadMode === 'byom'
                            ? 'bg-[#7760bd]/[0.12] text-[#8a75d4] border-[#7760bd]'
                            : 'bg-transparent text-[#8a8780] border-[#444] hover:border-[#3a3a3f] hover:text-[#9e9e9e]'
                        }`}
                      >
                        Upload my own pretrained model
                      </button>
                    </div>

                    {/* BYOM still needs the applicant data first (schema validation + SHAP
                        background) — make that two-step order explicit so "Upload my own
                        pretrained model" doesn't read as "the next dropzone is for my model". */}
                    {uploadMode === 'byom' && (
                      <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                        Step 1 of 2 — upload the applicant data your model expects. You'll upload the model file itself next.
                      </p>
                    )}

                    {/* Upload Drop Zone */}
                    <div
                      onClick={handleDropZoneClick}
                      className={`bg-[#2c2c2c] border-2 border-dashed rounded-[8px] px-[20px] md:px-[80px] py-[24px] md:py-[32px] flex flex-col gap-[10px] md:gap-[12px] items-center text-center cursor-pointer transition-all ${
                        isDragging ? 'border-[#7760bd] bg-[#3a3a3a]' : 'border-[#9e9e9e] hover:border-[#7760bd] hover:bg-[#3a3a3a]'
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
                      <p className={`font-sans text-[0.875rem] md:text-[1rem] ${selectedFile ? 'text-[#08B839]' : 'text-white'}`}>
                        {selectedFile
                          ? `Selected: ${selectedFile.name}`
                          : uploadMode === 'byom'
                            ? 'Click or drag your applicant data (.csv or .xlsx) to this area to upload'
                            : 'Click or drag file to this area to upload'}
                      </p>
                    </div>

                    <p className="font-sans text-[0.875rem] md:text-[1rem] text-[#9e9e9e]">Formats accepted are .csv and .xlsx</p>

                    {uploadMode === 'auto' && (
                      <>
                        <HairlineDivider />
                        <p className="font-sans text-[0.875rem] md:text-[1rem] text-[#f5f5f5]">No file? Try one of our sample datasets:</p>

                        {/* Sample dataset cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
                          {SAMPLE_DATASETS.map((ds, i) => (
                            <motion.button
                              key={ds.id}
                              type="button"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                              onClick={() => setSelectedSampleDataset(ds.id)}
                              className="bg-[#2c2c2c] border border-white/[0.08] rounded-[8px] px-[12px] py-[10px] flex flex-col gap-[4px] text-left cursor-pointer transition-all duration-300 hover:border-[#7760bd] hover:bg-[#3a3a3a] hover:-translate-y-[2px] hover:shadow-xl"
                            >
                              <p className="font-semibold text-[0.8125rem] text-white leading-tight">{ds.name}</p>
                              <p className="text-[0.6875rem] text-[#9e9e9e] leading-tight">{ds.description}</p>
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Step 2: Uploading / parsing spinner ── */}
                {uploadStep === 'loading' && (
                  <div className="px-[24px] py-[48px] flex flex-col items-center gap-[16px]">
                    <div className="w-[40px] h-[40px] border-4 border-[#7760bd] border-t-transparent rounded-full animate-spin" />
                    <p className="font-sans text-[0.9375rem] text-[#9e9e9e]">Uploading and parsing your file…</p>
                  </div>
                )}

                {/* ── Step 3 (BYOM only): column / task-type / model-file picker ── */}
                {uploadStep === 'model-setup' && (
                  <div className="px-[20px] md:px-[24px] py-[20px] md:py-[26px] flex flex-col gap-[14px] md:gap-[16px]">
                    {/* Hidden model file input */}
                    <input
                      ref={modelFileInputRef}
                      type="file"
                      aria-label="Upload pretrained model file"
                      accept=".pkl,.pickle,application/octet-stream"
                      onChange={handleModelFileInputChange}
                      className="hidden"
                    />

                    {/* Model-upload error banner — same visual pattern as the CSV one above */}
                    {modelUploadError && (
                      <div className="flex items-start gap-[10px] bg-[#e05a5a]/10 border border-[#e05a5a]/40 rounded-[8px] px-[14px] py-[12px]">
                        <svg className="w-[16px] h-[16px] text-[#e05a5a] flex-shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.8125rem] font-semibold text-[#e05a5a] mb-[2px]">Upload failed</p>
                          <p className="text-[0.75rem] text-[#e05a5a]/80 leading-[1.4]">{modelUploadError}</p>
                        </div>
                        <button onClick={() => setModelUploadError(null)} className="text-[#e05a5a]/60 hover:text-[#e05a5a] transition-colors flex-shrink-0">
                          <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 16 16">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Target column picker */}
                    <p className="font-sans text-[0.875rem] md:text-[1rem] text-[#f5f5f5]">Which column do you want to predict?</p>
                    <div className="flex flex-wrap gap-[6px]">
                      {byomColumns.filter((col) => !byomIdColumns.includes(col)).map((col) => (
                        <motion.button
                          key={col}
                          type="button"
                          onClick={() => setSelectedTargetColumn(col)}
                          className={`px-[10px] py-[4px] rounded-full text-[0.75rem] border transition-all duration-200 hover:-translate-y-[1px] ${
                            selectedTargetColumn === col
                              ? 'bg-[#7760bd]/[0.12] border-[#7760bd] text-[#8a75d4]'
                              : 'bg-[#2c2c2c] border-white/[0.08] text-[#9e9e9e] hover:border-[#7760bd] hover:text-white'
                          }`}
                        >
                          {col}
                        </motion.button>
                      ))}
                    </div>

                    {/* Task type toggle */}
                    <p className="font-sans text-[0.875rem] md:text-[1rem] text-[#f5f5f5]">What kind of problem is this?</p>
                    <div className="flex items-center gap-[8px]">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskType('classification')}
                        aria-pressed={selectedTaskType === 'classification'}
                        className={`flex-1 px-[16px] py-[10px] rounded-[8px] font-sans font-semibold text-[0.8125rem] transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] ${
                          selectedTaskType === 'classification'
                            ? 'bg-[#7760bd]/[0.12] text-[#8a75d4] border-[#7760bd]'
                            : 'bg-transparent text-[#8a8780] border-[#444] hover:border-[#3a3a3f] hover:text-[#9e9e9e]'
                        }`}
                      >
                        Classification
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTaskType('regression')}
                        aria-pressed={selectedTaskType === 'regression'}
                        className={`flex-1 px-[16px] py-[10px] rounded-[8px] font-sans font-semibold text-[0.8125rem] transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] ${
                          selectedTaskType === 'regression'
                            ? 'bg-[#7760bd]/[0.12] text-[#8a75d4] border-[#7760bd]'
                            : 'bg-transparent text-[#8a8780] border-[#444] hover:border-[#3a3a3f] hover:text-[#9e9e9e]'
                        }`}
                      >
                        Regression
                      </button>
                    </div>

                    <HairlineDivider />

                    {/* Model file dropzone — deliberate duplicate of the CSV dropzone above,
                        not a shared/parameterized component (see plan rationale). */}
                    <div
                      onClick={handleModelDropZoneClick}
                      className={`bg-[#2c2c2c] border-2 border-dashed rounded-[8px] px-[20px] md:px-[80px] py-[24px] md:py-[32px] flex flex-col gap-[10px] md:gap-[12px] items-center text-center cursor-pointer transition-all ${
                        isModelDragging ? 'border-[#7760bd] bg-[#3a3a3a]' : 'border-[#9e9e9e] hover:border-[#7760bd] hover:bg-[#3a3a3a]'
                      } ${selectedModelFile ? 'border-[#08B839] bg-[#08B839]/10' : ''}`}
                      onDragEnter={(e) => { e.preventDefault(); setIsModelDragging(true); }}
                      onDragLeave={handleModelDragLeave}
                      onDragOver={handleModelDragOver}
                      onDrop={handleModelDrop}
                    >
                      <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p2fe12e80} stroke={selectedModelFile ? '#08B839' : 'white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M9 15L12 12L15 15" stroke={selectedModelFile ? '#08B839' : 'white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M12 12V21" stroke={selectedModelFile ? '#08B839' : 'white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      <p className={`font-sans text-[0.875rem] md:text-[1rem] ${selectedModelFile ? 'text-[#08B839]' : 'text-white'}`}>
                        {selectedModelFile ? `Selected: ${selectedModelFile.name}` : 'Click or drag your .pkl or .pickle file here'}
                      </p>
                    </div>
                    <p className="font-sans text-[0.875rem] md:text-[1rem] text-[#9e9e9e]">Formats accepted are .pkl and .pickle (max 20MB)</p>
                  </div>
                )}

              {/* Modal Footer — self-trained / loading steps, unchanged internally */}
              {(uploadStep === 'file' || uploadStep === 'loading') && (
                <div className="bg-[#2c2c2c] border-t border-black px-[20px] md:px-[24px] py-[10px] md:py-[12px] rounded-b-[8px] flex justify-end">
                  <button
                    onClick={handleFileUpload}
                    disabled={uploadStep === 'loading' || (uploadMode === 'byom' && !selectedFile)}
                    className="bg-[#7760bd] disabled:opacity-50 rounded-[8px] px-[24px] md:px-[28px] h-[38px] md:h-[42px] flex items-center justify-center cursor-pointer hover:bg-[#8a75d4] hover:shadow-[0_0_20px_rgba(119,96,189,0.5)] hover:scale-105 transition-all"
                  >
                    <p className="font-sans font-medium text-[0.875rem] md:text-[1rem] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Send
                    </p>
                  </button>
                </div>
              )}

              {/* Modal Footer — BYOM model-setup step */}
              {uploadStep === 'model-setup' && (
                <div className="bg-[#2c2c2c] border-t border-black px-[20px] md:px-[24px] py-[10px] md:py-[12px] rounded-b-[8px] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleCancelModelSetup}
                    className="bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] px-[20px] h-[38px] md:h-[42px] transition-colors cursor-pointer"
                  >
                    <p className="font-sans font-semibold text-[0.875rem] text-[#9e9e9e]">Use normal flow instead</p>
                  </button>
                  <button
                    onClick={handleModelUpload}
                    disabled={isModelUploading || !selectedTargetColumn || !selectedModelFile}
                    className="bg-[#7760bd] disabled:opacity-50 rounded-[8px] px-[24px] md:px-[28px] h-[38px] md:h-[42px] flex items-center justify-center cursor-pointer hover:bg-[#8a75d4] hover:shadow-[0_0_20px_rgba(119,96,189,0.5)] hover:scale-105 transition-all"
                  >
                    <p className="font-sans font-medium text-[0.875rem] md:text-[1rem] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {isModelUploading ? 'Uploading…' : 'Upload Model'}
                    </p>
                  </button>
                </div>
              )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Chat Interface (shown when file is uploaded, or when messages already exist) */}
        {!showUploadModal && activeChat && (activeChat.fileAttachment || activeChat.messages.length > 0) && (
          <div className="h-full flex flex-col p-[16px] md:p-[40px]">
            {/* Chat Messages Area — cards + messages all scroll together */}
            <div className="flex-1 overflow-y-auto pr-[4px] md:pr-[8px]" ref={chatContainerRef}>
              <div className="px-[12px] md:px-[40px] max-w-[880px] mx-auto">

              {/* File bar */}
              {activeChat.fileAttachment && <div className="mb-[16px] flex justify-end">
              <div className="w-full max-w-[480px] bg-[#3a3a3a] border border-[#9e9e9e] rounded-[8px] px-[16px] py-[12px] flex items-center gap-[12px] shadow-lg">
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
                    <p className="font-sans font-semibold text-[0.875rem] text-white truncate">{activeChat.fileAttachment.name}</p>
                    <p className="font-sans text-[0.75rem] text-[#9e9e9e]">{activeChat.fileAttachment.type.toUpperCase()}</p>
                  </div>
                </button>
              </div>
              </div>}

              {/* Dataset Overview Card — expandable, appears after upload */}
              {activeChat.datasetInfo && (
                <div className="mb-[10px] flex justify-end">
                  <div className="w-full max-w-[480px] bg-[#2c2c2c] border border-white/[0.08] rounded-[8px] overflow-hidden">
                    <button
                      onClick={() => setIsDatasetCardExpanded((v) => !v)}
                      className="w-full px-[16px] py-[10px] flex items-center gap-[10px] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
                    >
                      <svg className="w-[14px] h-[14px] flex-shrink-0 text-[#7760bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                      </svg>
                      <p className="font-sans font-semibold text-[0.75rem] text-white flex-1 text-left">Dataset Overview</p>
                      <span className="text-[0.6875rem] text-[#9e9e9e]">{activeChat.datasetInfo.rows > 0 ? `${activeChat.datasetInfo.rows.toLocaleString()} rows · ` : ''}{activeChat.datasetInfo.columns.length} cols</span>
                      <ChevronDown className={`w-[14px] h-[14px] text-[#9e9e9e] transition-transform duration-200 ${isDatasetCardExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                    </button>
                    {isDatasetCardExpanded && (
                      <div className="border-t border-white/[0.08] px-[16px] py-[12px]">
                        <div className="flex gap-[20px] mb-[12px]">
                          {activeChat.datasetInfo.rows > 0 && <div><p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide">Rows</p><p className="text-[1.125rem] font-semibold text-white">{activeChat.datasetInfo.rows.toLocaleString()}</p></div>}
                          <div><p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide">Columns</p><p className="text-[1.125rem] font-semibold text-white">{activeChat.datasetInfo.columns.length}</p></div>
                        </div>
                        <p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide mb-[7px]">Features</p>
                        <div className="flex flex-wrap gap-[5px]">
                          {activeChat.datasetInfo.columns.map((col) => (
                            <span key={col} className={`px-[7px] py-[2px] rounded-full text-[0.6875rem] border ${activeChat.datasetInfo!.idColumns.includes(col) ? 'bg-[#3a3a3a] border-white/[0.08] text-[#9e9e9e]' : 'bg-[#7760bd]/10 border-[#7760bd]/30 text-[#8a75d4]'}`}>
                              {col}{activeChat.datasetInfo!.idColumns.includes(col) ? ' (ID)' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Model Performance Card — expandable, appears after first training */}
              {activeChat.trainingMetrics && (
                <div className="mb-[16px] flex justify-end">
                  <div className="w-full max-w-[480px] bg-[#2c2c2c] border border-white/[0.08] rounded-[8px] overflow-hidden">
                    <button
                      onClick={() => setIsModelCardExpanded((v) => !v)}
                      className="w-full px-[16px] py-[10px] flex items-center gap-[10px] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
                    >
                      <svg className="w-[14px] h-[14px] flex-shrink-0 text-[#7760bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="font-sans font-semibold text-[0.75rem] text-white flex-1 text-left">Model Performance</p>
                      <Tooltip
                        text={activeChat.trainingMetrics.metricKey === 'accuracy'
                          ? 'Accuracy: how often the model predicts correctly. 90–100% excellent · 70–90% good · 50–70% fair · below 50% poor.'
                          : 'R²: how much of the variation in the target the model explains. 80–100% excellent · 50–80% good · 20–50% fair · below 20% means the target is hard to predict from these features.'}
                        position="top"
                      >
                        <span className="bg-[#08B839]/15 border border-[#08B839]/30 rounded-full px-[8px] py-[1px] text-[0.6875rem] text-[#08B839] font-semibold cursor-help">
                          {activeChat.trainingMetrics.metricKey === 'accuracy' ? 'Accuracy' : 'R²'} {(activeChat.trainingMetrics.metricValue * 100).toFixed(1)}%
                        </span>
                      </Tooltip>
                      <ChevronDown className={`w-[14px] h-[14px] text-[#9e9e9e] transition-transform duration-200 ${isModelCardExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                    </button>
                    {isModelCardExpanded && (
                      <div className="border-t border-white/[0.08] px-[16px] py-[12px]">
                        <p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide mb-[10px]">Top Features by Importance</p>
                        {(() => {
                          const features = activeChat.trainingMetrics!.topFeatures;
                          const maxImp = Math.max(...features.map((f) => f.importance), 0.0001);
                          return features.map((f) => (
                            <div key={f.name} className="flex items-center gap-[10px] mb-[7px] last:mb-0">
                              <p className="font-sans text-[0.6875rem] text-[#9e9e9e] w-[110px] flex-shrink-0 truncate text-right">{f.name}</p>
                              <div className="flex-1 h-[6px] bg-[#3a3a3a] rounded-full overflow-hidden">
                                <motion.div className="h-full rounded-full bg-[#7760bd]" initial={{ width: 0 }} animate={{ width: `${(f.importance / maxImp) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                              </div>
                              <p className="font-tabular text-[0.625rem] text-[#7760bd] w-[32px] flex-shrink-0 text-right">{(f.importance * 100).toFixed(1)}%</p>
                            </div>
                          ));
                        })()}
                        <p className="font-sans text-[0.625rem] text-[#444] mt-[10px]">
                          {activeChat.trainingMetrics.taskType === 'classification' ? 'Classification' : 'Regression'} · RandomForest
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                      <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#666] mb-[8px]">You</p>
                      {editingMessageId === message.id ? (
                        /* Edit Mode */
                        <div className="bg-[#3a3a3a] border border-white/[0.08] rounded-[16px] px-[24px] py-[12px] max-w-[700px] w-full">
                          <textarea
                            className="w-full bg-transparent text-[#fffcfe] font-sans text-[1rem] leading-[24px] resize-none outline-none border-none placeholder:text-white/70"
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
                                <path d="M12 4L4 12M4 4L12 12" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleConfirmEdit(message.id)}
                              className="p-[6px] rounded-[6px] bg-[#7760bd] hover:bg-[#8a75d4] transition-colors"
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
                          <div className="bg-[#3a3a3a] border border-white/[0.08] rounded-[16px] px-[24px] py-[12px] max-w-[700px] overflow-x-hidden">
                            <p
                              className="font-sans text-[1rem] leading-[24px] text-[#fffcfe]"
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
                              <p className="font-sans text-[0.75rem] text-white/70 mt-[6px] italic">
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
                              className="p-[4px] rounded-[6px] hover:bg-[#3a3a3a] transition-colors"
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
                                  <rect x="6" y="6" width="10" height="10" rx="2" stroke="#9e9e9e" strokeWidth="1.5" fill="none" />
                                  <path d="M12 6V4C12 2.89543 11.1046 2 10 2H4C2.89543 2 2 2.89543 2 4V10C2 11.1046 2.89543 12 4 12H6" stroke="#9e9e9e" strokeWidth="1.5" fill="none" />
                                </svg>
                              )}
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => {
                                if (!isProcessing) {
                                  setEditingMessageId(message.id);
                                  setEditMessageValue(message.content);
                                }
                              }}
                              className={`p-[4px] rounded-[6px] transition-colors ${
                                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3a3a3a] cursor-pointer'
                              }`}
                              title={isProcessing ? 'Cannot edit while regenerating' : 'Edit'}
                              disabled={isProcessing}
                            >
                              <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 18 18" stroke="#9e9e9e" strokeWidth="1.5">
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
                      <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#666] mb-[8px]">Makeen</p>
                      <div className="max-w-[700px]">
                        <p
                          className="font-sans text-[1rem] leading-[24px] text-[#fffcfe] whitespace-pre-line"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          {streamedMessageIds.has(message.id) ? (
                            // Message was delivered via SSE streaming — content appeared
                            // progressively so TypewriterText would just re-animate it.
                            message.content
                          ) : (
                            <TypewriterText
                              text={message.content}
                              messageId={message.id}
                              isLatest={message.id === latestAiMessageId}
                              onTypingStart={() => setIsTyping(true)}
                              onTypingComplete={() => setIsTyping(false)}
                              shouldStop={shouldStopTyping}
                            />
                          )}
                        </p>
                        {message.stopped && (
                          <p className="mt-[6px] text-[0.75rem] text-[#9e9e9e] italic">Generation stopped</p>
                        )}
                      </div>

                      {/* UNCLEAR suggestions — shown when backend couldn't classify the question */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-[12px] flex flex-col gap-[8px] max-w-[700px]">
                          {message.suggestions.map((suggestion, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.06, ease: "easeOut" }}
                              onClick={() => {
                                setInputValue('');
                                sendMessage(suggestion);
                              }}
                              className="text-left px-[16px] py-[10px] rounded-[10px] border border-[#7760bd]/30 text-[#7760bd] hover:bg-[#7760bd]/10 hover:border-[#7760bd]/60 hover:text-[#8a75d4] transition-all"
                              style={{ fontSize: 'var(--ui-font-size)' }}
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* XAI Results Card — shown when pipeline data is available */}
                      {message.xaiData && (
                        <motion.div
                          className="mt-[16px] w-full max-w-[520px] bg-[#2c2c2c] border border-white/[0.08] rounded-[12px] overflow-hidden"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                        >
                          {/* Header */}
                          <div className="px-[20px] py-[12px] border-b border-white/[0.08] flex items-center justify-between gap-[8px] flex-wrap">
                            <div className="flex items-center gap-[8px]">
                              <svg className="w-[16px] h-[16px] text-[#7760bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                              </svg>
                              <p className="font-sans font-semibold text-[0.8125rem] text-white">XAI Explanation</p>
                            </div>
                            <div className="flex items-center gap-[6px] flex-wrap justify-end">
                              {message.xaiData.confidence !== null && message.xaiData.confidence !== undefined && message.xaiData.confidence < 60 && (
                                <div className="flex items-center gap-[4px] bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-full px-[8px] py-[2px]">
                                  <svg className="w-[10px] h-[10px] text-[#FFC107]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                  </svg>
                                  <p className="text-[0.625rem] text-[#FFC107]">Low confidence — treat with caution</p>
                                </div>
                              )}
                              <div className="bg-[#7760bd]/20 border border-[#7760bd]/40 rounded-full px-[10px] py-[3px]">
                                <p className="font-sans font-semibold text-[0.6875rem] text-[#7760bd]">
                                  {message.xaiData.prediction}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* SHAP Feature Importance Chart — presented as a data exhibit: eyebrow label, thin bars, hairline-separated rows */}
                          <div className="px-[20px] py-[16px]">
                            <Eyebrow>Factor Importance · SHAP</Eyebrow>
                            <div className="mt-[12px]">
                            {(() => {
                              const entries = Object.entries(message.xaiData.shapValues);
                              const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)));
                              return entries
                                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                                .map(([feature, value], i) => {
                                  const pct = (Math.abs(value) / maxAbs) * 100;
                                  const positive = value >= 0;
                                  return (
                                    <div key={feature}>
                                      {i > 0 && <HairlineDivider className="my-[8px]" />}
                                      <div title={`${feature} ${positive ? 'pushed toward' : 'pushed against'} prediction (${positive ? '+' : ''}${value.toFixed(3)})`} className="flex items-center gap-[10px] py-[2px] cursor-default">
                                        <p className="font-sans text-[0.75rem] text-[#9e9e9e] w-[110px] flex-shrink-0 truncate text-right">{feature}</p>
                                        <div className="flex-1 h-[5px] bg-[#3a3a3a] rounded-full overflow-hidden">
                                          <motion.div
                                            className={`h-full rounded-full ${positive ? 'bg-[#7760bd]' : 'bg-[#e05a5a]'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                                          />
                                        </div>
                                        <p className={`font-tabular text-[0.6875rem] w-[36px] flex-shrink-0 text-right ${positive ? 'text-[#7760bd]' : 'text-[#e05a5a]'}`}>
                                          {positive ? '+' : ''}{value.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                });
                            })()}
                            </div>
                          </div>

                          {/* LIME Feature Importance Chart — local_single only */}
                          {message.xaiData.mode === 'local_single' && message.xaiData.limeValues && Object.keys(message.xaiData.limeValues).length > 0 && (
                            <div className="px-[20px] pb-[16px] border-t border-white/[0.08] pt-[16px]">
                              <Eyebrow>Feature Importance · LIME</Eyebrow>
                              <div className="mt-[12px]">
                              {(() => {
                                const entries = Object.entries(message.xaiData.limeValues).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
                                const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 0.0001);
                                return entries.map(([feature, value], i) => {
                                  const pct = (Math.abs(value) / maxAbs) * 100;
                                  const positive = value >= 0;
                                  return (
                                    <div key={feature}>
                                      {i > 0 && <HairlineDivider className="my-[8px]" />}
                                      <div title={`${feature} ${positive ? 'supports' : 'opposes'} prediction (${positive ? '+' : ''}${value.toFixed(3)})`} className="flex items-center gap-[10px] py-[2px] cursor-default">
                                        <p className="font-sans text-[0.75rem] text-[#9e9e9e] w-[110px] flex-shrink-0 truncate text-right">{feature}</p>
                                        <div className="flex-1 h-[5px] bg-[#3a3a3a] rounded-full overflow-hidden">
                                          <motion.div
                                            className={`h-full rounded-full ${positive ? 'bg-[#08B839]' : 'bg-[#FFC107]'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
                                          />
                                        </div>
                                        <p className={`font-tabular text-[0.6875rem] w-[36px] flex-shrink-0 text-right ${positive ? 'text-[#08B839]' : 'text-[#FFC107]'}`}>
                                          {positive ? '+' : ''}{value.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="px-[20px] py-[8px] border-t border-white/[0.08] flex items-center justify-between gap-[6px]">
                            <div className="flex items-center gap-[6px]">
                              <svg className="w-[12px] h-[12px] text-[#9e9e9e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="font-sans text-[0.6875rem] text-[#9e9e9e]">SHAP: gold/red · LIME: green/amber</p>
                            </div>
                            {activeChat.rawFeatureDefaults && (
                              <button
                                onClick={() => {
                                  const lastXaiMsg = activeChat.messages.slice().reverse().find((m) => m.xaiData);
                                  setWhatIfOriginalPrediction(lastXaiMsg?.xaiData
                                    ? { prediction: lastXaiMsg.xaiData.prediction, confidence: lastXaiMsg.xaiData.confidence ?? null }
                                    : null);
                                  setWhatIfValues({ ...activeChat.rawFeatureDefaults! });
                                  setWhatIfResult(null);
                                  setWhatIfError(null);
                                  setShowWhatIfModal(true);
                                }}
                                className="flex-shrink-0 text-[0.6875rem] text-[#7760bd] hover:text-[#8a75d4] border border-[#7760bd]/40 hover:border-[#7760bd]/70 rounded-full px-[10px] py-[2px] transition-all cursor-pointer"
                              >
                                Try What-If
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Action Icons */}
                      <div className="flex gap-[12px] mt-[12px]">
                        {/* Copy Button */}
                        <Tooltip text={copiedMessageId === message.id ? "Copied" : "Copy"} position="top">
                          <button
                            className="p-[6px] rounded-[6px] hover:bg-[#3a3a3a] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
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
                                <rect x="6" y="6" width="10" height="10" rx="2" stroke="#9e9e9e" strokeWidth="1.5" fill="none" />
                                <path d="M12 6V4C12 2.89543 11.1046 2 10 2H4C2.89543 2 2 2.89543 2 4V10C2 11.1046 2.89543 12 4 12H6" stroke="#9e9e9e" strokeWidth="1.5" fill="none" />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        {/* Retry/Regenerate Button - Only show for last assistant message, not while processing */}
                        {!isProcessing && (() => {
                          const lastAssistantIndex = activeChat.messages.map((m, i) => ({ m, i })).reverse().find(({ m }) => m.role === 'assistant')?.i;
                          return lastAssistantIndex === index;
                        })() && (
                          <Tooltip text="Regenerate" position="top">
                            <button
                              className="p-[6px] rounded-[6px] hover:bg-[#3a3a3a] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                              aria-label="Regenerate"
                              onClick={() => handleRetryMessage(message.id)}
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path d="M2 9C2 5.13401 5.13401 2 9 2C11.3869 2 13.5056 3.16667 14.7513 4.96493M16 9C16 12.866 12.866 16 9 16C6.61311 16 4.49437 14.8333 3.24868 13.0351" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M14 2V5H11" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 16V13H7" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                  : 'hover:bg-[#3a3a3a]'
                              }`}
                              onClick={() => handleFeedback(message.id, 'up')}
                              aria-label="Good response"
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path
                                  d={svgPathsAnswer.p6226600}
                                  fill={message.feedback === 'up' ? '#7760bd' : '#9e9e9e'}
                                />
                                <path
                                  d="M4.73413 6.94358V17.2287"
                                  stroke={message.feedback === 'up' ? '#7760bd' : '#9e9e9e'}
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
                                  : 'hover:bg-[#3a3a3a]'
                              }`}
                              onClick={() => handleFeedback(message.id, 'down')}
                              aria-label="Bad response"
                            >
                              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 18 18">
                                <path
                                  d={svgPathsAnswer.p115b4180}
                                  fill={message.feedback === 'down' ? '#7760bd' : '#9e9e9e'}
                                />
                                <path
                                  d="M4.84912 11V0.999976"
                                  stroke={message.feedback === 'down' ? '#7760bd' : '#9e9e9e'}
                                  strokeWidth="2"
                                />
                              </svg>
                            </button>
                          </Tooltip>
                        )}

                        {/* Share Button */}
                        <Tooltip text="Share" position="top">
                          <button
                            className="p-[6px] rounded-[6px] hover:bg-[#3a3a3a] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            aria-label="Share"
                            onClick={() => handleOpenMessageShareModal(message.id, message.content)}
                          >
                            <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 20 19.995">
                              <path d={svgPathsAnswer.p123ea5e0} fill="#9e9e9e" />
                            </svg>
                          </button>
                        </Tooltip>

                        {/* Read Aloud Button (Coming Soon) */}
                        <Tooltip text="Read aloud" position="top">
                          <button
                            className="p-[6px] rounded-[6px] hover:bg-[#3a3a3a] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7760bd]/50"
                            aria-label="Read aloud"
                            onClick={() => setToastMessage('Coming soon')}
                          >
                            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="#9e9e9e" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Processing Indicator — only for new messages, not regeneration, and hides the instant the first token arrives */}
              <AnimatePresence>
              {isProcessing && !isRegenerating && !streamedMessageIds.has(latestAiMessageId ?? '') && (() => {
                const stages = [
                  { label: 'Understanding your question', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { label: 'Analysing your data',         icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
                  { label: 'Computing explanations',      icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
                  { label: 'Generating response',         icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                ];
                return (
                  <motion.div
                    className="mb-[24px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="max-w-[480px] bg-[#2c2c2c] border border-white/[0.08] rounded-[12px] px-[20px] py-[16px]">
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
                                         'bg-[#3a3a3a] border border-white/[0.08]'
                              }`}>
                                {done ? (
                                  <svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className={`w-[14px] h-[14px] ${active ? 'text-[#7760bd]' : 'text-[#9e9e9e]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                                  </svg>
                                )}
                              </div>
                              {/* Label */}
                              <p className={`font-sans text-[0.8125rem] transition-colors duration-500 ${
                                done   ? 'text-[#7760bd] line-through' :
                                active ? 'text-white' :
                                         'text-[#9e9e9e]'
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

              {/* Regenerating Indicator — only shown when regenerating, hides on first token */}
              <AnimatePresence>
              {isProcessing && isRegenerating && !streamedMessageIds.has(latestAiMessageId ?? '') && (
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
                      <p className="font-sans text-[0.875rem] text-[#9e9e9e]">
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

            {/* Suggested questions chip bar — shown after loading a sample dataset */}
            {sampleSuggestedQuestions.length > 0 && (
              <div className="flex items-center gap-[8px] pb-[10px] px-[2px]">
                <div className="flex gap-[8px] overflow-x-auto scrollbar-hide pb-[2px] flex-1">
                  {sampleSuggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setInputValue(q);
                        textareaRef.current?.focus();
                      }}
                      className="flex-shrink-0 bg-[#2c2c2c] border border-white/[0.08] hover:border-[#7760bd] hover:bg-[#3a3a3a] text-[#9e9e9e] hover:text-white text-[0.75rem] rounded-full px-[14px] py-[7px] transition-all cursor-pointer whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSampleSuggestedQuestions([]);
                    setChats((prev) => prev.map((c) => c.id === activeChatId ? { ...c, suggestedQuestions: [] } : c));
                  }}
                  className="flex-shrink-0 text-[#9e9e9e] hover:text-[#9e9e9e] transition-colors"
                  title="Dismiss suggestions"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="mt-auto pb-[16px]">
              {/* ChatInputGlowShell - Premium multi-layer glow container */}
              <div className="relative group/composer">
                
                {/* Gold highlight - hairline border on focus */}
                <div
                  className="absolute inset-[-2px] rounded-[18px] opacity-0 group-focus-within/composer:opacity-60 transition-opacity duration-[180ms] pointer-events-none"
                  style={{
                    background: '#7760bd',
                    padding: '2px',
                  }}
                >
                  <div className="h-full w-full bg-transparent rounded-[16px]"></div>
                </div>

                {/* Gold highlight - restrained blurred glow (single tone, no rainbow) */}
                <div
                  className="absolute inset-[-3px] rounded-[19px] opacity-0 group-focus-within/composer:opacity-25 transition-opacity duration-[180ms] pointer-events-none"
                  style={{
                    background: 'rgba(119, 96, 189, 0.25)',
                    filter: 'blur(18px)',
                  }}
                />

                {/* AuraGlow - Soft radial gold bloom, breathes gently at rest */}
                <div
                  className="absolute inset-0 rounded-[16px] pointer-events-none transition-all duration-300 ease-in-out animate-[breathe_3s_ease-in-out_infinite]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(119, 96, 189, 0.30) 0%, transparent 70%)',
                    opacity: 0.28,
                    filter: 'blur(35px)',
                  }}
                />

                {/* AuraGlow Enhanced on Hover/Focus */}
                <div
                  className="absolute inset-0 rounded-[16px] pointer-events-none transition-all duration-300 ease-in-out opacity-0 group-hover/composer:group-[:not(:focus-within)]:opacity-[0.15] group-focus-within/composer:opacity-[0.30]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(119, 96, 189, 0.35) 0%, transparent 70%)',
                    filter: 'blur(45px)',
                    boxShadow: '0 0 60px 20px rgba(119, 96, 189, 0.20)',
                  }}
                />

                  {/* Main Composer Container - FIXED dimensions — hairline border command-bar, not a solid filled box */}
                  <div className="relative bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm rounded-[16px] px-[20px] py-[14px] flex flex-col gap-[12px]">
                    {/* Top Section: Text Area */}
                    <TextareaAutosize
                      ref={textareaRef}
                      placeholder="Ask away"
                      className="bg-transparent text-[1rem] text-white placeholder:text-[#9e9e9e]/80 placeholder:italic outline-none font-sans resize-none max-w-full overflow-x-hidden"
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
                        if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={isProcessing}
                    />

                    {/* Character counter — only visible when user has typed something */}
                    {inputValue.length > 0 && (
                      <p className={`text-right text-[0.6875rem] font-tabular transition-colors ${
                        inputValue.length > 450
                          ? inputValue.length >= 500 ? 'text-red-400' : 'text-yellow-400'
                          : 'text-[#9e9e9e]'
                      }`}>
                        {inputValue.length} / 500
                      </p>
                    )}

                    {/* Bottom Section: Fixed Control Bar */}
                    <div className="flex gap-[12px] items-center justify-end relative z-10">
                      {/* Dictate Button */}
                      <button
                        className={`p-[8px] rounded-[8px] transition-all cursor-pointer focus:outline-none ${
                          isDictating ? 'bg-[#7760bd]/20' : 'hover:bg-[#444]'
                        }`}
                        onClick={() => {
                          setIsDictating(!isDictating);
                          setToastMessage('Coming soon');
                        }}
                        aria-label="Dictate"
                      >
                        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke={isDictating ? "#7760bd" : "#9e9e9e"} strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button
                        className={`bg-[#7760bd] rounded-full px-[28px] py-[12px] transition-all cursor-pointer ${
                          isProcessing || isTyping
                            ? 'hover:bg-[#8a75d4]'
                            : 'hover:bg-[#8a75d4] hover:shadow-[0_0_20px_rgba(119,96,189,0.5)] hover:scale-105'
                        }`}
                        onClick={(isProcessing || isTyping) ? stopGeneration : () => sendMessage()}
                      >
                        {(isProcessing || isTyping) ? (
                          /* Stop Icon - White Square */
                          <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="2" width="12" height="12" rx="2" fill="white" />
                          </svg>
                        ) : (
                          <p className="font-sans font-semibold text-[0.875rem] uppercase tracking-[0.08em] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
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
              <p className="font-sans font-semibold text-[0.9375rem] text-white mb-[2px]">
                Chat history is off
              </p>
              <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                This chat won't be saved. Turn it on in Settings → Security.
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-[8px] flex-shrink-0">
              {/* Turn on button */}
              <button
                onClick={handleTurnOnChatHistory}
                className="h-[34px] px-[14px] bg-[#7760bd] hover:bg-[#8a75d4] text-white rounded-[10px] font-sans font-medium text-[0.8125rem] transition-colors"
              >
                Turn on
              </button>
              
              {/* Close button */}
              <button
                onClick={() => setShowChatHistoryBanner(false)}
                className="hover:bg-[#3a3a3a] rounded-[4px] p-[2px] transition-colors"
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
          <div className="bg-[#2c2c2c] border border-[#9e9e9e] rounded-[8px] px-[24px] py-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center gap-[16px]">
            <p className="font-sans text-[1rem] text-white">
              Chat deleted
            </p>
            <button
              onClick={handleUndoDelete}
              className="bg-[#7760bd] hover:bg-[#8a75d4] rounded-[6px] px-[16px] py-[6px] transition-colors cursor-pointer"
            >
              <p className="font-sans font-semibold text-[0.875rem] text-white">
                Undo
              </p>
            </button>
            <button
              onClick={() => {
                if (!pendingDelete) return;
                clearTimeout(pendingDelete.timer);
                setShowDeleteToast(false);
                if (session?.access_token && pendingDelete.chat.backendId !== undefined) {
                  deleteChatAPI(session.access_token, pendingDelete.chat.backendId)
                    .catch((err) => console.error('[deleteChat] Backend delete failed:', err));
                }
                setPendingDelete(null);
              }}
              className="text-[#9e9e9e] hover:text-white transition-colors cursor-pointer p-[2px]"
              aria-label="Dismiss"
            >
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {shareModalChat && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleCloseShareModal}
        >
          <div
            className="bg-[#2c2c2c] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[480px] max-w-[90vw] border border-white/[0.08] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[32px] pt-[32px] pb-[16px] border-b border-white/[0.08]">
              <h2 className="font-sans font-semibold text-[1.5rem] text-white mb-[4px]">
                Export Results
              </h2>
              <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                Download the prediction, SHAP explanation, and conversation
              </p>
            </div>

            {/* Export Options */}
            <div className="px-[32px] py-[24px] flex flex-col gap-[12px]">
              {/* PDF */}
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#3a3a3a] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-semibold text-[1rem] text-white">
                    Export as PDF
                  </p>
                  <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                    Opens print dialog — save as PDF
                  </p>
                </div>
              </button>

              {/* HTML */}
              <button
                onClick={handleExportHTML}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#3a3a3a] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-semibold text-[1rem] text-white">
                    Export as HTML
                  </p>
                  <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                    Download a self-contained HTML report
                  </p>
                </div>
              </button>

              {/* CSV */}
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#3a3a3a] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-semibold text-[1rem] text-white">
                    Export as CSV
                  </p>
                  <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                    Download prediction and SHAP values as spreadsheet
                  </p>
                </div>
              </button>

              {/* Full report — aggregates every Q&A pair in this chat + an AI-written
                  overall summary, unlike the three options above which only look at the
                  most recent prediction from local state. */}
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#3a3a3a] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-semibold text-[1rem] text-white">
                    {isGeneratingReport ? 'Generating…' : 'Generate Full Report'}
                  </p>
                  <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">
                    AI summary across every question in this chat
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-[32px] pb-[32px] pt-[8px] flex justify-end">
              <button
                onClick={handleCloseShareModal}
                className="bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-sans font-semibold text-[0.875rem] text-white">
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
            className="bg-[#2c2c2c] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[400px] max-w-[90vw] border border-white/[0.08] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-[32px] pt-[32px] pb-[24px]">
              <h2 className="font-sans font-semibold text-[1.5rem] text-white mb-[12px]">
                Log out?
              </h2>
              <p className="font-sans text-[1rem] text-[#9e9e9e]">
                Are you sure you want to log out?
              </p>
            </div>
            <div className="px-[32px] pb-[32px] flex justify-end gap-[12px]">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-sans font-semibold text-[0.875rem] text-white">
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
                className="bg-[#7760bd] hover:bg-[#8b7dd8] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-sans font-semibold text-[0.875rem] text-white">
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
            className="bg-[#2c2c2c] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[480px] max-w-[90vw] border border-white/[0.08] animate-[modalFadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[32px] pt-[32px] pb-[16px] border-b border-white/[0.08]">
              <h2 className="font-sans font-semibold text-[1.5rem] text-white mb-[8px]">
                Share chat
              </h2>
            </div>

            {/* Share Options */}
            <div className="px-[32px] py-[24px] flex flex-col gap-[12px]">
              {/* Copy Chat Text */}
              <button
                onClick={handleCopyConversationText}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#3a3a3a] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-semibold text-[1rem] text-white">Copy Chat Text</p>
                  <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">Copy full transcript to clipboard</p>
                </div>
              </button>

              {/* Download */}
              <button
                onClick={handleDownloadTXT}
                className="w-full flex items-center gap-[16px] p-[16px] bg-[#2c2c2c] hover:bg-[#3a3a3a] hover:border-[#7760bd] border-2 border-transparent rounded-[12px] transition-all cursor-pointer group"
              >
                <div className="w-[40px] h-[40px] bg-[#7760bd]/20 rounded-[8px] flex items-center justify-center group-hover:bg-[#7760bd]/30 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="#7760bd" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-semibold text-[1rem] text-white">Download (.txt)</p>
                  <p className="font-sans text-[0.8125rem] text-[#9e9e9e]">Download chat as text file</p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-[32px] pb-[32px] pt-[8px] flex justify-end">
              <button
                onClick={handleCloseMessageShareModal}
                className="bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer"
              >
                <p className="font-sans font-semibold text-[0.875rem] text-white">
                  Close
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (() => {
        const attachment = activeChat?.fileAttachment;
        const datasetInfo = activeChat?.datasetInfo;
        // Match to a sample dataset by filename so we can show preview rows
        const matchedSample = attachment
          ? SAMPLE_DATASETS.find((d) => d.filename === attachment.name)
          : null;
        const previewColumns = datasetInfo?.columns ?? matchedSample?.columns ?? [];
        const previewRows = datasetInfo?.previewRows?.length ? datasetInfo.previewRows : (matchedSample?.previewRows ?? []);
        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-[16px]"
            onClick={() => setShowFilePreview(false)}
          >
            <div
              className="bg-[#2c2c2c] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[680px] max-w-[95vw] max-h-[90vh] flex flex-col border border-white/[0.08] animate-[modalFadeIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-[28px] pt-[24px] pb-[16px] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-sans font-semibold text-[1.25rem] text-white">File Preview</h2>
                  {datasetInfo && (
                    <p className="text-[0.75rem] text-[#9e9e9e] mt-[2px]">{datasetInfo.rows.toLocaleString()} rows · {datasetInfo.columns.length} columns</p>
                  )}
                </div>
                <button onClick={() => setShowFilePreview(false)} className="p-[6px] hover:bg-[#3a3a3a] rounded-[6px] transition-colors cursor-pointer">
                  <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-[28px] py-[20px] flex flex-col gap-[16px]">
                {/* File info row */}
                <div className="flex items-center gap-[12px] bg-[#2c2c2c] rounded-[10px] p-[14px]">
                  <svg className="w-[28px] h-[28px] flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="#08B839" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 2v7h7" stroke="#08B839" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[0.875rem] text-white truncate">{attachment?.name ?? 'Sample_Template.csv'}</p>
                    <p className="text-[0.75rem] text-[#9e9e9e]">{attachment?.type?.toUpperCase() ?? 'CSV'}{attachment?.size ? ` · ${(attachment.size / 1024).toFixed(1)} KB` : ''}</p>
                  </div>
                </div>

                {/* Data table — shown when we have columns */}
                {previewColumns.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] text-[#9e9e9e] uppercase tracking-wide mb-[10px]">
                      {previewRows.length > 0 ? 'Sample Rows' : 'Columns'}
                    </p>
                    <div className="overflow-x-auto rounded-[8px] border border-white/[0.08]">
                      <table className="w-full text-left border-collapse" style={{ minWidth: `${previewColumns.length * 100}px` }}>
                        <thead>
                          <tr className="bg-[#2c2c2c]">
                            {previewColumns.map((col) => (
                              <th key={col} className="px-[12px] py-[8px] text-[0.6875rem] font-semibold text-[#9e9e9e] uppercase tracking-wide border-b border-white/[0.08] whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        {previewRows.length > 0 && (
                          <tbody>
                            {previewRows.map((row, ri) => (
                              <tr key={ri} className="border-b border-[#3a3a3a] hover:bg-[#2c2c2c] transition-colors">
                                {row.map((cell, ci) => (
                                  <td key={ci} className="px-[12px] py-[7px] text-[0.75rem] text-[#9e9e9e] whitespace-nowrap">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>
                    {previewRows.length > 0 && datasetInfo && (
                      <p className="text-[0.6875rem] text-[#444] mt-[6px]">Showing 5 of {datasetInfo.rows.toLocaleString()} rows</p>
                    )}
                  </div>
                )}

                {/* Fallback if no column info yet */}
                {previewColumns.length === 0 && (
                  <div className="bg-[#2c2c2c] rounded-[10px] p-[24px] flex items-center justify-center min-h-[120px]">
                    <p className="text-[0.8125rem] text-[#9e9e9e]">Column information not available yet — ask a question to begin analysis.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-[28px] pb-[20px] pt-[12px] border-t border-white/[0.08] flex justify-end flex-shrink-0">
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="bg-[#7760bd] hover:bg-[#8a75d4] rounded-[8px] px-[20px] py-[8px] transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-[0.8125rem] text-white">Close</p>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sample Dataset Preview Modal */}
      {selectedSampleDataset && (() => {
        const ds = SAMPLE_DATASETS.find((d) => d.id === selectedSampleDataset)!;
        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedSampleDataset(null)}
          >
            <div
              className="bg-[#2c2c2c] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-[700px] max-w-[92vw] max-h-[90vh] overflow-y-auto border border-white/[0.08] animate-[modalFadeIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-[32px] pt-[32px] pb-[16px] border-b border-white/[0.08] flex items-start justify-between gap-[16px]">
                <div>
                  <h2 className="font-sans font-semibold text-[22px] text-white">{ds.name}</h2>
                  <p className="text-[0.875rem] text-[#9e9e9e] mt-[4px]">{ds.description}</p>
                </div>
                <button
                  onClick={() => setSelectedSampleDataset(null)}
                  className="text-[#9e9e9e] hover:text-white transition-colors mt-[2px] flex-shrink-0"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="px-[32px] py-[24px] flex flex-col gap-[24px]">
                {/* Table preview */}
                <div>
                  <p className="text-[0.75rem] font-semibold text-[#9e9e9e] uppercase tracking-wide mb-[10px]">Preview (first 5 rows)</p>
                  <div className="overflow-x-auto rounded-[8px] border border-white/[0.08]">
                    <table className="text-[0.75rem] text-[#9e9e9e] w-full border-collapse">
                      <thead>
                        <tr className="bg-[#2c2c2c]">
                          {ds.columns.map((col) => (
                            <th key={col} className="px-[12px] py-[8px] text-left font-semibold text-white border-b border-white/[0.08] whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ds.previewRows.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-[#141414]' : 'bg-[#3a3a3a]'}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-[12px] py-[7px] border-b border-[#3a3a3a] whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Suggested questions */}
                <div>
                  <p className="text-[0.75rem] font-semibold text-[#9e9e9e] uppercase tracking-wide mb-[10px]">Suggested questions</p>
                  <div className="flex flex-col gap-[8px]">
                    {ds.suggestedQuestions.map((q) => (
                      <div key={q} className="flex items-start gap-[10px] bg-[#2c2c2c] rounded-[8px] px-[14px] py-[10px]">
                        <span className="text-[#7760bd] text-[0.875rem] font-bold mt-[1px] flex-shrink-0">›</span>
                        <p className="text-[0.8125rem] text-[#ddd]">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-[32px] pb-[32px] flex items-center justify-between gap-[12px]">
                <button
                  onClick={() => setSelectedSampleDataset(null)}
                  className="bg-[#2c2c2c] hover:bg-[#3a3a3a] rounded-[8px] px-[20px] py-[10px] transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-[0.875rem] text-white">Cancel</p>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(ds.url);
                      if (!response.ok) {
                        // Supabase storage returns 400 for an object that doesn't exist at this
                        // path (not 404) — log the URL so a missing/renamed file in the bucket is
                        // obvious from devtools instead of a generic "please try again" toast.
                        console.error(`[sample dataset] ${response.status} fetching ${ds.url}`);
                        throw new Error(`HTTP ${response.status}`);
                      }
                      const blob = await response.blob();
                      const file = new File([blob], ds.filename, { type: 'text/csv' });
                      handleFileSelect(file);
                      setSampleSuggestedQuestions([...ds.suggestedQuestions]);
                      setChats((prev) => prev.map((c) => c.id === activeChatId ? { ...c, suggestedQuestions: [...ds.suggestedQuestions] } : c));
                      setSelectedSampleDataset(null);
                    } catch (err) {
                      console.error('[sample dataset] load failed:', err);
                      setToastMessage('Failed to load sample dataset. Please try again.');
                    }
                  }}
                  className="bg-[#7760bd] hover:bg-[#8a75d4] rounded-[8px] px-[24px] py-[10px] transition-colors cursor-pointer hover:shadow-[0_0_20px_rgba(119,96,189,0.4)]"
                >
                  <p className="font-semibold text-[0.875rem] text-white">Use this dataset</p>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
        onLearnMore={() => {
          // Revert thumbs-down highlight since user hasn't submitted
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
          setShowTermsAndPolicies(true);
        }}
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
        onKeyboardShortcutsClick={() => setShowKeyboardShortcuts(true)}
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
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={showReportBugModal}
        onClose={() => setShowReportBugModal(false)}
        onSuccess={() => setToastMessage('Bug report sent successfully')}
      />

      {/* What-If Analysis Modal */}
      {showWhatIfModal && activeChat?.rawFeatureDefaults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-[16px]">
          <div className="bg-[#2c2c2c] border border-white/[0.08] rounded-[12px] w-full max-w-[560px] max-h-[90vh] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="px-[24px] py-[16px] border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <p className="font-sans font-semibold text-[1rem] text-white">What-If Analysis</p>
                <p className="font-sans text-[0.75rem] text-[#9e9e9e] mt-[2px]">Adjust feature values to simulate a new prediction</p>
              </div>
              <button onClick={() => setShowWhatIfModal(false)} className="p-[6px] hover:bg-[#3a3a3a] rounded-[6px] transition-colors cursor-pointer">
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                  <path d="M12 4L4 12M4 4L12 12" stroke="#9e9e9e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Scrollable Feature Inputs */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[16px] flex flex-col gap-[10px]">
              {Object.entries(whatIfValues).map(([feature, value]) => (
                <div key={feature} className="flex items-center gap-[12px]">
                  <label className="font-sans text-[0.8125rem] text-[#9e9e9e] w-[140px] flex-shrink-0 truncate text-right">{feature}</label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={String(value)}
                    onChange={(e) => setWhatIfValues((prev) => ({
                      ...prev,
                      [feature]: typeof value === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value,
                    }))}
                    className="flex-1 bg-[#2c2c2c] border border-white/[0.08] rounded-[6px] px-[10px] py-[6px] font-sans text-[0.8125rem] text-white outline-none focus:border-[#7760bd] transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Result Panel */}
            {whatIfResult && (
              <div className="mx-[24px] mb-[12px] bg-[#2c2c2c] rounded-[10px] border border-white/[0.08] p-[16px]">
                <p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide mb-[12px]">Counterfactual Result</p>
                <div className="flex gap-[12px] mb-[14px]">
                  {/* Before */}
                  {whatIfOriginalPrediction && (
                    <div className="flex-1 bg-[#2c2c2c] border border-white/[0.08] rounded-[8px] p-[10px]">
                      <p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide mb-[6px]">Before</p>
                      <div className="bg-[#3a3a3a]/60 border border-white/[0.08] rounded-full px-[10px] py-[3px] inline-block mb-[4px]">
                        <p className="font-semibold text-[0.75rem] text-[#9e9e9e]">{whatIfOriginalPrediction.prediction}</p>
                      </div>
                      {whatIfOriginalPrediction.confidence !== null && (
                        <p className="font-tabular text-[0.6875rem] text-[#9e9e9e]">{whatIfOriginalPrediction.confidence.toFixed(1)}%</p>
                      )}
                    </div>
                  )}
                  {/* Arrow */}
                  {whatIfOriginalPrediction && (
                    <div className="flex items-center text-[#9e9e9e]">
                      <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                  {/* After */}
                  <div className="flex-1 bg-[#2c2c2c] border border-[#7760bd]/30 rounded-[8px] p-[10px]">
                    <p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide mb-[6px]">{whatIfOriginalPrediction ? 'After' : 'Prediction'}</p>
                    <div className="bg-[#7760bd]/20 border border-[#7760bd]/40 rounded-full px-[10px] py-[3px] inline-block mb-[4px]">
                      <p className="font-semibold text-[0.75rem] text-[#7760bd]">{whatIfResult.prediction}</p>
                    </div>
                    {whatIfResult.confidence !== null && (
                      <p className="font-tabular text-[0.6875rem] text-[#9e9e9e]">{whatIfResult.confidence.toFixed(1)}%</p>
                    )}
                  </div>
                </div>
                <p className="text-[0.625rem] text-[#9e9e9e] uppercase tracking-wide mb-[8px]">Key Drivers</p>
                {(() => {
                  const entries = Object.entries(whatIfResult.shapValues).slice(0, 5);
                  const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 0.0001);
                  return entries.map(([feat, val]) => {
                    const pct = (Math.abs(val) / maxAbs) * 100;
                    const positive = val >= 0;
                    return (
                      <div key={feat} className="flex items-center gap-[10px] mb-[6px]">
                        <p className="font-sans text-[0.6875rem] text-[#9e9e9e] w-[100px] flex-shrink-0 truncate text-right">{feat}</p>
                        <div className="flex-1 h-[6px] bg-[#3a3a3a] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${positive ? 'bg-[#7760bd]' : 'bg-[#e05a5a]'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        <p className={`font-tabular text-[0.625rem] w-[34px] flex-shrink-0 text-right ${positive ? 'text-[#7760bd]' : 'text-[#e05a5a]'}`}>
                          {positive ? '+' : ''}{val.toFixed(2)}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Error */}
            {whatIfError && (
              <p className="mx-[24px] mb-[8px] font-sans text-[0.75rem] text-[#e05a5a]">{whatIfError}</p>
            )}

            {/* Footer */}
            <div className="px-[24px] py-[14px] border-t border-white/[0.08] flex justify-end gap-[10px]">
              <button
                onClick={() => setShowWhatIfModal(false)}
                className="px-[16px] h-[36px] rounded-[8px] border border-[#9e9e9e] font-sans text-[0.8125rem] text-[#9e9e9e] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                disabled={isWhatIfLoading}
                onClick={async () => {
                  if (!session?.access_token || !activeChat?.backendId) return;
                  setIsWhatIfLoading(true);
                  setWhatIfError(null);
                  try {
                    const result = await whatIfAPI(session.access_token, activeChat.backendId, whatIfValues);
                    const shapMap: Record<string, number> = {};
                    for (const e of result.shap_values) shapMap[e.feature] = e.shap_value;
                    setWhatIfResult({ prediction: result.prediction, confidence: result.confidence, shapValues: shapMap });
                  } catch (err) {
                    setWhatIfError(err instanceof Error ? err.message : 'Simulation failed. Please try again.');
                  } finally {
                    setIsWhatIfLoading(false);
                  }
                }}
                className="bg-[#7760bd] disabled:opacity-50 px-[20px] h-[36px] rounded-[8px] font-sans text-[0.8125rem] text-white hover:bg-[#8a75d4] transition-all flex items-center gap-[8px] cursor-pointer"
              >
                {isWhatIfLoading && <div className="w-[12px] h-[12px] border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Run Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}