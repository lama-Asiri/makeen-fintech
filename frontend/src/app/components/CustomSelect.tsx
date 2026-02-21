import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  lockedOptions?: string[]; // Options that are locked with "Soon" label
  onLockedClick?: () => void; // Callback when locked option is clicked
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select...', lockedOptions = [], onLockedClick }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0) {
            onChange(options[focusedIndex]);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, options, onChange]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && menuRef.current) {
      const focusedElement = menuRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative min-w-[180px] flex-shrink-0">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[46px] rounded-[13px] px-[14px] flex items-center justify-between transition-all duration-200 ${
          isOpen
            ? 'bg-[#2a2a2a] border border-[#7760bd] shadow-[0_0_12px_rgba(119,96,189,0.25)]'
            : 'bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#7760bd]/40 hover:bg-[#2d2d2d]'
        }`}
      >
        <span className="text-[14px] text-white font-['Roboto:Regular',sans-serif]">
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-[16px] h-[16px] text-[#999] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#2a2a2a] border border-[#7760bd]/50 rounded-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_12px_rgba(119,96,189,0.2)] backdrop-blur-sm z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ minWidth: '100%' }}
        >
          <div className="py-[6px] max-h-[280px] overflow-y-auto">
            {options.map((option, index) => {
              const isSelected = option === value;
              const isFocused = index === focusedIndex;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full h-[42px] px-[14px] flex items-center justify-between transition-colors duration-100 ${
                    isFocused || isSelected
                      ? 'bg-[#7760bd]/15 text-white'
                      : 'text-[#ccc] hover:bg-[#7760bd]/10'
                  }`}
                >
                  <span className="text-[14px] font-['Roboto:Regular',sans-serif]">
                    {option}
                  </span>
                  {isSelected && (
                    <Check className="w-[16px] h-[16px] text-[#7760bd]" />
                  )}
                </button>
              );
            })}
            {lockedOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={onLockedClick}
                className="w-full h-[42px] px-[14px] flex items-center justify-between transition-colors duration-100 text-[#ccc] hover:bg-[#7760bd]/10"
              >
                <span className="text-[14px] font-['Roboto:Regular',sans-serif]">
                  {option}
                </span>
                <span className="text-[12px] font-['Roboto:Regular',sans-serif] text-[#7760bd]">Soon</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}