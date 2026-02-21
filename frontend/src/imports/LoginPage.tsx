import svgPaths from "./svg-actff4drkm";
import imgSideFrameJustToKnowWhereToPutSidePic from "@/assets/947a2afba4a6a78c9261396d816fb9015697ffc4.png";

function SidePic() {
  return <div className="absolute bg-[#382f5e] h-[1024px] left-[-5.5px] top-[-1.45px] w-[810px]" data-name="side pic" />;
}

function Frame2() {
  return (
    <div className="absolute bg-[#fffcfe] inset-[39.13%_10.42%_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Enter your email
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame2 />
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_86.98%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Email
      </p>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <TextFeild />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#fffcfe] inset-[39.13%_10.42%_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Enter your password
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild1() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame3 />
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_76.82%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Password
      </p>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <TextFeild1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] relative shrink-0 w-full">
      <Group />
      <Group2 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <p className="css-4hzbpn font-['Roboto:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#fffcfe] text-[32px] text-center w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Welcome back!
      </p>
      <Frame5 />
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="col-1 ml-0 mt-[2px] relative rounded-[8px] row-1 size-[20px]" data-name="check icon">
      <div className="absolute border border-[#fffcfe] border-solid inset-0 rounded-[2px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <p className="col-1 css-4hzbpn font-['Roboto:Regular',sans-serif] font-normal h-[15px] leading-[24px] ml-[27.29px] mt-0 relative row-1 text-[#fffcfe] text-[16px] w-[165.707px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Remember Me
      </p>
      <CheckIcon />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[64px] items-center relative shrink-0 w-full">
      <Group1 />
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#da876b] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Forgot Password?
      </p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
      <Frame6 />
      <Frame4 />
    </div>
  );
}

function LargeButton() {
  return (
    <div className="bg-[#7760bd] content-stretch flex h-[56px] items-center justify-center overflow-clip px-[24px] py-[16px] relative rounded-[8px] shrink-0 w-[344px]" data-name="Large Button">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[16px] text-black text-center">Login</p>
    </div>
  );
}

function LoginFormGroup() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[62px] items-center left-0 top-0 w-[384px]" data-name="Login form group">
      <Frame7 />
      <LargeButton />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0">
      <div className="h-0 relative shrink-0 w-[162.003px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 162.003 1">
            <line id="Line 14" stroke="var(--stroke-0, #404040)" x2="162.003" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#404040] text-[12px]">OR</p>
    </div>
  );
}

function OrSection() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-full" data-name="OR section">
      <Frame8 />
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
          <g id="Shape_5"></g>
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

function Frame() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[15px] items-start left-[calc(50%-0.5px)] p-[15px] rounded-[10px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <GoogleLogo />
      <p className="css-ew64yg font-['Roboto:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[20px] text-[rgba(0,0,0,0.54)]" style={{ fontVariationSettings: "'wdth' 100" }}>{` Google`}</p>
    </div>
  );
}

function ContinueWithGoogleCentreFixed() {
  return (
    <div className="absolute bg-[#fffcfe] h-[54px] left-0 rounded-[10px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08),0px_2px_3px_0px_rgba(0,0,0,0.17)] top-[2px] w-[180px]" data-name="Continue with Google / Centre / Fixed">
      <Frame />
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

function Frame1() {
  return (
    <div className="absolute bg-black content-stretch flex gap-[15px] items-start left-1/2 p-[15px] rounded-[10px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <AppleLogo />
      <p className="css-ew64yg font-['SF_Pro_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-white">Apple</p>
    </div>
  );
}

function ContinueWithAppleCentreFixed() {
  return (
    <div className="absolute bg-black h-[54px] left-[204px] rounded-[10px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08),0px_2px_3px_0px_rgba(0,0,0,0.17)] top-[2px] w-[180px]" data-name="Continue with Apple / Centre / Fixed">
      <Frame1 />
    </div>
  );
}

function GoogleApple() {
  return (
    <div className="absolute contents left-0 top-[2px]" data-name="Google/Apple">
      <ContinueWithGoogleCentreFixed />
      <ContinueWithAppleCentreFixed />
    </div>
  );
}

function FrameGA() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Frame G/A">
      <GoogleApple />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex font-['Roboto:Regular',sans-serif] font-normal gap-[2px] items-center relative shrink-0 text-[16px] text-center w-[229px]">
      <p className="css-4hzbpn h-[23px] leading-[0] relative shrink-0 text-[0px] text-black w-[167px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="leading-[24px] text-[#fffcfe]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Don’t have an account?
        </span>
        <span className="leading-[24px]"> </span>
      </p>
      <p className="css-4hzbpn h-[23px] leading-[24px] relative shrink-0 text-[#da876b] w-[58px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Sign Up
      </p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <FrameGA />
      <Frame9 />
    </div>
  );
}

function OtherLoginFromsSignUpGroup() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 top-[462px] w-[384px]" data-name="other login froms & sign up group">
      <OrSection />
      <Frame10 />
    </div>
  );
}

function Login() {
  return (
    <div className="absolute h-[616.232px] left-[936px] top-[calc(50%+0.12px)] translate-y-[-50%] w-[384px]" data-name="Login">
      <LoginFormGroup />
      <OtherLoginFromsSignUpGroup />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#141414] relative size-full" data-name="login page">
      <SidePic />
      <Login />
      <div className="absolute h-[1696px] left-[-134px] top-[-400px] w-[950px]" data-name="side frame just to know where to put side pic">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSideFrameJustToKnowWhereToPutSidePic} />
      </div>
    </div>
  );
}