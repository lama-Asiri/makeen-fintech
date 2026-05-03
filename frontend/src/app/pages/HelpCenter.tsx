import { X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { helpCenterFaq, FaqSection, FaqItem } from '@/data/helpCenterFaq';
import { ReportBugModal } from '@/app/components/ReportBugModal';
import { ContactUsModal } from '@/app/components/ContactUsModal';
import { trackEvent } from '@/utils/analytics';

interface HelpCenterProps {
  onClose: () => void;
  source?: 'menu' | 'shortcut';
  initialSection?: string; // Optional section to auto-expand and scroll to
}

interface FilteredSection {
  section: FaqSection;
  filteredItems: FaqItem[];
}

// Persisted state in session storage
interface PersistedState {
  searchQuery: string;
  expandedSection: string | null;
  scrollPosition: number;
}

const STORAGE_KEY = 'helpCenterState';

function loadPersistedState(): PersistedState | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading Help Center state:', error);
  }
  return null;
}

function savePersistedState(state: PersistedState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving Help Center state:', error);
  }
}

export function HelpCenter({ onClose, source = 'menu', initialSection }: HelpCenterProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isReportBugOpen, setIsReportBugOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load persisted state on mount
  useEffect(() => {
    // Track Help Center opened
    trackEvent('help_center_opened', { source });

    // If initialSection is provided, prioritize it over persisted state
    if (initialSection) {
      setExpandedSection(initialSection);
      // Scroll to the section after a short delay to ensure rendering
      setTimeout(() => {
        const element = sectionRefs.current[initialSection];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      // Otherwise, load persisted state
      const persistedState = loadPersistedState();
      if (persistedState) {
        setSearchQuery(persistedState.searchQuery);
        setDebouncedSearchQuery(persistedState.searchQuery);
        setExpandedSection(persistedState.expandedSection);
        window.scrollTo({ top: persistedState.scrollPosition, behavior: 'smooth' });
      }
    }
  }, [source, initialSection]);

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle Esc key to close Help Center (but not when Report Bug modal is open)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If Report Bug modal or Contact Us modal is open, let them handle Esc
        if (isReportBugOpen || isContactUsOpen) {
          return;
        }
        // Otherwise, close Help Center
        trackEvent('help_center_closed', { source: 'esc' });
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isReportBugOpen, isContactUsOpen, onClose]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Track search when debounced query updates
      if (searchQuery.trim()) {
        trackEvent('help_search_used', { 
          queryLength: searchQuery.trim().length, 
          resultsCount: totalResults 
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter sections and questions based on search
  const filteredSections: FilteredSection[] = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    
    if (!query) {
      return helpCenterFaq.map(section => ({
        section,
        filteredItems: section.items
      }));
    }

    const results: FilteredSection[] = [];

    helpCenterFaq.forEach(section => {
      const matchingItems = section.items.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );

      if (matchingItems.length > 0) {
        results.push({
          section,
          filteredItems: matchingItems
        });
      }
    });

    return results;
  }, [debouncedSearchQuery]);

  // Calculate total results
  const totalResults = useMemo(() => {
    return filteredSections.reduce((sum, fs) => sum + fs.filteredItems.length, 0);
  }, [filteredSections]);

  // Auto-expand sections/questions when searching
  useEffect(() => {
    if (debouncedSearchQuery && filteredSections.length > 0) {
      // Auto-expand all sections that have matches
      const sectionsToExpand = new Set<string>();
      const questionsToExpand = new Set<string>();
      
      filteredSections.forEach(({ section, filteredItems }) => {
        sectionsToExpand.add(section.id);
        // Auto-expand the first matching question in each section
        if (filteredItems.length > 0) {
          questionsToExpand.add(filteredItems[0].id);
        }
      });
      
      setExpandedSection(sectionsToExpand.size > 0 ? Array.from(sectionsToExpand)[0] : null);
      setExpandedQuestions(questionsToExpand);
    }
  }, [debouncedSearchQuery, filteredSections]);

  // Handle category chip click
  const handleChipClick = (sectionId: string) => {
    // Clear search if active
    if (searchQuery || debouncedSearchQuery) {
      clearSearch();
    }
    
    // Set active chip
    setActiveChip(sectionId);
    
    // Expand the section
    setExpandedSection(sectionId);
    
    // Scroll to section after a short delay to ensure rendering
    setTimeout(() => {
      const element = sectionRefs.current[sectionId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection((prev) => {
      return prev === sectionId ? null : sectionId;
    });
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
        // Track FAQ opened when expanding
        const question = helpCenterFaq
          .flatMap(section => section.items)
          .find(item => item.id === questionId);
        const section = helpCenterFaq.find(s => s.items.some(i => i.id === questionId));
        if (question && section) {
          trackEvent('help_faq_opened', {
            sectionId: section.id,
            questionId: question.id
          });
        }
      }
      return newSet;
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-[rgba(119,96,189,0.3)] text-[#fffcfe]">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Toast effect
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Save state on unmount
  useEffect(() => {
    const currentRef = searchInputRef.current;
    const currentSection = expandedSection;
    const currentScroll = window.scrollY;

    return () => {
      if (currentRef) {
        savePersistedState({
          searchQuery: searchQuery,
          expandedSection: currentSection,
          scrollPosition: currentScroll
        });
      }
    };
  }, [searchQuery, expandedSection]);

  return (
    <>
      <div className="fixed inset-0 bg-[#0a0a0a] z-[100] overflow-y-auto">
        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#7760bd] opacity-[0.03] blur-[120px]" />
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            trackEvent('help_center_closed', { source: 'x' });
            onClose();
          }}
          className="fixed top-[8px] right-[8px] z-[101] p-[12px] text-[#999] hover:text-[#fffcfe] hover:bg-[#2c2c2c] rounded-[8px] transition-all"
          aria-label="Close Help Center"
        >
          <X className="w-[24px] h-[24px]" />
        </button>

        {/* Content Container */}
        <div className="relative max-w-[1000px] mx-auto px-[16px] md:px-[24px] py-[32px] md:py-[48px]">
          {/* Header */}
          <div className="mb-[40px] text-center">
            <h1 className="font-['Roboto:Bold',sans-serif] font-bold text-[1.5rem] md:text-[2.25rem] text-[#fffcfe] mb-[12px]">
              Help Center
            </h1>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] md:text-[1rem] text-[#999]">
              Find answers, learn how to use the platform, or contact us.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-[24px]">
            <div className="relative group/search">
              {/* Sharp gradient border */}
              <div 
                className="absolute inset-[-2px] rounded-[14px] opacity-0 group-focus-within/search:opacity-60 transition-opacity duration-[180ms] pointer-events-none"
                style={{
                  background: '#7760bd',
                  padding: '2px',
                }}
              >
                <div className="h-full w-full bg-transparent rounded-[12px]"></div>
              </div>
              
              {/* Blurred glow */}
              <div 
                className="absolute inset-[-3px] rounded-[15px] opacity-0 group-focus-within/search:opacity-25 transition-opacity duration-[180ms] pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #7760bd 0%, #9580d4 25%, #FFC107 50%, #E59866 75%, #7760bd 100%)',
                  filter: 'blur(18px)',
                }}
              />
              
              <div className="relative">
                <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#666] z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search help articles…"
                  className="w-full bg-[#1a1a1a] border border-[rgba(255,252,254,0.15)] rounded-[12px] pl-[48px] pr-[16px] py-[14px] font-['Roboto:Regular',sans-serif] text-[0.9375rem] text-[#fffcfe] placeholder:text-[#666] focus:outline-none focus:border-[#7760bd] transition-all relative z-[1]"
                  ref={searchInputRef}
                />
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.8125rem] text-[#666] mt-[8px] ml-[4px]">
              Try: upload CSV, explanation methods, exporting results…
            </p>
          </div>

          {/* Quick Category Chips */}
          <div className="mb-[40px] flex flex-wrap gap-[8px]">
            {helpCenterFaq.map((section) => {
              const isActive = activeChip === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleChipClick(section.id)}
                  className={`px-[16px] py-[8px] rounded-[8px] font-['Roboto:Medium',sans-serif] text-[0.875rem] transition-all ${
                    isActive
                      ? 'bg-[rgba(119,96,189,0.2)] border border-[#7760bd] text-[#7760bd]'
                      : 'bg-[#1a1a1a] border border-[rgba(255,252,254,0.1)] text-[#999] hover:bg-[#242424] hover:text-[#fffcfe] hover:border-[rgba(255,252,254,0.2)]'
                  }`}
                >
                  {section.title}
                </button>
              );
            })}
          </div>

          {/* Results Count */}
          {debouncedSearchQuery && (
            <div className="mb-[16px]">
              <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999]">
                Showing {totalResults} result{totalResults !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Empty State */}
          {debouncedSearchQuery && totalResults === 0 && (
            <div className="text-center py-[64px]">
              <h3 className="font-['Roboto:Bold',sans-serif] font-bold text-[1.5rem] text-[#fffcfe] mb-[12px]">
                No results found
              </h3>
              <p className="font-['Roboto:Regular',sans-serif] text-[0.9375rem] text-[#999] mb-[24px]">
                Try different keywords or browse topics below.
              </p>
              <div className="flex items-center justify-center gap-[12px] flex-wrap">
                <button
                  onClick={clearSearch}
                  className="px-[24px] py-[12px] bg-[#7760bd] hover:bg-[#6952a8] active:bg-[#5b4691] text-[#fffcfe] font-['Roboto:Medium',sans-serif] text-[0.9375rem] rounded-[8px] transition-all"
                >
                  Clear search
                </button>
                <button
                  onClick={() => {
                    trackEvent('report_bug_opened', { source: 'help_center_empty_state' });
                    setIsReportBugOpen(true);
                  }}
                  className="px-[24px] py-[12px] bg-[#2c2c2c] hover:bg-[#333] border border-[rgba(255,252,254,0.15)] text-[#fffcfe] font-['Roboto:Medium',sans-serif] text-[0.9375rem] rounded-[8px] transition-all"
                >
                  Report a bug
                </button>
              </div>
              <button
                onClick={() => {
                  trackEvent('contact_opened', { source: 'help_center_empty_state' });
                  setIsContactUsOpen(true);
                }}
                className="mt-[16px] font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#7760bd] hover:text-[#6952a8] underline transition-colors"
              >
                Contact us
              </button>
            </div>
          )}

          {/* Topics List */}
          {totalResults > 0 && (
            <div className="space-y-[16px] mb-[48px]">
              {filteredSections.map(({ section, filteredItems }) => {
                const Icon = section.icon;
                const isSectionExpanded = expandedSection === section.id;

                return (
                  <div
                    key={section.id}
                    ref={(el) => { sectionRefs.current[section.id] = el; }}
                    className="bg-[#1a1a1a] border border-[rgba(255,252,254,0.1)] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleSection(section.id);
                        }
                      }}
                      aria-expanded={isSectionExpanded}
                      className="w-full px-[24px] py-[20px] flex items-center gap-[16px] hover:bg-[#242424] transition-all duration-150 group"
                    >
                      <div className="w-[40px] h-[40px] flex items-center justify-center bg-[#2c2c2c] rounded-[8px] flex-shrink-0">
                        <Icon className="w-[20px] h-[20px] text-[#7760bd]" />
                      </div>
                      <h2 className="flex-1 text-left font-['Roboto:Medium',sans-serif] text-[1.125rem] text-[#fffcfe]">
                        {section.title}
                        {debouncedSearchQuery && filteredItems.length > 0 && (
                          <span className="ml-[8px] font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999]">
                            ({filteredItems.length})
                          </span>
                        )}
                      </h2>
                      <div 
                        className="transition-transform duration-300 ease-in-out" 
                        style={{
                          transform: isSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      >
                        {isSectionExpanded ? (
                          <ChevronDown className="w-[20px] h-[20px] text-[#7760bd]" />
                        ) : (
                          <ChevronRight className="w-[20px] h-[20px] text-[#999] group-hover:text-[#7760bd] transition-colors" />
                        )}
                      </div>
                    </button>

                    {/* Questions */}
                    <div 
                      className="border-t border-[rgba(255,252,254,0.1)] transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        maxHeight: isSectionExpanded ? '2000px' : '0px',
                        opacity: isSectionExpanded ? 1 : 0,
                        borderTopWidth: isSectionExpanded ? '1px' : '0px',
                      }}
                    >
                      {filteredItems.map((item, index) => {
                        const isQuestionExpanded = expandedQuestions.has(item.id);

                        return (
                          <div
                            key={item.id}
                            className={`${
                              index !== 0 ? 'border-t border-[rgba(255,252,254,0.05)]' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleQuestion(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleQuestion(item.id);
                                }
                              }}
                              aria-expanded={isQuestionExpanded}
                              className="w-full px-[14px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[10px] hover:bg-[#242424] transition-all duration-150 group"
                            >
                              <div className="flex-1 text-left font-['Roboto:Regular',sans-serif] text-[0.9375rem] text-[#e0e0e0]">
                                {debouncedSearchQuery 
                                  ? highlightMatch(item.question, debouncedSearchQuery.trim())
                                  : item.question
                                }
                              </div>
                              <div className="transition-transform duration-150" style={{
                                transform: isQuestionExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                              }}>
                                {isQuestionExpanded ? (
                                  <ChevronDown className="w-[16px] h-[16px] text-[#7760bd] flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-[16px] h-[16px] text-[#666] group-hover:text-[#7760bd] flex-shrink-0 transition-colors" />
                                )}
                              </div>
                            </button>

                            {/* Answer */}
                            {isQuestionExpanded && (
                              <div className="px-[14px] md:px-[24px] pb-[16px] animate-fadeIn">
                                <p className="font-['Roboto:Regular',sans-serif] text-[0.875rem] text-[#999] leading-[1.6] overflow-wrap-anywhere break-words">
                                  {item.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Still Need Help Section */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2c2c2c] border border-[rgba(119,96,189,0.2)] rounded-[16px] p-[32px] text-center shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <h3 className="font-['Roboto:Bold',sans-serif] font-bold text-[1.5rem] text-[#fffcfe] mb-[12px]">
              Still need help?
            </h3>
            <p className="font-['Roboto:Regular',sans-serif] text-[0.9375rem] text-[#999] mb-[24px]">
              If you didn't find what you need, contact us or report a bug.
            </p>
            <div className="flex items-center justify-center gap-[12px] flex-wrap">
              <button
                onClick={() => {
                  trackEvent('contact_opened', { source: 'help_center_still_need_help' });
                  setIsContactUsOpen(true);
                }}
                className="px-[24px] py-[12px] bg-[#7760bd] hover:bg-[#6952a8] active:bg-[#5b4691] text-[#fffcfe] font-['Roboto:Medium',sans-serif] text-[0.9375rem] rounded-[8px] transition-all"
              >
                Contact us
              </button>
              <button
                onClick={() => {
                  trackEvent('report_bug_opened', { source: 'help_center_still_need_help' });
                  setIsReportBugOpen(true);
                }}
                className="px-[24px] py-[12px] bg-[#2c2c2c] hover:bg-[#333] border border-[rgba(255,252,254,0.15)] text-[#fffcfe] font-['Roboto:Medium',sans-serif] text-[0.9375rem] rounded-[8px] transition-all"
              >
                Report a bug
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 bg-[#2c2c2c] border border-[rgba(255,252,254,0.1)] rounded-[12px] px-[20px] py-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-[102] animate-fadeIn">
            <p className="font-['Roboto:Medium',sans-serif] text-[0.875rem] text-[#fffcfe]">
              {toastMessage}
            </p>
          </div>
        )}
      </div>

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={isReportBugOpen}
        onClose={() => setIsReportBugOpen(false)}
        onSuccess={() => setToastMessage('Thanks — report sent.')}
      />

      {/* Contact Us Modal */}
      <ContactUsModal
        isOpen={isContactUsOpen}
        onClose={() => setIsContactUsOpen(false)}
        onSuccess={() => setToastMessage('Thanks — message sent.')}
      />
    </>
  );
}