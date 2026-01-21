import { useState } from "react";
import svgPaths from "./imports/svg-hhup31ts9l";
import imgImage39 from "./asset/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png";
import imgIcosahedron from "./asset/b7e275b78aaa89a4a341109046d192edcfc5b207.png";
import imgTorusKnot from "./asset/ca61b143546dc6d680b519138244975fd48d3cd6.png";
import imgDarkMetallic from "./asset/eb1c030a1accb78fa3337e0e6602e2a5f5b8a9ff.png";
import imgEllipse1700 from "./asset/913344e9d2dc0748ee55530016e90f39fe0ea854.png";
import imgEllipse1701 from "./asset/0135563e88cb529bf78d0687ac5dd9ef20f1cddc.png";
import imgEllipse1702 from "./asset/e70ad9c181cd1c602d57488904eebe2d61f4b8cb.png";
import imgEllipse1703 from "./asset/6e5811598e554f2ed4d7062da58dc82d31f49945.png";
import imgBlack97Designrip from "./asset/4c2b0c6a1882a2437352038134d50fc8dc273205.png";
import imgOurMissonPhoto from "./asset/f0e48cf661e8b616f03050e3b9117048ab1fd1df.png";
import imgImage50 from "./asset/56eebf0771904b27a256cae1f6e0a8245fa4bc66.png";

// Gradient component
function Gradient() {
  return (
    <div className="h-[1307.224px] relative w-[1753.401px]" data-name="Gradient">
      <div className="absolute inset-[-30.6%_-22.81%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2553.4 2107.22">
          <g id="Gradient">
            <g filter="url(#filter0_f_1_668)" id="Ellipse 10">
              <ellipse cx="1199.56" cy="1028.51" fill="#2C147B" rx="799.558" ry="628.507" />
            </g>
            <g filter="url(#filter1_f_1_668)" id="Ellipse 8">
              <ellipse cx="1353.84" cy="1078.72" fill="#67579F" rx="799.558" ry="628.507" />
            </g>
            <g filter="url(#filter2_f_1_668)" id="Ellipse 7">
              <ellipse cx="1277.15" cy="1078.72" fill="#FF916C" rx="491.442" ry="452.776" />
            </g>
            <g filter="url(#filter3_f_1_668)" id="Ellipse 6">
              <ellipse cx="1452.77" cy="1078.72" fill="#F8EC93" rx="406.586" ry="365.807" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2057.01" id="filter0_f_1_668" width="2399.12" x="1.15663e-05" y="3.82943e-06">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_668" stdDeviation="200" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2057.01" id="filter1_f_1_668" width="2399.12" x="154.285" y="50.2095">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_668" stdDeviation="200" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1605.55" id="filter2_f_1_668" width="1682.88" x="435.712" y="275.94">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_668" stdDeviation="175" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1331.61" id="filter3_f_1_668" width="1413.17" x="746.181" y="412.909">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_668" stdDeviation="150" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// Navbar
function Navbar() {
  return (
    <div className="bg-[#141414] h-[70px] w-full shadow-[0px_4px_4px_0px_rgba(11,5,5,0.25)] fixed top-0 left-0 z-50">
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-[56px]">
        <div className="flex items-center gap-3">
          <img alt="Makeen Logo" className="h-[56px] w-[60px] rounded-[6px]" src={imgImage39} />
          <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[#fffcfe] text-[24px]">
            Makeen
          </p>
        </div>
        
        <div className="flex items-center gap-[32px]">
          <div className="h-[40px] w-[2px] bg-gray-600 rounded-[2px]"></div>
          <nav className="flex gap-[64px]">
            <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">Features</button>
            <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">About Us</button>
            <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">FAQ</button>
            <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">Contact Us</button>
          </nav>
        </div>

        <div className="flex gap-4">
          <button className="px-[12px] py-[20px] rounded-[8px] text-white text-[16px] hover:bg-[rgba(56,47,94,0.3)] transition-colors">
            Login
          </button>
          <button className="px-[12px] py-[20px] bg-[#7760bd] rounded-[8px] text-white text-[16px] font-extrabold hover:bg-[#8870cd] transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[70px]">
      <div className="absolute inset-0 bg-[#141414]"></div>
      
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-80">
        <Gradient />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-[119px] py-[100px]">
        <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[96px] text-[#fffcfe] leading-tight mb-6">
          Think Beyond
        </h1>
        <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[64px] text-[#f8ec93] leading-tight mb-8">
          Discover Makeen
        </h2>
        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[20px] text-[#fffcfe] leading-[28px] max-w-[806px] mb-12">
          Experience AI like never before. Generate predictions, ask questions in plain language, and gain clear, actionable insights, all through a seamless, intuitive interface. Designed for both beginners and professionals, Makeen makes complex AI transparent and understandable.
        </p>
        
        <button className="bg-[#7760bd] flex items-center gap-[8px] px-[32px] py-[15px] rounded-[8px] hover:bg-[#8870cd] transition-colors">
          <span className="font-['Roboto:Medium',sans-serif] font-medium text-[20px] text-white">Start now</span>
          <svg className="w-[15px] h-[13px]" fill="none" viewBox="0 0 15.9 13.2551">
            <path d={svgPaths.p33bb4580} fill="white" />
          </svg>
        </button>
      </div>
    </section>
  );
}

// Discover Makeen Section
function DiscoverSection() {
  return (
    <section className="relative bg-[rgba(20,20,20,0.6)] py-[150px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <h2 className="text-center text-[64px] font-['Inter:Semi_Bold',sans-serif] font-semibold mb-[100px]"
          style={{
            backgroundImage: "linear-gradient(90.4312deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
          Discover Makeen
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] items-stretch">
          {/* Card 3 - Large white card */}
          <div className="bg-[#fffcfe] rounded-[16px] p-[28px] flex flex-col h-full">
            <h3 className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[24px] text-[#00000a] mb-4">
              Ask Questions in Plain Language
            </h3>
            <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-black leading-[24px] mb-8">
              Type your questions in natural English, no coding or technical skills needed. Get answers that are easy to follow and understand.
            </p>
            <div className="mt-auto flex justify-center">
              <img alt="" className="w-[250px] h-[249px]" src={imgDarkMetallic} />
            </div>
          </div>

          {/* Right column cards */}
          <div className="flex flex-col gap-[24px]">
            {/* Card 2 - Predictions Generation */}
      <div
  className="rounded-[16px] p-[28px] pr-[320px] min-h-[800px] relative overflow-hidden"
  style={{
    backgroundImage:
      "linear-gradient(22.2062deg, rgb(20, 20, 20) 41.94%, rgb(43, 30, 86) 114.53%)",
  }}
>
  {/* image */}
  <div className="absolute right-[27px] top-[8px] z-0 pointer-events-none">
    <img alt="" className="w-[250px] h-[249px]" src={imgTorusKnot} />
  </div>

  {/* text */}
  <div className="relative z-10">
    <h3 className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[24px] text-white text-center mb-4">
      Predictions Generation
    </h3>
    <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-[#fffcfe] leading-[24px] max-w-[445px]">
      Generate AI predictions instantly for text, images, or tables. Each result comes with clear explanations and confidence indicators.
    </p>
  </div>
</div>


            {/* Card 1 - Designed for Everyone */}
         <div
  className="rounded-[16px] p-[28px] pt-[140px] min-h-[420px] relative overflow-hidden"
  style={{
    backgroundImage:
      "linear-gradient(22.2062deg, rgb(20, 20, 20) 41.94%, rgb(43, 30, 86) 114.53%)",
  }}
>
     <div className="absolute right-[27px] top-[27px]">
                <img alt="" className="w-[268px] h-[249px]" src={imgIcosahedron} />
              </div>
              <h3 className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[24px] text-white text-center mb-4">
                Designed for Everyone
              </h3>
              <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-[#fffcfe] leading-[24px] max-w-[445px]">
                A simple, intuitive interface built for beginners, students, and non-technical users. Explore AI transparently and confidently without feeling lost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mission Section
function MissionSection() {
  return (
    <section className="relative py-[150px] bg-[#141414]">
      <div className="absolute right-0 top-0 w-[462px] h-[600px] overflow-hidden">
        <img alt="" className="w-full h-full object-cover object-top opacity-70" src={imgOurMissonPhoto} />
      </div>
      
      <div className="max-w-[1440px] mx-auto px-[120px] relative z-10">
        <h2 className="text-[96px] font-['Roboto:Bold',sans-serif] font-bold leading-[40px] mb-8"
          style={{
            backgroundImage: "linear-gradient(90.2102deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
          Our Mission
        </h2>
        <p className="font-['Radley:Regular',sans-serif] text-[40px] text-[#da876b] leading-[40px] mb-6">
          From Confusion To Clarity
        </p>
        <p className="font-['Roboto:Medium',sans-serif] font-medium text-[24px] text-[#fffcfe] leading-[40px] max-w-[666px]">
          Makeen shows you how models think, helping you take control of decisions with confidence.
        </p>
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  const teamMembers = [
    {
      name: "Lama Asiri",
      role: "Integration & Project Leader",
      description: "Connects all system components and leads the team to keep everything aligned and working end-to-end.",
      image: imgEllipse1700,
      linkedin: "https://www.linkedin.com/in/lamak2asiri"
    },
    {
      name: "Shahad Alsomali",
      role: "Frontend Developer",
      description: "Develops clean, dynamic React interfaces featuring interactive data visualizations and seamless user experiences.",
      image: imgEllipse1701,
      linkedin: "https://www.linkedin.com/in/shahad-w-alsomali-11509b247"
    },
    {
      name: "Reem Alhijris",
      role: "Backend Developer",
      description: "Builds SHAP/LIME explanations and turns model behavior into clear, understandable insights.",
      image: imgEllipse1702,
      linkedin: "https://www.linkedin.com/in/reem-alhijris"
    },
    {
      name: "Rahaf Almalki",
      role: "Backend Developer",
      description: "Ensures the models run correctly, handles data processing, and keeps the backend stable and functional.",
      image: imgEllipse1703,
      linkedin: "https://www.linkedin.com/in/rahafalmalkics"
    }
  ];

  return (
    <section className="relative py-[150px] bg-[#141414]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none rotate-[22.643deg]">
        <img alt="" className="w-[833px] h-[734px] object-cover" src={imgBlack97Designrip} />
      </div>

      <div className="max-w-[1440px] mx-auto px-[120px] relative z-10">
        <h2 className="text-center text-[96px] font-['Roboto:Bold',sans-serif] font-bold leading-[40px] mb-[120px]"
          style={{
            backgroundImage: "linear-gradient(90.2703deg, rgb(153, 151, 152) 0%, rgb(230, 228, 229) 29.815%, rgb(255, 252, 254) 65.384%, rgb(153, 151, 152) 99.992%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
          Meet The Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {teamMembers.map((member, index) => (
            <div key={index} className="relative">
              <div className="bg-[#D9D9D9] rounded-[16px] p-[16px] pb-[60px] relative">
                <div className="flex justify-center mb-4">
                  <img alt={member.name} className="w-[110px] h-[110px] rounded-full" src={member.image} />
                </div>
                <h3 className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[20px] text-black text-center mb-2">
                  {member.name}
                </h3>
                <p className="font-['Roboto:Medium',sans-serif] font-medium text-[16px] text-[#7760bd] text-center mb-4">
                  {member.role}
                </p>
                <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-[#333] leading-[24px] text-center">
                  {member.description}
                </p>

                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-[16px] right-[16px] bg-[#484848] px-[16px] py-[8px] rounded-[12px] flex items-center gap-[8px] hover:bg-[#585858] transition-colors"
                >
                  <span className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[16px] text-[#fffcfe]">
                    Visit
                  </span>
                  <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p3d991900} stroke="#FFFCFE" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section with expandable items
function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqData = [
    {
      icon: svgPaths.p1fba0600,
      title: "Platform Basics",
      answer: "Makeen is an AI platform designed to make machine learning accessible to everyone. Whether you're a beginner or a professional, you can use Makeen to generate predictions, ask questions in plain language, and gain clear insights into how AI models make decisions."
    },
    {
      icon: svgPaths.p269a0600,
      iconSecondary: svgPaths.p3e666400,
      title: "Uploading & Data Handling",
      answer: "You can easily upload your datasets in various formats including CSV, Excel, and JSON. Makeen automatically processes your data and prepares it for analysis. Your data is securely stored and you have full control over how it's used."
    },
    {
      icon: svgPaths.p20943c20,
      title: "Natural Language Query (NLQ)",
      answer: "With Natural Language Query, you can ask questions about your data in plain English. No need to write complex SQL queries or code. Just type your question like 'What are the top 5 customers by revenue?' and Makeen will understand and provide the answer."
    },
    {
      icon: svgPaths.p8c84300,
      title: "Predictions & Explanations",
      answer: "Makeen generates AI predictions for your data and provides clear explanations using SHAP and LIME techniques. You'll see not just what the model predicts, but why it made that prediction, with confidence scores and feature importance visualizations."
    },
    {
      icon: svgPaths.p2b4c1400,
      title: "User Account & Security",
      answer: "Your account is protected with industry-standard security measures. All data is encrypted both in transit and at rest. You have complete control over your data and can delete it at any time. We never share your data with third parties."
    },
    {
      icon: svgPaths.p24abca80,
      title: "History & Exports",
      answer: "Makeen keeps a history of all your queries and predictions, making it easy to track your work over time. You can export your results in multiple formats including PDF, Excel, and CSV. All exports maintain the full context of your analysis."
    }
  ];

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section className="relative py-[150px] bg-[#141414]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <h2 className="font-['Roboto:Bold',sans-serif] font-bold text-[64px] text-white leading-[40px] mb-[100px]">
          Frequently Asked Questions
        </h2>

        <div className="max-w-[792px] mx-auto flex flex-col gap-[43px]">
          {faqData.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            
            return (
              <div
                key={index}
                className="bg-[#404040] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-[16px] flex items-center justify-between hover:bg-[#4a4a4a] transition-colors"
                >
                  <div className="flex items-center gap-[22px]">
                    <div className="w-[26px] h-[26px] flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 26 26">
                        <path d={item.icon} fill="white" />
                      </svg>
                    </div>
                    <h3 className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[20px] text-white text-left">
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
                      <path d="M17 15L12 10L7 15" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-[16px] pb-[16px] pt-[8px]">
                    <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-[#e0e0e0] leading-[24px] pl-[48px]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="relative py-[100px] bg-[#141414]">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 rotate-90 opacity-50">
        <img alt="" className="w-[313px] h-[1229px] rounded-[16px] object-cover" src={imgImage50} />
      </div>

      <div className="max-w-[1440px] mx-auto px-[120px] relative z-10 text-center">
        <h2 className="font-['Roboto:Regular',sans-serif] text-[64px] text-white leading-tight mb-[84px]">
          Ready To Try Makeen?
        </h2>

        <div className="flex gap-[24px] justify-center">
          <button className="bg-[#7760bd] flex items-center gap-[8px] px-[32px] py-[15px] rounded-[8px] hover:bg-[#8870cd] transition-colors">
            <span className="font-['Roboto:Medium',sans-serif] font-medium text-[20px] text-white">Start now</span>
            <svg className="w-[15px] h-[13px]" fill="none" viewBox="0 0 15.9 13.2551">
              <path d={svgPaths.p33bb4580} fill="white" />
            </svg>
          </button>

          <button className="border-2 border-[#fffcfe] flex items-center gap-[8px] px-[32px] py-[15px] rounded-[8px] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <span className="font-['Roboto:Medium',sans-serif] font-medium text-[20px] text-white">Learn More</span>
            <svg className="w-[15px] h-[13px]" fill="none" viewBox="0 0 15.9 13.2551">
              <path d={svgPaths.p33bb4580} fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-[#141414] border-t border-[#e1e4ed]">
      <div className="max-w-[1440px] mx-auto px-[163px] py-[80px]">
        <div className="flex items-center justify-between mb-[60px]">
          <div className="flex items-center gap-3">
            <img alt="Makeen Logo" className="h-[56px] w-[60px] rounded-[6px]" src={imgImage39} />
            <p className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[#fffcfe] text-[24px]">
              Makeen
            </p>
          </div>

          <div className="flex items-center gap-[32px]">
            <div className="h-[40px] w-[2px] bg-gray-600 rounded-[2px]"></div>
            <nav className="flex gap-[64px]">
              <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">Features</button>
              <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">About Us</button>
              <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">FAQ</button>
              <button className="text-white text-[16px] hover:text-[#7760bd] transition-colors">Contact Us</button>
            </nav>
          </div>

          <div className="flex gap-[8px]">
            <a href="#" className="bg-[#404040] w-[24px] h-[24px] rounded flex items-center justify-center hover:bg-[#505050] transition-colors">
              <svg className="w-full h-full" fill="none" viewBox="0 0 23.4783 24">
                <rect fill="#404040" height="24" rx="4" width="23.4783" />
                <path d={svgPaths.p498bc80} fill="white" />
              </svg>
            </a>
            <a href="#" className="bg-[#404040] w-[24px] h-[24px] rounded flex items-center justify-center hover:bg-[#505050] transition-colors">
              <svg className="w-full h-full" fill="none" viewBox="0 0 23.4783 24">
                <rect fill="#404040" height="24" rx="4" width="23.4783" />
                <path d={svgPaths.pc883480} fill="white" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-[#e1e4ed] pt-[17px]">
          <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-center leading-[24px]">
            <span className="text-[#b4b9c9]">Copyright © 2025 Makeen </span>
            <span className="text-[#e1e4ed]">| </span>
            <span className="text-[#b4b9c9]">All Rights Reserved </span>
            <span className="text-[#e1e4ed]">| </span>
            <span className="text-[#fffcfe]">Terms and Conditions</span>
            <span className="text-[#e1e4ed]"> | </span>
            <span className="text-[#fffcfe]">Privacy Policy</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main App Component
export default function App() {
  return (
    <div className="bg-[#141414] min-h-screen">
      <Navbar />
      <HeroSection />
      <DiscoverSection />
      <MissionSection />
      <TeamSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
