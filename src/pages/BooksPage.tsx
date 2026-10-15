import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import PageInfobox from "@/components/PageInfobox";
import {
  BookOpen,
  ExternalLink,
  Search,
  Share2,
  Check,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { useBooksData, CHAPTRA_AUTHOR_URL } from "@/hooks/useBooksData";

export default function BooksPage() {
  const { books } = useBooksData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["all", ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || b.category === category;
      return matchSearch && matchCat;
    });
  }, [books, search, category]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const authorStats = [
    { label: "Published Volumes", value: `${books.length}`, color: "text-sky-300", subtext: "Cataloged Editions" },
    { label: "Author Status", value: "Verified", color: "text-emerald-400", subtext: "Chaptra & Google Books" },
    { label: "Genres", value: "6 Fields", color: "text-amber-400", subtext: "AI, CSE, Memoirs, Poetry" },
    { label: "Citations", value: "37+", color: "text-indigo-400", subtext: "Academic Research" },
  ];

  const authorFacts = [
    { label: "Author Entity", value: <span className="text-white font-bold">MD. Shinha Sarder</span> },
    { label: "Catalog Platforms", value: <span className="text-sky-300 font-semibold">Chaptra Author Catalog · Google Books Global Repository · Amazon</span> },
    { label: "Subject Categories", value: <span className="text-slate-100">Artificial Intelligence, Computer Science &amp; Programming, Memoirs, Educational Technology, Leadership &amp; Poetry</span> },
    { label: "Flagship Titles", value: <span className="text-slate-100">Artificial Intelligence: Shaping the Future · Days of a Dreaming Boy · From Khulna to the Cloud · Life in Lines</span> },
    { label: "Author Location", value: <span className="text-slate-100">Khulna, Bangladesh</span> },
  ];

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>MD. Shinha Sarder — Books &amp; Publications</title>
        <meta
          name="description"
          content="Author catalog and published books by MD. Shinha Sarder available on Google Books and Chaptra."
        />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/books.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-5xl">
          {/* Blue UI/UX Design Board Author Infobox */}
          <PageInfobox
            title="MD. Shinha Sarder — Author &amp; Book Catalog"
            subtitle="Verified Author Profile · Google Books &amp; Chaptra Multi-Platform Registry"
            badge="Verified Published Author"
            badgeIcon={BookOpen}
            avatarUrl="/profile.webp"
            avatarAlt="MD. Shinha Sarder"
            verified={true}
            description="Comprehensive collection of published works authored by MD. Shinha Sarder, spanning Computer Science, Artificial Intelligence algorithms, personal memoirs, and reflective anthologies."
            stats={authorStats}
            facts={authorFacts}
            actions={[
              {
                label: "Chaptra Author Profile",
                href: CHAPTRA_AUTHOR_URL,
                icon: BookOpen,
                primary: true,
                external: true,
              },
              {
                label: copied ? "Copied Link" : "Share Catalog",
                onClick: handleShare,
                icon: copied ? Check : Share2,
              },
            ]}
          />

          {/* Search & Category Filter Bar in Blue UI/UX Container */}
          <div className="my-6 p-4 rounded-2xl blue-uix-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, keyword, or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-blue-950/70 border border-blue-500/30 rounded-xl text-xs text-white placeholder-blue-300/60 focus:outline-none focus:border-sky-400"
              />
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors font-semibold ${
                      category === cat
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50"
                        : "text-blue-200/80 hover:text-white bg-blue-950/40 border border-blue-500/20 hover:border-blue-400/40"
                    }`}
                  >
                    {cat === "all" ? `All Categories (${books.length})` : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Books Grid with High-Contrast Blue UI/UX Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="p-5 rounded-2xl blue-uix-card flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-blue-950 border border-blue-400/30 shadow-md">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-sky-300 font-medium mt-1">
                      <span>{book.category}</span>
                      <span className="text-blue-400/60">·</span>
                      <span className="text-slate-300">{book.publishedDate}</span>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-3 mt-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-500/20 flex items-center justify-between text-xs">
                  <span className="text-blue-300 text-[11px] font-medium">Author: MD. Shinha Sarder</span>
                  <a
                    href={book.chaptraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-300 hover:text-white font-bold bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-500/30 hover:bg-blue-900/60 transition-colors"
                  >
                    <span>Read on Chaptra</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
}
