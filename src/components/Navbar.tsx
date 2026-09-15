import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, BadgeCheck, Home, User, Wrench, FolderKanban, Sparkles, Images, Video, Film, Music, BookOpen, Newspaper } from "lucide-react";
import siteLogo from "@/assets/site-logo.ico";

const navLinks = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Biography", href: "#about", icon: User },
  { label: "Skills", href: "#skills", icon: Wrench },
  { label: "Projects", href: "#projects", icon: FolderKanban },
  { label: "Services", href: "#services", icon: Sparkles },
  { label: "Videos", href: "#videos", icon: Video },
  { label: "Reels", href: "#reels", icon: Film },
  { label: "Gallery", href: "#gallery", icon: Images },
  { label: "Music", href: "#music", icon: Music },
  { label: "Books", href: "#books", icon: BookOpen },
  { label: "Blog", href: "#blog", icon: Newspaper },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const { pathname } = useLocation();
  const nav = useNavigate();
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const linkHref = (href: string) => (onHome ? href : `/${href}`);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/posts?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setOpen(false);
    }
  };

  const Brand = (
    <Link to="/" className="flex items-center gap-2 min-w-0 group" onClick={() => setOpen(false)}>
      <img
        src={siteLogo || "/site-logo.ico"}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== window.location.origin + "/favicon.ico") {
            target.src = "/favicon.ico";
          }
        }}
        alt="MD. Shinha Sarder logo"
        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400/40 shadow-blue flex-shrink-0 transition-transform group-hover:scale-105"
      />
      <span className="text-sm sm:text-base font-serif font-bold text-white tracking-tight whitespace-nowrap group-hover:text-blue-300 transition-colors">MD. Shinha Sarder</span>
      <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/25 flex-shrink-0" aria-label="Verified" />
    </Link>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#091432]/92 backdrop-blur-md border-b border-blue-500/25 shadow-lg shadow-blue-950/70" : "bg-[#070e24]/75 backdrop-blur-md border-b border-blue-500/15"}`}>
        <div className="container mx-auto px-4 sm:px-6 py-3.5">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 lg:hidden">
            <button onClick={() => setOpen(!open)} className="text-slate-100 p-2 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" aria-label="Toggle menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex justify-center min-w-0">
              {searchOpen ? (
                <form onSubmit={onSearch} className="w-full max-w-md">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search site..." aria-label="Search site"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#0b1739] text-white placeholder:text-slate-400 border border-blue-500/30 rounded-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
                  </div>
                </form>
              ) : Brand}
            </div>
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-100 p-2 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" aria-label="Toggle search">
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-between gap-4">
            {Brand}
            <ul className="flex items-center gap-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={linkHref(l.href)} className="group flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-slate-200 hover:text-white rounded-lg hover:bg-blue-600/15 border border-transparent hover:border-blue-500/25 transition-all">
                    <l.icon size={14} className="text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span>{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              {searchOpen ? (
                <form onSubmit={onSearch}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search site..." aria-label="Search site"
                      className="w-56 pl-9 pr-3 py-2 text-xs bg-[#0b1739] text-white placeholder:text-slate-400 border border-blue-500/30 rounded-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
                  </div>
                </form>
              ) : null}
              <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-200 p-2 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" aria-label="Toggle search">
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 bg-[#070e24]/80 backdrop-blur-md transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setOpen(false)} />
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#091432]/98 backdrop-blur-2xl border-r border-blue-500/25 shadow-2xl transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!open}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-500/20 bg-[#070e24]/60">
          <span className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" /> Navigation Menu
          </span>
          <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-blue-500/10" aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="flex flex-col py-3">
          {navLinks.map((l) => (
            <a key={l.href} href={linkHref(l.href)} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-blue-600/15 border-l-2 border-transparent hover:border-blue-400 transition-all">
              <l.icon size={16} className="text-blue-400" />
              <span>{l.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Navbar;
