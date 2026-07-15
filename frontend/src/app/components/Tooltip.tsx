import { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
}

export function Tooltip({ text, children, position = 'right', disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || disabled || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const spacing = 12; // Distance from trigger
      let x = 0;
      let y = 0;
      let finalPosition = position;

      // Calculate position based on preference
      switch (position) {
        case 'right':
          x = triggerRect.right + spacing;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;

          // Flip to left if it would overflow right edge
          if (x + tooltipRect.width > viewport.width - 10) {
            x = triggerRect.left - tooltipRect.width - spacing;
            finalPosition = 'left';
          }
          break;

        case 'left':
          x = triggerRect.left - tooltipRect.width - spacing;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;

          // Flip to right if it would overflow left edge
          if (x < 10) {
            x = triggerRect.right + spacing;
            finalPosition = 'right';
          }
          break;

        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.top - tooltipRect.height - spacing;

          // Flip to bottom if it would overflow top edge
          if (y < 10) {
            y = triggerRect.bottom + spacing;
            finalPosition = 'bottom';
          }
          break;

        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.bottom + spacing;

          // Flip to top if it would overflow bottom edge
          if (y + tooltipRect.height > viewport.height - 10) {
            y = triggerRect.top - tooltipRect.height - spacing;
            finalPosition = 'top';
          }
          break;
      }

      // Constrain to viewport horizontally
      if (finalPosition === 'top' || finalPosition === 'bottom') {
        if (x < 10) x = 10;
        if (x + tooltipRect.width > viewport.width - 10) {
          x = viewport.width - tooltipRect.width - 10;
        }
      }

      // Constrain to viewport vertically
      if (finalPosition === 'left' || finalPosition === 'right') {
        if (y < 10) y = 10;
        if (y + tooltipRect.height > viewport.height - 10) {
          y = viewport.height - tooltipRect.height - 10;
        }
      }

      setCoords({ x, y });
      setActualPosition(finalPosition);
    };

    updatePosition();

    // Update on scroll or resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position, disabled]);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Arrow position based on tooltip position
  const getArrowClasses = () => {
    switch (actualPosition) {
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 mr-[-1px] w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#2c2c2c]';
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 ml-[-1px] w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#2c2c2c]';
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#2c2c2c]';
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-[1px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#2c2c2c]';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible &&
        !disabled &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed px-[12px] py-[6px] bg-[#2c2c2c] text-white text-[0.75rem] rounded-[6px] whitespace-nowrap shadow-lg pointer-events-none transition-opacity duration-200"
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              zIndex: 9999,
              opacity: coords.x === 0 && coords.y === 0 ? 0 : 1,
            }}
          >
            {text}
            <div className={getArrowClasses()}></div>
          </div>,
          document.body
        )}
    </>
  );
}
