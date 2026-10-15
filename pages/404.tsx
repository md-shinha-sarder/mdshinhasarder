import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Compass, Home, BookOpen, Music, FileText, ArrowLeft, Images, Sparkles } from "lucide-react";
import PageInfobox from "@/components/PageInfobox";
import FooterSection from "@/components/FooterSection";

export default function Custom404Page() {
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Head>
        <title>404 — Page Not Found | MD. Shinha Sarder</title>
        <meta name="description" content="The requested page could not be located on MD. Shinha Sarder official website." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#070e24]/90 backdrop-blur-md border-b border-blue-500/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/favicon.webp" alt="MD. Shinha Sarder" className="w-7 h-7 rounded-full border border-blue-400/40" />
            <span className="font-serif font-bold text-white text-base group-hover:text-blue-400 transition-colors">
              MD. Shinha Sarder
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <a href="/" className="hover:text-sky-300 transition-colors">Home</a>
            <a href="/p/biography.html" className="hover:text-sky-300 transition-colors">Biography</a>
            <a href="/p/skills.html" className="hover:text-sky-300 transition-colors">Skills</a>
            <a href="/p/projects.html" className="hover:text-sky-300 transition-colors">Projects</a>
            <a href="/p/publication.html" className="hover:text-sky-300 transition-colors">Publications</a>
            <a href="/p/books.html" className="hover:text-sky-300 transition-colors">Books</a>
            <a href="/p/songs.html" className="hover:text-sky-300 transition-colors">Music</a>
            <a href="/p/gallery.html" className="hover:text-sky-300 transition-colors text-blue-400 font-bold">Gallery</a>
            <a href="/posts" className="hover:text-sky-300 transition-colors">Blog</a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20 w-full min-h-[70vh]">
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-blue-200/80">
          <a href="/" className="hover:text-sky-300 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} />
            <span>Home</span>
          </a>
          <span>/</span>
          <span className="text-white">Page Not Found (404)</span>
        </div>

        {/* Blue UI/UX Design Board Infobox */}
        <PageInfobox
          title="404 — Page Not Found"
          subtitle="The requested URL could not be located in this domain"
          badge="HTTP Status 404"
          badgeIcon={Compass}
          avatarUrl="/profile.webp"
          avatarAlt="MD. Shinha Sarder"
          verified={true}
          description={`We could not find the page at "${currentPath || "/"}". The link might have moved, expired, or been entered with a typo. You can explore the verified sections below.`}
          stats={[
            { label: "Status", value: "404", color: "text-amber-400 font-bold", subtext: "Not Found" },
            { label: "Published Books", value: "20 Books", color: "text-sky-300 font-bold", subtext: "Official Catalog" },
            { label: "Music Releases", value: "15 Songs", color: "text-emerald-400 font-bold", subtext: "Deezer & YouTube" },
            { label: "Entity Status", value: "Verified", color: "text-blue-300 font-bold", subtext: "MD. Shinha Sarder" },
          ]}
          facts={[
            { label: "Attempted Path", value: <span className="font-mono text-amber-300">{currentPath || "Requested URL"}</span> },
            { label: "Entity Profile", value: <span className="text-white font-bold">MD. Shinha Sarder (Founder &amp; CEO, IT Tech BD and Biostar TV World)</span> },
            { label: "Recommended Routes", value: <span className="text-sky-300">Home (/), Photo Gallery (/p/gallery.html), Biography (/p/biography.html), Books (/p/books.html), Songs (/p/songs.html), Publications (/p/publication.html)</span> },
            { label: "Official Support", value: <span className="text-slate-100">Contact admin or visit the official homepage for complete archives.</span> },
          ]}
          actions={[
            {
              label: "Return to Home",
              href: "/",
              icon: Home,
              primary: true,
            },
            {
              label: "Photo Gallery",
              href: "/p/gallery.html",
              icon: Images,
            },
            {
              label: "Browse Books",
              href: "/p/books.html",
              icon: BookOpen,
            },
            {
              label: "Listen to Songs",
              href: "/p/songs.html",
              icon: Music,
            },
            {
              label: "Read Posts",
              href: "/posts",
              icon: FileText,
            },
          ]}
        />
      </main>

      <FooterSection />
    </div>
  );
}
