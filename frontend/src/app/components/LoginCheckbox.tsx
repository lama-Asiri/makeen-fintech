import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { TermsModal } from './TermsModal';

interface LoginCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const LoginCheckbox = forwardRef<HTMLInputElement, LoginCheckboxProps>(
  ({ label, id, onChange, ...props }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [initialTab, setInitialTab] = useState<'terms' | 'privacy'>('terms');
    const [hasRead, setHasRead] = useState(false);

    const handleOpenTerms = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setInitialTab('terms');
      setShowModal(true);
    };

    const handleOpenPrivacy = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setInitialTab('privacy');
      setShowModal(true);
    };

    const handleAccept = () => {
      setHasRead(true);
      setShowModal(false);
    };

    const handleWrapperClick = (e: React.MouseEvent) => {
      if (!hasRead) {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
      }
    };

    return (
      <>
        <label
          htmlFor={id}
          className={`flex items-start gap-3 group transition-opacity select-none cursor-pointer ${!hasRead ? 'opacity-80' : ''}`}
          onClick={handleWrapperClick}
        >
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input
              ref={ref}
              type="checkbox"
              id={id}
              className="sr-only peer"
              disabled={!hasRead}
              onChange={onChange}
              {...props}
            />
            <div className={`w-5 h-5 rounded-md border transition-all duration-200 
              ${!hasRead 
                ? 'border-white/10 bg-white/5' 
                : 'border-white/20 bg-white/5 peer-checked:bg-[#7760bd] peer-checked:border-[#7760bd] peer-hover:border-white/40 group-hover:border-white/40'}
              peer-focus-visible:ring-2 peer-focus-visible:ring-[#7760bd] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#141414]`} 
            />
            <svg
              className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className={`text-sm font-normal transition-colors leading-snug ${!hasRead ? 'text-[#666]' : 'text-[#9e9e9e] group-hover:text-white'}`}>
            {label.split(/(Terms of Service|Privacy Policy)/).map((part, i) => {
              if (part === "Terms of Service") {
                return (
                  <span
                    key={i}
                    className="text-[#7760bd] underline underline-offset-4 hover:text-[#8b7dd8] transition-colors"
                    onClick={handleOpenTerms}
                  >
                    {part}
                  </span>
                );
              }
              if (part === "Privacy Policy") {
                return (
                  <span
                    key={i}
                    className="text-[#7760bd] underline underline-offset-4 hover:text-[#8b7dd8] transition-colors"
                    onClick={handleOpenPrivacy}
                  >
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </span>
        </label>

        <TermsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAccept={handleAccept}
          initialTab={initialTab}
        />
      </>
    );
  }
);

LoginCheckbox.displayName = 'LoginCheckbox';
