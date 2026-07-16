import { motion, AnimatePresence, useInView, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import imgImage39 from "@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png";
import imgEllipse1700 from "@/assets/2d43ad35cf16e098dec1368159bbfed4db4e60be.png";
import imgEllipse1701 from "@/assets/873063e7e03a5e4ec249ed8b32559e0a52fa2f3f.png";
import imgEllipse1702 from "@/assets/c4a0bb29824c69e89d7b251f1e56b81e29ecd9c0.png";
import imgEllipse1703 from "@/assets/02d4010f3bb889503125b18a67d28ac3e6a98a86.png";
import imgSaudiMadeLogo from "@/assets/saudi-made-logo.png";
import { HelpCenter } from "@/app/pages/HelpCenter";
import { TermsAndPolicies } from "@/app/pages/TermsAndPolicies";

// Global animation settings
const MOTION_EASE = [0.2, 0.8, 0.2, 1] as [number, number, number, number];

// Section-specific animation settings (slower, more premium)
const SECTION_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const SECTION_DURATION = 1.2;
const SECTION_STAGGER = 0.15;

// Responsive Container
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-6 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

// Small tracked-out eyebrow label used throughout for editorial rhythm
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#7760bd] text-[12px] font-sans font-semibold uppercase tracking-[0.2em] mb-[16px]">
      {children}
    </p>
  );
}

// Hairline divider used between editorial list rows
function HairlineDivider({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-white/[0.08] ${className}`} />;
}

// ── Custom risk-gauge graphic — replaces the old stock gradient/3D-render hero art.
// A semicircular gauge with an animated fill arc, reads as a live product preview
// rather than decorative art, reinforcing the "explainable score" narrative.
function RiskGauge() {
  const r = 92;
  const circumference = Math.PI * r; // arc length of a 180° sweep
  const value = 0.78;
  const arcPath = `M 20 ${20 + r} A ${r} ${r} 0 0 1 ${20 + r * 2} ${20 + r}`;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={40 + r * 2} height={40 + r} viewBox={`0 0 ${40 + r * 2} ${40 + r}`} fill="none">
        <path d={arcPath} stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d={arcPath}
          stroke="#7760bd"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference * (1 - value) }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
        {/* Tick marks */}
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = Math.PI - (Math.PI / 8) * i;
          const cx = 20 + r;
          const cy = 20 + r;
          const x1 = cx + (r - 20) * Math.cos(angle);
          const y1 = cy - (r - 20) * Math.sin(angle);
          const x2 = cx + (r - 12) * Math.cos(angle);
          const y2 = cy - (r - 12) * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />;
        })}
      </svg>
      <div className="absolute top-[58%] flex flex-col items-center">
        <p className="font-tabular text-[3rem] leading-none text-[#fffcfe]">742</p>
        <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#9e9e9e] mt-[6px]">Risk Score · Low Risk</p>
      </div>
    </div>
  );
}

// ── Subtle repeating dot-grid pattern used as a quiet background texture.
function DotGrid({ className = "" }: { className?: string }) {
  const patternId = "landing-dot-grid";
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden="true">
      <defs>
        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(255,255,255,0.06)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414]/90 backdrop-blur-sm border-b border-white/[0.08]">
      <Container>
        <nav className="flex items-center justify-between h-[76px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden">
              <img src={imgImage39} alt="Makeen" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-medium text-lg text-white tracking-tight">Makeen Fintech</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] font-sans font-medium uppercase tracking-[0.12em] text-white/70 hover:text-[#7760bd] transition-colors cursor-pointer"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA + Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-[13px] font-sans font-medium uppercase tracking-[0.12em] text-white/70 hover:text-[#7760bd] transition-colors">Login</button>
            <button className="hidden sm:block px-5 py-2 border border-[#7760bd]/50 text-[#7760bd] rounded-sm hover:bg-[#7760bd]/10 transition-colors text-[13px] font-sans font-semibold uppercase tracking-[0.12em]">Sign Up</button>
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
        className="lg:hidden overflow-hidden bg-[#141414]/95 border-t border-white/[0.08]"
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-white hover:text-[#7760bd] py-3 text-[15px] font-sans uppercase tracking-[0.1em] border-b border-white/[0.06] last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            <button className="flex-1 py-2.5 text-white border border-white/20 rounded-sm hover:border-[#7760bd] transition-colors text-[14px] font-semibold uppercase tracking-[0.1em]">Login</button>
            <button className="flex-1 py-2.5 bg-[#7760bd] text-[#141414] rounded-sm hover:bg-[#8a75d4] transition-colors text-[14px] font-semibold uppercase tracking-[0.1em]">Sign Up</button>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

// HERO SECTION — editorial split layout: display type + copy on the left,
// a live-looking risk-gauge graphic on the right instead of a stock render.
function HeroSection() {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  const tickerItems = ["Explainable AI", "SHAP", "LIME", "Real-Time Risk Scoring"];

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-[76px] overflow-hidden bg-[#141414]">
      <DotGrid className="opacity-60" />
      {/* Soft single-tone gold glow, replacing the old rainbow gradient image */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[#7760bd]/[0.08] rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            style={{ y, opacity }}
            className="lg:col-span-7"
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: MOTION_EASE }}
              className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-[28px]"
            >
              {tickerItems.map((item, i) => (
                <span key={item} className="flex items-center gap-3">
                  <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#9e9e9e]">{item}</span>
                  {i < tickerItems.length - 1 && <span className="text-[#7760bd]/50">·</span>}
                </span>
              ))}
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: MOTION_EASE }}
              className="font-serif font-medium text-[clamp(3rem,6.5vw,5.5rem)] leading-[1.05] text-white mb-6"
            >
              Your credit decisions,
              <br /><span className="italic text-[#f8ec93]">explained.</span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: MOTION_EASE }}
              className="font-sans text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-white/70 mb-10 max-w-[560px]"
            >
              Upload applicant data. Ask a question in plain language. Get a credit risk assessment — and a clear explanation of exactly why the AI made that decision. No technical background needed.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: MOTION_EASE }}
              className="flex items-center gap-6"
            >
              <button className="flex items-center gap-3 px-8 py-4 bg-[#7760bd] text-[#141414] rounded-sm font-sans font-semibold text-[15px] uppercase tracking-[0.08em] transition-all hover:bg-[#8a75d4] hover:shadow-[0_10px_30px_-10px_rgba(119,96,189,0.5)] cursor-pointer">
                Start now
                <svg width="16" height="12" viewBox="0 0 16 14" fill="none">
                  <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <a href="#how-it-works" className="text-[14px] font-sans font-semibold uppercase tracking-[0.1em] text-white/70 hover:text-[#7760bd] transition-colors cursor-pointer">
                See how it works
              </a>
            </motion.div>
          </motion.div>

          {/* Risk gauge visual */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: SECTION_EASE }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="border border-white/[0.08] rounded-[24px] p-10 bg-white/[0.02] backdrop-blur-sm">
              <RiskGauge />
              <HairlineDivider className="my-8" />
              <div className="flex justify-between font-tabular text-[13px] text-[#9e9e9e]">
                <span>Applicant #A0231</span>
                <span className="text-[#08B839]">Approved</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

// FEATURES SECTION — numbered editorial list instead of a stock-render card grid
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const features = [
    {
      number: "01",
      title: "Ask Questions About Credit Risk",
      description: "Ask about applicant creditworthiness in natural English — no coding needed. Get clear answers about credit risk you can defend to regulators and credit committees.",
      icon: (
        <svg className="w-[34px] h-[34px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-3.155-.502l-4.345 2.17v-3.233C3.612 15.55 3 13.86 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Credit Risk Assessment",
      description: "Generate loan risk assessments instantly from applicant data. Each result comes with clear factor-by-factor explanations and confidence scores for defensible decisions.",
      icon: (
        <svg className="w-[34px] h-[34px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v16.5A1.5 1.5 0 004.5 21H21M7 16l4-6 3 3 5-8" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Built for Credit Teams",
      description: "A simple, intuitive interface built for loan officers, risk analysts, and credit committees. Evaluate applicant risk transparently and with confidence for every lending decision.",
      icon: (
        <svg className="w-[34px] h-[34px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 3.13a4 4 0 10-3-7.26" />
        </svg>
      ),
    },
  ];

  return (
    <section id="discover" ref={ref} className="relative py-28 bg-[#141414]">
      <Container>
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
          className="max-w-[640px] mb-20"
        >
          <Eyebrow>What You Can Do</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.1] text-[#fffcfe]">
            Three ways Makeen turns raw applicant data into decisions you can defend.
          </h2>
        </motion.div>

        <div>
          <HairlineDivider />
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: index * SECTION_STAGGER, ease: SECTION_EASE }}
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start py-10"
            >
              <div className="md:col-span-2">
                <span className="font-tabular text-[23px] text-[#7760bd]">{feature.number}</span>
              </div>
              <div className="md:col-span-1 text-[#7760bd]/70 group-hover:text-[#7760bd] transition-colors">
                {feature.icon}
              </div>
              <h3 className="md:col-span-4 font-sans font-semibold text-[20px] text-white leading-tight">
                {feature.title}
              </h3>
              <p className="md:col-span-5 font-sans text-[16px] leading-[1.7] text-[#9e9e9e]">
                {feature.description}
              </p>
            </motion.div>
          ))}
          <HairlineDivider />
        </div>
      </Container>
    </section>
  );
}

// HOW IT WORKS SECTION — triptych of oversized serif numerals, no icon circles
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [
    {
      number: "01",
      title: "Upload your file",
      description: "Drop in a CSV or Excel file of applicant data — loan applications, credit profiles, financial records. The platform processes it instantly.",
    },
    {
      number: "02",
      title: "Ask your question",
      description: "Type whatever you want to know in plain English. \"Which applicants will default?\" \"What drives high-risk profiles?\" No SQL, no code.",
    },
    {
      number: "03",
      title: "Get an explanation",
      description: "The platform trains a model on applicant data, returns a risk score, and shows you exactly which financial factors drove that assessment — with a chart you can actually read.",
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="relative py-28 bg-[#141414] border-y border-white/[0.06]">
      <Container>
        <motion.div
          className="mb-20"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
        >
          <Eyebrow>Simple By Design</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(2.25rem,4vw,3.25rem)] text-[#fffcfe] leading-[1.1] mb-4">
            How it works
          </h2>
          <p className="font-sans text-[17px] text-[#9e9e9e] max-w-[480px]">
            Three steps from applicant data to a credit decision you can trust and defend.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-14">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: i * SECTION_STAGGER, ease: SECTION_EASE }}
              className="relative"
            >
              <p className="font-serif font-medium text-[4rem] leading-none text-[#7760bd]/80 mb-4">{step.number}</p>
              <h3 className="font-sans font-semibold text-[19px] text-white mb-3">{step.title}</h3>
              <p className="font-sans text-[15.5px] text-[#9e9e9e] leading-[1.7]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// XAI EXPLAINER SECTION — glossary-style definition list instead of a card grid
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
      color: "#7760bd",
    },
    {
      tag: "SHAP",
      title: "Feature Importance",
      tagline: "Which factors matter most?",
      analogy: "Imagine deciding whether to bring an umbrella. SHAP tells you: clouds count for 60% of the decision, humidity 30%, and season 10%. Each factor gets a score.",
      forYou: "The bar chart in your results shows how much each column in your data pushed the prediction up or down — so you know where to focus.",
      color: "#C46F94",
    },
    {
      tag: "LIME",
      title: "Local Explanations",
      tagline: "Why this specific answer?",
      analogy: "SHAP explains the big picture. LIME zooms in on one specific prediction and explains it in the simplest possible terms — as if you're seeing your data for the first time.",
      forYou: "Used as a second opinion alongside SHAP to confirm or challenge the result, giving you more confidence in what the AI found.",
      color: "#C17F6E",
    },
  ];

  return (
    <section id="understand" ref={ref} className="relative py-28 bg-[#141414]">
      <Container className="max-w-[880px]">
        <motion.div
          className="mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
        >
          <Eyebrow>Under The Hood</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(2.25rem,4vw,3.25rem)] text-[#fffcfe] leading-[1.1] mb-4">
            A short glossary
          </h2>
          <p className="font-sans text-[17px] text-[#9e9e9e] max-w-[520px]">
            No technical background needed. Here's what these words actually mean — and why they matter for your data.
          </p>
        </motion.div>

        <div>
          <HairlineDivider />
          {concepts.map((c, i) => (
            <motion.div
              key={c.tag}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: i * SECTION_STAGGER, ease: SECTION_EASE }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10"
            >
              <div className="md:col-span-3">
                <p className="font-serif italic text-[26px] text-white leading-tight">{c.title}</p>
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.15em] mt-2" style={{ color: c.color }}>
                  {c.tag} · {c.tagline}
                </p>
              </div>
              <div className="md:col-span-9 space-y-3">
                <p className="font-sans text-[16px] text-[#9e9e9e] leading-[1.7] italic">"{c.analogy}"</p>
                <p className="font-sans text-[15.5px] text-white/80 leading-[1.7]">{c.forYou}</p>
              </div>
            </motion.div>
          ))}
          <HairlineDivider />
        </div>

        <motion.p
          className="text-center font-sans text-[14px] text-[#666] mt-10"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: SECTION_DURATION, delay: 0.5, ease: SECTION_EASE }}
        >
          You don't need to understand the math — Makeen handles it. This section just helps you read your results with confidence.
        </motion.p>
      </Container>
    </section>
  );
}

// MISSION SECTION — a pull-quote manifesto moment instead of a text+photo split
function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section id="mission" ref={ref} className="relative py-32 bg-[#141414] border-y border-white/[0.06] overflow-hidden">
      <DotGrid className="opacity-40" />
      <Container className="relative max-w-[820px] text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
        >
          <Eyebrow>Our Mission</Eyebrow>
        </motion.div>

        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.15, ease: SECTION_EASE }}
          className="font-serif italic font-medium text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.3] text-white mb-10"
        >
          "From confusion to clarity — every credit decision should be one you can understand, and defend."
        </motion.p>

        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.35, ease: SECTION_EASE }}
          className="font-sans text-[16.5px] leading-[1.8] text-[#9e9e9e] max-w-[560px] mx-auto"
        >
          Credit decisions are only defensible if you can understand and justify them. We built Makeen Fintech because loan officers, risk analysts, and credit committees shouldn't need a data science degree to trust — or challenge — what a risk model predicts. Every credit assessment comes with a plain-language explanation backed by SHAP attributions.
        </motion.p>
      </Container>
    </section>
  );
}

// TEAM SECTION — editorial directory list instead of an avatar-card grid
function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const team = [
    { name: "Lama Asiri", role: "Full Stack Developer", description: "Manages both frontend and backend, ensuring seamless integration and a smooth user experience.", image: imgEllipse1700, linkedin: "https://www.linkedin.com/in/lamak2asiri" },
    { name: "Shahad Alsomali", role: "Frontend Developer", description: "Designs the user interface and experience, ensuring the platform is intuitive and visually appealing.", image: imgEllipse1701, linkedin: "https://www.linkedin.com/in/shahad-w-alsomali-11509b247" },
    { name: "Reem Alhijris", role: "Backend Developer", description: "Ensures the models run correctly, handles data processing, and keeps the backend stable and functional.", image: imgEllipse1702, linkedin: "https://www.linkedin.com/in/reem-alhijris" },
    { name: "Rahaf Almalki", role: "AI/ML Engineer", description: "Develops and optimizes AI models, ensures explainability, and handles the core machine learning logic.", image: imgEllipse1703, linkedin: "https://www.linkedin.com/in/rahafalmalkics" }
  ];

  return (
    <section id="team" ref={ref} className="relative py-28 bg-[#141414]">
      <Container>
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
          className="max-w-[640px] mb-16"
        >
          <Eyebrow>Meet The Team</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(2.25rem,4vw,3.25rem)] text-[#fffcfe] leading-[1.1]">
            The people behind Makeen
          </h2>
        </motion.div>

        <div>
          <HairlineDivider />
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * SECTION_STAGGER, ease: SECTION_EASE }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center py-8"
            >
              <div className="md:col-span-1">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/[0.12]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="md:col-span-3">
                <p className="font-serif text-[19px] text-white leading-tight">{member.name}</p>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7760bd] mt-1">{member.role}</p>
              </div>
              <p className="md:col-span-6 font-sans text-[15.5px] text-[#9e9e9e] leading-[1.6]">
                {member.description}
              </p>
              <div className="md:col-span-2 md:text-right">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-sans font-semibold uppercase tracking-[0.1em] text-white/70 hover:text-[#7760bd] transition-colors cursor-pointer"
                >
                  LinkedIn
                  <svg width="12" height="12" viewBox="0 0 16 14" fill="none">
                    <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
          <HairlineDivider />
        </div>
      </Container>
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
    <section id="faq" ref={ref} className="relative py-28 bg-[#141414]">
      <Container className="max-w-[820px]">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: SECTION_DURATION, ease: SECTION_EASE }}
          className="mb-14"
        >
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(2.25rem,4vw,3.25rem)] text-[#fffcfe] leading-[1.1]">
            Frequently asked questions
          </h2>
        </motion.div>

        <div>
          <HairlineDivider />
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.06 * index, ease: SECTION_EASE }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left group cursor-pointer"
              >
                <span className="font-sans font-medium text-[16px] md:text-[17px] text-white pr-4 group-hover:text-[#7760bd] transition-colors">
                  {faq.q}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`flex-shrink-0 transition-all duration-300 ${openIndex === index ? 'rotate-45' : ''}`}
                  style={{ color: openIndex === index ? '#7760bd' : 'rgba(255,255,255,0.5)' }}
                >
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="font-sans text-[15.5px] md:text-[16px] text-[#9e9e9e] leading-relaxed pb-6 max-w-[640px]">
                    {faq.a}
                  </p>
                </motion.div>
              )}
              <HairlineDivider />
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.5, ease: SECTION_EASE }}
          className="text-center mt-10 text-[15px] font-sans text-[#9e9e9e]"
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
      </Container>
    </section>
  );
}

// CTA SECTION — bold typographic closer, no background photo
function CTASection({ onSignUp }: { onSignUp: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section ref={ref} className="relative py-28 bg-[#141414] border-y border-white/[0.06] overflow-hidden">
      <DotGrid className="opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#7760bd]/[0.10] rounded-full blur-[140px] pointer-events-none" />
      <Container className="relative text-center max-w-[720px]">
        <motion.h2
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: SECTION_EASE }}
          className="font-serif font-medium text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.1] text-white mb-10"
        >
          Ready to try Makeen?
        </motion.h2>
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: MOTION_EASE }}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          <button
            onClick={onSignUp}
            className="flex items-center gap-2 px-8 py-4 bg-[#7760bd] text-[#141414] rounded-sm font-sans font-semibold text-[15px] uppercase tracking-[0.08em] hover:bg-[#8a75d4] transition-colors cursor-pointer"
          >
            Start now
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-sm font-sans font-semibold text-[15px] uppercase tracking-[0.08em] hover:border-[#7760bd] hover:text-[#7760bd] transition-colors cursor-pointer"
          >
            Learn More
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </Container>
    </section>
  );
}

// FOOTER
function Footer({ onOpenTerms }: { onOpenTerms: () => void }) {
  return (
    <footer className="bg-[#141414] border-t border-white/[0.08] py-14">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden border border-white/[0.08]">
              <img src={imgImage39} alt="Makeen" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-medium text-xl text-white tracking-tight">Makeen</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] font-sans font-semibold uppercase tracking-[0.1em] text-white/60">
            <a href="#discover" className="hover:text-[#7760bd] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#7760bd] transition-colors">How It Works</a>
            <a href="#understand" className="hover:text-[#7760bd] transition-colors">XAI Explained</a>
            <a href="#team" className="hover:text-[#7760bd] transition-colors">Meet the Team</a>
            <a href="#mission" className="hover:text-[#7760bd] transition-colors">Our Mission</a>
            <a href="#faq" className="hover:text-[#7760bd] transition-colors">FAQ</a>
          </div>

          {/* Saudi Made badge + Email */}
          <div className="flex items-center gap-5">
            <img src={imgSaudiMadeLogo} alt="Saudi Made" className="h-12 w-auto" />
            <a
              href="mailto:makeen.chat@gmail.com"
              title="makeen.chat@gmail.com"
              className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] rounded-md flex items-center justify-center hover:border-[#7760bd]/50 hover:bg-[#7760bd]/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7L13.03 12.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-white/[0.08] text-center">
          <p className="text-[#888] text-[14px] font-sans">
            Copyright © 2026 Makeen | All Rights Reserved | <a href="#" onClick={(e) => { e.preventDefault(); onOpenTerms(); }} className="text-white/80 hover:text-[#7760bd] transition-colors cursor-pointer">Terms and Policies</a>
          </p>
        </div>
      </Container>
    </footer>
  );
}

// MAIN LANDING PAGE
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
        <MissionSection />
        <TeamSection />
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
            className="fixed bottom-[32px] right-[32px] z-50 w-[44px] h-[44px] bg-[#7760bd] hover:bg-[#8a75d4] text-[#141414] rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors"
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
