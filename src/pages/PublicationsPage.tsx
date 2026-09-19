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
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Publications &amp; Google Scholar Citations — MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Academic papers, journal articles, and research monographs authored by MD. Shinha Sarder, detected directly from Google Scholar profile."
        />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Publications &amp; Scholar</span>
          </div>

          {/* Hero Banner with Scholar Profile Link and Citation Stats */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#070c1e]/95 border border-blue-900/50 shadow-2xl mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 text-xs font-semibold border border-blue-800/60 mb-3">
                  <GraduationCap size={14} className="text-blue-400" />
                  <span>Google Scholar Verified Profile</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  Research &amp; Publications
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  Automatically detected and synchronized from Google Scholar (scholar.google.com/citations?user=ixspgUAAAAAJ).
                  Covering materials engineering, veterinary epidemiology, graph theory, data structures, and computer science.
                </p>
              </div>

              {/* Scholar Stats Chips & Profile Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-black/60 border border-blue-900/40 px-4 py-2.5 rounded-2xl">
                  <div className="text-center px-2">
                    <span className="block text-base font-bold text-white">{totalCitations}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Citations</span>
                  </div>
                  <div className="h-6 w-px bg-blue-900/50" />
                  <div className="text-center px-2">
                    <span className="block text-base font-bold text-blue-400">{hIndex}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">h-index</span>
                  </div>
                  <div className="h-6 w-px bg-blue-900/50" />
                  <div className="text-center px-2">
                    <span className="block text-base font-bold text-indigo-400">{i10Index}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">i10-index</span>
                  </div>
                </div>

                <a
                  href={SCHOLAR_PROFILE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
                >
                  <GraduationCap size={14} />
                  <span>Open Google Scholar</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-[#05091a]/80 border border-blue-900/40 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or keyword..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              {publicationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedType === type
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-black/50 text-slate-400 hover:text-white border border-blue-950"
                  }`}
                >
                  {type === "all" ? `All (${publications.length})` : type}
                </button>
              ))}
            </div>
          </div>

          {/* Publications List */}
          <div className="space-y-4 mb-12">
            {filteredPublications.map((pub, idx) => (
              <div
                key={pub.id}
                className="rounded-2xl p-5 sm:p-6 bg-[#070c1e]/90 border border-blue-900/40 hover:border-blue-500/50 transition-all duration-300 shadow-md group flex flex-col md:flex-row gap-5"
              >
                {/* Visual Thumbnail */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-blue-900/40 flex items-center justify-center relative">
                  <img
                    src={pub.coverImage}
                    alt={pub.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-1">
                    <span className="text-[9px] font-mono text-blue-300 font-bold">
                      {pub.year}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-900/50">
                        {pub.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {pub.year}
                      </span>
                      {pub.citations > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <Quote size={11} />
                          {pub.citations} {pub.citations === 1 ? "Citation" : "Citations"}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-blue-300 transition-colors leading-snug mb-1">
                      {pub.title}
                    </h2>

                    <p className="text-xs text-blue-400 font-medium mb-2">
                      Authors: <span className="text-slate-300">{pub.authors}</span>
                    </p>

                    <p className="text-xs text-slate-400 font-mono mb-2">
                      Source: {pub.publisher}
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed text-justify line-clamp-3">
                      {pub.abstract}
                    </p>
                  </div>

                  {/* Links & Share */}
                  <div className="flex items-center gap-3 pt-3 mt-3 border-t border-blue-950">
                    <a
                      href={pub.scholarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <GraduationCap size={13} />
                      <span>View Citation on Google Scholar</span>
                      <ExternalLink size={12} />
                    </a>

                    <div className="flex-1" />

                    <button
                      type="button"
                      onClick={() => handleShare(pub)}
                      title="Copy citation link"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === pub.id ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Share2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPublications.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#05091a]/80 border border-blue-900/40 text-slate-400">
              No publications matched your search criteria.
            </div>
          )}
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default PublicationsPage;
