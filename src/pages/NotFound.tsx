import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Compass, Home, BookOpen, Music, FileText, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import PageInfobox from "@/components/PageInfobox";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>404 — Page Not Found | MD. Shinha Sarder</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:py-24 w-full">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-blue-200/80">
            <Link to="/" className="hover:text-sky-300 transition-colors flex items-center gap-1">
              <ArrowLeft size={12} />
              <span>Home</span>
            </Link>
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
            description={`We could not find the page at "${location.pathname}". The link might have moved, expired, or been entered with a typo. You can explore the verified sections below.`}
            stats={[
              { label: "Status", value: "404", color: "text-amber-400 font-bold", subtext: "Not Found" },
              { label: "Published Books", value: "20 Books", color: "text-sky-300 font-bold", subtext: "Official Catalog" },
              { label: "Music Releases", value: "15 Songs", color: "text-emerald-400 font-bold", subtext: "Deezer & YouTube" },
              { label: "Entity Status", value: "Verified", color: "text-blue-300 font-bold", subtext: "MD. Shinha Sarder" },
            ]}
            facts={[
              { label: "Attempted Path", value: <span className="font-mono text-amber-300">{location.pathname}</span> },
              { label: "Entity Profile", value: <span className="text-white font-bold">MD. Shinha Sarder (Founder &amp; CEO, IT Tech BD and Biostar TV World)</span> },
              { label: "Recommended Routes", value: <span className="text-sky-300">Home (/), Biography (/p/biography.html), Books (/p/books.html), Songs (/p/songs.html), Publications (/p/publication.html), Gallery (/p/gallery.html)</span> },
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
    </div>
  );
};

export default NotFound;
