import { motion } from 'motion/react';
import { useMemo } from 'react';

interface WelcomeHeaderProps {
  displayName?: string;
  messageIndex: number;
  mode: 'entry-login' | 'entry-signup' | 'rotating';
}

// One-time entry greetings (shown once per session)
const ENTRY_LOGIN_GREETINGS = [
  {
    headline: (name: string) => `Welcome back, ${name}`,
    subtext: "Ready to evaluate your next credit decision?",
  },
  {
    headline: (name: string) => `Good to see you, ${name}.`,
    subtext: "Upload applicant data to generate risk assessments + explanations.",
  },
  {
    headline: (name: string) => `Back again, ${name}`,
    subtext: "Let's turn borrower data into defensible credit decisions.",
  },
];

const ENTRY_SIGNUP_GREETINGS = [
  {
    headline: (name: string) => `Welcome to Makeen Fintech, ${name}`,
    subtext: "Upload applicant data to start assessing credit risk with clear explanations.",
  },
  {
    headline: (name: string) => `Hi ${name}`,
    subtext: "Every credit decision comes with a clear, explainable reason.",
  },
  {
    headline: (name: string) => `Welcome, ${name}.`,
    subtext: "Let's generate your first credit risk assessment and break it down.",
  },
];

// Rotating New Chat prompts (cycle on every New Chat click)
const ROTATING_PROMPTS = [
  {
    headline: () => "Upload applicant data to assess credit risk with clear explanations.",
    subtext: "Each session works with a single applicant file for focused analysis.",
  },
  {
    headline: () => "Want to know why that credit decision was made?",
    subtext: "Start by uploading your applicant data.",
  },
  {
    headline: () => "Assess credit risk, then break it down factor-by-factor.",
    subtext: "Upload your loan data to begin explainable AI analysis.",
  },
  {
    headline: () => "Explore credit patterns, then ask for an explanation you can defend.",
    subtext: "Start with one CSV or XLSX file of applicant data.",
  },
  {
    headline: () => "Start a fresh credit risk assessment",
    subtext: "One applicant file per session for clean, focused results.",
  },
  {
    headline: () => "Ready for credit risk insights?",
    subtext: "Upload your applicant data to begin.",
  },
];

export function WelcomeHeader({ displayName = 'User', messageIndex, mode }: WelcomeHeaderProps) {
  // Select message based on mode
  const currentMessage = useMemo(() => {
    if (mode === 'entry-login') {
      // Pick random from login greetings (shown once)
      const randomIndex = Math.floor(Math.random() * ENTRY_LOGIN_GREETINGS.length);
      return ENTRY_LOGIN_GREETINGS[randomIndex];
    } else if (mode === 'entry-signup') {
      // Pick random from signup greetings (shown once)
      const randomIndex = Math.floor(Math.random() * ENTRY_SIGNUP_GREETINGS.length);
      return ENTRY_SIGNUP_GREETINGS[randomIndex];
    } else {
      // Rotating mode: cycle through prompts
      return ROTATING_PROMPTS[messageIndex % ROTATING_PROMPTS.length];
    }
  }, [mode, messageIndex]);

  return (
    <motion.div
      key={`${mode}-${messageIndex}`} // Force re-mount animation on change
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-[32px] text-center"
    >
      {/* Subtle glow background — single restrained gold glow, not a rainbow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[120px] bg-[#7760bd]/10 blur-[60px] opacity-40" />
      </div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif font-medium text-[1.75rem] md:text-[2.25rem] text-[#fffcfe] mb-[12px] relative"
      >
        {currentMessage.headline(displayName)}
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-sans text-[1rem] md:text-[1.125rem] text-[#9e9e9e] max-w-[600px] mx-auto"
      >
        {currentMessage.subtext}
      </motion.p>

      {/* Accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-[20px] h-[2px] w-[80px] bg-gradient-to-r from-transparent via-[#7760bd] to-transparent rounded-full"
      />
    </motion.div>
  );
}
