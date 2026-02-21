import { motion, useInView } from "motion/react";
import { useRef } from "react";
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

// ============================================================================
// RESPONSIVE CONTAINER SYSTEM
// ============================================================================
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-6 md:px-12 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// HERO GRADIENT - EXACT COPY (DO NOT MODIFY COLORS/POSITIONS)
// ============================================================================
function HeroGradient() {
  return (
    <div className="absolute left-[-100px] md:left-[-200px] top-[-50px] md:top-[-100px] pointer-events-none overflow-visible">
      <div className="h-[1307px] relative w-[1753px]" style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
        <div className="absolute inset-[-30.6%_-22.81%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2553.4 2107.22">
            <g>
              <g filter="url(#filter0_f_367_618)">
                <ellipse cx="1199.56" cy="1028.51" fill="#2C147B" rx="799.558" ry="628.507" />
              </g>
              <g filter="url(#filter1_f_367_618)">
                <ellipse cx="1353.84" cy="1078.72" fill="#67579F" rx="799.558" ry="628.507" />
              </g>
              <g filter="url(#filter2_f_367_618)">
                <ellipse cx="1277.15" cy="1078.72" fill="#FF916C" rx="491.442" ry="452.776" />
              </g>
              <g filter="url(#filter3_f_367_618)">
                <ellipse cx="1452.77" cy="1078.72" fill="#F8EC93" rx="406.586" ry="365.807" />
              </g>
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2057.01" id="filter0_f_367_618" width="2399.12" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_367_618" stdDeviation="200" />
              </filter>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2057.01" id="filter1_f_367_618" width="2399.12" x="154.285" y="50.2095">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_367_618" stdDeviation="200" />
              </filter>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1605.55" id="filter2_f_367_618" width="1682.88" x="435.712" y="275.94">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_367_618" stdDeviation="175" />
              </filter>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1331.61" id="filter3_f_367_618" width="1413.17" x="746.181" y="412.909">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_367_618" stdDeviation="150" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HEADER / NAVBAR - RESPONSIVE, NO CLIPPING
// ============================================================================
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#141414] shadow-[0px_4px_4px_0px_rgba(11,5,5,0.25)]">
      <Container>
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
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

          {/* Navigation Links - Hidden on mobile, visible on tablet+ */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="#discover">Features</NavLink>
            <NavLink href="#mission">About Us</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <NavLink href="#contact">Contact Us</NavLink>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-white font-['Roboto'] hover:bg-[rgba(56,47,94,0.3)] transition-colors">
              Login
            </button>
            <button className="px-6 py-3 rounded-lg bg-[#7760bd] text-white font-['Roboto'] font-extrabold shadow-md hover:bg-[#8a75d4] transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </Container>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-white font-['Roboto'] text-base hover:text-[#7760bd] transition-colors cursor-pointer"
      data-scroll-to={href.replace('#', '')}
    >
      {children}
    </a>
  );
}

// ============================================================================
// HERO SECTION - EXACT GRADIENT, RESPONSIVE LAYOUT, ALIGNED TEXT + BUTTON
// ============================================================================
function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-[#141414] pt-[70px] overflow-hidden">
      {/* Hero Gradient Background - EXACT POSITION */}
      <HeroGradient />

      {/* Hero Content */}
      <Container className="relative z-10 py-16 md:py-24">
        <div className="flex flex-col items-start max-w-[800px]">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-['Inter'] font-semibold text-[clamp(48px,8vw,96px)] leading-[1.1] text-white mb-4"
          >
            Think Beyond
          </motion.h1>

          {/* Highlight */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-['Inter'] font-semibold text-[clamp(36px,5vw,64px)] text-[#f8ec93] mb-6"
          >
            Discover Makeen
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-['Roboto'] font-medium text-[clamp(16px,1.5vw,20px)] leading-[1.6] text-white mb-8 max-w-[700px]"
          >
            Experience AI like never before. Generate predictions, ask questions in plain language, and gain clear, actionable insights, all through a seamless, intuitive interface. Designed for both beginners and professionals, Makeen makes complex AI transparent and understandable.
          </motion.p>

          {/* CTA Button - ALIGNED WITH TEXT */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.03, backgroundColor: "#8a75d4" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-lg bg-[#7760bd] text-white font-['Roboto'] font-medium text-lg shadow-lg transition-all"
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
    <section id="discover" ref={ref} className="relative bg-[rgba(20,20,20,0.6)] py-24 md:py-32">
      <Container>
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center font-['Inter'] font-semibold text-[clamp(40px,6vw,64px)] mb-16"
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
          />
          <FeatureCard
            title="Predictions Generation"
            description="Generate AI predictions instantly for text, images, or tables. Each result comes with clear explanations and confidence indicators."
            image={imgTorusKnot}
            gradient="linear-gradient(22.2062deg, rgb(20, 20, 20) 41.94%, rgb(43, 30, 86) 114.53%)"
            delay={0.2}
          />
          <FeatureCard
            title="Designed for Everyone"
            description="A simple, intuitive interface built for beginners, students, and non-technical users. Explore AI transparently and confidently without feeling lost."
            image={imgIcosahedron}
            gradient="linear-gradient(22.2062deg, rgb(20, 20, 20) 41.94%, rgb(43, 30, 86) 114.53%)"
            delay={0.3}
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
  delay = 0 
}: { 
  title: string; 
  description: string; 
  image: string; 
  background?: string; 
  gradient?: string;
  textColor?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
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
      <div className="p-6 flex flex-col h-full min-h-[400px]">
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
// MISSION SECTION
// ============================================================================
function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="mission" ref={ref} className="relative py-24 md:py-32 bg-[#141414]">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-[800px] mx-auto"
        >
          <h2 
            className="font-['Roboto'] font-bold text-[clamp(56px,8vw,96px)] mb-6"
            style={{
              backgroundImage: "linear-gradient(90.2102deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Our Mission
          </h2>
          <p className="font-['Radley'] text-[clamp(28px,4vw,40px)] text-[#da876b] mb-6">
            From Confusion To Clarity
          </p>
          <p className="font-['Roboto'] font-medium text-[clamp(18px,2vw,24px)] text-white">
            Makeen shows you how models think, helping you take control of decisions with confidence.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="bg-[#141414] border-t border-[#e1e4ed] py-8">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
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

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#b4b9c9] text-sm">
            <span>Copyright © 2025 Makeen</span>
            <span className="text-[#e1e4ed]">|</span>
            <span>All Rights Reserved</span>
            <span className="text-[#e1e4ed]">|</span>
            <a href="#" className="text-white hover:text-[#7760bd] transition-colors">Terms and Conditions</a>
            <span className="text-[#e1e4ed]">|</span>
            <a href="#" className="text-white hover:text-[#7760bd] transition-colors">Privacy Policy</a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a href="#" className="w-6 h-6 bg-[#404040] rounded flex items-center justify-center hover:bg-[#505050] transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M10.5 0H1.5C0.67 0 0 0.67 0 1.5V10.5C0 11.33 0.67 12 1.5 12H10.5C11.33 12 12 11.33 12 10.5V1.5C12 0.67 11.33 0 10.5 0ZM4 10H2V4H4V10ZM3 3.3C2.5 3.3 2.1 2.9 2.1 2.4C2.1 1.9 2.5 1.5 3 1.5C3.5 1.5 3.9 1.9 3.9 2.4C3.9 2.9 3.5 3.3 3 3.3ZM10 10H8V7C8 6.4 7.6 6 7 6C6.4 6 6 6.4 6 7V10H4V4H6V4.8C6.4 4.3 7.1 4 7.7 4C8.9 4 10 5.1 10 6.3V10Z" />
              </svg>
            </a>
            <a href="#" className="w-6 h-6 bg-[#404040] rounded flex items-center justify-center hover:bg-[#505050] transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M6 0C2.7 0 0 2.7 0 6C0 9.3 2.7 12 6 12C9.3 12 12 9.3 12 6C12 2.7 9.3 0 6 0ZM8.2 4.5H7.4C6.8 4.5 6.7 4.7 6.7 5.1V6H8.2L8 7.5H6.7V12H5V7.5H3.8V6H5V4.8C5 3.6 5.7 3 6.8 3H8.2V4.5Z" />
              </svg>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-[#141414] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <DiscoverSection />
      <MissionSection />
      <Footer />
    </div>
  );
}
