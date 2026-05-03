import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Check, X, HelpCircle } from 'lucide-react';
import { ComingSoonModal } from '@/app/components/ComingSoonModal';
import { EnterpriseContactModal } from '@/app/components/EnterpriseContactModal';

interface SubscriptionPageProps {
  onBack?: () => void;
  onOpenHelpCenter?: () => void;
}

interface PlanFeature {
  name: string;
  included: boolean;
  comingSoon?: boolean;
}

interface Plan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  buttonText: string;
  buttonVariant: 'current' | 'primary' | 'secondary';
  isPopular?: boolean;
  note?: string;
  features: PlanFeature[];
}

type BillingPeriod = 'monthly' | 'yearly';

export function SubscriptionPage({ onBack, onOpenHelpCenter }: SubscriptionPageProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showEnterpriseContactModal, setShowEnterpriseContactModal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  // Refs for scroll animations
  const helpCtaRef = useRef<HTMLDivElement>(null);

  const helpCtaInView = useInView(helpCtaRef, { once: true, amount: 0.3 });

  // Handle Escape key (only when modal is not open)
  useEffect(() => {
    if (showComingSoonModal || showEnterpriseContactModal) return; // Let modal handle escape

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onBack, showComingSoonModal, showEnterpriseContactModal]);

  // Lock body scroll when Subscription page is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      badge: 'Current',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      description: 'Core features for getting started',
      buttonText: 'Current Plan',
      buttonVariant: 'current',
      note: 'Basic usage limits apply (future configuration)',
      features: [
        { name: 'Upload Excel / CSV datasets', included: true },
        { name: 'Natural Language Queries (NLQ)', included: true },
        { name: 'Basic predictions', included: true },
        { name: 'Single-prediction explanations (SHAP / LIME)', included: true },
        { name: 'View prediction results in chat', included: true },
        { name: 'Limited history access', included: true },
        { name: 'Basic export', included: true },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Most Popular',
      monthlyPrice: '$9',
      yearlyPrice: '$90',
      description: 'Advanced features for power users',
      buttonText: 'Upgrade',
      buttonVariant: 'primary',
      isPopular: true,
      features: [
        { name: 'Everything in Free', included: true },
        { name: 'Advanced explanations (multi-feature insights)', included: true, comingSoon: true },
        { name: 'Side-by-side explanation comparison', included: true, comingSoon: true },
        { name: 'Full export options (PDF / Excel)', included: true, comingSoon: true },
        { name: 'Extended history & version tracking', included: true, comingSoon: true },
        { name: 'Larger dataset limits', included: true, comingSoon: true },
        { name: 'Priority support', included: true, comingSoon: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      description: 'Full power for teams and organizations',
      buttonText: 'Contact Sales',
      buttonVariant: 'secondary',
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'API access for external systems', included: true, comingSoon: true },
        { name: 'Custom deployment options', included: true, comingSoon: true },
        { name: 'Advanced governance & audit reports', included: true, comingSoon: true },
        { name: 'Dedicated account manager', included: true, comingSoon: true },
        { name: 'SLA & uptime guarantees', included: true, comingSoon: true },
        { name: 'Custom branding & theming', included: true, comingSoon: true },
      ],
    },
  ];

  const handlePlanClick = (planId: string) => {
    if (planId === 'enterprise') {
      setShowEnterpriseContactModal(true);
    } else if (planId !== 'free') {
      setShowComingSoonModal(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] text-white overflow-y-auto overflow-x-hidden z-[100]" style={{ height: '100vh' }}>
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.6) 0%, rgba(255, 152, 0, 0.4) 50%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute top-[40%] left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 152, 0, 0.5) 0%, rgba(255, 193, 7, 0.3) 50%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      {/* Close X Button (top-right) - matching Help Center / Terms pattern */}
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-[8px] right-[8px] z-[101] p-[12px] text-[#999] hover:text-[#fffcfe] hover:bg-[#2c2c2c] rounded-[8px] transition-all focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
          aria-label="Close Subscription"
        >
          <X className="w-[24px] h-[24px]" />
        </button>
      )}

      {/* Content Container */}
      <div className="relative max-w-[1400px] mx-auto px-[24px] md:px-[40px] py-[60px] min-h-full">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-[48px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Title */}
          <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[2.25rem] md:text-[48px] leading-[1.2] mb-[16px]">
            Choose the plan that fits your workflow
          </h1>

          {/* Subtitle */}
          <p className="font-['Inter:Regular',sans-serif] text-[1.125rem] md:text-[1.25rem] text-[#b0b0b0] max-w-[700px] mx-auto mb-[24px] leading-[1.6]">
            Start free with core predictions + explanations. Upgrade anytime for advanced features and future integrations.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-[8px] mb-[16px]">
            <button
              onClick={() => setBillingPeriod('monthly')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setBillingPeriod('monthly');
                }
              }}
              className={`px-[24px] py-[10px] rounded-full font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.875rem] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
                billingPeriod === 'monthly'
                  ? 'bg-[#7760bd]/20 text-[#a89bd9] border-2 border-[#7760bd]'
                  : 'bg-transparent text-[#808080] border-2 border-[#444] hover:border-[#666] hover:text-[#b0b0b0]'
              }`}
              aria-pressed={billingPeriod === 'monthly'}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setBillingPeriod('yearly');
                }
              }}
              className={`px-[24px] py-[10px] rounded-full font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.875rem] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
                billingPeriod === 'yearly'
                  ? 'bg-[#7760bd]/20 text-[#a89bd9] border-2 border-[#7760bd]'
                  : 'bg-transparent text-[#808080] border-2 border-[#444] hover:border-[#666] hover:text-[#b0b0b0]'
              }`}
              aria-pressed={billingPeriod === 'yearly'}
            >
              Yearly
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] md:gap-[32px] mb-[120px]">
          {plans.map((plan, index) => {
            const displayPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const priceSuffix = plan.id === 'free' || displayPrice === 'Custom' 
              ? '' 
              : billingPeriod === 'monthly' 
                ? '/month' 
                : '/year';

            return (
              <motion.div
                key={plan.id}
                className={`relative bg-[#242424] rounded-[16px] border transition-all duration-300 hover:shadow-2xl ${
                  plan.isPopular
                    ? 'border-[#7760bd] shadow-[0_0_30px_rgba(119,96,189,0.2)] hover:shadow-[0_0_40px_rgba(119,96,189,0.3)] hover:-translate-y-[4px] md:scale-105'
                    : 'border-[#333] hover:border-[#7760bd]/50 hover:-translate-y-[2px]'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-[12px] left-1/2 -translate-x-1/2">
                    <div className={`px-[16px] py-[6px] rounded-full shadow-lg ${
                      plan.isPopular 
                        ? 'bg-[#7760bd]' 
                        : 'border border-[#444] bg-[#2a2a2a]'
                    }`}>
                      <span className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.75rem] uppercase tracking-wide ${
                        plan.isPopular ? 'text-white' : 'text-[#9e9e9e]'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-[32px]">
                  {/* Plan Name */}
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[1.75rem] mb-[8px]">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-[12px] min-h-[60px]">
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[42px] leading-none">
                      {displayPrice}
                    </span>
                    {priceSuffix && (
                      <span className="font-['Inter:Regular',sans-serif] text-[1.125rem] text-[#9e9e9e]">
                        {priceSuffix}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="font-['Inter:Regular',sans-serif] text-[0.875rem] text-[#b0b0b0] mb-[24px] min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanClick(plan.id)}
                    disabled={plan.buttonVariant === 'current'}
                    className={`w-full py-[14px] rounded-[10px] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.9375rem] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#242424] ${
                      plan.buttonVariant === 'current'
                        ? 'bg-[#333] text-[#808080] cursor-not-allowed'
                        : plan.buttonVariant === 'primary'
                        ? 'bg-[#7760bd] text-white hover:bg-[#8870cd] hover:shadow-[0_0_20px_rgba(119,96,189,0.4)] active:scale-[0.98]'
                        : 'bg-transparent border-2 border-[#7760bd] text-[#7760bd] hover:bg-[#7760bd]/10 hover:border-[#8870cd] active:scale-[0.98]'
                    }`}
                    aria-label={`${plan.buttonText} for ${plan.name} plan`}
                  >
                    {plan.buttonText}
                  </button>

                  {/* Note */}
                  {plan.note && (
                    <p className="font-['Inter:Regular',sans-serif] text-[0.75rem] text-[#808080] mt-[12px] italic">
                      {plan.note}
                    </p>
                  )}

                  {/* Features List */}
                  <div className="mt-[32px] space-y-[12px]">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-[12px]">
                        <div className={`flex-shrink-0 w-[20px] h-[20px] rounded-full flex items-center justify-center mt-[2px] ${
                          feature.included 
                            ? 'bg-[#7760bd]/20' 
                            : 'bg-[#333]'
                        }`}>
                          {feature.included ? (
                            <Check className="w-[12px] h-[12px] text-[#7760bd]" />
                          ) : (
                            <X className="w-[12px] h-[12px] text-[#666]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`font-['Inter:Regular',sans-serif] text-[0.875rem] ${
                            feature.included ? 'text-[#e0e0e0]' : 'text-[#666]'
                          }`}>
                            {feature.name}
                          </span>
                          {feature.comingSoon && (
                            <span className="ml-[8px] px-[6px] py-[2px] rounded-[4px] bg-[#7760bd]/20 font-['Inter:Regular',sans-serif] text-[0.625rem] text-[#a89bd9] uppercase tracking-wide">
                              Soon
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Help Center CTA */}
        <motion.div
          ref={helpCtaRef}
          initial={{ opacity: 0, y: 40 }}
          animate={helpCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-[80px]"
        >
          <div className="max-w-[700px] mx-auto bg-[#242424] border border-[#333] rounded-[16px] p-[32px] md:p-[40px] text-center">
            {/* Icon */}
            <div className="flex items-center justify-center mb-[16px]">
              <div className="w-[48px] h-[48px] rounded-[12px] bg-[#7760bd]/20 border border-[#7760bd]/40 flex items-center justify-center">
                <HelpCircle className="w-[24px] h-[24px] text-[#a89bd9]" />
              </div>
            </div>

            {/* Title */}
            <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[1.25rem] md:text-[1.5rem] mb-[12px]">
              Questions about subscriptions?
            </h3>

            {/* Body */}
            <p className="font-['Inter:Regular',sans-serif] text-[0.9375rem] text-[#b0b0b0] leading-[1.6] mb-[24px]">
              Find answers in the Help Center under "Subscriptions."
            </p>

            {/* Button */}
            {onOpenHelpCenter ? (
              <button
                onClick={onOpenHelpCenter}
                className="px-[24px] py-[12px] rounded-[10px] bg-transparent border-2 border-[#7760bd] text-[#7760bd] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[0.9375rem] hover:bg-[#7760bd]/10 hover:border-[#8870cd] transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#242424]"
              >
                Open Help Center
              </button>
            ) : (
              <p className="font-['Inter:Regular',sans-serif] text-[0.8125rem] text-[#808080] italic">
                Help Center integration coming soon
              </p>
            )}
          </div>
        </motion.div>

        {/* Footer Micro-copy */}
        <div className="text-center pt-[40px] border-t border-[#333]">
          <p className="font-['Inter:Regular',sans-serif] text-[0.8125rem] text-[#808080] leading-[1.6] max-w-[600px] mx-auto">
            Subscriptions are not active yet. This page represents the planned pricing structure for future releases.
          </p>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
      />

      {/* Enterprise Contact Modal */}
      <EnterpriseContactModal
        isOpen={showEnterpriseContactModal}
        onClose={() => setShowEnterpriseContactModal(false)}
      />
    </div>
  );
}