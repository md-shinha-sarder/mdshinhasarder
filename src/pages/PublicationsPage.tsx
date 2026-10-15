import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import PageInfobox from "@/components/PageInfobox";
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

  const scholarStats = [
    { label: "Total Citations", value: `${totalCitations}`, color: "text-white font-bold", subtext: "Verified Citations" },
    { label: "h-index", value: `${hIndex}`, color: "text-sky-300 font-bold", subtext: "Productivity & Impact" },
    { label: "i10-index", value: `${i10Index}`, color: "text-indigo-300 font-bold", subtext: "High-Impact Works" },
    { label: "Research Papers", value: `${publications.length}`, color: "text-emerald-400 font-bold", subtext: "Indexed Articles" },
  ];

  const scholarFacts = [
    { label: "Researcher Entity", value: <span className="text-white font-bold">MD. Shinha Sarder</span> },
    { label: "Google Scholar Profile", value: <a href={SCHOLAR_PROFILE_URL} target="_blank" rel="noreferrer" className="text-sky-300 font-semibold hover:underline">scholar.google.com/citations?user=ixspgUAAAAAJ</a> },
    { label: "Academic Affiliation", value: <span className="text-slate-100">Department of Computer Science and Engineering, Northern University of Business and Technology Khulna (NUBTK)</span> },
    { label: "Research Disciplines", value: <span className="text-slate-100">Computational Graph Theory, Materials Science &amp; Engineering, Veterinary Epidemiology &amp; Disease Modelling, Algorithmic Analysis</span> },
    { label: "Scientific Repositories", value: <span className="text-slate-100">Google Scholar, ResearchGate, Semantic Scholar, CrossRef, DOI Registry</span> },
  ];

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
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-blue-200/80">
            <Link to="/" className="hover:text-sky-300 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Publications &amp; Scholar</span>
          </div>

          {/* Blue UI/UX Design Board Researcher Infobox */}
          <PageInfobox
            title="MD. Shinha Sarder — Academic &amp; Research Publications"
            subtitle="Google Scholar Verified Profile · Citations &amp; Scientific Research Repository"
            badge="Google Scholar Verified Researcher"
            badgeIcon={GraduationCap}
            avatarUrl="/profile.webp"
            avatarAlt="MD. Shinha Sarder"
            verified={true}
            description="Academic research papers, monographs, and scientific citations authored by MD. Shinha Sarder, synchronized directly with Google Scholar citations registry."
            stats={scholarStats}
            facts={scholarFacts}
            actions={[
              {
                label: "Open Google Scholar",
                href: SCHOLAR_PROFILE_URL,
                icon: GraduationCap,
                primary: true,
                external: true,
              },
              {
                label: "Browse Books (20)",
                href: "/books",
                icon: BookOpen,
              },
            ]}
          />

          {/* Filter & Search Bar in Blue UI/UX Container */}
          <div className="p-4 sm:p-5 rounded-2xl blue-uix-card mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or keyword..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-blue-950/70 border border-blue-500/30 text-xs text-white placeholder-blue-300/60 focus:outline-none focus:border-sky-400"
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40"
                      : "bg-blue-950/40 text-blue-200 hover:text-white border border-blue-500/20 hover:border-blue-400/40"
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
                className="rounded-2xl p-5 sm:p-6 blue-uix-card transition-all duration-300 shadow-xl group flex flex-col md:flex-row gap-5"
              >
                {/* Visual Thumbnail */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-blue-950 border border-blue-400/30 flex items-center justify-center relative shadow-md">
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
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-sky-200 border border-blue-500/40">
                        {pub.type}
                      </span>
                      <span className="text-xs text-blue-300 font-mono font-medium">
                        {pub.year}
                      </span>
                      {pub.citations > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                          <Quote size={11} />
                          {pub.citations} {pub.citations === 1 ? "Citation" : "Citations"}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors leading-snug mb-1">
                      {pub.title}
                    </h2>

                    <p className="text-xs text-sky-300 font-semibold mb-2">
                      Authors: <span className="text-slate-200 font-normal">{pub.authors}</span>
                    </p>

                    <p className="text-xs text-blue-200/90 font-mono mb-2">
                      Source: {pub.publisher}
                    </p>

                    <p className="text-xs text-slate-100 leading-relaxed text-justify line-clamp-3">
                      {pub.abstract}
                    </p>
                  </div>

                  {/* Links & Share */}
                  <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-blue-500/20">
                    <a
                      href={pub.scholarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white transition-colors"
                    >
                      <GraduationCap size={14} />
                      <span>View Citation on Google Scholar</span>
                      <ExternalLink size={11} />
                    </a>

                    <button
                      onClick={() => handleShare(pub)}
                      className="inline-flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 transition-colors"
                    >
                      {copiedId === pub.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Copied!</span>
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
