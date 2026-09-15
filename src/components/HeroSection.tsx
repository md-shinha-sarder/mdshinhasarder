import { MapPin, Calendar, Mail, FileText, ExternalLink, BadgeCheck, ArrowDown, Briefcase, Phone, Globe, Code } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.webp";
import heroBg from "@/assets/hero-bg.jpg";

const info = [
  { icon: Calendar, label: "Born", value: "5 November 2004" },
  { icon: MapPin, label: "Place", value: "Shirgati, Aichgati, Khulna" },
  { icon: Briefcase, label: "Profession", value: "Entrepreneur" },
  { icon: Code, label: "Education", value: "CSE, Northern University of Business & Tech" },
  { icon: Globe, label: "Website", value: "mdshinhasarder.com", href: "https://mdshinhasarder.com" },
  { icon: Mail, label: "Email", value: "Shinhasarder2343@gmail.com", href: "mailto:Shinhasarder2343@gmail.com" },
  { icon: Phone, label: "WhatsApp", value: "+880 1576-716992", href: "https://wa.me/8801576716992" },
  { icon: FileText, label: "Curriculum Vitae", value: "Preview CV", href: "https://drive.google.com/file/d/1b4uAYCgzzgpprCkI16KYS2ycPk1VBEXk/view" },
  { icon: ExternalLink, label: "Google Panel", value: "Knowledge Panel", href: "https://share.google/8cHEzvrnE2uFpnlc3" },
];

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070e24]/75 via-[#070e24]/90 to-[#070e24]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/18 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="text-center mb-8 animate-fade-up">
          <span className="inline-flex items-center gap-2 text-[11px] text-blue-300 font-semibold tracking-widest uppercase mb-4 px-3.5 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 shadow-sm shadow-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Official Website &amp; Portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-2 flex flex-wrap items-center justify-center gap-2.5 text-white">
            <span>MD. Shinha <span className="text-gradient-blue">Sarder</span></span>
            <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 fill-blue-400/25" aria-label="Verified" />
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-300 font-medium">Founder &amp; CEO · Entrepreneur · Musical Artist · Author · YouTuber</p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0c183a]/95 via-[#0a1532]/95 to-[#070e24]/98 shadow-2xl shadow-blue-950/80 overflow-hidden animate-fade-in backdrop-blur-xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-72 flex-shrink-0 p-6 sm:p-8 flex items-center justify-center bg-[#091330]/80 border-b md:border-b-0 md:border-r border-blue-500/25">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 rounded-full opacity-35 blur-xl animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-sky-500 rounded-full opacity-70 p-[2px]" />
                <img
                  src={profilePhoto || "/profile.webp"}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== window.location.origin + "/profile.webp") {
                      target.src = "/profile.webp";
                    }
                  }}
                  alt="MD. Shinha Sarder portrait"
                  width={240}
                  height={240}
                  className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-[#070e24] shadow-2xl"
                />
                <span title="Verified" className="absolute bottom-3 right-3 bg-[#070e24] rounded-full p-1.5 border-2 border-blue-400 shadow-lg shadow-blue-500/50">
                  <BadgeCheck className="w-5 h-5 text-blue-400 fill-blue-400/30" />
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 sm:p-4">
              <table className="w-full text-sm">
                <tbody>
                  {info.map((row) => (
                    <tr key={row.label} className="border-b border-blue-500/15 last:border-0 hover:bg-blue-500/10 transition-colors">
                      <td className="py-2.5 px-4 w-[40%] sm:w-[32%] text-slate-300 font-medium align-top">
                        <span className="inline-flex items-center gap-2">
                          <row.icon size={14} className="text-blue-400 flex-shrink-0" /> {row.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-white font-normal">
                        {row.href ? (
                          <a href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-blue-300 hover:text-white underline underline-offset-2 hover:underline transition-colors break-all">
                            {row.value}
                          </a>
                        ) : (
                          row.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-7 justify-center">
          <a href="mailto:Shinhasarder2343@gmail.com" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5">
            <Mail size={15} /> Email Me
          </a>
          <a href="https://drive.google.com/file/d/1b4uAYCgzzgpprCkI16KYS2ycPk1VBEXk/view" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-blue-400/40 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-blue-600/20 hover:border-blue-400 transition-all hover:-translate-y-0.5">
            <FileText size={15} className="text-blue-400" /> Preview CV
          </a>
          <a href="https://share.google/8cHEzvrnE2uFpnlc3" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-blue-500/30 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:border-blue-400 hover:bg-blue-600/15 transition-all hover:-translate-y-0.5">
            <ExternalLink size={15} className="text-blue-400" /> Google Panel
          </a>
        </div>
      </div>

      <a href="#about" aria-label="Scroll down" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 hover:text-blue-400 transition-colors animate-bounce">
        <ArrowDown size={22} />
      </a>
    </section>
  );
};

export default HeroSection;
