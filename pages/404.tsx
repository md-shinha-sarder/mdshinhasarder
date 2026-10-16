import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Home, Images, BookOpen, Music, FileText, Compass, Sparkles, Sun, Moon } from "lucide-react";
import FooterSection from "@/components/FooterSection";

export default function Custom404Page() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
      const savedTheme = localStorage.getItem("theme");
      const darkActive = savedTheme ? savedTheme === "dark" : document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (nextDark) {
        root.classList.remove("light");
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
        localStorage.setItem("theme", "light");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300 flex flex-col">
      <Head>
        <title>404 — Page Not Found | MD. Shinha Sarder</title>
        <meta name="description" content="Oops! This page is lost in space. Return home or explore MD. Shinha Sarder verified portfolio." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 text-slate-900 dark:bg-black/95 dark:text-white backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 px-4 py-3 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/favicon.webp" alt="MD. Shinha Sarder" className="w-7 h-7 rounded-full border border-blue-500/40" />
            <span className="font-serif font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              MD. Shinha Sarder
            </span>
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <a href="/" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Home</a>
              <a href="/p/biography.html" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Biography</a>
              <a href="/p/skills.html" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Skills</a>
              <a href="/p/projects.html" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Projects</a>
              <a href="/p/publication.html" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Publications</a>
              <a href="/p/books.html" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Books</a>
              <a href="/p/songs.html" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Music</a>
              <a href="/p/gallery.html" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Gallery</a>
              <a href="/posts" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Blog</a>
            </nav>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-800 transition-colors flex items-center justify-center"
            >
              {isDark ? (
                <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon size={17} className="text-blue-600 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Lost in Space 404 Section */}
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
        <a
          href="/"
          className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-sky-300 underline underline-offset-4 transition-colors inline-flex items-center gap-1.5 mb-10"
        >
          <Home size={18} />
          <span>Return home</span>
        </a>

        {/* Quick Verified Portal Directory */}
        <div className="w-full bg-slate-50 border border-slate-200 dark:bg-neutral-900/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm max-w-xl mx-auto text-left transition-colors">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-neutral-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Compass size={14} className="text-blue-600 dark:text-blue-400" />
              Verified Sections
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
              {currentPath || "404 Route"}
            </span>
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            The link you requested is not present on this domain. You can visit any verified destination below:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <a
              href="/p/gallery.html"
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
            >
              <Images size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Gallery</span>
            </a>

            <a
              href="/p/biography.html"
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
            >
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Biography</span>
            </a>

            <a
              href="/p/books.html"
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
            >
              <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Books</span>
            </a>

            <a
              href="/p/songs.html"
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
            >
              <Music size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Music</span>
            </a>

            <a
              href="/p/publication.html"
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
            >
              <FileText size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Publications</span>
            </a>

            <a
              href="/posts"
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-black dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
            >
              <FileText size={14} className="text-blue-600 dark:text-blue-400" />
              <span>All Posts</span>
            </a>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
