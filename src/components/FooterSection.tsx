import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram, FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa6";
import { Mail, MapPin, Rss, FileText, BookOpen, Map, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const socials = [
  { Icon: FaFacebook, href: "https://www.facebook.com/md.shinha.sarder", label: "Facebook", color: "#1877F2" },
  { Icon: FaXTwitter, href: "https://x.com/mdshinhasarder", label: "X / Twitter", color: "#ffffff" },
  { Icon: FaYoutube, href: "https://www.youtube.com/@MD-Shinha-Sarder", label: "YouTube", color: "#FF0000" },
  { Icon: FaInstagram, href: "https://www.instagram.com/md_shinha_sarder", label: "Instagram", color: "#E4405F" },
  { Icon: FaLinkedin, href: "https://www.linkedin.com/in/md-shinha-sarder/", label: "LinkedIn", color: "#0A66C2" },
  { Icon: FaGithub, href: "https://github.com/md-shinha-sarder", label: "GitHub", color: "#ffffff" },
];

const FooterSection = () => (
  <footer className="relative border-t border-blue-500/25 pt-16 pb-8 bg-gradient-to-b from-[#091432] via-[#070e24] to-[#040816] overflow-hidden">
    {/* Ambient blue top glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-blue-600/15 blur-3xl pointer-events-none" />

    <div className="container mx-auto px-6 relative z-10">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-2">
          <h3 className="text-2xl font-serif font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-blue-400" /> MD. Shinha Sarder
          </h3>
          <p className="text-sm text-slate-300 text-justify leading-relaxed mb-4 max-w-md">
            Founder &amp; CEO of IT Tech BD and Biostar TV World. Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. Studying CSE at Northern University of Businesses and Technology, Khulna.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Next.js 16", "Node.js 22", "React 19", "Python", "Java", "Supabase CMS", "jsDelivr CDN", "cdnjs CDN", "IT Tech BD", "Biostar TV World", "Founder & CEO"].map((t) => (
              <span key={t} className="text-[11px] font-medium text-blue-300 bg-blue-500/10 border border-blue-400/20 px-2.5 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li><Link to="/biography" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><BookOpen size={13} className="text-blue-400" /> Full Biography</Link></li>
            <li><Link to="/skills" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><FileText size={13} className="text-blue-400" /> Technical Skills</Link></li>
            <li><Link to="/projects" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><FileText size={13} className="text-blue-400" /> Projects &amp; Ventures</Link></li>
            <li><Link to="/publications" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><BookOpen size={13} className="text-blue-400" /> Publications</Link></li>
            <li><Link to="/books" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><BookOpen size={13} className="text-blue-400" /> Published Books</Link></li>
            <li><Link to="/songs" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><Sparkles size={13} className="text-blue-400" /> Music &amp; Player</Link></li>
            <li><Link to="/posts" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"><FileText size={13} className="text-blue-400" /> All Posts</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4 text-white">Contact &amp; Location</h4>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-center gap-2"><FaWhatsapp size={15} style={{ color: "#25D366" }} /> <a href="https://wa.me/8801576716992" className="hover:text-blue-400 font-medium">+880 1576-716992</a></li>
            <li className="flex items-center gap-2"><Mail size={15} className="text-blue-400" /> <a href="mailto:Shinhasarder2343@gmail.com" className="hover:text-blue-400 break-all">Shinhasarder2343@gmail.com</a></li>
            <li className="flex items-center gap-2"><MapPin size={15} className="text-blue-400" /> Khulna, Bangladesh</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center gap-3.5 mb-8 flex-wrap">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
            className="w-10 h-10 rounded-full border border-blue-500/25 flex items-center justify-center bg-[#0c183b] hover:scale-110 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            <s.Icon size={18} style={{ color: s.color }} />
          </a>
        ))}
      </div>
      <div className="pt-6 border-t border-blue-500/20 text-center flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} MD. Shinha Sarder. All Rights Reserved. • Google Knowledge Graph Verified</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="text-blue-300">Next.js 16 &amp; Node.js</span>
          <span>•</span>
          <span className="text-emerald-300">Supabase CMS</span>
          <span>•</span>
          <span className="text-amber-300">jsDelivr &amp; cdnjs</span>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
