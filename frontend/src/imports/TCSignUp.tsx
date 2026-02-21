import svgPaths from "./svg-6nwso2007n";
import imgPicc1 from "@/assets/947a2afba4a6a78c9261396d816fb9015697ffc4.png";

function LoginPic() {
  return (
    <div className="absolute bg-[#382f5e] h-[1024px] left-0 overflow-clip top-0 w-[810px]" data-name="Login pic">
      <div className="absolute h-[1696px] left-[-140px] top-[-402px] w-[950px]" data-name="picc 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgPicc1} />
      </div>
    </div>
  );
}

function LoginPic1() {
  return (
    <div className="absolute bg-[#382f5e] h-[1024px] left-0 overflow-clip top-[4px] w-[810px]" data-name="Login pic">
      <LoginPic />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-white inset-[39.13%_10.42%_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_85.94%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
    <div className="absolute bg-white inset-[39.13%_10.42%_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_86.98%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Group4 />
      <Group1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-white inset-[39.13%_10.42%_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_76.82%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame8 />
      <Group2 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-white inset-[39.13%_10.42%_0_0] rounded-[8px]">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[24px] relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#616161] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`Enter your password `}</p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TextFeild3() {
  return (
    <div className="col-1 h-[92px] ml-0 mt-0 relative row-1 w-[384px]" data-name="Text feild">
      <Frame6 />
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold inset-[0_56.77%_69.57%_0] leading-[28px] text-[#fffcfe] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] relative shrink-0 w-full">
      <Frame9 />
      <Group3 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <p className="css-4hzbpn font-['Roboto:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#fffcfe] text-[32px] text-center w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Get Started Now
      </p>
      <Frame10 />
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
        <p className="css-4hzbpn">
          <span className="leading-[24px] text-[#fffcfe]">{`I agree to the `}</span>
          <span className="leading-[24px] text-[#da876b]">{`Terms & Conditions`}</span>
        </p>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame11 />
      <Frame />
    </div>
  );
}

function LargeButton() {
  return (
    <div className="bg-[#7760bd] content-stretch flex h-[56px] items-center justify-center overflow-clip px-[24px] py-[16px] relative rounded-[8px] shrink-0 w-[344px]" data-name="Large Button">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[16px] text-black text-center">Sign Up</p>
    </div>
  );
}

function SignUpForm() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[64px] items-center left-0 top-0 w-[384px]" data-name="Sign up form">
      <Frame13 />
      <LargeButton />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
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
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="OR section">
      <Frame12 />
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

function Frame1() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[15px] items-start left-[calc(50%-0.5px)] p-[15px] rounded-[10px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <GoogleLogo />
      <p className="css-ew64yg font-['Roboto:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[20px] text-[rgba(0,0,0,0.54)]" style={{ fontVariationSettings: "'wdth' 100" }}>{` Google`}</p>
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
    <div className="absolute bg-black content-stretch flex gap-[15px] items-start left-1/2 p-[15px] rounded-[10px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <AppleLogo />
      <p className="css-ew64yg font-['SF_Pro_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-white">Apple</p>
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
      <p className="col-1 css-ew64yg font-['Roboto:Regular',sans-serif] font-normal ml-0 mt-0 relative row-1 text-[#fffcfe] text-[0px] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="leading-[24px]">{`Have an account?  `}</span>
        <span className="leading-[24px] text-[#da876b]" style={{ fontVariationSettings: "'wdth' 100" }}>
          {" "}
        </span>
      </p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0">
      <Group />
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#da876b] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Login
      </p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <GoogleApple />
      <Frame14 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 top-[676px] w-[384px]">
      <OrSection />
      <Frame15 />
    </div>
  );
}

function SignUp() {
  return (
    <div className="absolute h-[825px] left-[933px] top-[calc(50%-0.5px)] translate-y-[-50%] w-[384px]" data-name="Sign Up">
      <SignUpForm />
      <Frame16 />
    </div>
  );
}

function MediumButtonFrame() {
  return (
    <div className="absolute bg-[#7760bd] content-stretch flex items-center justify-center left-[904px] opacity-25 p-[10px] rounded-[7.25px] top-[578px] w-[167px]" data-name="Medium Button/Frame 7051">
      <p className="css-ew64yg font-['Raleway:SemiBold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[16px] text-white">Accept</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute h-[2451px] left-0 top-0 w-[965px]">
      <div className="absolute font-['Roboto:Regular',sans-serif] font-normal h-[2451px] leading-[24px] left-0 text-[#fffcfe] text-[16px] text-justify top-0 w-[965px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn mb-0">Last Revised: December 16, 2013</p>
        <p className="css-4hzbpn mb-0">Welcome to www.lorem-ipsum.info. This site is provided as a service to our visitors and may be used for informational purposes only. Because the Terms and Conditions contain legal obligations, please read them carefully.</p>
        <p className="css-4hzbpn mb-0">1. YOUR AGREEMENT</p>
        <p className="css-4hzbpn mb-0">By using this Site, you agree to be bound by, and to comply with, these Terms and Conditions. If you do not agree to these Terms and Conditions, please do not use this site.</p>
        <p className="css-4hzbpn mb-0">PLEASE NOTE: We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms and Conditions at any time. Unless otherwise indicated, amendments will become effective immediately. Please review these Terms and Conditions periodically. Your continued use of the Site following the posting of changes and/or modifications will constitute your acceptance of the revised Terms and Conditions and the reasonableness of these standards for notice of changes. For your information, this page was last updated as of the date at the top of these terms and conditions.</p>
        <p className="css-4hzbpn mb-0">2. PRIVACY</p>
        <p className="css-4hzbpn mb-0">Please review our Privacy Policy, which also governs your visit to this Site, to understand our practices.</p>
        <p className="css-4hzbpn mb-0">3. LINKED SITES</p>
        <p className="css-4hzbpn mb-0">{`This Site may contain links to other independent third-party Web sites ("Linked Sites”). These Linked Sites are provided solely as a convenience to our visitors. Such Linked Sites are not under our control, and we are not responsible for and does not endorse the content of such Linked Sites, including any information or materials contained on such Linked Sites. You will need to make your own independent judgment regarding your interaction with these Linked Sites.`}</p>
        <p className="css-4hzbpn mb-0">4. FORWARD LOOKING STATEMENTS</p>
        <p className="css-4hzbpn mb-0">All materials reproduced on this site speak as of the original date of publication or filing. The fact that a document is available on this site does not mean that the information contained in such document has not been modified or superseded by events or by a subsequent document or filing. We have no duty or policy to update any information or statements contained on this site and, therefore, such information or statements should not be relied upon as being current as of the date you access this site.</p>
        <p className="css-4hzbpn mb-0">5. DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY</p>
        <p className="css-4hzbpn mb-0">{`A. THIS SITE MAY CONTAIN INACCURACIES AND TYPOGRAPHICAL ERRORS. WE DOES NOT WARRANT THE ACCURACY OR COMPLETENESS OF THE MATERIALS OR THE RELIABILITY OF ANY ADVICE, OPINION, STATEMENT OR OTHER INFORMATION DISPLAYED OR DISTRIBUTED THROUGH THE SITE. YOU EXPRESSLY UNDERSTAND AND AGREE THAT: (i) YOUR USE OF THE SITE, INCLUDING ANY RELIANCE ON ANY SUCH OPINION, ADVICE, STATEMENT, MEMORANDUM, OR INFORMATION CONTAINED HEREIN, SHALL BE AT YOUR SOLE RISK; (ii) THE SITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS; (iii) EXCEPT AS EXPRESSLY PROVIDED HEREIN WE DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, WORKMANLIKE EFFORT, TITLE AND NON-INFRINGEMENT; (iv) WE MAKE NO WARRANTY WITH RESPECT TO THE RESULTS THAT MAY BE OBTAINED FROM THIS SITE, THE PRODUCTS OR SERVICES ADVERTISED OR OFFERED OR MERCHANTS INVOLVED; (v) ANY MATERIAL DOWNLOADED OR OTHERWISE OBTAINED THROUGH THE USE OF THE SITE IS DONE AT YOUR OWN DISCRETION AND RISK; and (vi) YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER SYSTEM OR FOR ANY LOSS OF DATA THAT RESULTS FROM THE DOWNLOAD OF ANY SUCH MATERIAL.`}</p>
        <p className="css-4hzbpn mb-0">B. YOU UNDERSTAND AND AGREE THAT UNDER NO CIRCUMSTANCES, INCLUDING, BUT NOT LIMITED TO, NEGLIGENCE, SHALL WE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES THAT RESULT FROM THE USE OF, OR THE INABILITY TO USE, ANY OF OUR SITES OR MATERIALS OR FUNCTIONS ON ANY SUCH SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE FOREGOING LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.</p>
        <p className="css-4hzbpn mb-0">6. EXCLUSIONS AND LIMITATIONS</p>
        <p className="css-4hzbpn mb-0">SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, OUR LIABILITY IN SUCH JURISDICTION SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.</p>
        <p className="css-4hzbpn mb-0">7. OUR PROPRIETARY RIGHTS</p>
        <p className="css-4hzbpn mb-0">{`This Site and all its Contents are intended solely for personal, non-commercial use. Except as expressly provided, nothing within the Site shall be construed as conferring any license under our or any third party's intellectual property rights, whether by estoppel, implication, waiver, or otherwise. Without limiting the generality of the foregoing, you acknowledge and agree that all content available through and used to operate the Site and its services is protected by copyright, trademark, patent, or other proprietary rights. You agree not to: (a) modify, alter, or deface any of the trademarks, service marks, trade dress (collectively "Trademarks") or other intellectual property made available by us in connection with the Site; (b) hold yourself out as in any way sponsored by, affiliated with, or endorsed by us, or any of our affiliates or service providers; (c) use any of the Trademarks or other content accessible through the Site for any purpose other than the purpose for which we have made it available to you; (d) defame or disparage us, our Trademarks, or any aspect of the Site; and (e) adapt, translate, modify, decompile, disassemble, or reverse engineer the Site or any software or programs used in connection with it or its products and services.`}</p>
        <p className="css-4hzbpn mb-0">The framing, mirroring, scraping or data mining of the Site or any of its content in any form and by any method is expressly prohibited.</p>
        <p className="css-4hzbpn mb-0">8. INDEMNITY</p>
        <p className="css-4hzbpn mb-0">{`By using the Site web sites you agree to indemnify us and affiliated entities (collectively "Indemnities") and hold them harmless from any and all claims and expenses, including (without limitation) attorney's fees, arising from your use of the Site web sites, your use of the Products and Services, or your submission of ideas and/or related materials to us or from any person's use of any ID, membership or password you maintain with any portion of the Site, regardless of whether such use is authorized by you.`}</p>
        <p className="css-4hzbpn mb-0">9. COPYRIGHT AND TRADEMARK NOTICE</p>
        <p className="css-4hzbpn mb-0">Except our generated dummy copy, which is free to use for private and commercial use, all other text is copyrighted. generator.lorem-ipsum.info © 2013, all rights reserved</p>
        <p className="css-4hzbpn mb-0">10. INTELLECTUAL PROPERTY INFRINGEMENT CLAIMS</p>
        <p className="css-4hzbpn mb-0">{`It is our policy to respond expeditiously to claims of intellectual property infringement. We will promptly process and investigate notices of alleged infringement and will take appropriate actions under the Digital Millennium Copyright Act ("DMCA") and other applicable intellectual property laws. Notices of claimed infringement should be directed to:`}</p>
        <p className="css-4hzbpn mb-0">generator.lorem-ipsum.info</p>
        <p className="css-4hzbpn mb-0">126 Electricov St.</p>
        <p className="css-4hzbpn mb-0">Kiev, Kiev 04176</p>
        <p className="css-4hzbpn mb-0">Ukraine</p>
        <p className="css-4hzbpn mb-0">contact@lorem-ipsum.info</p>
        <p className="css-4hzbpn mb-0">11. PLACE OF PERFORMANCE</p>
        <p className="css-4hzbpn mb-0">This Site is controlled, operated and administered by us from our office in Kiev, Ukraine. We make no representation that materials at this site are appropriate or available for use at other locations outside of the Ukraine and access to them from territories where their contents are illegal is prohibited. If you access this Site from a location outside of the Ukraine, you are responsible for compliance with all local laws.</p>
        <p className="css-4hzbpn mb-0">12. GENERAL</p>
        <p className="css-4hzbpn mb-0">{`A. If any provision of these Terms and Conditions is held to be invalid or unenforceable, the provision shall be removed (or interpreted, if possible, in a manner as to be enforceable), and the remaining provisions shall be enforced. Headings are for reference purposes only and in no way define, limit, construe or describe the scope or extent of such section. Our failure to act with respect to a breach by you or others does not waive our right to act with respect to subsequent or similar breaches. These Terms and Conditions set forth the entire understanding and agreement between us with respect to the subject matter contained herein and supersede any other agreement, proposals and communications, written or oral, between our representatives and you with respect to the subject matter hereof, including any terms and conditions on any of customer's documents or purchase orders.`}</p>
        <p className="css-4hzbpn">B. No Joint Venture, No Derogation of Rights. You agree that no joint venture, partnership, employment, or agency relationship exists between you and us as a result of these Terms and Conditions or your use of the Site. Our performance of these Terms and Conditions is subject to existing laws and legal process, and nothing contained herein is in derogation of our right to comply with governmental, court and law enforcement requests or requirements relating to your use of the Site or information provided to or gathered by us with respect to such use.</p>
      </div>
    </div>
  );
}

function ContentWrapper() {
  return (
    <div className="h-[409px] relative shrink-0 w-[965px]" data-name="Content Wrapper">
      <Frame7 />
    </div>
  );
}

function Content() {
  return (
    <div className="bg-[#333] content-stretch flex flex-col h-[409px] items-start pb-[37px] px-[46px] relative shrink-0" data-name="Content">
      <ContentWrapper />
    </div>
  );
}

function ContentScrollbar() {
  return (
    <div className="absolute content-stretch flex items-start left-0 top-0" data-name="Content / Scrollbar">
      <Content />
    </div>
  );
}

function Scrollbar() {
  return (
    <div className="absolute bg-[#fffcfe] content-stretch flex h-[408px] items-start left-[1068px] py-[8px] rounded-[100px] top-0" data-name="Scrollbar">
      <div className="bg-[#7760bd] h-[65.58px] rounded-[100px] shrink-0 w-[11px]" />
    </div>
  );
}

function ShowcaseContainer() {
  return (
    <div className="absolute bg-[#333] h-[408px] left-0 overflow-clip top-[134px] w-[1100px]" data-name="Showcase Container">
      <ContentScrollbar />
      <Scrollbar />
    </div>
  );
}

function Frame17() {
  return <div className="absolute bg-[rgba(255,255,255,0)] h-[6px] left-[1064px] top-[531px] w-[20px]" />;
}

function TermsAndConditions() {
  return (
    <div className="absolute bg-[#333] h-[649px] left-1/2 overflow-clip rounded-[15px] top-[calc(50%-0.5px)] translate-x-[-50%] translate-y-[-50%] w-[1100px]" data-name="Terms and Conditions">
      <MediumButtonFrame />
      <p className="absolute css-ew64yg font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[1.5] left-[809px] not-italic text-[#7760bd] text-[17px] top-[587px]" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
        Cancel
      </p>
      <ShowcaseContainer />
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold leading-[36px] left-[46px] text-[#7760bd] text-[28px] top-[37px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Terms and Conditions
      </p>
      <p className="absolute css-ew64yg font-['Roboto:SemiBold',sans-serif] font-semibold leading-[28px] left-[46px] text-[#fffcfe] text-[20px] top-[89px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Your Agreement
      </p>
      <Frame17 />
    </div>
  );
}

function TermConditionBlure() {
  return (
    <div className="absolute backdrop-blur-[2px] bg-[rgba(0,0,0,0.47)] h-[1024px] left-1/2 overflow-clip top-1/2 translate-x-[-50%] translate-y-[-50%] w-[1440px]" data-name="Term & Condition blure">
      <TermsAndConditions />
    </div>
  );
}

export default function TCSignUp() {
  return (
    <div className="bg-[#141414] relative size-full" data-name="t&c SignUp">
      <div className="absolute h-[1024px] left-full top-0 w-[154.5px]" data-name="right padding">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="right padding"></g>
        </svg>
      </div>
      <LoginPic1 />
      <SignUp />
      <TermConditionBlure />
    </div>
  );
}