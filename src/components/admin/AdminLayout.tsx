import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  X,
  Search,
  Info,
  HelpCircle,
  Plus,
  FileText,
  BarChart2,
  MessageSquare,
  DollarSign,
  Copy,
  Layout,
  Palette,
  Settings,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Globe,
  LogOut,
  Home,
  Music,
  BookOpen,
  Images,
  ShieldCheck,
  Check,
} from "lucide-react";

export const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [blogDropdown, setBlogDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setDrawer(false);
    setUserDropdown(false);
    setBlogDropdown(false);
  }, [location.pathname]);

  // Handle outside clicks to close user & blog dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav("/auth");
      return;
    }
    if (!isAdmin) {
      signOut().then(() => {
        import("sonner").then(({ toast }) => toast.error("Admin access required."));
        nav("/auth");
      });
    }
  }, [user, isAdmin, loading, nav, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-[#5f6368] font-sans">
        <Helmet>
          <title>Blogger - Loading...</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="flex flex-col items-center gap-3">
          <img
            src="/images/site-logo.png"
            onError={(e) => {
              e.currentTarget.src = "/profile.webp";
            }}
            alt="Site Logo"
            className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-md animate-pulse"
          />
          <span className="text-sm font-medium text-[#202124]">Loading Blogger Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  // Core Blogger Menu items matching screenshot
  const coreMenuItems = [
    { to: "/admin/posts", icon: FileText, label: "Posts" },
    { to: "/admin/dashboard", icon: BarChart2, label: "Stats" },
    { to: "/admin/comments", icon: MessageSquare, label: "Comments" },
    { to: "/admin/earnings", icon: DollarSign, label: "Earnings" },
    { to: "/admin/pages", icon: Copy, label: "Pages" },
    { to: "/admin/profile-data", icon: Layout, label: "Layout" },
    { to: "/admin/theme", icon: Palette, label: "Theme" },
    { to: "/admin/seo", icon: Settings, label: "Settings" },
    { to: "/admin/tech-version", icon: Bookmark, label: "Reading List" },
  ];

  // Dedicated Content Management links under the menu
  const contentMenuItems = [
    { to: "/admin/songs", icon: Music, label: "Music & Songs" },
    { to: "/admin/books", icon: BookOpen, label: "Books & Pubs" },
    { to: "/admin/media", icon: Images, label: "Media Library" },
    { to: "/admin/news-check", icon: ShieldCheck, label: "Fact Verification" },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white select-none overflow-y-auto">
      {/* Blog Switcher matching Blogger */}
      <div className="p-3 border-b border-[#f1f3f4] relative">
        <div className="flex items-center gap-1 text-[11px] font-medium text-[#5f6368] px-2 mb-1">
          <Globe size={12} className="text-[#5f6368]" />
          <span>Public &gt;</span>
        </div>
        <div
          onClick={() => setBlogDropdown(!blogDropdown)}
          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f1f3f4] cursor-pointer transition-colors group border border-transparent hover:border-[#dadce0]"
          title="Click to toggle blog selection menu"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[14px] font-bold text-[#202124] truncate">
              MD. Shinha Sarder
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-[#5f6368] group-hover:text-[#202124] transition-transform duration-200 ${
              blogDropdown ? "rotate-180 text-[#e37400]" : ""
            }`}
          />
        </div>

        {/* Menu Under Show: Blog Switcher Dropdown Menu */}
        {blogDropdown && (
          <div className="mt-2 p-2.5 bg-white border border-[#dadce0] rounded-xl shadow-lg space-y-1.5 z-30 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#feefe3] text-[#d93025]">
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">MD. Shinha Sarder</div>
                <div className="text-[10px] text-[#5f6368] font-mono">ID: 6282207288549492115</div>
              </div>
              <Check size={14} className="text-[#d93025] shrink-0" />
            </div>

            <div className="pt-1.5 border-t border-[#f1f3f4] space-y-0.5">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#3c4043] hover:bg-[#f1f3f4] rounded-md transition-colors"
              >
                <ExternalLink size={13} className="text-[#5f6368]" />
                <span>Open Public Website</span>
              </a>
              <NavLink
                to="/admin/posts?new=true"
                onClick={() => {
                  setBlogDropdown(false);
                  setDrawer(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#e37400] hover:bg-[#feefe3] rounded-md transition-colors font-medium"
              >
                <Plus size={13} />
                <span>Create New Post</span>
              </NavLink>
              <NavLink
                to="/admin/seo"
                onClick={() => {
                  setBlogDropdown(false);
                  setDrawer(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#5f6368] hover:bg-[#f1f3f4] rounded-md transition-colors"
              >
                <Settings size={13} />
                <span>Blog Settings</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      {/* "+ NEW POST" Pill Button */}
      <div className="p-3 shrink-0">
        <NavLink
          to="/admin/posts?new=true"
          onClick={() => setDrawer(false)}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full border border-[#dadce0] bg-white hover:bg-[#f8f9fa] hover:shadow-md text-[#e37400] font-medium text-sm transition-all shadow-xs"
        >
          <Plus size={20} className="text-[#e37400] stroke-[2.5]" />
          <span className="tracking-wide">NEW POST</span>
        </NavLink>
      </div>

      {/* Blogger Navigation Links */}
      <nav className="flex-1 px-2 space-y-0.5 pb-4">
        {coreMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            (item.to === "/admin/posts" && location.pathname === "/admin") ||
            (item.to === "/admin/posts" && location.pathname.startsWith("/admin/post"));

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setDrawer(false)}
              className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#feefe3] text-[#d93025] font-semibold"
                  : "text-[#3c4043] hover:bg-[#f1f3f4]"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#d93025]" : "text-[#5f6368]"} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Content Management Links Under Core Menu */}
        <div className="pt-3 pb-1">
          <div className="border-t border-[#f1f3f4] mx-2 mb-2" />
          <div className="px-4 text-[10px] font-bold tracking-wider text-[#80868b] uppercase mb-1">
            Site Content
          </div>
        </div>

        {contentMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setDrawer(false)}
              className={`flex items-center gap-4 px-4 py-2 rounded-r-full text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#feefe3] text-[#d93025] font-semibold"
                  : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]"
              }`}
            >
              <Icon size={16} className={isActive ? "text-[#d93025]" : "text-[#5f6368]"} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-2 pb-1">
          <div className="border-t border-[#f1f3f4] mx-2 my-1" />
        </div>

        {/* View blog link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-4 py-2.5 rounded-r-full text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
        >
          <ExternalLink size={18} className="text-[#5f6368]" />
          <span>View blog</span>
        </a>
      </nav>

      {/* Bottom Footer Links matching Blogger */}
      <div className="p-4 border-t border-[#f1f3f4] text-[11px] text-[#5f6368] space-y-1 shrink-0">
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          <a href="#" className="hover:underline">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:underline">Content Policy</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#ffffff] text-[#202124] font-sans antialiased overflow-hidden">
      <Helmet>
        <title>Blogger: Posts - MD. Shinha Sarder</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Google Blogger Top Bar */}
      <header className="h-16 bg-white border-b border-[#dadce0] px-4 flex items-center justify-between shrink-0 select-none z-40">
        {/* Left: Menu Hamburger + Real Site Logo (Replacing orange B logo) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawer(!drawer)}
            className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors"
            aria-label="Main menu"
          >
            <Menu size={20} />
          </button>

          <NavLink to="/admin/posts" className="flex items-center gap-2.5 group">
            <img
              src="/images/site-logo.png"
              onError={(e) => {
                e.currentTarget.src = "/profile.webp";
              }}
              alt="MD. Shinha Sarder Site Logo"
              className="w-9 h-9 rounded-full object-cover border-2 border-orange-500/40 shadow-xs transition-transform group-hover:scale-105"
            />
            <span className="font-serif font-bold text-base text-[#202124] hidden sm:inline tracking-tight">
              Blogger
            </span>
          </NavLink>
        </div>

        {/* Center: Search Posts Capsule Input matching Blogger */}
        <div className="flex-1 max-w-2xl mx-4 hidden sm:block">
          <div className="relative flex items-center bg-[#f1f3f4] hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-[#dadce0] rounded-full px-4 py-2 transition-all">
            <Search size={18} className="text-[#5f6368] mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const el = document.getElementById("blogger-search-event") as HTMLInputElement | null;
                if (el) {
                  el.value = e.target.value;
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }}
              placeholder="Search posts"
              className="w-full bg-transparent text-sm text-[#202124] placeholder-[#5f6368] outline-none"
            />
            <button
              type="button"
              title="Search tips"
              className="text-[#5f6368] hover:text-[#202124] p-0.5 ml-2"
            >
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* Hidden bridge input for communicating search queries */}
        <input
          id="blogger-search-event"
          type="hidden"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Right side: Help icon, Google 9-dots apps icon, user avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative" ref={dropdownRef}>
          <button
            type="button"
            className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors hidden sm:flex items-center justify-center"
            title="Help"
          >
            <HelpCircle size={20} />
          </button>

          {/* Google Apps 9-dots grid */}
          <button
            type="button"
            className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-colors flex items-center justify-center"
            title="Google apps"
          >
            <svg className="w-5 h-5 fill-[#5f6368]" viewBox="0 0 24 24">
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="p-0.5 rounded-full hover:ring-2 hover:ring-[#dadce0] transition-all flex items-center justify-center"
              title="Google Account: MD. Shinha Sarder"
            >
              <img
                src="/profile.webp"
                alt="MD. Shinha Sarder"
                className="w-8 h-8 rounded-full object-cover border border-[#dadce0]"
                onError={(e) => {
                  e.currentTarget.src = "/profile.webp";
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {userDropdown && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-xl shadow-xl border border-[#dadce0] p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 pb-3 border-b border-[#f1f3f4]">
                  <img
                    src="/profile.webp"
                    alt="MD. Shinha Sarder"
                    className="w-10 h-10 rounded-full object-cover border border-[#dadce0]"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#202124] truncate">MD. Shinha Sarder</div>
                    <div className="text-xs text-[#5f6368] truncate">shinhasarder2343@gmail.com</div>
                  </div>
                </div>
                <div className="py-2 space-y-1">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#3c4043] hover:bg-[#f1f3f4] rounded-lg transition-colors"
                  >
                    <Home size={14} />
                    <span>View Public Website</span>
                  </a>
                  <button
                    onClick={() => signOut().then(() => nav("/auth"))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#d93025] hover:bg-[#fce8e6] rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (w-64) */}
        <aside className="hidden md:flex w-64 border-r border-[#dadce0] bg-white flex-col shrink-0 h-full overflow-hidden">
          {SidebarContent}
        </aside>

        {/* Mobile Drawer */}
        {drawer && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setDrawer(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-white border-r border-[#dadce0] flex flex-col shadow-2xl z-10 h-full">
              <div className="p-3 border-b border-[#dadce0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/site-logo.png"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.webp";
                    }}
                    alt="MD. Shinha Sarder Site Logo"
                    className="w-8 h-8 rounded-full object-cover border border-orange-500/40 shadow-xs"
                  />
                  <span className="font-semibold text-sm text-[#202124]">Blogger</span>
                </div>
                <button
                  onClick={() => setDrawer(false)}
                  className="p-1 rounded-lg text-[#5f6368] hover:bg-[#f1f3f4]"
                >
                  <X size={18} />
                </button>
              </div>
              {SidebarContent}
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
