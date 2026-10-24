import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home, Images, BookOpen, Music, FileText, ArrowLeft, Sparkles, Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300 flex flex-col">
      <Helmet>
        <title>404 - Page Not Found | MD. Shinha Sarder</title>
        <meta property="og:title" content="404 - Page Not Found | MD. Shinha Sarder" />
        <meta name="description" content="Oops! This page is lost in space. Return home or explore MD. Shinha Sarder verified portfolio." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center max-w-3xl mx-auto w-full">
          {/* Astronaut in Space Illustration matching uploaded photo */}
          <div className="w-full max-w-[340px] sm:max-w-[420px] mx-auto mb-6 transition-transform hover:scale-105 duration-500">
            <img
              src="/lost-in-space-404.svg"
              alt="404 — Astronaut and dog lost in space"
              className="w-full h-auto drop-shadow-md select-none pointer-events-none"
            />
          </div>

          {/* Large Bold 404 Heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-black dark:text-white tracking-tight font-sans leading-none mb-3">
            404
          </h1>

          {/* Subtitle matching uploaded image */}
          <p className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-200 mb-4 tracking-normal">
            Oops! this page is lost in space
          </p>

          {/* Clean Return Home link matching image */}
          <Link
            to="/"
            className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-sky-300 underline underline-offset-4 transition-colors inline-flex items-center gap-1.5 mb-10"
          >
            <Home size={18} />
            <span>Return home</span>
          </Link>

          {/* Quick Verified Portal Directory */}
          <div className="w-full bg-slate-50 border border-slate-200 dark:bg-neutral-900/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm max-w-xl mx-auto text-left transition-colors">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-neutral-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Compass size={14} className="text-blue-600 dark:text-blue-400" />
                Verified Sections
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                {location.pathname}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              The link you requested is not present on this domain. You can visit any verified destination below:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <Link
                to="/p/gallery.html"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
              >
                <Images size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Gallery</span>
              </Link>

              <Link
                to="/p/biography.html"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
              >
                <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Biography</span>
              </Link>

              <Link
                to="/p/books.html"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
              >
                <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Books</span>
              </Link>

              <Link
                to="/p/songs.html"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
              >
                <Music size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Music</span>
              </Link>

              <Link
                to="/p/publication.html"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
              >
                <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Publications</span>
              </Link>

              <Link
                to="/posts"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
              >
                <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                <span>All Posts</span>
              </Link>
            </div>
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default NotFound;
