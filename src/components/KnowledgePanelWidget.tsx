import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Calendar,
  Users,
  Mail,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Play,
  Music2,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  Radio,
  Building2,
  GraduationCap,
  Quote,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Github,
  Images,
} from "lucide-react";
import SkillCircleGraph from "@/components/SkillCircleGraph";
import { chaptraBooksData } from "@/pages/BooksPage";
import { songsData } from "@/pages/SongsPage";
import { defaultScholarPublications } from "@/hooks/useScholarPublications";

export const KnowledgePanelWidget = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "songs" | "books" | "publications">("overview");
  const [openSongIndex, setOpenSongIndex] = useState<number | null>(null);

  const photoSliderRef = useRef<HTMLDivElement>(null);

  // Auto horizontal scroll effect for photo slider
  useEffect(() => {
    const el = photoSliderRef.current;
    if (!el) return;
    let isPaused = false;
    let frameId: number;

    const step = () => {
      if (!isPaused && el) {
        el.scrollLeft += 0.6;
        if (Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      frameId = requestAnimationFrame(step);
    };

    const onEnter = () => { isPaused = true; };
    const onLeave = () => { isPaused = false; };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
    };
  }, [activeTab]);

  const avatarUrl = "https://mdshinhasarder.com/profile.webp";

  const socials = [
    { name: "Facebook", href: "https://www.facebook.com/md.shinha.sarder", icon: Facebook, color: "hover:bg-[#1877f2]" },
    { name: "Twitter / X", href: "https://x.com/mdshinhasarder", icon: Twitter, color: "hover:bg-slate-800" },
    { name: "YouTube", href: "https://www.youtube.com/@MD-Shinha-Sarder", icon: Youtube, color: "hover:bg-[#ff0000]" },
    { name: "Instagram", href: "https://www.instagram.com/md_shinha_sarder", icon: Instagram, color: "hover:bg-[#e1306c]" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/md-shinha-sarder/", icon: Linkedin, color: "hover:bg-[#0077b5]" },
    { name: "GitHub", href: "https://github.com/md-shinha-sarder", icon: Github, color: "hover:bg-slate-800" },
    { name: "Deezer", href: "https://www.deezer.com/en/artist/338551431", icon: Radio, color: "hover:bg-red-600" },
    { name: "Spotify", href: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF", icon: Music2, color: "hover:bg-emerald-600" },
  ];

  const photos = [
    { src: "/profile.webp", label: "Official Portrait · mdshinhasarder.com" },
    { src: "/hero-portrait.jpg", label: "ICT Author & Researcher" },
    { src: "/hero-bg.jpg", label: "Software & Digital Creator" },
    { src: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "From Khulna to the Cloud" },
    { src: "https://books.google.com/books/content?id=z_eEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "Days of a Dreaming Boy" },
    { src: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "Artificial Intelligence" },
    { src: "https://books.google.com/books/content?id=pqd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "The Musical Journey" },
    { src: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "From Village to Virtual" },
  ];

  const officialProfiles = [
    { name: "Deezer Verified", href: "https://www.deezer.com/en/artist/338551431", icon: Radio },
    { name: "Chaptra Author", href: "https://www.chaptra.com/author/md-shinha-sarder", icon: BookOpen },
    { name: "Google Scholar", href: "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en", icon: GraduationCap },
    { name: "Spotify Artist", href: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF", icon: Music2 },
    { name: "Google Books", href: "https://books.google.com.bd/books?id=_DZmEQAAQBAJ", icon: BookOpen },
    { name: "Official Domain", href: "https://mdshinhasarder.com", icon: Globe },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Knowledge Panel Unified Card */}
      <div className="rounded-3xl bg-[#070c1e]/95 border border-blue-900/50 shadow-2xl overflow-hidden backdrop-blur-md">

        {/* MIXED HEADER & PANEL DETAILS: Avatar, Name, Nice ONLY "Entrepreneur", Social Links & Actions */}
        <div className="p-6 sm:p-8 pb-6 border-b border-blue-950 bg-gradient-to-b from-black/60 via-[#070c1e]/90 to-[#070c1e]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with verified checkmark */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-blue-500 via-sky-400 to-indigo-500 shadow-xl shadow-blue-950/80 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={avatarUrl}
                  alt="MD. Shinha Sarder portrait"
                  className="w-full h-full rounded-xl object-cover object-top border-2 border-black"
                  onError={(e) => {
                    e.currentTarget.src = "/profile.webp";
                  }}
                />
              </div>
              <span
                title="Google Verified Public Figure"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-black shadow-lg shadow-blue-500/50"
              >
                <BadgeCheck className="w-5 h-5 fill-blue-600 text-white" />
              </span>
            </div>

            {/* Entity Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2.5">
                    <span>MD. Shinha Sarder</span>
                    <BadgeCheck className="w-7 h-7 text-blue-400 fill-blue-500/20 flex-shrink-0" />
                  </h1>

                  {/* Under name, nice ONLY "Entrepreneur" */}
                  <div className="mt-1.5 flex items-center justify-center md:justify-start">
                    <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-blue-300 bg-blue-950/80 border border-blue-500/40 shadow-sm">
                      Entrepreneur
                    </span>
                  </div>
                </div>

                {/* Top Action CTAs */}
                <div className="flex items-center justify-center md:justify-end gap-2.5 flex-wrap">
                  <a
                    href="https://www.deezer.com/en/artist/338551431"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold border border-blue-700/50 transition-colors"
                  >
                    <Radio size={13} />
                    <span>Deezer Artist</span>
                  </a>
                  <Link
                    to="/biography"
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-blue-900/60 transition-colors"
                  >
                    <span>Biography</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Sub-summary */}
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                Founder &amp; CEO of <strong className="text-white">IT Tech BD</strong> and <strong className="text-white">Biostar TV World</strong>. Computer Science &amp; Engineering scholar, Author, and Musical Artist.
              </p>

              {/* Social Media Link Icons */}
              <div className="mt-3.5 flex items-center justify-center md:justify-start flex-wrap gap-2">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      title={s.name}
                      className={`w-8 h-8 rounded-full bg-slate-900/90 text-slate-300 border border-blue-900/50 hover:text-white flex items-center justify-center text-xs shadow-sm transition-all duration-200 hover:scale-110 ${s.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 border-b border-blue-950 bg-[#040715] overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview & Facts", icon: Layers },
            { id: "books", label: "Books (20 Books · Chaptra)", icon: BookOpen },
            { id: "songs", label: "Songs (15 Tracks · Deezer)", icon: Music2 },
            { id: "publications", label: "Publications (15 Scholar)", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  active
                    ? "border-blue-500 text-blue-400 bg-blue-950/40"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon className="w-4 h-4 text-blue-400" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & BIOGRAPHY */}
        {activeTab === "overview" && (
          <div className="animate-fadeIn">
            {/* Auto-scrolling Verified Photo Strip */}
            <div
              ref={photoSliderRef}
              className="w-full h-44 overflow-x-auto flex items-center gap-3 p-3 bg-black/80 border-b border-blue-950 scrollbar-none cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-3 h-full flex-shrink-0">
                {photos.map((item, i) => (
                  <div
                    key={i}
                    className="group relative h-full w-52 rounded-xl overflow-hidden flex-shrink-0 border border-blue-900/40 shadow-md bg-slate-900"
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/profile.webp";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-medium text-white/90 truncate">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="p-5 border-b border-blue-950/60 bg-[#05091a]/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Born</span>
                  <strong className="text-white">5 Nov 2004 (age 21)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Building2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Founded</span>
                  <strong className="text-white">IT Tech BD &amp; Biostar TV</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Education</span>
                  <strong className="text-white">NUBTK · CSE &amp; Khulna Zilla School</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Inquiries</span>
                  <a href="mailto:shinhasarder2343@gmail.com" className="text-blue-400 hover:underline">
                    shinhasarder2343@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* EXACT CANONICAL BIOGRAPHY (akadik bio not show - only this single verified biography) */}
            <div className="p-6 sm:p-8 border-b border-blue-950">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Biography
                </h2>
              </div>

              <div className="rounded-2xl p-5 sm:p-6 bg-black/50 border border-blue-900/40 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 font-normal text-justify">
                <p>
                  MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. He regularly upload Content in YouTube, Facebook and other social media. He is a regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna. He was a former student of Khulna Zilla School. His father (MD. Lutfor Rahaman) is a lawyer. His mother (Samima Sultana) is a private sector employee. He born into a Muslim family in Shirgati village, Aichgati UnionParishad, Khulna.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/biography"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
                >
                  Read Comprehensive Biography
                  <ChevronRight size={14} />
                </Link>
                <a
                  href="https://share.google/8cHEzvrnE2uFpnlc3"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-blue-900/60 transition-colors"
                >
                  <ExternalLink size={13} className="text-blue-400" />
                  <span>View on Google</span>
                </a>
              </div>
            </div>

            {/* Official Knowledge Facts Table */}
            <div className="p-6 sm:p-8 border-b border-blue-950 bg-[#05091a]/40">
              <h2 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-400" />
                Structured Entity Facts
              </h2>

              <div className="overflow-hidden rounded-2xl border border-blue-900/50 bg-black/60 shadow-md">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody className="divide-y divide-blue-950/80">
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300 w-1/3 sm:w-1/4">Full Name</th>
                      <td className="py-3 px-5 text-slate-100 font-medium">MD. Shinha Sarder</td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Born</th>
                      <td className="py-3 px-5 text-slate-200">
                        5 November 2004 (age 21 years), Shirgati village, Aichgati UnionParishad, Khulna, Bangladesh
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Nationality</th>
                      <td className="py-3 px-5 text-slate-200">Bangladeshi</td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Role / Occupation</th>
                      <td className="py-3 px-5 text-blue-300 font-semibold">Entrepreneur</td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Organizations Founded</th>
                      <td className="py-3 px-5 text-slate-200">
                        <strong className="text-white">IT Tech BD</strong> (Founder &amp; CEO) · <strong className="text-white">Biostar TV World</strong> (Founder &amp; CEO)
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Education</th>
                      <td className="py-3 px-5 text-slate-200 leading-relaxed">
                        • Northern University of Businesses and Technology, Khulna (CSE)<br />
                        • Khulna Zilla School (Former Student)
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Parents</th>
                      <td className="py-3 px-5 text-slate-200">
                        MD. Lutfor Rahaman (Father, Lawyer) · Samima Sultana (Mother, Private Sector Employee)
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-5 bg-blue-950/40 font-semibold text-slate-300">Verified Profiles</th>
                      <td className="py-3 px-5 text-slate-200">
                        <div className="flex flex-wrap gap-2">
                          {officialProfiles.map((p) => {
                            const Icon = p.icon;
                            return (
                              <a
                                key={p.name}
                                href={p.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 text-xs border border-blue-800/40 transition-colors"
                              >
                                <Icon size={12} />
                                <span>{p.name}</span>
                                <ExternalLink size={10} />
                              </a>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technical Skills Circular Graph */}
            <div className="p-6 sm:p-8 border-b border-blue-950">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Engineering &amp; Core Skill Proficiencies
                </h2>
                <Link
                  to="/skills"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
                >
                  View Full Skills Page <ChevronRight size={13} />
                </Link>
              </div>
              <SkillCircleGraph />
            </div>
          </div>
        )}

        {/* TAB 2: BOOKS (Chaptra Direct 20 Books Integration) */}
        {activeTab === "books" && (
          <div className="p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/70 border border-blue-800/40 px-2.5 py-0.5 rounded-full">
                  Verified Author Catalog
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  Books by MD. Shinha Sarder ({chaptraBooksData.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Detected directly from Chaptra (chaptra.com/author/md-shinha-sarder)
                </p>
              </div>
              <Link
                to="/books"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
              >
                Browse All 20 Books on Dedicated Page
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {chaptraBooksData.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#05091a]/80 border border-blue-900/40 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-md group"
                >
                  <div>
                    <div className="w-full h-48 rounded-xl overflow-hidden mb-3 bg-slate-900 relative">
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = "/hero-portrait.jpg";
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-bold text-blue-300">
                        Chaptra
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                      {b.category} · {b.publishedDate}
                    </span>
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {b.title}
                    </h3>
                  </div>
                  <a
                    href={b.chaptraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white py-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow transition-colors"
                  >
                    <span>Read on Chaptra</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SONGS (Deezer Integration with All 15 Songs) */}
        {activeTab === "songs" && (
          <div className="p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/70 border border-blue-800/40 px-2.5 py-0.5 rounded-full">
                  Official Deezer Artist #338551431
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  Discography &amp; Releases ({songsData.length} Tracks)
                </h2>
                <p className="text-xs text-slate-400">
                  Streaming on Deezer, Spotify &amp; Google Knowledge Graph
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.deezer.com/en/artist/338551431"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-transform hover:scale-105"
                >
                  <Radio size={13} />
                  <span>Open Deezer</span>
                </a>
                <Link
                  to="/songs"
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-blue-900/60 transition-transform hover:scale-105"
                >
                  <span>Music Player</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Embedded Deezer Official Player Widget */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-blue-900/50 shadow-xl bg-black/80">
              <iframe
                title="Deezer Official Artist Player"
                src="https://widget.deezer.com/widget/dark/artist/338551431"
                width="100%"
                height="152"
                frameBorder="0"
                allow="encrypted-media; clipboard-write"
                className="w-full"
              />
            </div>

            {/* Song list */}
            <div className="divide-y divide-blue-950/80 bg-[#05091a]/60 rounded-2xl border border-blue-900/40 overflow-hidden">
              {songsData.map((song, i) => {
                const isOpen = openSongIndex === i;
                return (
                  <div key={song.id} className="p-3.5 hover:bg-blue-950/30 transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenSongIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800/40 text-blue-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-blue-900/40 bg-slate-900">
                          <img
                            src={song.cover}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/500x500.jpg";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-white text-xs sm:text-sm block truncate">{song.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({song.year}) · {song.genre}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400 font-mono">{song.duration}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="mt-3 ml-10 p-3.5 rounded-xl bg-black/60 border border-blue-900/40 text-xs text-slate-300 space-y-2">
                        <p>{song.description}</p>
                        <div className="pt-2 flex items-center gap-3">
                          <Link
                            to="/songs"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                          >
                            <Play size={12} className="fill-white" />
                            <span>Play Track in Player</span>
                          </Link>
                          <a
                            href={song.deezerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Deezer Artist Profile</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PUBLICATIONS (Google Scholar Detected Citations) */}
        {activeTab === "publications" && (
          <div className="p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/70 border border-blue-800/40 px-2.5 py-0.5 rounded-full">
                  Google Scholar Detected Citations
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  Research Papers &amp; Academic Works ({defaultScholarPublications.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Detected from scholar.google.com/citations?user=ixspgUAAAAAJ
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-transform hover:scale-105"
                >
                  <GraduationCap size={13} />
                  <span>Google Scholar Profile</span>
                  <ExternalLink size={11} />
                </a>
                <Link
                  to="/publications"
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-blue-900/60 transition-transform hover:scale-105"
                >
                  <span>Full Page</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-blue-950/80 bg-[#05091a]/60 rounded-2xl border border-blue-900/40 overflow-hidden">
              {defaultScholarPublications.map((pub) => (
                <div key={pub.id} className="p-4 hover:bg-blue-950/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900/50">
                          {pub.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{pub.year}</span>
                        {pub.citations > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <Quote size={10} />
                            {pub.citations} Citations
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-300">
                        {pub.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {pub.authors} · {pub.publisher}
                      </p>
                    </div>
                    <a
                      href={pub.scholarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-semibold border border-blue-900/50 transition-colors flex-shrink-0 flex items-center gap-1"
                    >
                      <span>Cite</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Pages Quick Portals */}
        <div className="p-6 sm:p-8 bg-[#040715] border-t border-blue-950">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
            Explore Dedicated Portals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {[
              { to: "/biography", label: "Biography", icon: Users },
              { to: "/skills", label: "Skills", icon: Layers },
              { to: "/projects", label: "Projects", icon: Building2 },
              { to: "/books", label: "Books", icon: BookOpen },
              { to: "/songs", label: "Songs", icon: Music2 },
              { to: "/publications", label: "Publications", icon: Award },
              { to: "/gallery", label: "Gallery", icon: Images },
            ].map((portal) => {
              const Icon = portal.icon;
              return (
                <Link
                  key={portal.to}
                  to={portal.to}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/60 border border-blue-950 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all hover:-translate-y-0.5 shadow-sm text-center group"
                >
                  <Icon size={18} className="text-blue-400 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="text-[11px] font-semibold">{portal.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePanelWidget;
