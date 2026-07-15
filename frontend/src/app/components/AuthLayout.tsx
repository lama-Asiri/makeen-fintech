import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import imgSidePic from '@/assets/947a2afba4a6a78c9261396d816fb9015697ffc4.png';
import imgLogo from '@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png';

interface AuthLayoutProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

export function AuthLayout({ children, onClose, title }: AuthLayoutProps) {
  return (
    <div className="bg-[#141414] min-h-screen w-full flex flex-col lg:flex-row overflow-hidden relative font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#7760bd] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#7760bd] opacity-5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Decorative Sidebar (Less Bulky) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] min-h-screen relative overflow-hidden bg-gradient-to-br from-[#2c2c2c] to-[#141414] border-r border-white/5 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <img
            alt=""
            className="w-full h-full object-cover grayscale mix-blend-overlay"
            src={imgSidePic}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#2c2c2c]" />
        </div>
        
        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-8">
              <img src={imgLogo} alt="Makeen" className="w-full h-full object-cover" />
            </div>
            <p className="text-[#7760bd] text-[12px] font-sans font-semibold uppercase tracking-[0.2em] mb-4">Explainable Credit Intelligence</p>
            <h1 className="font-serif font-medium text-4xl text-white mb-4 tracking-tight">Makeen</h1>
            <p className="text-[#9e9e9e] text-lg leading-relaxed">
              Unlock the power of conversational intelligence with our next-generation AI platform.
            </p>
          </motion.div>

          <div className="mt-12">
            <div className="h-px bg-white/[0.08]" />
            <div className="grid grid-cols-2">
              <div className="py-6 pr-6 text-center border-r border-white/[0.08]">
                <div className="font-tabular text-[#7760bd] font-semibold text-xl mb-1">SHAP + LIME</div>
                <div className="text-[#666] text-xs font-sans uppercase tracking-[0.15em]">XAI Methods</div>
              </div>
              <div className="py-6 pl-6 text-center">
                <div className="font-tabular text-[#7760bd] font-semibold text-xl mb-1">24/7</div>
                <div className="text-[#666] text-xs font-sans uppercase tracking-[0.15em]">Availability</div>
              </div>
            </div>
            <div className="h-px bg-white/[0.08]" />
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
