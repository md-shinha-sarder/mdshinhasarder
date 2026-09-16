import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
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

const BlogSection = () => {
  const { posts, loading } = usePosts();
  const items = posts.slice(0, 9);

  return (
    <section id="blog" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">
            Articles &amp; Insights
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
            Latest <span className="text-gradient-blue">Posts</span>
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            {posts.length > 0
              ? `${posts.length} articles published · Next.js & Tech Tutorials`
              : "Stories, projects & updates"}
          </p>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-[#0c183a]/60 animate-pulse border border-blue-500/20"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => {
              const pTags = Array.isArray(p.tags) ? p.tags : [];
              return (
                <Link
                  key={p.id}
                  to={postPath(p)}
                  className="group bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl overflow-hidden border border-blue-500/25 hover:border-blue-400/70 transition-all hover:-translate-y-1 duration-300 flex flex-col shadow-xl shadow-blue-950/60"
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
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pTags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider text-blue-200 bg-blue-500/15 border border-blue-400/25 px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h4 className="font-serif font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                      {p.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2 flex-1 text-justify leading-relaxed">
                      {p.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-blue-500/15">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar size={13} className="text-blue-400" /> {fmt(p.published)}
                      </span>
                      <ArrowRight
                        size={15}
                        className="text-blue-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {posts.length > 9 && (
          <div className="text-center mt-12">
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 border border-blue-500/30 bg-[#0c183a]/80 px-7 py-3.5 rounded-xl text-white font-medium hover:border-blue-400 hover:bg-blue-600/20 transition-all shadow-lg"
            >
              View all {posts.length} posts <ArrowRight size={16} className="text-blue-400" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
