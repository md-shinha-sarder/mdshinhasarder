import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
      <Helmet>
        <title>Books - MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Author catalog and published books by MD. Shinha Sarder available on Google Books and Chaptra."
        />
        <meta property="og:title" content="Books - MD. Shinha Sarder" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/books.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-5xl">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400">
                <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">Books</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Books
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={CHAPTRA_AUTHOR_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-200 transition-colors"
              >
                <BookOpen size={14} className="text-blue-600 dark:text-sky-400" />
                <span>Chaptra Author</span>
              </a>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-200 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar in Blue UI/UX Container */}
          <div className="my-6 p-4 rounded-2xl blue-uix-card flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-blue-500 dark:text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, keyword, or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:bg-blue-950/70 dark:border-blue-500/30 dark:text-white dark:placeholder-blue-300/60"
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
                        ? "bg-blue-600 text-white shadow-sm border border-blue-500"
                        : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-blue-200/80 dark:hover:text-white dark:bg-blue-950/40 dark:border-blue-500/20"
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
                className="p-5 rounded-2xl blue-uix-card flex flex-col justify-between shadow-sm dark:shadow-md"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-400/30 shadow-sm">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-sky-300 font-medium mt-1">
                      <span>{book.category}</span>
                      <span className="text-slate-400 dark:text-blue-400/60">·</span>
                      <span className="text-slate-600 dark:text-slate-300">{book.publishedDate}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-3 mt-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-blue-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-blue-300 text-[11px] font-medium">Author: MD. Shinha Sarder</span>
                  <a
                    href={book.chaptraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-800 hover:text-blue-600 font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg border border-slate-200 dark:text-sky-300 dark:hover:text-white dark:bg-blue-950/60 dark:border-blue-500/30 dark:hover:bg-blue-900/60 transition-colors"
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
