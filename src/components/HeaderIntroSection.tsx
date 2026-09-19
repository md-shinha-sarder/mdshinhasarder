import { Youtube, Facebook, Instagram, Linkedin, Github, Twitter, BadgeCheck, Radio, Music } from "lucide-react";

export const HeaderIntroSection = () => {
  const avatarUrl = "https://mdshinhasarder.com/profile.webp";

  const socials = [
    { name: "Facebook", href: "https://www.facebook.com/md.shinha.sarder", icon: Facebook, color: "hover:bg-[#1877f2]" },
    { name: "Twitter / X", href: "https://x.com/mdshinhasarder", icon: Twitter, color: "hover:bg-slate-800" },
    { name: "YouTube", href: "https://www.youtube.com/@MD-Shinha-Sarder", icon: Youtube, color: "hover:bg-[#ff0000]" },
    { name: "Instagram", href: "https://www.instagram.com/md_shinha_sarder", icon: Instagram, color: "hover:bg-[#e1306c]" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/md-shinha-sarder/", icon: Linkedin, color: "hover:bg-[#0077b5]" },
    { name: "GitHub", href: "https://github.com/md-shinha-sarder", icon: Github, color: "hover:bg-slate-800" },
    { name: "Deezer", href: "https://www.deezer.com/en/artist/338551431", icon: Radio, color: "hover:bg-red-600" },
    { name: "Spotify", href: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF", icon: Music, color: "hover:bg-emerald-600" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#04081c] to-black text-white py-12 px-4 border-b border-blue-900/40">
      {/* Micro tech grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.4) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Intro Avatar with verified ring */}
        <div className="relative mb-5 group">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-sky-400 to-indigo-500 shadow-xl shadow-blue-950/80 transition-transform duration-300 group-hover:scale-105">
            <img
              src={avatarUrl}
              alt="MD. Shinha Sarder portrait"
              className="w-full h-full rounded-full object-cover object-top border-2 border-black"
              onError={(e) => {
                e.currentTarget.src = "/profile.webp";
              }}
            />
          </div>
          <span
            title="Google Verified Public Figure"
            className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white ring-3 ring-black shadow-lg shadow-blue-500/50"
          >
            <BadgeCheck className="w-5 h-5 fill-blue-600 text-white" />
          </span>
        </div>

        {/* Name */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white mb-2 flex items-center justify-center gap-2">
          <span>MD. Shinha Sarder</span>
        </h1>

        {/* User requirement: Under name, nice ONLY "Entrepreneur" */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-blue-300 bg-blue-950/70 border border-blue-500/40 shadow-sm shadow-blue-900/30">
            Entrepreneur
          </span>
        </div>

        {/* Short verified description */}
        <p className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-300 max-w-2xl text-center mb-6 font-normal">
          Founder &amp; CEO of <strong className="text-white font-medium">IT Tech BD</strong> and <strong className="text-white font-medium">Biostar TV World</strong>. Regular student at Computer Science and Engineering (CSE) in Northern University of Business &amp; Technology, Khulna.
        </p>

        {/* Social Icons */}
        <ul className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5">
          {socials.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.name}
                  className={`w-9 h-9 rounded-full bg-slate-900/90 text-slate-300 border border-blue-900/50 hover:text-white flex items-center justify-center text-sm shadow-md transition-all duration-200 hover:scale-110 ${s.color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default HeaderIntroSection;
