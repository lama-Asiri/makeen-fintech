import imgDownload32 from "@/assets/f75b2c830b5863043b5b2dc0e088226d033c1cb7.png";

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 text-[#fffcfe] text-center w-full" data-name="Frame">
      <p className="css-4hzbpn font-['Roboto:SemiBold',sans-serif] font-semibold leading-[32px] relative shrink-0 text-[24px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Email Verification
      </p>
      <p className="css-4hzbpn font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        We sent a 4-digit code to your email. Please enter it below.
      </p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="css-g0mm18 flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px not-italic overflow-hidden relative text-[#667085] text-[16px] text-center text-ellipsis">&nbsp;</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[rgba(153,153,153,0.2)] flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(140,140,140,0.3)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] py-[10px] relative size-full">
          <Content />
        </div>
      </div>
    </div>
  );
}

function InputWithLabel() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-h-px min-w-px relative w-full" data-name="Input with label">
      <Input />
    </div>
  );
}

function InputField() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-[100px] items-start relative shrink-0 w-[80px]" data-name="Input field">
      <InputWithLabel />
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="css-g0mm18 flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px not-italic overflow-hidden relative text-[#8c8c8c] text-[16px] text-center text-ellipsis">&nbsp;</p>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[rgba(153,153,153,0.2)] flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(140,140,140,0.3)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[14px] py-[10px] relative size-full">
          <Content1 />
        </div>
      </div>
    </div>
  );
}

function InputWithLabel1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-h-px min-w-px relative w-full" data-name="Input with label">
      <Input1 />
    </div>
  );
}

function InputField1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-[100px] items-start relative shrink-0 w-[80px]" data-name="Input field">
      <InputWithLabel1 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px relative" data-name="Frame">
      <InputField />
      {[...Array(3).keys()].map((_, i) => (
        <InputField1 key={i} />
      ))}
    </div>
  );
}

function LargeButton() {
  return (
    <div className="bg-[#7760bd] content-stretch flex h-[56px] items-center justify-center overflow-clip px-[24px] py-[16px] relative rounded-[8px] shrink-0 w-[344px]" data-name="Large Button">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[16px] text-black text-center">Verify Code</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[168px] items-center justify-center relative shrink-0" data-name="Frame">
      <Frame1 />
      <LargeButton />
    </div>
  );
}

function ButtonsButton() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip relative shrink-0" data-name="Buttons/Button">
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#da876b] text-[16px]">Resend code</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] items-center justify-center ml-0 mt-0 relative row-1 w-[659px]">
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#fffcfe] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Didn’t receive code?
      </p>
      <ButtonsButton />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0 w-full" data-name="Group">
      <Frame5 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Frame">
      <Frame2 />
      <Group />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start justify-center left-0 p-[24px] rounded-[16px] top-1/2 translate-y-[-50%] w-[707px]" data-name="Frame">
      <Frame />
      <Frame3 />
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

export default function EmailVerification() {
  return (
    <div className="bg-[#141414] relative size-full" data-name="Email Verification">
      <Frame4 />
      <Pic />
      <div className="absolute h-[1330px] left-[692px] top-1/2 translate-y-[-50%] w-[748px]" data-name="download (3) 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDownload32} />
      </div>
    </div>
  );
}