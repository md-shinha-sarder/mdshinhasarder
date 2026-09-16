import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePosts } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { buildAlt } from "@/lib/imageSeo";

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
    <div className="relative min-h-screen bg-[#070e24] text-foreground selection:bg-blue-500/30 selection:text-blue-100">
      <SiteBackground />
      <div className="relative z-10">
        <Helmet>
          <title>All Posts | MD. Shinha Sarder</title>
          <meta
            name="description"
            content="Browse all articles, biographies, projects, and tech insights published by MD. Shinha Sarder."
          />
          <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
        </Helmet>
        <Navbar />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Home
            </Link>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-3 text-white">
              All <span className="text-gradient-blue">Posts</span>
            </h1>
            <p className="text-slate-400 mb-8">{posts.length} articles published</p>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search articles, technology, updates..."
                  className="w-full pl-10 pr-4 py-3 bg-[#0c183a]/90 border border-blue-500/25 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => setTag(null)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    !tag
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "border border-blue-500/20 bg-[#0c183a]/60 text-slate-300 hover:text-white hover:border-blue-400"
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
                        : "border border-blue-500/20 bg-[#0c183a]/60 text-slate-300 hover:text-white hover:border-blue-400"
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
                  <div key={i} className="h-80 bg-[#0c183a]/60 animate-pulse rounded-2xl border border-blue-500/20" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-[#0c183a]/40 border border-blue-500/20 rounded-2xl p-8">
                <h3 className="text-xl font-serif text-white mb-2">No Posts Found</h3>
                <p className="text-sm text-slate-400">
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
                      className="group bg-[#0c183a]/80 rounded-2xl overflow-hidden border border-blue-500/25 hover:border-blue-400/60 transition-all hover:-translate-y-1 duration-300 flex flex-col shadow-lg"
                    >
                      {p.image && (
                        <div className="aspect-[16/10] overflow-hidden bg-[#070e24] flex items-center justify-center p-2">
                          <img
                            src={p.image}
                            alt={buildAlt(p.title, pTags)}
                            loading="lazy"
                            decoding="async"
                            className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {pTags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-400/20 px-2.5 py-0.5 rounded-full font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <h4 className="font-serif font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors leading-snug">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 mb-3 flex-1 leading-relaxed">
                          {p.excerpt}
                        </p>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 pt-3 border-t border-blue-500/15">
                          <Calendar size={13} className="text-blue-400" /> {fmt(p.published)}
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
