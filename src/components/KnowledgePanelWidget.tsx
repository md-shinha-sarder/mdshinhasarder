import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Calendar,
  Mail,
  ExternalLink,
  ChevronRight,
  Play,
  Music2,
  BookOpen,
  Radio,
  Building2,
  GraduationCap,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Github,
  X,
} from "lucide-react";
import SkillCircleGraph from "@/components/SkillCircleGraph";
import { useSongsData, Song, OFFICIAL_YOUTUBE_CHANNEL, DEEZER_ARTIST_COVER } from "@/hooks/useSongsData";
import { useBooksData } from "@/hooks/useBooksData";
import { useProfileData } from "@/hooks/useProfileData";
import { defaultScholarPublications } from "@/hooks/useScholarPublications";

export const KnowledgePanelWidget = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "songs" | "books" | "publications">("overview");
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);

  const { songs } = useSongsData();
  const { books } = useBooksData();
  const { profile } = useProfileData();

  const photoSliderRef = useRef<HTMLDivElement>(null);

  // Auto horizontal scroll effect for photo slider
  useEffect(() => {
    const el = photoSliderRef.current;
    if (!el) return;
    let isPaused = false;
    let frameId: number;

    const step = () => {
      if (!isPaused && el) {
        el.scrollLeft += 0.5;
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

  const avatarUrl = "/profile.webp";

  const socials = [
    { name: "YouTube", href: profile.youtubeChannel || OFFICIAL_YOUTUBE_CHANNEL, icon: Youtube, color: "hover:text-red-400" },
    { name: "Deezer", href: profile.deezer || "https://www.deezer.com/en/artist/338551431", icon: Radio, color: "hover:text-amber-400" },
    { name: "Spotify", href: profile.spotify || "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF", icon: Music2, color: "hover:text-emerald-400" },
    { name: "Chaptra", href: profile.chaptra || "https://www.chaptra.com/author/md-shinha-sarder", icon: BookOpen, color: "hover:text-sky-400" },
    { name: "Scholar", href: profile.scholar || "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en", icon: GraduationCap, color: "hover:text-blue-400" },
    { name: "Facebook", href: profile.facebook, icon: Facebook, color: "hover:text-blue-500" },
    { name: "Twitter / X", href: profile.twitter, icon: Twitter, color: "hover:text-slate-200" },
    { name: "Instagram", href: profile.instagram, icon: Instagram, color: "hover:text-pink-400" },
    { name: "LinkedIn", href: profile.linkedin, icon: Linkedin, color: "hover:text-blue-400" },
    { name: "GitHub", href: profile.github, icon: Github, color: "hover:text-white" },
  ];

  const photos = [
    { src: "/profile.webp", label: "Official Portrait" },
    { src: "/hero-portrait.jpg", label: "Author & Researcher" },
    { src: "/profile-photo.webp", label: "Founder & CEO" },
    { src: "/hero-bg.jpg", label: "Developer & Creator" },
    { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQV79hudXoSC3A3-63meKOFFLT-Um2ZMI_i3U65Qo6hitbx9o1eyq9vN6HZUD7NV_dI7ndaPm6l7P4h0crBvneHt4ueHVdP4koqJOMNEoBnvmnIwH7oM4ac_2HnwOvdvrgsz2twPB1mY-c8q5eCkDVCgws_iesMFEk9fnK0o9rdhPou_wyAEsKnbEraNbb/s266/1000020228.jpg", label: "Python Programming Analysis" },
    { src: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "Mastering C++" },
    { src: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg", label: "The Entrepreneur Journey" },
    { src: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "Journey of Koyra To Khulna" },
    { src: "https://books.google.com/books/content?id=z_eEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "Days of a Dreaming Boy" },
    { src: "https://books.google.com/books/content?id=e6uAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", label: "Life in Lines" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Profile Header */}
      <div className="pb-8 border-b border-slate-800/60">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with clean verified ring */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 shadow-lg">
              <img
                src={avatarUrl}
                alt={profile.name}
                className="w-full h-full rounded-xl object-cover object-top border-2 border-slate-950"
                onError={(e) => {
                  e.currentTarget.src = "/profile.webp";
                }}
              />
            </div>
            <span
              title="Verified Entity"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-slate-950 shadow-md"
            >
              <BadgeCheck className="w-4 h-4 fill-blue-600 text-white" />
            </span>
          </div>

          {/* Profile Identity */}
          <div className="flex-1 text-center md:text-left">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                <span>{profile.name}</span>
                <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-500/20" />
              </h1>

              <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium text-sky-400 bg-sky-950/60 border border-sky-800/40">
                  {profile.tagline || "Entrepreneur"}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">Founder &amp; CEO, IT Tech BD</span>
              </div>
            </div>

            {/* Social Channels Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-center md:justify-start gap-3 flex-wrap">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    title={s.name}
                    className={`p-1.5 rounded-md text-slate-400 ${s.color} hover:bg-slate-800/60 transition-colors`}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Laravel-Style Pill Navigation Tabs */}
      <div className="py-3 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("songs")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "songs"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Music2 size={13} className="text-red-400" />
            <span>Songs &amp; YouTube Videos ({songs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("books")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "books"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BookOpen size={13} className="text-sky-400" />
            <span>Books ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("publications")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "publications"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <GraduationCap size={13} className="text-indigo-400" />
            <span>Scholar Citations ({defaultScholarPublications.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="divide-y divide-slate-800/40">
            {/* Horizontal Photo Strip */}
            <div className="py-4">
              <div
                ref={photoSliderRef}
                className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {photos.map((item, i) => (
                  <div
                    key={i}
                    className="relative h-32 w-48 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-800/60 shadow-sm"
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/profile.webp";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] font-medium text-slate-200 truncate">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Calendar className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Born</span>
                  <strong className="text-white">{profile.birthDate}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Founded</span>
                  <strong className="text-white">IT Tech BD &amp; Biostar TV</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Education</span>
                  <strong className="text-white">NUBTK · CSE</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Inquiries</span>
                  <a href="mailto:shinhasarder2343@gmail.com" className="text-sky-400 hover:underline">
                    shinhasarder2343@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Clean Biography - Clean Typography without clunky nested boxes */}
            <div className="py-6">
              <h2 className="text-lg font-bold text-white mb-3">Biography</h2>
              <p className="text-slate-300 text-sm leading-relaxed text-justify">
                {profile.bioText}
              </p>
            </div>

            {/* Key Entity Attributes Table */}
            <div className="py-6">
              <h2 className="text-base font-bold text-white mb-3">Entity Attributes</h2>
              <div className="border border-slate-800/60 rounded-xl overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-left divide-y divide-slate-800/40">
                  <tbody className="divide-y divide-slate-800/40">
                    <tr>
                      <th className="py-2.5 px-4 bg-slate-900/40 text-slate-400 font-medium w-40">Born</th>
                      <td className="py-2.5 px-4 text-slate-200">
                        {profile.birthDate}, {profile.birthPlace}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-slate-900/40 text-slate-400 font-medium">Occupation</th>
                      <td className="py-2.5 px-4 text-sky-400 font-semibold">{profile.tagline || "Entrepreneur"}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-slate-900/40 text-slate-400 font-medium">Organizations</th>
                      <td className="py-2.5 px-4 text-slate-200">
                        <strong className="text-white">IT Tech BD</strong> (Founder &amp; CEO) · <strong className="text-white">Biostar TV World</strong> (Founder &amp; CEO)
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-slate-900/40 text-slate-400 font-medium">Education</th>
                      <td className="py-2.5 px-4 text-slate-200">
                        {profile.education} · {profile.school}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-slate-900/40 text-slate-400 font-medium">Parents</th>
                      <td className="py-2.5 px-4 text-slate-200">
                        {profile.father} · {profile.mother}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technical Skills Circular Graph */}
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Engineering &amp; Core Skill Proficiencies</h2>
                <Link to="/skills" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
                  <span>Full Skills</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
              <SkillCircleGraph />
            </div>
          </div>
        )}

        {/* TAB 2: SONGS & YOUTUBE VIDEOS */}
        {activeTab === "songs" && (
          <div className="py-6 space-y-6">
            {/* Official YouTube Channel Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 via-slate-900/60 to-slate-900/40 border border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Official YouTube Channel</h3>
                  <p className="text-xs text-slate-400">
                    Watch official music videos, singles, and performances on YouTube.
                  </p>
                </div>
              </div>
              <a
                href={profile.youtubeChannel || OFFICIAL_YOUTUBE_CHANNEL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shrink-0"
              >
                <span>Visit YouTube Channel</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Deezer Audio Stream Widget */}
            <div className="rounded-xl overflow-hidden border border-slate-800/60 bg-black">
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

            {/* Song list with direct YouTube Watch and Audio synthesis */}
            <div className="border border-slate-800/60 rounded-xl divide-y divide-slate-800/40 overflow-hidden bg-slate-900/20">
              {songs.map((song: Song, i: number) => {
                const videoId = song.youtubeId || "dQMyeL9CDks";
                return (
                  <div
                    key={song.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-semibold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>

                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-black">
                        <img
                          src={song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEEZER_ARTIST_COVER;
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{song.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{song.genre}</span>
                          <span>·</span>
                          <span>{song.year}</span>
                          <span>·</span>
                          <span>{song.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedVideo({ id: videoId, title: song.title })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Watch Video</span>
                      </button>

                      <a
                        href={song.youtubeUrl || `${OFFICIAL_YOUTUBE_CHANNEL}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Open on YouTube"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Link to="/songs" className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium">
                <span>View Full Music &amp; Audio Synthesizer Page</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKS */}
        {activeTab === "books" && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Published Books ({books.length})</h3>
                <p className="text-xs text-slate-400">Official author publications on Google Books and Chaptra.</p>
              </div>
              <Link to="/books" className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium">
                <span>All Books</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/30 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-20 rounded overflow-hidden shrink-0 bg-black border border-slate-800">
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-xs line-clamp-2">{book.title}</h4>
                      <p className="text-[11px] text-sky-400 mt-1">{book.category}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{book.publishedDate}</p>
                    </div>
                  </div>

                  <a
                    href={book.chaptraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
                  >
                    <span>Read on Chaptra</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SCHOLAR PUBLICATIONS */}
        {activeTab === "publications" && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">
                  Research Papers &amp; Academic Works ({defaultScholarPublications.length})
                </h3>
                <p className="text-xs text-slate-400">Detected from Google Scholar citations index.</p>
              </div>
              <a
                href={profile.scholar || "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
              >
                <span>Google Scholar Profile</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="border border-slate-800/60 rounded-xl divide-y divide-slate-800/40 bg-slate-900/20">
              {defaultScholarPublications.map((pub) => (
                <div key={pub.id} className="p-4 hover:bg-slate-900/40 transition-colors">
                  <h4 className="font-semibold text-white text-sm">{pub.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{pub.authors} · {pub.year}</p>
                  <p className="text-xs text-slate-400">{pub.venue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* YouTube Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-sm text-white truncate max-w-md">{selectedVideo.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&playsinline=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <span className="truncate">Official video stream for &ldquo;{selectedVideo.title}&rdquo;</span>
              <a
                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>If stream doesn&apos;t play in iframe, click here to watch directly</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgePanelWidget;
