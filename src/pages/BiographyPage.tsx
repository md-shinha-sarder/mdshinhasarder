import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  GraduationCap,
  Share2,
  Check,
  ExternalLink,
  Youtube,
  BookOpen,
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
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
      <Helmet>
        <title>Biography - MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Biography of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World. Entrepreneur, author, researcher, and musical artist."
        />
        <meta property="og:title" content="Biography - MD. Shinha Sarder" />
        <meta property="og:image" content="/profile.webp" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/biography.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-neutral-800 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 mb-2">
                <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">Biography</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Biography
              </h1>
            </div>

            <button
              onClick={handleCopyLink}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{copied ? "Copied" : "Share Biography"}</span>
            </button>
          </div>

          {/* Biography Article */}
          <article className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed text-justify space-y-5 mb-10">
            <p>{profile.bioText}</p>
          </article>

          {/* Direct Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-neutral-800">
            <Link
              to="/p/songs.html"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 transition-colors flex items-center justify-between group shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-2.5">
                <Youtube className="w-5 h-5 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Songs &amp; Videos (15 Tracks)</span>
              </div>
              <ExternalLink size={12} className="text-blue-600 dark:text-blue-400" />
            </Link>

            <Link
              to="/p/books.html"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 transition-colors flex items-center justify-between group shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Books &amp; Works (20 Books)</span>
              </div>
              <ExternalLink size={12} className="text-blue-600 dark:text-blue-400" />
            </Link>

            <Link
              to="/p/publication.html"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 transition-colors flex items-center justify-between group shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Scholar Citations (37+ Citations)</span>
              </div>
              <ExternalLink size={12} className="text-blue-600 dark:text-blue-400" />
            </Link>
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default BiographyPage;
