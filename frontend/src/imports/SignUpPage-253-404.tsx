import svgPaths from "./svg-j9scyyfsrf";
import imgSidePic from "@/assets/947a2afba4a6a78c9261396d816fb9015697ffc4.png";

function SideFrameJustToKnowWhereToPutSidePic() {
  return (
    <div className="absolute bg-[#382f5e] h-[1024px] left-0 overflow-clip top-0 w-[810px]" data-name="side frame just to know where to put side pic">
      <div className="absolute h-[1696px] left-[-140px] top-[-402px] w-[950px]" data-name="side pic">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSidePic} />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-white inset-[39.13%_0_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Enter your name
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame3 />
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_85.94%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Name
      </p>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <TextFeild />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-white inset-[39.13%_0_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Enter your email
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild1() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame4 />
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_86.98%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Email
      </p>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <TextFeild1 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Group4 />
      <Group1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-white inset-[39.13%_0_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Enter your password
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild2() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame5 />
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_76.82%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Password
      </p>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <TextFeild2 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame7 />
      <Group2 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-white inset-[39.13%_0_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`Enter your password `}</p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild3() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame6 />
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_56.77%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Confirm Password
      </p>
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <TextFeild3 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] relative shrink-0 w-full">
      <Frame8 />
      <Group3 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#fffcfe] text-[32px] text-center w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Get Started Now
      </p>
      <Frame9 />
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[20px]" data-name="check icon">
      <div className="absolute border border-[#fffcfe] border-solid inset-0 rounded-[2px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <CheckIcon />
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] relative shrink-0 text-[16px] text-black text-center w-[238px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="whitespace-pre-wrap">
          <span className="leading-[24px] text-[#fffcfe]">{`I agree to the `}</span>
          <span className="leading-[24px] text-[#da876b]">{`Terms & Conditions`}</span>
        </p>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame10 />
      <Frame />
    </div>
  );
}

function LargeButton() {
  return (
    <div className="bg-[#7760bd] content-stretch flex h-[56px] items-center justify-center overflow-clip px-[24px] py-[16px] relative rounded-[8px] shrink-0 w-[344px]" data-name="Large Button">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[16px] text-black text-center">Sign Up</p>
    </div>
  );
}

function SignUpForm() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[64px] items-center left-0 top-0 w-[384px]" data-name="Sign up form">
      <Frame12 />
      <LargeButton />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="h-0 relative shrink-0 w-[162.003px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 162.003 1">
            <line id="Line 14" stroke="var(--stroke-0, #404040)" x2="162.003" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#404040] text-[12px]">OR</p>
    </div>
  );
}

function OrSection() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="OR section">
      <Frame11 />
      <div className="h-0 relative shrink-0 w-[162.003px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 162.003 1">
            <line id="Line 14" stroke="var(--stroke-0, #404040)" x2="162.003" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function LogoGoogleg48Dp() {
  return (
    <div className="absolute left-[0.5px] size-[23px] top-[0.5px]" data-name="logo googleg 48dp">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="logo googleg 48dp">
          <path clipRule="evenodd" d={svgPaths.p15d7be00} fill="var(--fill-0, #4285F4)" fillRule="evenodd" id="Shape" />
          <path clipRule="evenodd" d={svgPaths.p1f2f62f0} fill="var(--fill-0, #34A853)" fillRule="evenodd" id="Shape_2" />
          <path clipRule="evenodd" d={svgPaths.p2f8c9600} fill="var(--fill-0, #FBBC05)" fillRule="evenodd" id="Shape_3" />
          <path clipRule="evenodd" d={svgPaths.p14f01400} fill="var(--fill-0, #EA4335)" fillRule="evenodd" id="Shape_4" />
          <g id="Shape_5" />
        </g>
      </svg>
    </div>
  );
}

function GoogleLogo() {
  return (
    <div className="bg-white relative shrink-0 size-[24px]" data-name="Google Logo">
      <LogoGoogleg48Dp />
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white content-stretch flex gap-[15px] items-start left-[calc(50%-0.5px)] p-[15px] rounded-[10px] top-1/2">
      <GoogleLogo />
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[20px] text-[rgba(0,0,0,0.54)]" style={{ fontVariationSettings: "'wdth' 100" }}>{` Google`}</p>
    </div>
  );
}

function ContinueWithGoogleCentreFixed() {
  return (
    <div className="bg-white col-1 h-[54px] ml-0 mt-0 relative rounded-[10px] row-1 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08),0px_2px_3px_0px_rgba(0,0,0,0.17)] w-[180px]" data-name="Continue with Google / Centre / Fixed">
      <Frame1 />
    </div>
  );
}

function AppleLogo() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Apple Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Apple Logo">
          <rect fill="black" height="24" width="24" />
          <path d={svgPaths.p2c445b80} fill="var(--fill-0, white)" id="path4" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-black content-stretch flex gap-[15px] items-start left-1/2 p-[15px] rounded-[10px] top-1/2">
      <AppleLogo />
      <p className="font-['SF_Pro_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-white">Apple</p>
    </div>
  );
}

function ContinueWithAppleCentreFixed() {
  return (
    <div className="bg-black col-1 h-[54px] ml-[204px] mt-0 relative rounded-[10px] row-1 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08),0px_2px_3px_0px_rgba(0,0,0,0.17)] w-[180px]" data-name="Continue with Apple / Centre / Fixed">
      <Frame2 />
    </div>
  );
}

function GoogleApple() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Google/Apple">
      <ContinueWithGoogleCentreFixed />
      <ContinueWithAppleCentreFixed />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <p className="col-1 font-['Roboto:Regular',sans-serif] font-normal ml-0 mt-0 relative row-1 text-[#fffcfe] text-[0px] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="leading-[24px]">{`Have an account?  `}</span>
        <span className="leading-[24px] text-[#da876b]" style={{ fontVariationSettings: "'wdth' 100" }}>{` `}</span>
      </p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0">
      <Group />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#da876b] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Login
      </p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <GoogleApple />
      <Frame13 />
    </div>
  );
}

function OtherOptionsOfSignUpFromsLoginGroup() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 top-[676px] w-[384px]" data-name="other options of sign up froms & login group">
      <OrSection />
      <Frame14 />
    </div>
  );
}

function SignUp() {
  return (
    <div className="-translate-y-1/2 absolute h-[825px] left-[933px] top-[calc(50%-0.5px)] w-[384px]" data-name="Sign Up">
      <SignUpForm />
      <OtherOptionsOfSignUpFromsLoginGroup />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="bg-[#141414] relative size-full" data-name="Sign Up page">
      <SideFrameJustToKnowWhereToPutSidePic />
      <SignUp />
    </div>
  );
}