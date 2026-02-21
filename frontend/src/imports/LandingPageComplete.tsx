import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
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
import imgHeroGradient from "@/assets/b3217eaba563f915320aff36700c569e472c9a23.png";
import imgReadyToTry from "@/assets/ea0a79e594ecfacebd784d6e5c1c7ef8324c510a.png";

// ============================================================================
// RESPONSIVE CONTAINER SYSTEM
// ============================================================================
function Container({ children, className = "", full = false }: { children: React.ReactNode; className?: string; full?: boolean }) {
  if (full) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-6 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// HEADER / NAVBAR - FULLY RESPONSIVE, NO CLIPPING
// ============================================================================
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#141414] shadow-[0px_4px_4px_0px_rgba(11,5,5,0.25)]"
    >
      <Container>
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-12 w-12 rounded-md overflow-hidden">
              <img 
                src={imgImage39} 
                alt="Makeen" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-['Roboto'] font-semibold text-xl text-white">
              Makeen
            </span>
          </div>

          {/* Navigation Links - Hidden on small screens */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="#discover">Features</NavLink>
            <NavLink href="#mission">About Us</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <NavLink href="#contact">Contact Us</NavLink>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="px-4 py-2 rounded-lg text-white font-['Roboto'] hover:bg-[rgba(56,47,94,0.3)] transition-colors hidden sm:block">
              Login
            </button>
            <button className="px-6 py-3 rounded-lg bg-[#7760bd] text-white font-['Roboto'] font-extrabold shadow-md hover:bg-[#8a75d4] transition-all text-sm sm:text-base">
              Sign Up
            </button>
          </div>
        </div>
      </Container>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-white font-['Roboto'] text-base hover:text-[#7760bd] transition-colors cursor-pointer whitespace-nowrap"
      data-scroll-to={href.replace('#', '')}
    >
      {children}
    </a>
  );
}

// ============================================================================
// HERO SECTION - EXACT GRADIENT FROM IMAGE, PERFECT ALIGNMENT
// ============================================================================
function HeroSection() {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const animationProps = prefersReducedMotion 
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <section id="hero" className="relative min-h-[100vh] flex items-center bg-[#141414] pt-[70px] overflow-hidden scroll-mt-[70px]">
      {/* EXACT HERO GRADIENT FROM ORIGINAL DESIGN */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={imgHeroGradient} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Hero Content */}
      <Container className="relative z-10 py-20">
        <div className="flex flex-col items-start max-w-[800px]">
          {/* Headline */}
          <motion.h1
            {...animationProps}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="font-['Inter'] font-semibold text-[clamp(3rem,8vw,6rem)] leading-[1.1] text-white mb-3"
          >
            Think Beyond
          </motion.h1>

          {/* Highlight */}
          <motion.p
            {...animationProps}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="font-['Inter'] font-semibold text-[clamp(2rem,5vw,4rem)] text-[#f8ec93] mb-6"
          >
            Discover Makeen
          </motion.p>

          {/* Description */}
          <motion.p
            {...animationProps}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="font-['Roboto'] font-medium text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.6] text-white mb-8 max-w-[650px]"
          >
            Experience AI like never before. Generate predictions, ask questions in plain language, and gain clear, actionable insights, all through a seamless, intuitive interface. Designed for both beginners and professionals, Makeen makes complex AI transparent and understandable.
          </motion.p>

          {/* CTA Button - ALIGNED WITH TEXT */}
          <motion.button
            {...animationProps}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-lg bg-[#7760bd] text-white font-['Roboto'] font-medium text-lg shadow-lg hover:bg-[#8a75d4] transition-all"
          >
            <span>Start now</span>
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// DISCOVER MAKEEN SECTION - RESPONSIVE FEATURE CARDS
// ============================================================================
function DiscoverSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="discover" ref={ref} className="relative bg-[rgba(20,20,20,0.6)] py-20 md:py-32 scroll-mt-[70px]">
      <Container>
        {/* Section Title - NO CLIPPING */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center font-['Inter'] font-semibold text-[clamp(2.5rem,6vw,4rem)] leading-[1.2] mb-16 px-4"
          style={{
            backgroundImage: "linear-gradient(90.4312deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Discover Makeen
        </motion.h2>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Ask Questions in Plain Language"
            description="Type your questions in natural English, no coding or technical skills needed. Get answers that are easy to follow and understand."
            image={imgDarkMetallic}
            background="#fffcfe"
            textColor="#00000a"
            delay={0.1}
            isInView={isInView}
          />
          <FeatureCard
            title="Predictions Generation"
            description="Generate AI predictions instantly for text, images, or tables. Each result comes with clear explanations and confidence indicators."
            image={imgTorusKnot}
            gradient="linear-gradient(22.2062deg, rgb(20, 20, 20) 41.94%, rgb(43, 30, 86) 114.53%)"
            delay={0.2}
            isInView={isInView}
          />
          <FeatureCard
            title="Designed for Everyone"
            description="A simple, intuitive interface built for beginners, students, and non-technical users. Explore AI transparently and confidently without feeling lost."
            image={imgIcosahedron}
            gradient="linear-gradient(22.2062deg, rgb(20, 20, 20) 41.94%, rgb(43, 30, 86) 114.53%)"
            delay={0.3}
            isInView={isInView}
          />
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ 
  title, 
  description, 
  image, 
  background, 
  gradient, 
  textColor = "#fffcfe",
  delay = 0,
  isInView
}: { 
  title: string; 
  description: string; 
  image: string; 
  background?: string; 
  gradient?: string;
  textColor?: string;
  delay?: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ 
        backgroundColor: background,
        backgroundImage: gradient
      }}
    >
      <div className="p-6 flex flex-col h-full min-h-[450px]">
        <h3 className="font-['Roboto'] font-semibold text-2xl mb-4 leading-tight" style={{ color: textColor }}>
          {title}
        </h3>
        <p className="font-['Roboto'] text-base leading-relaxed mb-6" style={{ color: textColor }}>
          {description}
        </p>
        <div className="mt-auto flex justify-center">
          <img 
            src={image} 
            alt=""
            className="w-[200px] h-[200px] object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// OUR MISSION SECTION - NO CLIPPING
// ============================================================================
function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="mission" ref={ref} className="relative py-20 md:py-32 bg-[#141414] scroll-mt-[70px]">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-[900px] mx-auto px-4"
        >
          <h2 
            className="font-['Roboto'] font-bold text-[clamp(3.5rem,8vw,6rem)] leading-[1.1] mb-6"
            style={{
              backgroundImage: "linear-gradient(90.2102deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Our Mission
          </h2>
          <p className="font-['Radley'] text-[clamp(1.75rem,4vw,2.5rem)] text-[#da876b] mb-6 leading-tight">
            From Confusion To Clarity
          </p>
          <p className="font-['Roboto'] font-medium text-[clamp(1.125rem,2vw,1.5rem)] text-white leading-relaxed">
            Makeen shows you how models think, helping you take control of decisions with confidence.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

// ============================================================================
// MEET THE TEAM SECTION - RESTORED EXACTLY, RESPONSIVE
// ============================================================================
function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const teamMembers = [
    {
      name: "Rawan AlMalki",
      role: "Full Stack Developer",
      description: "Manages both frontend and backend, ensuring seamless integration and a smooth user experience.",
      linkedin: "https://www.linkedin.com/in/rawan-almalki",
      image: imgEllipse1700
    },
    {
      name: "Rahaf AlMalki",
      role: "UI/UX Designer",
      description: "Designs the user interface and experience, ensuring the platform is intuitive and visually appealing.",
      linkedin: "https://www.linkedin.com/in/rahaf-almalki",
      image: imgEllipse1701
    },
    {
      name: "Reem AlSaqer",
      role: "AI/ML Engineer",
      description: "Develops and optimizes AI models, ensures explainability, and handles the core machine learning logic.",
      linkedin: "https://www.linkedin.com/in/reem-alsaqer",
      image: imgEllipse1702
    },
    {
      name: "Rahaf AlMalki",
      role: "Backend Developer",
      description: "Ensures the models run correctly, handles data processing, and keeps the backend stable and functional.",
      linkedin: "https://www.linkedin.com/in/rahafalmalkics",
      image: imgEllipse1703
    }
  ];

  return (
    <section id="team" ref={ref} className="relative py-20 md:py-32 bg-[#141414] scroll-mt-[70px]">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center font-['Roboto'] font-bold text-[clamp(3.5rem,8vw,6rem)] leading-[1.1] mb-16 px-4"
          style={{
            backgroundImage: "linear-gradient(90.2703deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Meet The Team
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <TeamCard key={index} member={member} delay={index * 0.1} isInView={isInView} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function TeamCard({ member, delay, isInView }: { member: any; delay: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-[#f5f5f5] rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="font-['Roboto'] font-semibold text-xl text-[#333] mb-1">
          {member.name}
        </h3>
        <p className="font-['Roboto'] font-semibold text-sm text-[#7760bd] mb-3">
          {member.role}
        </p>
        <p className="font-['Roboto'] text-sm text-[#333] mb-4 leading-relaxed">
          {member.description}
        </p>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto px-6 py-2 bg-[#484848] text-white rounded-lg font-['Roboto'] font-semibold text-sm hover:bg-[#5a5a5a] transition-colors flex items-center gap-2"
        >
          Visit
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 6.5L6 2.5L2 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 6 6)"/>
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

// ============================================================================
// FAQ SECTION - SIMPLE PRE-LOGIN QUESTIONS ONLY
// ============================================================================
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Makeen and how does it help me?",
      answer: "Makeen is an Explainable AI platform that helps you understand AI predictions. Upload your data, ask questions, and get clear explanations of how decisions are made."
    },
    {
      question: "Do I need technical skills to use Makeen?",
      answer: "No! Makeen is designed for everyone. Simply upload your data and ask questions in plain language—no coding required."
    },
    {
      question: "What kind of data can I upload?",
      answer: "Makeen supports CSV and XLSX files. You can upload datasets for predictions and analysis."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use industry-standard encryption and security measures to protect your data. Your information is never shared with third parties."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes! Makeen offers a free tier to get you started. Check our pricing page for more details on plans and features."
    }
  ];

  return (
    <section id="faq" ref={ref} className="relative py-20 md:py-32 bg-[rgba(20,20,20,0.6)] scroll-mt-[70px]">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center font-['Roboto'] font-bold text-[clamp(2.5rem,6vw,4rem)] leading-[1.2] text-white mb-12 px-4"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="max-w-[800px] mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              delay={index * 0.05}
              isInView={isInView}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 text-[#999] font-['Roboto']"
        >
          For more questions, visit our{" "}
          <a href="#" className="text-[#7760bd] hover:text-[#8a75d4] underline transition-colors">
            Help Center
          </a>
        </motion.p>
      </Container>
    </section>
  );
}

function FAQItem({ question, answer, isOpen, onClick, delay, isInView }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] hover:border-[#7760bd] transition-colors"
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <span className="font-['Roboto'] font-semibold text-lg text-white pr-4">
          {question}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-4"
        >
          <p className="font-['Roboto'] text-base text-[#ccc] leading-relaxed">
            {answer}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// READY TO TRY MAKEEN CTA - RESTORED EXACTLY
// ============================================================================
function ReadyToTryCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative py-20 bg-[#141414]">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={imgReadyToTry} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20">
            <h2 className="font-['Roboto'] font-bold text-[clamp(2.5rem,5vw,4rem)] text-white mb-8 leading-tight">
              Ready To Try Makeen?
            </h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-lg bg-[#7760bd] text-white font-['Roboto'] font-medium text-lg shadow-lg hover:bg-[#8a75d4] transition-all flex items-center gap-2">
                Start now
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="px-8 py-4 rounded-lg bg-transparent text-white font-['Roboto'] font-medium text-lg border-2 border-white hover:bg-white hover:text-[#141414] transition-all flex items-center gap-2">
                Learn More
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <path d="M15 7L1 7M15 7L9 1M15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

// ============================================================================
// FOOTER - COMPLETE
// ============================================================================
function Footer() {
  return (
    <footer id="contact" className="bg-[#141414] border-t border-[#333] pt-12 pb-8">
      <Container>
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-md overflow-hidden">
                <img 
                  src={imgImage39} 
                  alt="Makeen" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-['Roboto'] font-semibold text-xl text-white">
                Makeen
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="font-['Roboto'] font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#discover" className="text-[#999] hover:text-white transition-colors">Features</a></li>
                <li><a href="#faq" className="text-[#999] hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Roboto'] font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#mission" className="text-[#999] hover:text-white transition-colors">About Us</a></li>
                <li><a href="#team" className="text-[#999] hover:text-white transition-colors">Team</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Roboto'] font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#999] hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-[#999] hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[#333]">
          <p className="text-[#999] text-sm font-['Roboto']">
            Copyright © 2025 Makeen. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-8 h-8 bg-[#404040] rounded flex items-center justify-center hover:bg-[#505050] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M14 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V2C16 0.9 15.1 0 14 0ZM5 14H2V5H5V14ZM3.5 4C2.7 4 2 3.3 2 2.5C2 1.7 2.7 1 3.5 1C4.3 1 5 1.7 5 2.5C5 3.3 4.3 4 3.5 4ZM14 14H11V9.5C11 8.7 10.3 8 9.5 8C8.7 8 8 8.7 8 9.5V14H5V5H8V6.2C8.5 5.4 9.6 5 10.5 5C12.4 5 14 6.6 14 8.5V14Z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 bg-[#404040] rounded flex items-center justify-center hover:bg-[#505050] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM11.1 6H10.2C9.4 6 9.2 6.3 9.2 6.8V8H11L10.8 10H9.2V16H7V10H5V8H7V6.4C7 4.8 8 4 9.4 4H11.1V6Z"/>
              </svg>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// ============================================================================
// MAIN LANDING PAGE - ALL SECTIONS INCLUDED
// ============================================================================
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-[#141414] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <DiscoverSection />
      <MissionSection />
      <TeamSection />
      <FAQSection />
      <ReadyToTryCTA />
      <Footer />
    </div>
  );
}
