import { motion, useInView, useScroll, useTransform } from "motion/react";
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

          {/* Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#discover" className="text-white hover:text-[#7760bd] transition-colors cursor-pointer">Features</a>
            <a href="#mission" className="text-white hover:text-[#7760bd] transition-colors cursor-pointer">Our Mission</a>
            <a href="#contact" className="text-white hover:text-[#7760bd] transition-colors cursor-pointer">Contact Us</a>
            <a href="#faq" className="text-white hover:text-[#7760bd] transition-colors cursor-pointer">FAQ</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-white hover:text-[#7760bd] transition-colors">Login</button>
            <button className="px-6 py-2.5 bg-[#7760bd] text-white rounded-lg hover:bg-[#8a75d4] transition-colors font-semibold">Sign Up</button>
          </div>
        </nav>
      </Container>
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
            Think Beyond
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: MOTION_EASE }}
            className="font-['Inter'] font-semibold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] text-[#f8ec93] mb-6"
          >
            Discover Makeen
          </motion.p>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: MOTION_EASE }}
            className="font-['Roboto'] text-[clamp(1.1rem,1.5vw,1.35rem)] leading-relaxed text-white/90 mb-10 max-w-[650px]"
          >
            Experience AI like never before. Generate predictions, ask questions in plain language, and gain clear, actionable insights, all through a seamless, intuitive interface. Designed for both beginners and professionals, Makeen makes complex AI transparent and understandable.
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
          Discover Makeen
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

// MISSION SECTION
function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section id="mission" ref={ref} className="relative py-24 bg-[#141414]">
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
              Makeen shows you how models think, helping you take control of decisions with confidence. Experience AI like never before with clear, actionable insights that make complex predictions transparent and understandable for everyone.
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
    <section id="contact" ref={ref} className="relative py-24 bg-[#141414]">
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
          Contact Us
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
              className="bg-[#f5f5f5] overflow-hidden p-6 flex flex-col items-center text-center group"
              style={{
                minHeight: "240px",
                borderRadius: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                className="font-['Roboto'] font-bold text-xl text-[#1a1a1a] mb-1 leading-tight"
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
                className="font-['Roboto'] text-[15px] text-[#444] leading-relaxed mb-6 flex-grow"
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
    { q: "Is there a free plan?", a: "Yes! Makeen offers a free tier to get you started. Check our pricing page for more details on plans and features." },
    { q: "How accurate are the AI predictions?", a: "Prediction accuracy depends on your data quality and the model used. Makeen provides confidence scores and explanations so you can evaluate each prediction's reliability." }
  ];

  return (
    <section id="faq" ref={ref} className="relative py-24 bg-[#141414]">
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
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section ref={ref} className="relative py-20 bg-[#141414]">
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
              <a
                href="#discover"
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
              </a>
              <a
                href="#discover"
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
          <div className="flex flex-wrap items-center justify-center gap-10 text-white/70 font-['Roboto'] font-medium">
            <a href="#discover" className="hover:text-[#7760bd] transition-all hover:scale-105">Features</a>
            <a href="#mission" className="hover:text-[#7760bd] transition-all hover:scale-105">Our Mission</a>
            <a href="#contact" className="hover:text-[#7760bd] transition-all hover:scale-105">Contact Us</a>
            <a href="#faq" className="hover:text-[#7760bd] transition-all hover:scale-105">FAQ</a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <motion.a 
              whileHover={{ scale: 1.1, backgroundColor: "#0a66c2" }}
              href="#" className="w-10 h-10 bg-[#222] border border-[#ffffff10] rounded-xl flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                <path d="M14 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V2C16 0.9 15.1 0 14 0ZM5 14H2V5H5V14ZM3.5 4C2.7 4 2 3.3 2 2.5C2 1.7 2.7 1 3.5 1C4.3 1 5 1.7 5 2.5C5 3.3 4.3 4 3.5 4ZM14 14H11V9.5C11 8.7 10.3 8 9.5 8C8.7 8 8 8.7 8 9.5V14H5V5H8V6.2C8.5 5.4 9.6 5 10.5 5C12.4 5 14 6.6 14 8.5V14Z"/>
              </svg>
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1, backgroundColor: "#7760bd" }}
              href="mailto:contact@makeen.ai" className="w-10 h-10 bg-[#222] border border-[#ffffff10] rounded-xl flex items-center justify-center transition-colors"
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
export default function LandingPage() {
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTermsAndPolicies, setShowTermsAndPolicies] = useState(false);

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
        <MissionSection />
        <TeamSection />
        <FAQSection onOpenHelpCenter={() => setShowHelpCenter(true)} />
        <CTASection />
        <Footer onOpenTerms={() => setShowTermsAndPolicies(true)} />
      </div>
    </>
  );
}