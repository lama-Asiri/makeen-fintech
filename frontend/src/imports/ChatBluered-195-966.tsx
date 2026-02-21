import svgPaths from "./svg-d823tf0jbw";
import imgImage39 from "@/assets/f2078903bc60d007ab38f14e8f06bb0ac47cb5a0.png";

function Frame() {
  return (
    <div className="absolute bg-[#7760bd] bottom-0 left-1/2 rounded-[8px] top-0 translate-x-[-50%]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[20px] relative">
          <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#fffcfe] text-[16px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
            Send
          </p>
        </div>
      </div>
    </div>
  );
}

function SmallButton() {
  return (
    <div className="h-[28px] relative shrink-0 w-[47px]" data-name="Small Button">
      <Frame />
    </div>
  );
}

function Chatbox() {
  return (
    <div className="absolute bg-[rgba(92,92,92,0.54)] blur-[8px] content-stretch flex h-[48px] items-center justify-between left-[426px] px-[13px] py-[9px] rounded-[10px] top-[908px] w-[894px]" data-name="chatbox">
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#9e9e9e] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Ask away
      </p>
      <SmallButton />
    </div>
  );
}

function Frame6() {
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

function Frame7() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[calc(50%+0.31px)] top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] w-[259.125px]">
      <Frame6 />
      <AlignJustify />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute h-[53px] left-0 top-0 w-[276.25px]" data-name="header">
      <Frame7 />
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
        <g clipPath="url(#clip0_195_994)" id="file-text">
          <path d={svgPaths.p1123ea00} id="Vector" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Rectangle 6707" width="354" x="3.125" y="21" />
        </g>
        <defs>
          <clipPath id="clip0_195_994">
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
          <path d={svgPaths.p16599900} fill="var(--fill-0, #FFFCFE)" id="Vector" />
        </svg>
      </div>
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[#9e9e9e] text-[16px]">Chat history</p>
    </div>
  );
}

function Frame1() {
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
      <Header />
      <SearchField />
      <MenuGroup />
      <MenuItems1 />
      <Frame1 />
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[20.5px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5 20.5">
        <g clipPath="url(#clip0_195_982)" id="settings">
          <path d={svgPaths.p326c8980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p302cf200} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_195_982">
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
    <div className="absolute bg-[rgba(255,255,255,0.54)] blur-[8px] h-[1029px] left-[-11px] top-0 w-[312px]" data-name="Menu">
      <Sidebar />
      <div className="absolute inset-[25.78%_0.16%_74.22%_0]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 311.499 1">
            <line id="Line 11" stroke="var(--stroke-0, white)" x2="311.499" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute left-[1046px] size-[44px] top-[106px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="Group 239205">
          <rect fill="var(--fill-0, #0F5F38)" height="44" id="Rectangle 6725" rx="12" width="44" />
          <path d={svgPaths.p3ef86100} fill="var(--fill-0, #FFFCFE)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[10.84%_17.15%_85.84%_76.18%] leading-[16px] text-[12px]">
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[12.6%_22.22%_85.84%_76.18%] text-[#efefef]" style={{ fontVariationSettings: "'wdth' 100" }}>
        CSV
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Medium',sans-serif] font-medium inset-[10.84%_17.15%_87.6%_76.18%] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        Project1_data.csv
      </p>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[1038px] top-[99px]">
      <div className="absolute border-2 border-[#5c5c5c] border-solid inset-[9.67%_8.33%_84.67%_72.08%] rounded-[16px]" />
      <Group3 />
      <Group2 />
    </div>
  );
}

function Header1() {
  return (
    <div className="absolute bg-[#262626] h-[64px] left-[5px] rounded-tl-[8px] rounded-tr-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-[601px]" data-name="header">
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold leading-[28px] left-[24px] text-[#fffcfe] text-[20px] top-[calc(50%-14px)]" style={{ fontVariationSettings: "'wdth' 100" }}>
        General
      </p>
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
        Submit
      </p>
    </div>
  );
}

function Buttons() {
  return (
    <div className="absolute bg-[#262626] content-stretch flex gap-[16px] items-start justify-end left-0 px-[24px] py-[14px] rounded-bl-[8px] rounded-br-[8px] top-[442px] w-[606px]" data-name="buttons">
      <div aria-hidden="true" className="absolute border-[#e3e3e3] border-solid border-t inset-0 pointer-events-none rounded-bl-[8px] rounded-br-[8px]" />
      <MediumButton />
      <MediumButton1 />
    </div>
  );
}

function Settings1() {
  return (
    <div className="absolute bg-[#262626] h-[514px] left-[56px] overflow-clip rounded-[8px] top-0 w-[606px]" data-name="settings">
      <Header1 />
      <Buttons />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[56px] top-0">
      <Settings1 />
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="absolute h-[514px] left-[28px] top-0 w-[662px]" data-name="settings page">
      <Group1 />
    </div>
  );
}

function Group() {
  return (
    <div className="col-[1] css-hcpsqa h-[18.792px] relative row-[1] self-center shrink-0 w-[18.383px]">
      <div className="absolute inset-[-5.32%_-5.44%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.3832 20.7917">
          <g id="Group 239184">
            <path d={svgPaths.p3d740f80} id="Vector" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d={svgPaths.p1f2ec600} id="Vector_2" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function GeneralSettingsIcon() {
  return (
    <div className="gap-[10px] grid grid-cols-[repeat(1,_minmax(0,_1fr))] grid-rows-[repeat(1,_minmax(0,_1fr))] h-[46px] p-[12px] relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[45px]" data-name="General settings icon">
      <div className="absolute bg-[#484848] left-0 rounded-[8px] size-[46px] top-0" />
      <Group />
    </div>
  );
}

function PersonalIcon() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="personal icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 46">
        <g id="personal icon">
          <rect fill="var(--fill-0, #2C2C2C)" height="46" id="Rectangle 6702" rx="8" width="46" />
          <path d={svgPaths.p38ef5d00} fill="var(--fill-0, #FFFCFE)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function PrivacyIcon() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="privacy icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 46">
        <g id="privacy icon">
          <rect fill="var(--fill-0, #2C2C2C)" height="46" id="Rectangle 6702" rx="8" width="46" />
          <path d={svgPaths.p3c6e8100} fill="var(--fill-0, #FFFCFE)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Bell() {
  return (
    <div className="absolute left-[13px] size-[20.5px] top-[13px]" data-name="bell">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5 20.5">
        <g id="bell">
          <path d={svgPaths.p2f9a6480} id="Vector" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3da4bd80} id="Vector_2" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function NotificationIcon() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="notification icon">
      <div className="absolute bg-[#2c2c2c] left-0 rounded-[8px] size-[46px] top-0" />
      <Bell />
    </div>
  );
}

function DataIcon() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="data icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 46">
        <g id="data icon">
          <rect fill="var(--fill-0, #2C2C2C)" height="46" id="Rectangle 6702" rx="8" width="46" />
          <path d={svgPaths.p3c115100} fill="var(--fill-0, #FFFCFE)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SideBarIcons() {
  return (
    <div className="absolute bottom-[31.91%] content-stretch flex flex-col gap-[24px] items-start left-[calc(50%+0.5px)] py-[3px] top-[3.5%] translate-x-[-50%] w-[46px]" data-name="Side bar icons">
      <GeneralSettingsIcon />
      <PersonalIcon />
      <PrivacyIcon />
      <NotificationIcon />
      <DataIcon />
    </div>
  );
}

function SettingsSidebar() {
  return (
    <div className="absolute h-[514px] left-0 top-0 w-[89px]" data-name="Settings sidebar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 89 514">
        <g id="Group 239185">
          <rect fill="var(--fill-0, #2C2C2C)" height="514" id="Rectangle 6701" rx="16" width="89" />
          <circle cx="45" cy="430" fill="var(--fill-0, #D9D9D9)" id="Ellipse 1698" r="20" />
        </g>
      </svg>
      <SideBarIcons />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute h-[514px] left-0 top-0 w-[89px]">
      <SettingsSidebar />
    </div>
  );
}

function Header2() {
  return (
    <div className="absolute bg-[#262626] h-[60px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[601px]" data-name="header">
      <div aria-hidden="true" className="absolute border-[rgba(255,252,254,0.19)] border-b-[0.5px] border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
    </div>
  );
}

function DropdownArrowIcon() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="dropdown arrow icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 46">
        <g id="dropdown arrow icon">
          <rect fill="var(--fill-0, #262626)" height="46" id="Rectangle 6702" rx="8" width="46" />
          <path d="M15 19L23 26L31 19" id="Vector" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex h-[54px] items-center justify-between left-0 pl-[25px] pr-[20px] py-[4px] top-[3px] w-[601px]">
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#fffcfe] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Appearance
      </p>
      <DropdownArrowIcon />
    </div>
  );
}

function SettingElement() {
  return (
    <div className="absolute h-[60px] left-[89px] top-[71px] w-[601px]" data-name="setting element">
      <Header2 />
      <Frame4 />
    </div>
  );
}

function Header3() {
  return <div className="absolute bg-[#262626] h-[60px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[601px]" data-name="header" />;
}

function DropdownArrowIcon1() {
  return (
    <div className="relative shrink-0 size-[46px]" data-name="dropdown arrow icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 46">
        <g id="dropdown arrow icon">
          <rect fill="var(--fill-0, #262626)" height="46" id="Rectangle 6702" rx="8" width="46" />
          <path d="M15 19L23 26L31 19" id="Vector" stroke="var(--stroke-0, #FFFCFE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex h-[54px] items-center justify-between left-0 pl-[25px] pr-[20px] py-[4px] top-[3px] w-[601px]">
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#fffcfe] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Language
      </p>
      <DropdownArrowIcon1 />
    </div>
  );
}

function SettingElement1() {
  return (
    <div className="absolute h-[60px] left-[89px] top-[131px] w-[601px]" data-name="setting element">
      <Header3 />
      <Frame5 />
    </div>
  );
}

function SettingsFrame() {
  return (
    <div className="absolute h-[514px] left-[calc(50%+5px)] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[690px]" data-name="Settings frame">
      <div className="absolute bg-[#262626] h-[514px] left-[28px] top-0 w-[75px]" />
      <SettingsPage />
      <Frame2 />
      <SettingElement />
      <SettingElement1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.3)] h-[1024px] left-0 overflow-clip top-0 w-[1440px]">
      <SettingsFrame />
    </div>
  );
}

export default function ChatBluered() {
  return (
    <div className="bg-[#262626] relative size-full" data-name="Chat-bluered">
      <Chatbox />
      <Menu />
      <Group4 />
      <Frame3 />
    </div>
  );
}