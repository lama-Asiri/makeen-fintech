import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface ColorOption {
  label: string;
  value: string;
}

interface ColorSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ColorOption[];
  lockedOptions?: ColorOption[]; // Options that are locked with "Soon" label
  onLockedClick?: () => void; // Callback when locked option is clicked
}

export function ColorSelect({ value, onChange, options, lockedOptions = [], onLockedClick }: ColorSelectProps) {
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
            onChange(options[focusedIndex].label);
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

  const handleSelect = (option: ColorOption) => {
    onChange(option.label);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const selectedOption = options.find(opt => opt.label === value);

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
        <div className="flex items-center gap-[12px]">
          {/* Color Dot */}
          {selectedOption && (
            <div
              className="w-[12px] h-[12px] rounded-full border border-white/[0.22] flex-shrink-0"
              style={{ backgroundColor: selectedOption.value }}
            />
          )}
          <span className="text-[14px] text-white font-['Roboto:Regular',sans-serif]">
            {value}
          </span>
        </div>
        <ChevronDown
          className={`w-[16px] h-[16px] text-[#999] transition-transform duration-200 flex-shrink-0 ${
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
              const isSelected = option.label === value;
              const isFocused = index === focusedIndex;
              
              // Calculate background color based on selected item's accent
              const bgColorHex = isSelected ? option.value : null;
              const bgColorStyle = bgColorHex 
                ? { backgroundColor: `${bgColorHex}24` } // 24 is ~14% opacity in hex
                : {};

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full h-[42px] px-[14px] flex items-center justify-between transition-colors duration-100 ${
                    isFocused && !isSelected
                      ? 'bg-[#7760bd]/10'
                      : ''
                  }`}
                  style={isSelected ? bgColorStyle : {}}
                >
                  <div className="flex items-center gap-[12px]">
                    {/* Color Dot */}
                    <div
                      className="w-[12px] h-[12px] rounded-full border border-white/[0.22] flex-shrink-0"
                      style={{ backgroundColor: option.value }}
                    />
                    <span className={`text-[14px] font-['Roboto:Regular',sans-serif] ${
                      isSelected ? 'text-white' : 'text-[#ccc]'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-[16px] h-[16px] text-[#7760bd] flex-shrink-0" />
                  )}
                </button>
              );
            })}
            {lockedOptions.map((option, index) => {
              const isSelected = option.label === value;
              const isFocused = index === focusedIndex;
              
              // Calculate background color based on selected item's accent
              const bgColorHex = isSelected ? option.value : null;
              const bgColorStyle = bgColorHex 
                ? { backgroundColor: `${bgColorHex}24` } // 24 is ~14% opacity in hex
                : {};

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onLockedClick?.()}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className="w-full h-[42px] px-[14px] flex items-center justify-between transition-colors duration-100 hover:bg-[#7760bd]/10"
                >
                  <div className="flex items-center gap-[12px]">
                    {/* Color Dot */}
                    <div
                      className="w-[12px] h-[12px] rounded-full border border-white/[0.22] flex-shrink-0"
                      style={{ backgroundColor: option.value }}
                    />
                    <span className="text-[14px] font-['Roboto:Regular',sans-serif] text-[#ccc]">
                      {option.label}
                    </span>
                  </div>
                  <span className="text-[12px] font-['Roboto:Regular',sans-serif] text-[#7760bd]">Soon</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}