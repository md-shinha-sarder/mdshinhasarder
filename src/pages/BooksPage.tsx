import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  BookOpen,
  ExternalLink,
  Search,
  Share2,
  Check,
} from "lucide-react";
import { useBooksData, Book, CHAPTRA_AUTHOR_URL, DEFAULT_BOOKS } from "@/hooks/useBooksData";

// Re-exports for backwards compatibility
export { CHAPTRA_AUTHOR_URL, DEFAULT_BOOKS as chaptraBooksData };
export type { Book as ChaptraBook };

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

  return (
    <div className="relative min-h-screen bg-black text-slate-100">
      <Helmet>
        <title>MD. Shinha Sarder — Books &amp; Publications</title>
        <meta
          name="description"
          content="Author catalog and published books by MD. Shinha Sarder available on Google Books and Chaptra."
        />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold bg-sky-950/50 px-2.5 py-0.5 rounded-full border border-sky-800/40">
                  Published Author Catalog
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">Google Books &amp; Chaptra</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                Books by MD. Shinha Sarder
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Comprehensive collection of works on Computer Science, AI, Memoirs, and Leadership.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={CHAPTRA_AUTHOR_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <BookOpen size={15} />
                <span>Chaptra Author Profile</span>
                <ExternalLink size={12} />
              </a>

              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
                title="Share link"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="my-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      category === cat
                        ? "bg-slate-800 text-white font-medium"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Books Grid - Clean Laravel style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 shadow-md">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-sky-400 mt-1">
                      <span>{book.category}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">{book.publishedDate}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Author: MD. Shinha Sarder</span>
                  <a
                    href={book.chaptraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
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
