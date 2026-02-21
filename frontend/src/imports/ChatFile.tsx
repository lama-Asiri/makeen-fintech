import svgPaths from "./svg-i4pd84glzg";
import imgImage39 from "@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png";

function Header() {
  return (
    <div className="bg-[#2c2c2c] relative rounded-tl-[8px] rounded-tr-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] py-[20px] relative w-full">
          <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[20px] text-white">File Upload</p>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_76_470)" id="Frame">
          <g id="Vector"></g>
          <path d={svgPaths.p2fe12e80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M9 15L12 12L15 15" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 12V21" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_76_470">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function UploadSection() {
  return (
    <div className="bg-[#262626] content-stretch flex flex-col gap-[17px] items-center px-[105px] py-[45px] relative rounded-[8px] shrink-0" data-name="upload section">
      <div aria-hidden="true" className="absolute border border-[#bebebe] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <Frame />
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-white">Click or drag file to this area to upload</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_76_445)" id="Frame">
          <g id="Vector"></g>
          <path d={svgPaths.p2c7f0600} id="Vector_2" stroke="var(--stroke-0, #08B839)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p18d48b80} id="Vector_3" stroke="var(--stroke-0, #08B839)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8 11H16V18H8V11Z" id="Vector_4" stroke="var(--stroke-0, #08B839)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8 15H16" id="Vector_5" stroke="var(--stroke-0, #08B839)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M11 11V18" id="Vector_6" stroke="var(--stroke-0, #08B839)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_76_445">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SampleFileCta() {
  return (
    <div className="bg-[#262626] content-stretch flex gap-[8px] h-[44px] items-center px-[24px] relative rounded-[8px] shrink-0" data-name="sample file cta">
      <div aria-hidden="true" className="absolute border border-[#d0d0d0] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Frame1 />
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#e9e9e9] text-[16px]">Download Sample Template</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start px-[24px] relative shrink-0" data-name="content">
      <UploadSection />
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#ccc] text-[16px] w-[min-content]">Formats accepted are .csv and .xlsx</p>
      <div className="h-0 relative shrink-0 w-[499px]" data-name="divider line">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 499 1">
            <line id="divider line" stroke="var(--stroke-0, black)" x2="499" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f5f5] text-[16px]">If you do not have a file you can use the sample below:</p>
      <SampleFileCta />
    </div>
  );
}

function MediumButton() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[28px] py-[20px] relative rounded-[8px] shrink-0" data-name="Medium Button">
      <div aria-hidden="true" className="absolute border border-[#7760bd] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#fffcfe] text-[16px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
        Cancel
      </p>
    </div>
  );
}

function MediumButton1() {
  return (
    <div className="bg-[#7760bd] content-stretch flex h-[44px] items-center justify-center px-[28px] py-[20px] relative rounded-[8px] shrink-0" data-name="Medium Button">
      <p className="css-ew64yg font-['Roboto:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#fffcfe] text-[16px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
        Send
      </p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#2c2c2c] relative rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="button">
      <div aria-hidden="true" className="absolute border-black border-solid border-t inset-0 pointer-events-none rounded-bl-[8px] rounded-br-[8px]" />
      <div className="flex flex-row justify-end size-full">
        <div className="content-stretch flex gap-[16px] items-start justify-end px-[24px] py-[14px] relative w-full">
          <MediumButton />
          <MediumButton1 />
        </div>
      </div>
    </div>
  );
}

function UploadFile() {
  return (
    <div className="absolute bg-[#2c2c2c] content-stretch flex flex-col gap-[33px] items-center left-[528px] rounded-[8px] top-[211px] w-[601px]" data-name="upload file">
      <Header />
      <Content />
      <Button />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-end justify-center relative shrink-0">
      <div className="h-[56px] relative rounded-[6px] shrink-0 w-[60px]" data-name="image 39">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgImage39} />
      </div>
      <p className="css-4hzbpn font-['Roboto:SemiBold',sans-serif] font-semibold h-[32px] leading-[32px] relative shrink-0 text-[#fffcfe] text-[24px] text-center w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Makeen
      </p>
    </div>
  );
}

function AlignJustify() {
  return (
    <div className="relative shrink-0 size-[28.5px]" data-name="align-justify">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.5 28.5">
        <g id="align-justify">
          <path d="M24.9375 11.875H3.5625" id="Vector" stroke="var(--stroke-0, #9E9E9E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M24.9375 7.125H3.5625" id="Vector_2" stroke="var(--stroke-0, #9E9E9E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M24.9375 16.625H3.5625" id="Vector_3" stroke="var(--stroke-0, #9E9E9E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M24.9375 21.375H3.5625" id="Vector_4" stroke="var(--stroke-0, #9E9E9E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[calc(50%+0.31px)] top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] w-[259.125px]">
      <Frame3 />
      <AlignJustify />
    </div>
  );
}

function Header1() {
  return (
    <div className="absolute h-[53px] left-0 top-0 w-[276.25px]" data-name="header">
      <Frame4 />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[20.5px]" data-name="search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5 20.5">
        <g id="search">
          <path d={svgPaths.p39117340} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p11970080} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function SearchField() {
  return (
    <div className="absolute bg-[#333] content-stretch flex gap-[16px] h-[52.5px] items-center left-0 p-[16px] rounded-[8px] top-[81px] w-[276.25px]" data-name="search-field">
      <Search />
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[#9e9e9e] text-[16px]">Search</p>
    </div>
  );
}

function FileText() {
  return (
    <div className="relative shrink-0 size-[20.5px]" data-name="file-text">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5 20.5">
        <g clipPath="url(#clip0_76_459)" id="file-text">
          <path d={svgPaths.p1123ea00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Rectangle 6707" width="354" x="3.125" y="21" />
        </g>
        <defs>
          <clipPath id="clip0_76_459">
            <rect fill="white" height="20.5" width="20.5" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function MenuItems() {
  return (
    <div className="content-stretch flex gap-[16px] h-[52.5px] items-center p-[16px] relative rounded-[8px] shrink-0 w-[276px]" data-name="menu-items">
      <FileText />
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[#9e9e9e] text-[16px]">New Chat</p>
    </div>
  );
}

function MenuGroup() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-[161.5px] w-[276.25px]" data-name="menu-group">
      <MenuItems />
    </div>
  );
}

function MenuItems1() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[52.5px] items-center left-0 p-[16px] rounded-[8px] top-[242px] w-[276.25px]" data-name="menu-items">
      <div className="relative shrink-0 size-[18px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <path d={svgPaths.p16599900} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[#9e9e9e] text-[16px]">Chat history</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold h-[109px] leading-[1.2] left-[18.13px] not-italic text-[#fffcfe] text-[16px] top-[322px] w-[70px]">
      <p className="absolute css-4hzbpn left-0 top-[-3px] w-[70px]">Chat 1</p>
      <p className="absolute css-4hzbpn left-0 top-[45px] w-[64px]">Chat 2</p>
      <p className="absolute css-ew64yg left-0 top-[93px]">Chat 3</p>
    </div>
  );
}

function Cont() {
  return (
    <div className="absolute h-[431.5px] left-[11.88px] top-[40px] w-[276.25px]" data-name="cont">
      <Header1 />
      <SearchField />
      <MenuGroup />
      <MenuItems1 />
      <Frame2 />
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[20.5px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5 20.5">
        <g clipPath="url(#clip0_76_441)" id="settings">
          <path d={svgPaths.p326c8980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p302cf200} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_76_441">
            <rect fill="white" height="20.5" width="20.5" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function MenuItems2() {
  return (
    <div className="bg-[#2c2c2c] content-stretch flex gap-[16px] h-[52.5px] items-center p-[16px] relative rounded-[8px] shrink-0 w-[276px]" data-name="menu-items">
      <Settings />
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[#9e9e9e] text-[16px]">Settings</p>
    </div>
  );
}

function SettingsMenuOption() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="settings menu option">
      <MenuItems2 />
    </div>
  );
}

function MenuGroup1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="menu-group">
      <SettingsMenuOption />
    </div>
  );
}

function TextCont() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[8px] items-start leading-[1.2] not-italic relative shrink-0" data-name="text-cont">
      <p className="css-ew64yg relative shrink-0 text-[#fffcfe] text-[16px]">Username</p>
      <p className="css-ew64yg relative shrink-0 text-[#808080] text-[12px]">username@gmail.com</p>
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0" data-name="profile">
      <div className="relative shrink-0 size-[40px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
          <circle cx="20" cy="20" fill="var(--fill-0, #D9D9D9)" id="Ellipse 1698" r="20" />
        </svg>
      </div>
      <TextCont />
    </div>
  );
}

function MoreVertical() {
  return (
    <div className="absolute inset-[28.26%]" data-name="more-vertical">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="more-vertical">
          <path d={svgPaths.p39a1e780} fill="var(--fill-0, #808080)" id="Vector" stroke="var(--stroke-0, #808080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p11974af0} fill="var(--fill-0, #808080)" id="Vector_2" stroke="var(--stroke-0, #808080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p133c1580} fill="var(--fill-0, #808080)" id="Vector_3" stroke="var(--stroke-0, #808080)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function OptionsButton() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="options button">
      <div className="absolute bg-[#333] inset-0 rounded-[8px]" />
      <MoreVertical />
    </div>
  );
}

function ProfileWidget() {
  return (
    <div className="bg-[#333] content-stretch flex h-[89px] items-center justify-between px-[16px] py-[24px] relative rounded-[8px] shrink-0 w-[276px]" data-name="profile-widget">
      <Profile />
      <OptionsButton />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-start left-[12px] top-[810.5px]" data-name="container">
      <MenuGroup1 />
      <ProfileWidget />
    </div>
  );
}

function Sidebar() {
  return (
    <div className="absolute bg-[#2c2c2c] bottom-0 left-1/2 rounded-[16px] top-0 translate-x-[-50%] w-[300px]" data-name="sidebar">
      <Cont />
      <Container />
    </div>
  );
}

function Menu() {
  return (
    <div className="absolute h-[1024px] left-0 top-0 w-[300px]" data-name="Menu">
      <Sidebar />
      <div className="absolute inset-[25.78%_0.16%_74.22%_0]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 299.518 1">
            <line id="Line 11" stroke="var(--stroke-0, white)" x2="299.518" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ChatFile() {
  return (
    <div className="bg-[#262626] relative size-full" data-name="Chat-file">
      <UploadFile />
      <Menu />
    </div>
  );
}