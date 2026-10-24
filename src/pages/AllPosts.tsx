import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePosts } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { buildAlt } from "@/lib/imageSeo";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const fmt = (d?: string | null) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
};

const AllPostsContent = () => {
  const { posts, loading } = usePosts();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    setQ(sp.get("q") || "");
  }, [sp]);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp);
      if (q) next.set("q", q);
      else next.delete("q");
      setSp(next, { replace: true });
    }, 200);
    return () => clearTimeout(t);
  }, [q, sp, setSp]);

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => (Array.isArray(p?.tags) ? p.tags : [])))).sort(),
    [posts]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (!p) return false;
      const pTags = Array.isArray(p.tags) ? p.tags : [];
      const matchTag = !tag || pTags.includes(tag);
      const matchQuery =
        !query ||
        (p.title || "").toLowerCase().includes(query) ||
        (p.excerpt || "").toLowerCase().includes(query);
      return matchTag && matchQuery;
    });
  }, [posts, tag, q]);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-100 transition-colors duration-300">
      <SiteBackground />
      <div className="relative z-10">
        <Helmet>
          <title>Blog - MD. Shinha Sarder</title>
          <meta
            name="description"
            content="Articles, technology insights, and updates published by MD. Shinha Sarder."
          />
          <meta property="og:title" content="Blog - MD. Shinha Sarder" />
          <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
        </Helmet>
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Page Header */}
            <div className="mb-8 border-b border-slate-200 dark:border-neutral-800 pb-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400">
                <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">Blog</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Blog
              </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search articles, technology, updates..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-neutral-700 transition-colors shadow-sm dark:shadow-none"
                />
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => setTag(null)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    !tag
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "border border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white dark:hover:border-neutral-700"
                  }`}
                >
                  All
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      tag === t
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "border border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white dark:hover:border-neutral-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {loading && filtered.length === 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-80 bg-slate-100 dark:bg-neutral-950 animate-pulse rounded-2xl border border-slate-200 dark:border-neutral-800" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 border border-slate-200 dark:bg-neutral-950 dark:border-neutral-800 rounded-2xl p-8">
                <h3 className="text-xl font-serif text-slate-900 dark:text-white mb-2">No Posts Found</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Try adjusting your search query or removing the selected category filter.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => {
                  const pTags = Array.isArray(p.tags) ? p.tags : [];
                  return (
                    <Link
                      key={p.id}
                      to={postPath(p)}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-400 dark:bg-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-700 transition-all hover:-translate-y-1 duration-300 flex flex-col shadow-sm"
                    >
                      {p.image && (
                        <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-black flex items-center justify-center p-2">
                          <img
                            src={resolveMediaUrl(p.image)}
                            alt={buildAlt(p.title, pTags)}
                            loading="lazy"
                            decoding="async"
                            className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = "/hero-portrait.jpg";
                            }}
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {pTags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 dark:text-sky-300 dark:bg-neutral-900 dark:border-neutral-800 px-2.5 py-0.5 rounded-full font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <h4 className="font-serif font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-neutral-300 line-clamp-2 mb-3 flex-1 leading-relaxed">
                          {p.excerpt}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
                          <Calendar size={13} className="text-blue-500 dark:text-blue-400" /> {fmt(p.published)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        <FooterSection />
      </div>
    </div>
  );
};

export default function AllPosts() {
  return (
    <ErrorBoundary>
      <AllPostsContent />
    </ErrorBoundary>
  );
}
