import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  BadgeCheck,
  Home,
  User,
  Wrench,
  FolderKanban,
  Images,
  Music,
  BookOpen,
  Newspaper,
  Award,
} from "lucide-react";
import siteLogo from "@/assets/site-logo.ico";

interface NavItem {
  label: string;
  to: string;
  icon: any;
}

const navLinks: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Biography", to: "/biography", icon: User },
  { label: "Skills", to: "/skills", icon: Wrench },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Publications", to: "/publications", icon: Award },
  { label: "Books", to: "/books", icon: BookOpen },
  { label: "Music", to: "/songs", icon: Music },
  { label: "Gallery", to: "/gallery", icon: Images },
  { label: "Blog", to: "/posts", icon: Newspaper },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const { pathname } = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40 shadow-sm flex-shrink-0 transition-transform group-hover:scale-105"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm sm:text-base font-serif font-bold text-white tracking-tight whitespace-nowrap group-hover:text-blue-400 transition-colors">
            MD. Shinha Sarder
          </span>
          <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-500/20 flex-shrink-0" aria-label="Verified" />
        </div>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400">Entrepreneur</span>
      </div>
    </Link>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-md border-b border-blue-900/50 shadow-lg shadow-black/80"
            : "bg-black/85 backdrop-blur-md border-b border-blue-900/30"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-2.5">
          {/* Mobile Bar */}
          <div className="flex items-center justify-between gap-2 lg:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="text-slate-200 p-2 hover:bg-slate-900 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex-1 flex justify-center min-w-0">
              {searchOpen ? (
                <form onSubmit={onSearch} className="w-full max-w-xs">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search site..."
                      aria-label="Search site"
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 text-white placeholder:text-slate-400 border border-blue-900/60 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </form>
              ) : (
                Brand
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-slate-200 p-2 hover:bg-slate-900 rounded-lg transition-colors"
                aria-label="Toggle search"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
            </div>
          </div>

          {/* Desktop Bar */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            {Brand}

            <ul className="flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((l) => {
                const Icon = l.icon;
                const isCurrent = pathname === l.to;

                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        isCurrent
                          ? "bg-blue-950/80 text-blue-400 border border-blue-800/60 shadow-sm"
                          : "text-slate-300 hover:text-blue-400 hover:bg-blue-950/40"
                      }`}
                    >
                      <Icon size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>{l.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              {searchOpen ? (
                <form onSubmit={onSearch}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search site..."
                      aria-label="Search site"
                      className="w-48 pl-9 pr-3 py-1.5 text-xs bg-slate-900 text-white placeholder:text-slate-400 border border-blue-900/60 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </form>
              ) : null}

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-slate-300 p-2 hover:bg-slate-900 rounded-lg transition-colors"
                aria-label="Toggle search"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#030612] border-r border-blue-900/40 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-900/30">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            Menu Navigation
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-1 px-3">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const isCurrent = pathname === l.to;

              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-blue-950/80 text-blue-400 font-bold border border-blue-800/40"
                      : "text-slate-300 hover:text-blue-400 hover:bg-slate-900"
                  }`}
                >
                  <Icon size={16} className="text-blue-400" />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-blue-900/30">
          <p className="text-[11px] text-slate-400 text-center">
            Official Portal of <strong className="text-white">MD. Shinha Sarder</strong>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
