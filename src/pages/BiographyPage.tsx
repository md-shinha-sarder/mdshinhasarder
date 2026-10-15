import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import PageInfobox from "@/components/PageInfobox";
import {
  BadgeCheck,
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  Users,
  Share2,
  Check,
  ExternalLink,
  Youtube,
  BookOpen,
  Music,
} from "lucide-react";
import { useProfileData } from "@/hooks/useProfileData";

export const BiographyPage = () => {
  const { profile } = useProfileData();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const entityFacts = [
    { label: "Full Name", value: <span className="text-white font-bold">{profile.name}</span> },
    { label: "Born", value: <span className="text-slate-100">{profile.birthDate} ({profile.birthPlace})</span> },
    { label: "Known As", value: <span className="text-sky-300 font-semibold">Founder &amp; CEO, IT Tech BD and Biostar TV World</span> },
    { label: "Occupations", value: <span className="text-blue-300 font-medium">Entrepreneur, Musical Artist, Author, Researcher, YouTuber &amp; Content Creator</span> },
    { label: "Higher Education", value: <span className="text-slate-100">{profile.education}</span> },
    { label: "Secondary School", value: <span className="text-slate-100">{profile.school}</span> },
    { label: "Father", value: <span className="text-slate-100">{profile.father}</span> },
    { label: "Mother", value: <span className="text-slate-100">{profile.mother}</span> },
    { label: "Hometown", value: <span className="text-slate-100">Shirgati village, Aichgati UnionParishad, Khulna, Bangladesh</span> },
    { label: "National Identity", value: <span className="text-slate-100">Bangladeshi Tech Entrepreneur &amp; Published Author</span> },
  ];

  const entityStats = [
    { label: "Published Books", value: "20+", color: "text-sky-400", subtext: "Chaptra & Google Books" },
    { label: "Music Releases", value: "15", color: "text-amber-400", subtext: "Deezer & Spotify" },
    { label: "Enterprises", value: "2", color: "text-emerald-400", subtext: "IT Tech BD & Biostar TV" },
    { label: "Citations", value: "37+", color: "text-indigo-400", subtext: "Google Scholar" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Biography — MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Complete verified biography of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World. Early life, education, entrepreneurial career, authorship, and musical artistry."
        />
        <meta property="og:image" content="/profile.webp" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/biography.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
          {/* Top Breadcrumb & Actions */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-blue-500/20 mb-8">
            <div className="flex items-center gap-2 text-xs text-blue-200/80">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white font-medium">Biography</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-xs text-blue-200 hover:text-white transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? "Copied" : "Share Biography"}</span>
            </button>
          </div>

          {/* Blue UI/UX Design Board Infobox */}
          <PageInfobox
            title={profile.name}
            subtitle={`${profile.tagline || "Entrepreneur"} · ${profile.ventures}`}
            badge="Google Knowledge Graph &amp; Official Entity"
            badgeIcon={BadgeCheck}
            avatarUrl="/profile.webp"
            avatarAlt={profile.name}
            verified={true}
            description="Official biographical record of MD. Shinha Sarder, documented across international encyclopedias, Google Knowledge Graph, academic registries, and digital broadcast networks."
            stats={entityStats}
            facts={entityFacts}
            actions={[
              { label: "Music Releases", href: "/songs", icon: Music, primary: true },
              { label: "Published Books", href: "/books", icon: BookOpen },
              { label: "Scholar Citations", href: "/publications", icon: GraduationCap },
            ]}
          />

          {/* Canonical Biography Text Article inside Blue UI/UX Card */}
          <article className="blue-uix-board p-6 sm:p-8 rounded-2xl sm:rounded-3xl mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>Canonical Narrative &amp; Career History</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/30 text-sky-300">
                Verified Document
              </span>
            </h2>
            <div className="text-slate-100 text-sm sm:text-base leading-relaxed text-justify space-y-4">
              <p>{profile.bioText}</p>
            </div>
          </article>

          {/* Direct Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-blue-500/20">
            <Link
              to="/p/songs.html"
              className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Youtube className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Songs &amp; Videos (15 Tracks)</span>
              </div>
              <ExternalLink size={12} className="text-blue-300" />
            </Link>

            <Link
              to="/p/books.html"
              className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Books &amp; Works (20 Books)</span>
              </div>
              <ExternalLink size={12} className="text-blue-300" />
            </Link>

            <Link
              to="/p/publication.html"
              className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Scholar Citations (37+ Citations)</span>
              </div>
              <ExternalLink size={12} className="text-blue-300" />
            </Link>
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default BiographyPage;
