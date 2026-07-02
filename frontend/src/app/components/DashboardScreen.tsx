interface DashboardScreenProps {
  onLogout: () => void;
}

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  return (
    <div className="bg-[#141414] relative size-full flex items-center justify-center">
      <div className="bg-[#2a2a2a] rounded-[12px] p-[48px] max-w-[600px] w-full mx-4 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto size-16 text-[#7760bd]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1
          className="font-['Roboto:Bold',sans-serif] font-bold text-[2.5rem] leading-[48px] text-[#fffcfe] mb-4"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Welcome to Makeen Fintech!
        </h1>

        <p
          className="font-['Roboto:Regular',sans-serif] font-normal text-[1.125rem] leading-[28px] text-[#fffcfe] mb-8 opacity-80"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          You have successfully logged in. Upload applicant data to start assessing credit risk with
          AI-powered, explainable decisions.
        </p>

        <button
          onClick={onLogout}
          className="bg-[#7760bd] hover:bg-[#6952a8] active:bg-[#5b4692] font-['Inter:Regular',sans-serif] font-normal text-[1rem] leading-[20px] text-black px-[32px] py-[16px] rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7760bd] focus:ring-offset-2 focus:ring-offset-[#141414]"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
