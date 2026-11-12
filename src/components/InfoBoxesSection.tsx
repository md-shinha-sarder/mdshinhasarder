import { Mail, Phone, Globe, Github } from "lucide-react";

export const InfoBoxesSection = () => {
  return (
    <div className="w-full my-6 font-['Poppins','Karla',sans-serif]">
      {/* 2-column grid matching #infobox-grid from XML */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HTML10: Personal Infobox */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.07)] p-[22px_24px_16px] text-[#334155] leading-relaxed flex flex-col justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2.5 mb-5 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[50px] after:h-[2px] after:bg-[#2563eb]">
              Personal Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-sm">
                <strong className="block text-[#2563eb] text-xs uppercase tracking-wider mb-1 font-semibold">
                  Born
                </strong>
                Nov 05, 2004
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-sm">
                <strong className="block text-[#2563eb] text-xs uppercase tracking-wider mb-1 font-semibold">
                  Birth Place
                </strong>
                Shirgati, Aichgati, Khulna, Bangladesh
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-sm">
                <strong className="block text-[#2563eb] text-xs uppercase tracking-wider mb-1 font-semibold">
                  Nationality
                </strong>
                Bangladeshi
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-sm">
                <strong className="block text-[#2563eb] text-xs uppercase tracking-wider mb-1 font-semibold">
                  Parents
                </strong>
                MD. Lutfor Rahaman &amp; Samima Sultana
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#f1f5f9] text-sm">
            <div className="flex items-center gap-2.5 text-[#334155] break-all">
              <Mail size={16} className="text-[#2563eb] shrink-0" />
              <a href="mailto:shinhasarder2343@gmail.com" className="hover:text-[#2563eb] hover:underline">
                shinhasarder2343@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-[#334155]">
              <Phone size={16} className="text-[#2563eb] shrink-0" />
              <a href="tel:01576716992" className="hover:text-[#2563eb] hover:underline">
                01576716992
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-[#334155]">
              <Globe size={16} className="text-[#2563eb] shrink-0" />
              <a href="https://mdshinhasarder.com" target="_blank" rel="noreferrer" className="hover:text-[#2563eb] hover:underline">
                mdshinhasarder.com
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-[#334155]">
              <Github size={16} className="text-[#2563eb] shrink-0" />
              <a href="https://github.com/md-shinha-sarder" target="_blank" rel="noreferrer" className="hover:text-[#2563eb] hover:underline">
                md-shinha-sarder
              </a>
            </div>
          </div>
        </div>

        {/* HTML11: Education Infobox */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.07)] p-[22px_24px_16px] text-[#334155] leading-relaxed flex flex-col justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2.5 mb-5 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[50px] after:h-[2px] after:bg-[#2563eb]">
              Education Background
            </h3>
            <div className="space-y-4">
              <div className="pl-3.5 border-l-2 border-[#2563eb]">
                <div className="text-[16px] font-semibold text-[#1e2a38]">
                  Computer Science and Engineering (CSE)
                </div>
                <div className="text-sm text-[#64748b] mt-0.5">
                  Northern University of Business and Technology, Khulna
                </div>
              </div>
              <div className="pl-3.5 border-l-2 border-[#2563eb]">
                <div className="text-[16px] font-semibold text-[#1e2a38]">
                  Higher Secondary Certificate
                </div>
                <div className="text-sm text-[#64748b] mt-0.5">
                  Ahsanullah College, Khulna
                </div>
              </div>
              <div className="pl-3.5 border-l-2 border-[#2563eb]">
                <div className="text-[16px] font-semibold text-[#1e2a38]">
                  Secondary School Certificate
                </div>
                <div className="text-sm text-[#64748b] mt-0.5">
                  Khulna Zilla School
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HTML12: My Skill Infobox (spans 1 / -1 on desktop) */}
        <div className="md:col-span-2 bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.07)] p-[22px_24px_16px] text-[#334155] leading-relaxed">
          <h3 className="text-[20px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2.5 mb-5 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[50px] after:h-[2px] after:bg-[#2563eb]">
            My Skill
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0]">
              <div className="flex justify-between text-sm font-medium mb-2.5 text-[#334155]">
                <span>HTML/CSS/JS</span>
                <span className="font-semibold text-[#2563eb]">30%</span>
              </div>
              <div className="bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full rounded-full transition-all duration-1000" style={{ width: "30%" }} />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0]">
              <div className="flex justify-between text-sm font-medium mb-2.5 text-[#334155]">
                <span>Python</span>
                <span className="font-semibold text-[#2563eb]">30%</span>
              </div>
              <div className="bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full rounded-full transition-all duration-1000" style={{ width: "30%" }} />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0]">
              <div className="flex justify-between text-sm font-medium mb-2.5 text-[#334155]">
                <span>Java</span>
                <span className="font-semibold text-[#2563eb]">25%</span>
              </div>
              <div className="bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full rounded-full transition-all duration-1000" style={{ width: "25%" }} />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0]">
              <div className="flex justify-between text-sm font-medium mb-2.5 text-[#334155]">
                <span>C/C++</span>
                <span className="font-semibold text-[#2563eb]">10%</span>
              </div>
              <div className="bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full rounded-full transition-all duration-1000" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* HTML13: Projects Infobox (spans 1 / -1 on desktop) */}
        <div className="md:col-span-2 bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.07)] p-[22px_24px_20px] text-[#334155] leading-relaxed">
          <h3 className="text-[20px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2.5 mb-5 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[50px] after:h-[2px] after:bg-[#2563eb]">
            Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project 1 */}
            <div className="flex flex-col bg-white p-3.5 rounded-[10px] border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-md hover:border-[#2563eb] transition-all">
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSCdw5RbTH6ybaehBxCcypBWf4yjoNIRCJ_ypZKPjIqai6nSNvJuvItYuExsxn7PYBag0jGRAcGhZm7hFq-Af2H4RvotQ6FZboVU7xqZXGKcdTrRcNb1I8PIBFt-DodExGBlzJvGnENFykTObfQmm9AdYE4Q15M3QwdKv70dA-Te6B2GFTR4IlwvXzsP0t/w646-h180-rw/Screenshot%202025-07-02%20191141.png"
                alt="Knowledge Panel"
                className="w-full h-[130px] object-cover rounded-[6px] mb-3"
                onError={(e) => {
                  e.currentTarget.src = "/hero-portrait.jpg";
                }}
              />
              <h4 className="font-semibold text-[16px] text-[#0a4275] mb-1.5">Knowledge Panel Review</h4>
              <p className="flex-grow text-[13.5px] text-[#64748b] mb-3 leading-normal">
                An in-depth review of the Google Knowledge Panel setup and features.
              </p>
              <a
                href="https://www.mdshinhasarder.com/2025/07/httpswww.mdshinhasarder.com202507GoogleKnowledgePanelReviewforMDShinhaSarder.html"
                target="_blank"
                rel="noreferrer"
                className="text-[13.5px] font-semibold text-[#2563eb] hover:underline mt-auto"
              >
                View Project &rarr;
              </a>
            </div>

            {/* Project 2 */}
            <div className="flex flex-col bg-white p-3.5 rounded-[10px] border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-md hover:border-[#2563eb] transition-all">
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjodXYtmhZXw3DMzsclnR7QKGj4pB7EtltGEVAKHluF9q43M2xhp48sia0BIiGIyv_Z_8btnrrhXK9-DDcc14tX1UxBrZTEqHN_m99S_Cjn6Y0wrqJtfkQhTq2D4Lw7LFydGoWA-BZrW5I-Z0768jaUWRpxaZ7ODP1xV4a4EntzzE7u7g324MoXW_TLG5fp/w387-h222-rw/biostartvworld%20project.jpg"
                alt="Biostar TV World"
                className="w-full h-[130px] object-cover rounded-[6px] mb-3"
                onError={(e) => {
                  e.currentTarget.src = "/hero-portrait.jpg";
                }}
              />
              <h4 className="font-semibold text-[16px] text-[#0a4275] mb-1.5">Biostar TV World</h4>
              <p className="flex-grow text-[13.5px] text-[#64748b] mb-3 leading-normal">
                Live TV streaming platform development and integration.
              </p>
              <a
                href="https://www.mdshinhasarder.com/2026/03/biostar-tv-world-project-by-md-shinha.html"
                target="_blank"
                rel="noreferrer"
                className="text-[13.5px] font-semibold text-[#2563eb] hover:underline mt-auto"
              >
                View Project &rarr;
              </a>
            </div>

            {/* Project 3 */}
            <div className="flex flex-col bg-white p-3.5 rounded-[10px] border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-md hover:border-[#2563eb] transition-all">
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhUuMmO8QatoNP5It-QgXSj0l3_GU7Riz97ecEd23vhtUmmpSUbyrkvr8wm9DE4rL21fZCbHAHVgLZ0FdtJBVq3jT99lEb6Qm-bFHQdm4IMuNag8aLevFL7dU4tCBPWK2PDTq51JiS6FBr-djg3mXsWemB2x5TQGioZgoX0XwA_Lh3_FKYk2ogXNpLhzXPs/s320-rw/Gemini_Generated_Image_yaf5wiyaf5wiyaf5.png"
                alt="Globalpedia"
                className="w-full h-[130px] object-cover rounded-[6px] mb-3"
                onError={(e) => {
                  e.currentTarget.src = "/hero-portrait.jpg";
                }}
              />
              <h4 className="font-semibold text-[16px] text-[#0a4275] mb-1.5">Wiki Page Globalpedia</h4>
              <p className="flex-grow text-[13.5px] text-[#64748b] mb-3 leading-normal">
                Wiki Pages Web Project development and implementation.
              </p>
              <a
                href="https://www.mdshinhasarder.com/2026/03/wiki-page-globalpedia-project-by-md.html"
                target="_blank"
                rel="noreferrer"
                className="text-[13.5px] font-semibold text-[#2563eb] hover:underline mt-auto"
              >
                View Project &rarr;
              </a>
            </div>

            {/* Project 4 */}
            <div className="flex flex-col bg-white p-3.5 rounded-[10px] border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-md hover:border-[#2563eb] transition-all">
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgA4KbxARO8NX0-y0D3iukkvOlgpsgZWjnHli32HBGXj1wun6O9aRiIaYlbF9Xmy2jPV1-F_5XsXCKiZfbWEgSbH9gIBXanKPjaJ0LzSkd-sHF_28QDCXD4tsLKs4L7vf_MQDOK1hNlbWcltfrWol84QGdDk8RGCJjGeOE8eREH2TkLjKtCMCPDyGGGHOgk/s1920/Chess%20Game%20Project%20Report%20Review%20on%20Google%20for%20MD.%20Shinha%20Sarder.png"
                alt="Chess Game"
                className="w-full h-[130px] object-cover rounded-[6px] mb-3"
                onError={(e) => {
                  e.currentTarget.src = "/hero-portrait.jpg";
                }}
              />
              <h4 className="font-semibold text-[16px] text-[#0a4275] mb-1.5">Chess Game Report</h4>
              <p className="flex-grow text-[13.5px] text-[#64748b] mb-3 leading-normal">
                A detailed review covering design, features, and educational value.
              </p>
              <a
                href="https://www.mdshinhasarder.com/2025/08/chess-game-project-report-review-on.html"
                target="_blank"
                rel="noreferrer"
                className="text-[13.5px] font-semibold text-[#2563eb] hover:underline mt-auto"
              >
                View Project &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBoxesSection;
