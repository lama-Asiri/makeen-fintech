import { motion, AnimatePresence, useInView, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import Greadient from "./Greadient";
import svgPaths from "./svg-n85plffo05";
import imgBlack97Designrip from "@/assets/4c2b0c6a1882a2437352038134d50fc8dc273205.png";
import imgImage39 from "@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png";
import imgIcosahedron from "@/assets/b7e275b78aaa89a4a341109046d192edcfc5b207.png";
import imgTorusKnot from "@/assets/ca61b143546dc6d680b519138244975fd48d3cd6.png";
import imgDarkMetallic from "@/assets/eb1c030a1accb78fa3337e0e6602e2a5f5b8a9ff.png";
import imgEllipse1700 from "@/assets/2d43ad35cf16e098dec1368159bbfed4db4e60be.png";
import imgEllipse1701 from "@/assets/873063e7e03a5e4ec249ed8b32559e0a52fa2f3f.png";
import imgEllipse1702 from "@/assets/c4a0bb29824c69e89d7b251f1e56b81e29ecd9c0.png";
import imgEllipse1703 from "@/assets/02d4010f3bb889503125b18a67d28ac3e6a98a86.png";
import imgOurMissonPhoto from "@/assets/f0e48cf661e8b616f03050e3b9117048ab1fd1df.png";
import imgImage50 from "@/assets/56eebf0771904b27a256cae1f6e0a8245fa4bc66.png";
import imgReadyToTryBg from "@/assets/56eebf0771904b27a256cae1f6e0a8245fa4bc66.png";
import heroBgImage from "@/assets/adb615f29051cb78de5e87efa07d68d9bb707b34.png";
import { HelpCenter } from "@/app/pages/HelpCenter";
import { TermsAndPolicies } from "@/app/pages/TermsAndPolicies";

// Global animation settings
const MOTION_EASE = [0.2, 0.8, 0.2, 1] as [number, number, number, number];
const ENTRANCE_DURATION = 0.45;
const STAGGER_DELAY = 0.08;

// Section-specific animation settings (slower, more premium)
const SECTION_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]; // More elastic easing
const SECTION_DURATION = 1.2; // Slower base duration
const SECTION_STAGGER = 0.2; // More pronounced stagger

// Responsive Container
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-6 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

// HEADER / NAVBAR
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Features',       href: '#discover' },
    { label: 'How It Works',   href: '#how-it-works' },
    { label: 'Meet the Team',  href: '#team' },
    { label: 'Our Mission',    href: '#mission' },
    { label: 'FAQ',            href: '#faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414]/90 backdrop-blur-sm border-b border-[#ffffff10]">
      <Container>
        <nav className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-md overflow-hidden">
              <img src={imgImage39} alt="Makeen" className="w-full h-full object-cover" />
            </div>
            <span className="font-['Roboto'] font-semibold text-xl text-white">Makeen</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-white hover:text-[#7760bd] transition-colors cursor-pointer">{l.label}</a>
            ))}
          </div>

          {/* Desktop CTA + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-white hover:text-[#7760bd] transition-colors">Login</button>
            <button className="hidden sm:block px-6 py-2.5 bg-[#7760bd] text-white rounded-lg hover:bg-[#8a75d4] transition-colors font-semibold">Sign Up</button>
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden p-2 text-white hover:text-[#7760bd] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile Menu Dropdown */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="lg:hidden overflow-hidden bg-[#141414]/95 border-t border-[#ffffff10]"
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-white hover:text-[#7760bd] py-3 text-[16px] font-['Roboto'] border-b border-[#ffffff08] last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            <button className="flex-1 py-2.5 text-white border border-[#ffffff30] rounded-lg hover:border-[#7760bd] transition-colors text-[15px] font-semibold">Login</button>
            <button className="flex-1 py-2.5 bg-[#7760bd] text-white rounded-lg hover:bg-[#8a75d4] transition-colors text-[15px] font-semibold">Sign Up</button>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

// HERO SECTION - SINGLE SET OF COMPONENTS ONLY
function HeroSection() {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-[70px] overflow-hidden">
      {/* Hero Background Image - Your gradient image */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBgImage} 
          alt="" 
          className="w-full h-full object-cover scale-110"
        />
      </motion.div>

      {/* Content - SINGLE SET ONLY */}
      <Container className="relative z-10 py-20">
        <div className="max-w-[800px]">
          <motion.h1
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: MOTION_EASE }}
            className="font-['Inter'] font-semibold text-[clamp(3.5rem,8vw,6.5rem)] leading-[1.05] text-white mb-4"
          >
            Your Data,
            <br /><span className="italic text-[#f8ec93]">Explained.</span>
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: MOTION_EASE }}
            className="font-['Roboto'] text-[clamp(1.1rem,1.5vw,1.35rem)] leading-relaxed text-white/90 mb-10 max-w-[650px]"
          >
            Upload your data. Ask a question in plain language. Get a prediction — and a clear explanation of exactly why the AI answered that way. No technical background needed.
          </motion.p>

          <motion.button
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: MOTION_EASE }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "#8a75d4",
              boxShadow: "0 10px 30px -10px rgba(119, 96, 189, 0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-10 py-5 bg-[#7760bd] text-white rounded-xl font-['Roboto'] font-semibold text-lg transition-all shadow-xl"
          >
            Start now
            <motion.svg 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              width="20" height="14" viewBox="0 0 16 14" fill="none"
            >
              <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.button>
        </div>
      </Container>
    </section>
  );
}

// FEATURES SECTION
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const features = [
    {
      title: "Ask Questions in Plain Language",
      description: "Type your questions in natural English, no coding or technical skills needed. Get answers that are easy to follow and understand.",
      image: imgDarkMetallic,
      bg: "#fffcfe",
      color: "#00000a"
    },
    {
      title: "Predictions Generation",
      description: "Generate AI predictions instantly for text, images, or tables. Each result comes with clear explanations and confidence indicators.",
      image: imgTorusKnot,
      gradient: "linear-gradient(22.21deg, #141414 41.94%, #2b1e56 114.53%)"
    },
    {
      title: "Designed for Everyone",
      description: "A simple, intuitive interface built for beginners, students, and non-technical users. Explore AI transparently and confidently without feeling lost.",
      image: imgIcosahedron,
      gradient: "linear-gradient(22.21deg, #141414 41.94%, #2b1e56 114.53%)"
    }
  ];

  return (
    <section id="discover" ref={ref} className="relative py-24 bg-[#141414]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.h2
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
          className="text-center font-['Roboto'] font-bold leading-[1.1] mb-14"
          style={{
            fontSize: "clamp(44px, 5vw, 72px)",
            backgroundImage: "linear-gradient(90.21deg, #999798 0%, #e6e4e5 29.82%, #fffcfe 65.38%, #999798 99.99%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          What You Can Do
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-4 md:gap-5 lg:gap-7">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 60, scale: 0.92 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                duration: SECTION_DURATION, 
                delay: 0.3 + (index * SECTION_STAGGER), 
                ease: SECTION_EASE 
              }}
              whileHover={prefersReducedMotion ? {} : { 
                y: -16, 
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
                transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }
              }}
              className={`rounded-[24px] overflow-hidden p-10 flex flex-col cursor-default group ${
                index === 0 ? "md:row-span-2" : ""
              }`}
              style={{ 
                backgroundColor: feature.bg,
                backgroundImage: feature.gradient,
                color: feature.color || "#fffcfe",
                minHeight: index === 0 ? "548px" : "260px",
                transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease"
              }}
            >
              <motion.h3 
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.5 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className={`font-['Roboto'] font-semibold leading-tight mb-4 ${
                  index === 0 ? "text-[26px]" : "text-[20px]"
                }`}
              >
                {feature.title}
              </motion.h3>
              <motion.p 
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ 
                  duration: 0.9, 
                  delay: 0.6 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className={`font-['Roboto'] leading-[1.6] mb-8 ${
                  index === 0 ? "text-[16px]" : "text-[14px]"
                }`}
              >
                {feature.description}
              </motion.p>
              <motion.div 
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, y: 30 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ 
                  duration: 1, 
                  delay: 0.7 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className={`mt-auto flex justify-center items-center ${
                  index === 0 ? "flex-grow py-10" : ""
                }`}
              >
                <img 
                  src={feature.image} 
                  alt="" 
                  className="object-contain group-hover:scale-110 transition-transform duration-700"
                  style={{
                    maxWidth: index === 0 ? "260px" : "160px",
                    maxHeight: index === 0 ? "220px" : "120px"
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// HOW IT WORKS SECTION
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [
    {
      number: "01",
      title: "Upload your file",
      description: "Drop in a CSV or Excel file — your sales data, survey results, medical records, anything tabular. Makeen reads it instantly.",
      icon: (
        <svg className="w-[32px] h-[32px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Ask your question",
      description: "Type whatever you want to know in plain English. \"Which product will sell out first?\" \"What drives customer churn?\" No SQL, no code.",
      icon: (
        <svg className="w-[32px] h-[32px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-3.155-.502l-4.345 2.17v-3.233C3.612 15.55 3 13.86 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Get an explanation",
      description: "Makeen trains a model on your data, returns a prediction, and shows you exactly which columns drove that answer — with a chart you can actually read.",
      icon: (
        <svg className="w-[32px] h-[32px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="relative py-24 bg-[#141414]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Heading */}
        <motion.div
          className="text-center mb-[64px]"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
        >
          <p className="text-[#7760bd] text-[13px] font-['Inter'] font-semibold uppercase tracking-widest mb-[12px]">Simple by design</p>
          <h2
            className="font-['Roboto'] font-bold leading-tight mb-[16px]"
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              backgroundImage: "linear-gradient(90.21deg, #999798 0%, #e6e4e5 29.82%, #fffcfe 65.38%, #999798 99.99%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            How it works
          </h2>
          <p className="font-['Inter'] text-[18px] text-[#9e9e9e] max-w-[520px] mx-auto">
            Three steps from raw data to a result you can trust and explain.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-[1px] bg-gradient-to-r from-[#7760bd]/40 via-[#7760bd] to-[#7760bd]/40 z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative z-10 flex flex-col items-center text-center px-[32px] py-[40px]"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 60, scale: 0.92 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: SECTION_DURATION, delay: 0.3 + (i * SECTION_STAGGER), ease: SECTION_EASE }}
            >
              {/* Number + icon circle */}
              <div className="relative mb-[24px]">
                <div className="w-[80px] h-[80px] rounded-full bg-[#1a1a1a] border-2 border-[#7760bd]/60 flex items-center justify-center text-[#7760bd] shadow-[0_0_30px_rgba(119,96,189,0.25)]">
                  {step.icon}
                </div>
                <span className="absolute -top-[8px] -right-[8px] w-[24px] h-[24px] rounded-full bg-[#7760bd] flex items-center justify-center font-['Inter'] font-bold text-[10px] text-white">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-['Roboto'] font-bold text-[20px] text-white mb-[12px]">{step.title}</h3>
              <p className="font-['Inter'] text-[15px] text-[#9e9e9e] leading-[1.7]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// MISSION SECTION
function XaiExplainerSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const concepts = [
    {
      tag: "XAI",
      title: "Explainable AI",
      tagline: "AI that shows its work",
      analogy: "Like a doctor who doesn't just say \"take this pill\" — they explain which symptoms led to the diagnosis, so you can ask questions and actually trust the answer.",
      forYou: "Instead of a black-box result, Makeen tells you exactly which parts of your data drove the prediction — and why.",
      icon: (
        <svg className="w-[28px] h-[28px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "#7760bd",
    },
    {
      tag: "SHAP",
      title: "Feature Importance",
      tagline: "Which factors matter most?",
      analogy: "Imagine deciding whether to bring an umbrella. SHAP tells you: clouds count for 60% of the decision, humidity 30%, and season 10%. Each factor gets a score.",
      forYou: "The bar chart in your results shows how much each column in your data pushed the prediction up or down — so you know where to focus.",
      icon: (
        <svg className="w-[28px] h-[28px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: "#08B839",
    },
    {
      tag: "LIME",
      title: "Local Explanations",
      tagline: "Why this specific answer?",
      analogy: "SHAP explains the big picture. LIME zooms in on one specific prediction and explains it in the simplest possible terms — as if you're seeing your data for the first time.",
      forYou: "Used as a second opinion alongside SHAP to confirm or challenge the result, giving you more confidence in what the AI found.",
      icon: (
        <svg className="w-[28px] h-[28px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "#e0a020",
    },
  ];

  return (
    <section id="understand" ref={ref} className="relative py-24 bg-[#0f0f0f]">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />

      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Heading */}
        <motion.div
          className="text-center mb-[60px]"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
        >
          <p className="text-[#7760bd] text-[13px] font-['Inter'] font-semibold uppercase tracking-widest mb-[12px]">Under the Hood</p>
          <h2 className="font-['Roboto'] font-bold text-[36px] lg:text-[48px] text-white leading-tight mb-[16px]">
            What is XAI, SHAP, and LIME?
          </h2>
          <p className="font-['Inter'] text-[18px] text-[#9e9e9e] max-w-[600px] mx-auto">
            No technical background needed. Here's what these words actually mean — and why they matter for your data.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          {concepts.map((c, i) => (
            <motion.div
              key={c.tag}
              className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-[16px] p-[28px] flex flex-col gap-[20px] cursor-default"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 60, scale: 0.92 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: SECTION_DURATION, delay: 0.3 + (i * SECTION_STAGGER), ease: SECTION_EASE }}
              whileHover={prefersReducedMotion ? {} : {
                y: -16,
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
                transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }
              }}
            >
              {/* Tag + Icon */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-['Inter'] font-bold uppercase tracking-widest px-[10px] py-[4px] rounded-full"
                  style={{ color: c.color, backgroundColor: `${c.color}18`, border: `1px solid ${c.color}40` }}
                >
                  {c.tag}
                </span>
                <div style={{ color: c.color }}>{c.icon}</div>
              </div>

              {/* Title + Tagline */}
              <div>
                <h3 className="font-['Roboto'] font-bold text-[22px] text-white mb-[4px]">{c.title}</h3>
                <p className="font-['Inter'] text-[13px] font-semibold" style={{ color: c.color }}>{c.tagline}</p>
              </div>

              {/* Analogy */}
              <div className="bg-[#141414] rounded-[10px] px-[16px] py-[14px] border-l-[3px]" style={{ borderColor: c.color }}>
                <p className="font-['Inter'] text-[13px] text-[#9e9e9e] leading-[1.6] italic">"{c.analogy}"</p>
              </div>

              {/* What it means for you */}
              <div className="flex gap-[10px] items-start mt-auto">
                <div className="w-[6px] h-[6px] rounded-full mt-[6px] flex-shrink-0" style={{ backgroundColor: c.color }} />
                <p className="font-['Inter'] text-[14px] text-white leading-[1.6]">{c.forYou}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          className="text-center font-['Inter'] text-[13px] text-[#555] mt-[40px]"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, delay: 0.3 + (3 * SECTION_STAGGER), ease: SECTION_EASE }}
        >
          You don't need to understand the math — Makeen handles it. This section just helps you read your results with confidence.
        </motion.p>
      </div>
    </section>
  );
}

function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section id="mission" ref={ref} className="relative py-24 bg-[#141414]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Text Content - Left Column (55%) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -50, scale: 0.95 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
            className="lg:col-span-7"
          >
            <motion.h2
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: SECTION_EASE }}
              className="font-['Roboto'] font-bold leading-[1.1] mb-5"
              style={{
                fontSize: "clamp(44px, 5vw, 72px)",
                backgroundImage: "linear-gradient(90.21deg, #999798 0%, #e6e4e5 29.82%, #fffcfe 65.38%, #999798 99.99%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Our Mission
            </motion.h2>
            <motion.p 
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.4, ease: SECTION_EASE }}
              className="font-['Radley'] text-[clamp(28px,3vw,34px)] text-[#da876b] mb-6 leading-tight"
            >
              From Confusion To Clarity
            </motion.p>
            <motion.p 
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.6, ease: SECTION_EASE }}
              className="font-['Roboto'] text-[16px] leading-[1.7] text-white/90 max-w-[520px]"
            >
              AI predictions are only useful if you can understand and justify them. We built Makeen because students, researchers, and decision-makers shouldn't need a data science degree to trust — or challenge — what a model tells them. Every result comes with a plain-language explanation of why.
            </motion.p>
          </motion.div>

          {/* Visual - Right Column (45%) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 60, scale: 0.9 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: SECTION_DURATION, delay: 0.3, ease: SECTION_EASE }}
            className="lg:col-span-5"
          >
            <motion.div 
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.03,
                rotateZ: 1,
                transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }
              }}
              className="relative w-full aspect-square overflow-hidden"
              style={{
                borderRadius: "32px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
              }}
            >
              <img 
                src={imgOurMissonPhoto} 
                alt="Our Mission" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// TEAM SECTION (RENAMED TO CONTACT US)
function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const team = [
    { name: "Lama Asiri", role: "Full Stack Developer", description: "Manages both frontend and backend, ensuring seamless integration and a smooth user experience.", image: imgEllipse1700, linkedin: "https://www.linkedin.com/in/lamak2asiri" },
    { name: "Shahad Alsomali", role: "Frontend Developer", description: "Designs the user interface and experience, ensuring the platform is intuitive and visually appealing.", image: imgEllipse1701, linkedin: "https://www.linkedin.com/in/shahad-w-alsomali-11509b247" },
    { name: "Reem Alhijris", role: "AI/ML Engineer", description: "Develops and optimizes AI models, ensures explainability, and handles the core machine learning logic.", image: imgEllipse1702, linkedin: "https://www.linkedin.com/in/reem-alhijris" },
    { name: "Rahaf AlMalki", role: "Backend Developer", description: "Ensures the models run correctly, handles data processing, and keeps the backend stable and functional.", image: imgEllipse1703, linkedin: "https://www.linkedin.com/in/rahafalmalkics" }
  ];

  return (
    <section id="team" ref={ref} className="relative py-24 bg-[#141414]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.h2
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
          className="text-center font-['Roboto'] font-bold text-[clamp(3.5rem,8vw,6rem)] leading-tight mb-16"
          style={{
            backgroundImage: "linear-gradient(90.27deg, #999798 0%, #e6e4e5 29.82%, #fffcfe 65.38%, #999798 99.99%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Meet the Team
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-[18px] xl:gap-[22px]">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                duration: SECTION_DURATION, 
                delay: 0.2 + (index * SECTION_STAGGER), 
                ease: SECTION_EASE 
              }}
              whileHover={prefersReducedMotion ? {} : { 
                y: -14,
                scale: 1.03,
                rotateY: 2,
                boxShadow: "0 25px 50px rgba(119, 96, 189, 0.3)",
                transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }
              }}
              className="bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden p-6 flex flex-col items-center text-center group"
              style={{
                minHeight: "240px",
                borderRadius: "24px",
                transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease"
              }}
            >
              <motion.div 
                initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.4 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className="w-20 h-20 rounded-full overflow-hidden mb-4 flex-shrink-0 border-2 border-white/50 shadow-inner group-hover:scale-110 transition-transform duration-500"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.h3 
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.5 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className="font-['Roboto'] font-bold text-xl text-white mb-1 leading-tight"
              >
                {member.name}
              </motion.h3>
              <motion.p 
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.6 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className="font-['Roboto'] font-semibold text-sm text-[#7760bd] mb-3 uppercase tracking-wider"
              >
                {member.role}
              </motion.p>
              <motion.p 
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.7 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                className="font-['Roboto'] text-[15px] text-[#9e9e9e] leading-relaxed mb-6 flex-grow"
              >
                {member.description}
              </motion.p>
              <motion.a
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.8 + (index * SECTION_STAGGER), 
                  ease: SECTION_EASE 
                }}
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={prefersReducedMotion ? {} : { 
                  scale: 1.08, 
                  backgroundColor: "#333",
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                className="mt-auto bg-[#484848] text-white font-['Roboto'] font-bold text-sm h-10 px-6 rounded-xl flex items-center justify-center transition-all shadow-md"
              >
                LinkedIn
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ SECTION
function FAQSection({ onOpenHelpCenter }: { onOpenHelpCenter: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is Makeen and how does it help me?", a: "Makeen is an Explainable AI platform that helps you understand AI predictions. Upload your data, ask questions, and get clear explanations of how decisions are made." },
    { q: "Do I need technical skills to use Makeen?", a: "No! Makeen is designed for everyone. Simply upload your data and ask questions in plain language—no coding required." },
    { q: "What kind of data can I upload?", a: "Makeen supports CSV and XLSX files. You can upload datasets for predictions and analysis." },
    { q: "Is my data secure?", a: "Yes. We use industry-standard encryption and security measures to protect your data. Your information is never shared with third parties." },
    { q: "Is there a free plan?", a: "Yes — Makeen is completely free to use during our beta. Sign up and start exploring your data at no cost." },
    { q: "How accurate are the AI predictions?", a: "Prediction accuracy depends on your data quality and the model used. Makeen provides confidence scores and explanations so you can evaluate each prediction's reliability." }
  ];

  return (
    <section id="faq" ref={ref} className="relative py-24 bg-[#141414]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />
      <div className="w-full max-w-[900px] mx-auto px-6 lg:px-12">
        <motion.h2
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
          className="text-center font-['Roboto'] font-bold text-[clamp(2.5rem,6vw,4rem)] leading-tight text-white mb-[34px]"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                duration: 1, 
                delay: 0.2 + (index * 0.15), 
                ease: SECTION_EASE 
              }}
              className={`overflow-hidden border transition-all duration-500 ${
                openIndex === index
                  ? 'border-[#7760bd] bg-[rgba(119,96,189,0.12)] shadow-[0_10px_30px_rgba(119,96,189,0.2)] scale-[1.02]'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]'
              }`}
              style={{
                borderRadius: '16px'
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full h-14 md:h-[56px] px-[18px] flex items-center justify-between text-left group"
              >
                <span className="font-['Roboto'] font-semibold text-[16px] md:text-[17px] text-white pr-4 transition-colors">
                  {faq.q}
                </span>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  className={`flex-shrink-0 transition-all duration-400 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: openIndex === index ? '#7760bd' : 'rgba(255,255,255,0.7)' }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-[18px] pb-4 pt-0">
                    <p className="font-['Roboto'] text-[14px] md:text-[15px] text-[#d8d8d8] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.2, ease: SECTION_EASE }}
          className="text-center mt-[18px] text-[14px] font-['Roboto']"
          style={{ opacity: 0.85, color: '#aaa' }}
        >
          Need more answers? Visit our{' '}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onOpenHelpCenter();
            }}
            className="text-[#7760bd] transition-all hover:underline hover:text-[#8a75d4] cursor-pointer"
          >
            Help Center
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}

// READY TO TRY MAKEEN CTA - SINGLE SET ONLY (matches reference)
function CTASection({ onSignUp }: { onSignUp: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section ref={ref} className="relative py-20 bg-[#141414]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7760bd]/30 to-transparent" />
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: MOTION_EASE }}
          whileHover={prefersReducedMotion ? {} : {
            y: -10,
            scale: 1.01,
            boxShadow: "0 25px 60px rgba(119, 96, 189, 0.3)"
          }}
          className="relative w-full overflow-hidden group"
          style={{ 
            height: '300px',
            borderRadius: '32px',
            backgroundImage: `url(${imgReadyToTryBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />

          {/* Content - left positioned */}
          <div className="absolute left-[56px] top-[44px] z-50">
            <h2 className="font-['Roboto'] font-bold text-[40px] leading-tight text-white mb-[26px]">
              Ready To Try Makeen?
            </h2>
            <div className="flex flex-wrap gap-[18px]">
              <button
                onClick={onSignUp}
                className="bg-[#7760bd] text-white font-['Roboto'] font-medium text-lg hover:bg-[#8a75d4] shadow-lg flex items-center gap-2 cursor-pointer"
                style={{
                  height: '44px',
                  padding: '0 22px',
                  borderRadius: '12px',
                  transition: 'background-color 0.18s ease, transform 0.18s ease'
                }}
              >
                Start now
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <a
                href="#how-it-works"
                className="bg-transparent text-white font-['Roboto'] font-medium text-lg border-2 border-white hover:bg-white hover:text-[#141414] flex items-center gap-2 cursor-pointer"
                style={{
                  height: '44px',
                  padding: '0 22px',
                  borderRadius: '12px',
                  transition: 'background-color 0.18s ease, color 0.18s ease, transform 0.18s ease'
                }}
              >
                Learn More
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// FOOTER - MATCHES REFERENCE IMAGE (single row layout)
function Footer({ onOpenTerms }: { onOpenTerms: () => void }) {
  return (
    <footer className="bg-[#141414] border-t border-[#ffffff08] py-12">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden shadow-lg border border-[#ffffff10]">
              <img src={imgImage39} alt="Makeen" className="w-full h-full object-cover" />
            </div>
            <span className="font-['Roboto'] font-bold text-2xl text-white tracking-tight">Makeen</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/70 font-['Roboto'] font-medium">
            <a href="#discover" className="hover:text-[#7760bd] transition-all hover:scale-105">Features</a>
            <a href="#how-it-works" className="hover:text-[#7760bd] transition-all hover:scale-105">How It Works</a>
            <a href="#understand" className="hover:text-[#7760bd] transition-all hover:scale-105">XAI Explained</a>
            <a href="#team" className="hover:text-[#7760bd] transition-all hover:scale-105">Meet the Team</a>
            <a href="#mission" className="hover:text-[#7760bd] transition-all hover:scale-105">Our Mission</a>
            <a href="#faq" className="hover:text-[#7760bd] transition-all hover:scale-105">FAQ</a>
          </div>

          {/* Email only */}
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1, backgroundColor: "#7760bd" }}
              href="mailto:makeen.chat@gmail.com"
              title="makeen.chat@gmail.com"
              className="w-10 h-10 bg-[#222] border border-[#ffffff10] rounded-xl flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7L13.03 12.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </motion.a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-[#ffffff08] text-center">
          <p className="text-[#888] text-sm font-['Roboto']">
            Copyright © 2026 Makeen | All Rights Reserved | <a href="#" onClick={(e) => { e.preventDefault(); onOpenTerms(); }} className="text-white hover:text-[#7760bd] transition-colors cursor-pointer">Terms and Policies</a>
          </p>
        </div>
      </Container>
    </footer>
  );
}

// MAIN LANDING PAGE - ALL SECTIONS, NO DUPLICATIONS
export default function LandingPage({ onSignUp }: { onSignUp?: () => void } = {}) {
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTermsAndPolicies, setShowTermsAndPolicies] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const container = document.getElementById('landing-scroll');
    const el: EventTarget = container ?? window;
    const onScroll = () => {
      const scrollY = container ? container.scrollTop : window.scrollY;
      setShowBackToTop(scrollY > 500);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth scroll handler for navigation
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-scroll-to]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        const id = link.getAttribute('data-scroll-to');
        const element = document.getElementById(id || '');
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => {
      document.removeEventListener('click', handleSmoothScroll);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <>
      {/* Help Center Modal */}
      {showHelpCenter && (
        <HelpCenter
          onClose={() => setShowHelpCenter(false)}
          source="menu"
        />
      )}

      {/* Terms and Policies Modal */}
      {showTermsAndPolicies && (
        <TermsAndPolicies
          onClose={() => setShowTermsAndPolicies(false)}
        />
      )}

      {/* Landing Page Content */}
      <div className="w-full min-h-screen bg-[#141414] text-white overflow-x-hidden">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <XaiExplainerSection />
        <TeamSection />
        <MissionSection />
        <FAQSection onOpenHelpCenter={() => setShowHelpCenter(true)} />
        <CTASection onSignUp={onSignUp ?? (() => {})} />
        <Footer onOpenTerms={() => setShowTermsAndPolicies(true)} />
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              const el = document.getElementById('landing-scroll');
              if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed bottom-[32px] right-[32px] z-50 w-[44px] h-[44px] bg-[#7760bd] hover:bg-[#8870cd] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors"
            aria-label="Back to top"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}