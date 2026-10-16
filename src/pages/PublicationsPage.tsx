import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  Award,
  BookOpen,
  ExternalLink,
  Calendar,
  Building,
  FileText,
  Search,
  Share2,
  Check,
  GraduationCap,
  Sparkles,
  Quote,
} from "lucide-react";
import {
  useScholarPublications,
  ScholarPublication,
  SCHOLAR_PROFILE_URL,
} from "@/hooks/useScholarPublications";

export const PublicationsPage = () => {
  const { publications, totalCitations, hIndex, i10Index } = useScholarPublications();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const publicationTypes = useMemo(() => {
    const types = new Set(publications.map((p) => p.type));
    return ["all", ...Array.from(types)];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const matchType = selectedType === "all" || pub.type === selectedType;
      const matchSearch =
        searchQuery.trim() === "" ||
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.abstract.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [publications, selectedType, searchQuery]);

  const handleShare = (pub: ScholarPublication) => {
    navigator.clipboard.writeText(pub.scholarUrl);
    setCopiedId(pub.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
      <Helmet>
        <title>Publications - MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Academic papers, journal articles, and research citations authored by MD. Shinha Sarder."
        />
        <meta property="og:title" content="Publications - MD. Shinha Sarder" />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/publication.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400">
                <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">Publications</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Publications
              </h1>
            </div>

            <a
              href={SCHOLAR_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-200 transition-colors"
            >
              <GraduationCap size={14} className="text-blue-600 dark:text-sky-400" />
              <span>Google Scholar</span>
            </a>
          </div>

          {/* Filter & Search Bar in Blue UI/UX Container */}
          <div className="p-4 sm:p-5 rounded-2xl blue-uix-card mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-sky-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or keyword..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:bg-blue-950/70 dark:border-blue-500/30 dark:text-white dark:placeholder-blue-300/60"
              />
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              {publicationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedType === type
                      ? "bg-blue-600 text-white shadow-sm border border-blue-500"
                      : "bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:text-white dark:border-blue-500/20"
                  }`}
                >
                  {type === "all" ? `All (${publications.length})` : type}
                </button>
              ))}
            </div>
          </div>

          {/* Publications List with High-Contrast Blue UI/UX Cards */}
          <div className="space-y-4 mb-12">
            {filteredPublications.map((pub) => (
              <div
                key={pub.id}
                className="rounded-2xl p-5 sm:p-6 blue-uix-card transition-all duration-300 shadow-sm dark:shadow-xl group flex flex-col md:flex-row gap-5"
              >
                {/* Visual Thumbnail */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-400/30 flex items-center justify-center relative shadow-sm">
                  <img
                    src={pub.coverImage}
                    alt={pub.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-1">
                    <span className="text-[10px] font-mono text-sky-300 font-bold">
                      {pub.year}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-sky-200 dark:border-blue-500/40">
                        {pub.type}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-blue-300 font-mono font-medium">
                        {pub.year}
                      </span>
                      {pub.citations > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-600/40">
                          <Quote size={11} />
                          {pub.citations} {pub.citations === 1 ? "Citation" : "Citations"}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors leading-snug mb-1">
                      {pub.title}
                    </h2>

                    <p className="text-xs text-blue-600 dark:text-sky-300 font-semibold mb-2">
                      Authors: <span className="text-slate-700 dark:text-slate-200 font-normal">{pub.authors}</span>
                    </p>

                    <p className="text-xs text-slate-500 dark:text-blue-200/90 font-mono mb-2">
                      Source: {pub.publisher}
                    </p>

                    <p className="text-xs text-slate-700 dark:text-slate-100 leading-relaxed text-justify line-clamp-3">
                      {pub.abstract}
                    </p>
                  </div>

                  {/* Links & Share */}
                  <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-blue-500/20">
                    <a
                      href={pub.scholarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-sky-300 dark:hover:text-white transition-colors"
                    >
                      <GraduationCap size={14} />
                      <span>View Citation on Google Scholar</span>
                      <ExternalLink size={11} />
                    </a>

                    <button
                      onClick={() => handleShare(pub)}
                      className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-blue-200 dark:hover:text-white dark:bg-blue-950/60 dark:border-blue-500/30 transition-colors"
                    >
                      {copiedId === pub.id ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-300 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={12} />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default PublicationsPage;
