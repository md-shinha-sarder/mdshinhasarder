import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
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

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Biography — MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Complete verified biography of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World. Early life, education, entrepreneurial career, authorship, and musical artistry."
        />
        <meta property="og:image" content="/profile.webp" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          {/* Top Breadcrumb & Actions */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-800/60 mb-8">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white font-medium">Biography</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? "Copied" : "Share Biography"}</span>
            </button>
          </div>

          {/* Profile Header Header - Clean Laravel typography without heavy boxes */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-800/60">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-slate-800 shadow-xl bg-slate-900">
              <img
                src="/profile.webp"
                alt={profile.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {profile.name}
                </h1>
                <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-500/20" />
              </div>

              <p className="text-xs sm:text-sm text-sky-400 font-medium mt-1">
                {profile.tagline || "Entrepreneur"} · {profile.ventures}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-500" />
                  {profile.birthDate}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-500" />
                  Khulna, Bangladesh
                </span>
              </div>
            </div>
          </div>

          {/* Canonical Biography Text Article */}
          <article className="py-8 prose prose-invert max-w-none">
            <h2 className="text-xl font-bold text-white mb-4">Official Biography</h2>
            <p className="text-slate-300 text-base leading-relaxed text-justify">
              {profile.bioText}
            </p>
          </article>

          {/* Entity Facts - Clean Laravel table layout */}
          <div className="my-6">
            <h3 className="text-base font-bold text-white mb-3">Key Details &amp; Personal Background</h3>
            <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-xs sm:text-sm text-left divide-y divide-slate-800/40">
                <tbody className="divide-y divide-slate-800/40">
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium w-48">Full Name</th>
                    <td className="py-3 px-4 text-white font-medium">{profile.name}</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Born</th>
                    <td className="py-3 px-4 text-slate-200">{profile.birthDate} ({profile.birthPlace})</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Known As</th>
                    <td className="py-3 px-4 text-slate-200">Founder &amp; CEO, IT Tech BD and Biostar TV World</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Occupations</th>
                    <td className="py-3 px-4 text-sky-400">Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Higher Education</th>
                    <td className="py-3 px-4 text-slate-200">{profile.education}</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">School</th>
                    <td className="py-3 px-4 text-slate-200">{profile.school}</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Father</th>
                    <td className="py-3 px-4 text-slate-200">{profile.father}</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Mother</th>
                    <td className="py-3 px-4 text-slate-200">{profile.mother}</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-900/40 text-slate-400 font-medium">Hometown</th>
                    <td className="py-3 px-4 text-slate-200">Shirgati village, Aichgati UnionParishad, Khulna, Bangladesh</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Direct Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/60">
            <Link
              to="/songs"
              className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-xs font-semibold text-white">Songs &amp; Videos</span>
              </div>
              <ExternalLink size={12} className="text-slate-500" />
            </Link>

            <Link
              to="/books"
              className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-semibold text-white">Books &amp; Works</span>
              </div>
              <ExternalLink size={12} className="text-slate-500" />
            </Link>

            <Link
              to="/publications"
              className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Scholar Citations</span>
              </div>
              <ExternalLink size={12} className="text-slate-500" />
            </Link>
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default BiographyPage;
