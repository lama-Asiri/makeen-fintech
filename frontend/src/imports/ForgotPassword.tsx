import imgDownload31 from "@/assets/f75b2c830b5863043b5b2dc0e088226d033c1cb7.png";

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 text-[#fffcfe] text-center w-full" data-name="Frame">
      <p className="css-4hzbpn font-['Roboto:Bold',sans-serif] font-bold leading-[40px] min-w-full relative shrink-0 text-[32px] w-[min-content]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Forgot Your Password?
      </p>
      <p className="css-4hzbpn font-['Roboto:SemiBold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[20px] w-[472px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`No worries, we’ll send you reset instructions. `}</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-white inset-[39.13%_0_0_0] rounded-[8px]">
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
      <Frame4 />
      <div className="absolute css-g0mm18 flex flex-col font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_86.98%_69.57%_0] justify-end leading-[0] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-ew64yg leading-[28px]">Email</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Group">
      <TextFeild />
    </div>
  );
}

function LargeButton() {
  return (
    <div className="bg-[#7760bd] content-stretch flex h-[56px] items-center justify-center overflow-clip px-[24px] py-[16px] relative rounded-[8px] shrink-0 w-[384px]" data-name="Large Button">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[16px] text-black text-center">Send Reset Link</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0" data-name="Frame">
      <Group />
      <LargeButton />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Frame">
      <Frame1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start justify-center left-[120px] p-[24px] rounded-[16px] top-[332px]" data-name="Frame">
      <Frame />
      <Frame2 />
    </div>
  );
}

function Pic() {
  return (
    <div className="absolute h-[1024px] left-[707px] top-0 w-[733px]" data-name="pic">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 733 1024">
        <g clipPath="url(#clip0_50_98)" id="pic">
          <rect fill="#9C9C9C" height="1024" width="733" />
          <line id="Line 7" stroke="var(--stroke-0, #262626)" x1="708.412" x2="6.41234" y1="0.282717" y2="1024.28" />
          <line id="Line 8" stroke="var(--stroke-0, #262626)" x1="6.41091" x2="709.411" y1="-0.284879" y2="1013.72" />
        </g>
        <defs>
          <clipPath id="clip0_50_98">
            <rect fill="white" height="1024" width="733" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <div className="bg-[#141414] relative size-full" data-name="Forgot Password">
      <Frame3 />
      <Pic />
      <div className="absolute h-[1312px] left-[702px] top-1/2 translate-y-[-50%] w-[738px]" data-name="download (3) 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDownload31} />
      </div>
    </div>
  );
}