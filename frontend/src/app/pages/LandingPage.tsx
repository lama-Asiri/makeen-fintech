import React from 'react';
import LandingPageImport from '@/imports/LandingPageFixed';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingPageWrapper({ onLogin, onSignUp }: LandingPageProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 70; // navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Find if the clicked element or its parent is a button
    let element: HTMLElement | null = target;
    let depth = 0;
    while (element && depth < 10) {
      // Check for scroll navigation first
      const scrollTo = element.getAttribute('data-scroll-to');
      if (scrollTo) {
        e.preventDefault();
        e.stopPropagation();
        scrollToSection(scrollTo);
        return;
      }
      
      if (element.tagName === 'BUTTON' || element.classList.contains('cursor-pointer')) {
        const text = element.textContent?.trim();
        if (text === 'Login') {
          onLogin();
          return;
        }
        if (text === 'Sign Up') {
          onSignUp();
          return;
        }
        if (text?.includes('Start now')) {
          onLogin();
          return;
        }
        if (text?.includes('Learn More')) {
          // Could open help/docs
          return;
        }
      }
      element = element.parentElement;
      depth++;
    }
  };

  return (
    <div 
      className="w-full h-screen overflow-y-auto overflow-x-hidden bg-[#141414]"
      onClick={handleClick}
    >
      <LandingPageImport />
    </div>
  );
}
