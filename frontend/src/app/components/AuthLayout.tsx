import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import imgSidePic from '@/assets/947a2afba4a6a78c9261396d816fb9015697ffc4.png';

interface AuthLayoutProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

export function AuthLayout({ children, onClose, title }: AuthLayoutProps) {
  return (
    <div className="bg-[#0f0f0f] min-h-screen w-full flex flex-col lg:flex-row overflow-hidden relative font-['Roboto',sans-serif]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#7760bd] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#da876b] opacity-5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Decorative Sidebar (Less Bulky) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] min-h-screen relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-r border-white/5 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <img
            alt=""
            className="w-full h-full object-cover grayscale mix-blend-overlay"
            src={imgSidePic}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-[#1a1a1a]" />
        </div>
        
        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-[#7760bd] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#7760bd]/20">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Makeen AI</h1>
            <p className="text-[#999] text-lg leading-relaxed">
              Unlock the power of conversational intelligence with our next-generation AI platform.
            </p>
          </motion.div>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[#7760bd] font-bold text-2xl mb-1">SHAP + LIME</div>
              <div className="text-[#666] text-xs uppercase tracking-wider">XAI Methods</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[#7760bd] font-bold text-2xl mb-1">24/7</div>
              <div className="text-[#666] text-xs uppercase tracking-wider">Availability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 lg:px-16 relative z-10 overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="fixed top-6 right-6 lg:right-12 text-[#666] hover:text-white transition-all duration-200 z-50 p-2 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full max-w-[440px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
