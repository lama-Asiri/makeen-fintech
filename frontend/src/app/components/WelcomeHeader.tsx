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
    subtext: "Ready to explain your latest prediction?",
  },
  {
    headline: (name: string) => `Good to see you, ${name}.`,
    subtext: "Upload a dataset to generate predictions + explanations.",
  },
  {
    headline: (name: string) => `Back again, ${name}`,
    subtext: "Let's turn your data into clear decisions.",
  },
];

const ENTRY_SIGNUP_GREETINGS = [
  {
    headline: (name: string) => `Welcome to Makeen, ${name}`,
    subtext: "Upload a dataset to start predicting and explaining.",
  },
  {
    headline: (name: string) => `Hi ${name}`,
    subtext: "You're in Makeen where predictions come with clear reasons.",
  },
  {
    headline: (name: string) => `Welcome, ${name}.`,
    subtext: "Let's generate your first prediction and interpret it.",
  },
];

// Rotating New Chat prompts (cycle on every New Chat click)
const ROTATING_PROMPTS = [
  {
    headline: () => "Upload one dataset to generate predictions with clear explanations.",
    subtext: "Each chat works with a single file for focused analysis.",
  },
  {
    headline: () => "Want to know why the model decided that?",
    subtext: "Start by uploading your file.",
  },
  {
    headline: () => "Make a prediction, then break it down feature-by-feature.",
    subtext: "Upload your dataset to begin explainable AI analysis.",
  },
  {
    headline: () => "Explore patterns, then ask for an explanation you can trust.",
    subtext: "Start with one CSV or XLSX file.",
  },
  {
    headline: () => "Start a fresh analysis",
    subtext: "One file per chat for clean results.",
  },
  {
    headline: () => "Ready for decision insights?",
    subtext: "Upload your dataset to begin.",
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
      {/* Subtle glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[120px] bg-gradient-to-r from-[#FFB800]/10 via-[#7760bd]/10 to-[#FF6B35]/10 blur-[60px] opacity-40" />
      </div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-['Inter:Bold',sans-serif] font-bold text-[1.75rem] md:text-[2rem] text-[#fffcfe] mb-[12px] relative"
      >
        <span className="bg-gradient-to-r from-[#fffcfe] via-[#fffcfe] to-[#fffcfe]/90 bg-clip-text text-transparent">
          {currentMessage.headline(displayName)}
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-['Inter:Regular',sans-serif] text-[1rem] md:text-[1.125rem] text-[#999] max-w-[600px] mx-auto"
      >
        {currentMessage.subtext}
      </motion.p>

      {/* Accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-[20px] h-[2px] w-[80px] bg-gradient-to-r from-[#FFB800] via-[#7760bd] to-[#FF6B35] rounded-full"
      />
    </motion.div>
  );
}
