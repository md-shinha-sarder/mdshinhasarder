import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  TrendingUp,
  Tag,
  Search,
  Sparkles,
  Share2,
  Mail,
  Send,
  BadgeCheck,
  Image as ImageIcon,
} from "lucide-react";
import {
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaSpotify,
} from "react-icons/fa6";
import { usePosts } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { resolveMediaUrl, handleUploadedImageError } from "@/lib/mediaUrl";
import { toast } from "sonner";

// Estimate reading time from content
function estimateReadTime(content?: string): string {
  if (!content) return "2 min read";
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// Generate realistic view count for Codify style
function getViewsCount(post: any, index: number): number {
  if (post.views !== undefined && post.views > 0) return post.views;
  const presets = [68, 65, 58, 42, 33, 31, 11, 74, 88, 53, 39, 62, 50, 45];
  return presets[index % presets.length];
}

export const MainPostsGrid = () => {
  const { posts, loading } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);
  const [subscribedEmail, setSubscribedEmail] = useState("");

  const fmt = (d?: string | null) => {
    if (!d) return "Recently";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Extract unique categories / labels
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      tags.forEach((t) => {
        const key = t.trim();
        if (key) {
          counts[key] = (counts[key] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [posts]);

  // Featured lead post for Codify hero banner
  const featuredPost = posts[0] || null;

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (selectedCategory !== "All") {
      result = result.filter((p) => {
        const tags = Array.isArray(p.tags) ? p.tags : [];
        return tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase());
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [posts, selectedCategory, searchQuery]);

  const displayedPosts = filteredPosts.slice(0, displayCount);

  // Popular / Trending posts
  const popularPosts = useMemo(() => {
    return posts.slice(0, 5);
  }, [posts]);

  const handleShare = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://mdshinhasarder.com${postPath(p)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard!");
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribedEmail.trim() || !subscribedEmail.includes("@")) {
      return toast.error("Please enter a valid email address.");
    }
    toast.success("Thank you for subscribing to MD. Shinha Sarder's newsletter!");
    setSubscribedEmail("");
  };

  return (
    <div className="w-full my-8 font-['Poppins','Karla',sans-serif]">
      {/* 1. CODIFY TEMPLATE FEATURED POST HERO BANNER */}
      {featuredPost && (
        <section className="mb-10 group relative rounded-2xl overflow-hidden border border-[#e2e8f0] bg-gradient-to-br from-[#0a4275] via-[#1e3a8a] to-[#0f172a] shadow-md">
          <Link to={postPath(featuredPost)} className="block relative w-full h-[280px] sm:h-[380px] md:h-[440px] overflow-hidden">
            {resolveMediaUrl(featuredPost.image) && (
              <img
                src={resolveMediaUrl(featuredPost.image)}
                alt={featuredPost.title}
                {...({ fetchpriority: "high" } as any)}
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.85]"
                onError={(e) => handleUploadedImageError(e.currentTarget, featuredPost.image)}
              />
            )}
            {/* Codify Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            {/* Floating Top Badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d93025] text-white shadow-md flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>Featured</span>
              </span>
              {(featuredPost.tags || []).slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white z-10 max-w-4xl">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 mb-2.5 font-medium flex-wrap">
                <div className="flex items-center gap-2">
                  <img
                    src="/profile.webp"
                    alt="MD. Shinha Sarder"
                    className="w-6 h-6 rounded-full border border-white/50 object-cover"
                  />
                  <span>MD. Shinha Sarder</span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#38bdf8]" />
                  <span>{fmt(featuredPost.published)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#38bdf8]" />
                  <span>{estimateReadTime(featuredPost.content)}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:flex items-center gap-1">
                  <Eye size={13} className="text-[#38bdf8]" />
                  <span>{getViewsCount(featuredPost, 0)} views</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2.5 group-hover:text-[#60a5fa] transition-colors drop-shadow-sm">
                {featuredPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-3xl leading-relaxed mb-4 hidden sm:block">
                {featuredPost.excerpt || "Read full in-depth article, insights, and media publications by MD. Shinha Sarder."}
              </p>

              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full shadow-md transition-colors">
                <span>Continue Reading</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 2. TWO-COLUMN CODIFY BLOGGER MAGAZINE LAYOUT (#main-wrapper + #sidebar-wrapper) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN ARTICLES COLUMN (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section Header with Blogger Accent Underline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#e2e8f0]">
            <div>
              <h3 className="text-[22px] font-bold text-[#0a4275] relative after:content-[''] after:absolute after:left-0 after:bottom-[-14px] after:w-[60px] after:h-[2px] after:bg-[#2563eb]">
                Latest Articles
              </h3>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {["All", "Technology", "Song", "News", "Entrepreneur", "Music"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[#2563eb] text-white shadow-xs font-semibold"
                      : "bg-white text-[#5f6368] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {loading && displayedPosts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-[#e2e8f0]" />
              ))}
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center text-[#5f6368]">
              <p className="text-base font-semibold text-[#202124]">No posts found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-semibold text-[#2563eb] hover:underline"
              >
                Clear filters and view all articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedPosts.map((p, idx) => {
                const pTags = Array.isArray(p.tags) ? p.tags : [];
                const imgUrl = resolveMediaUrl(p.image);
                const viewsCount = getViewsCount(p, idx);
                const readTime = estimateReadTime(p.content);

                return (
                  <article
                    key={p.id}
                    className="group flex flex-col bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)] transition-all duration-300"
                  >
                    {/* 16:9 Image Wrap with Hover Zoom */}
                    <Link to={postPath(p)} className="relative block w-full aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => handleUploadedImageError(e.currentTarget, p.image)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                          <ImageIcon size={24} />
                          <span className="text-[11px] font-medium">No Photo</span>
                        </div>
                      )}
                      {/* Subtle dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />

                      {/* Primary Label Badge */}
                      {pTags.length > 0 && (
                        <div className="absolute top-3 left-3 z-10 flex gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2563eb] text-white shadow-xs">
                            {pTags[0]}
                          </span>
                        </div>
                      )}

                      {/* Quick Share on Hover */}
                      <button
                        type="button"
                        onClick={(e) => handleShare(p, e)}
                        title="Share article"
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Share2 size={13} />
                      </button>
                    </Link>

                    {/* Post Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Meta Info: Date + Reading Time + Views */}
                        <div className="flex items-center gap-2 text-[11.5px] text-[#64748b] mb-2 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#2563eb]" />
                            <span>{fmt(p.published)}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-[#64748b]" />
                            <span>{readTime}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} className="text-[#64748b]" />
                            <span>{viewsCount}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-[16px] sm:text-[17px] font-bold text-[#161619] group-hover:text-[#2563eb] transition-colors line-clamp-2 leading-snug mb-2">
                          <Link to={postPath(p)}>{p.title}</Link>
                        </h4>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-[13px] text-[#5e5e5e] line-clamp-2 leading-relaxed mb-4">
                          {p.excerpt || "Read the complete narrative and in-depth thoughts by MD. Shinha Sarder."}
                        </p>
                      </div>

                      {/* Card Footer: Author + Read Link */}
                      <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-[#5f6368]">
                          <img
                            src="/profile.webp"
                            alt="MD. Shinha Sarder"
                            className="w-5 h-5 rounded-full object-cover border border-[#cbd5e1]"
                          />
                          <span className="truncate max-w-[120px]">MD. Shinha Sarder</span>
                        </div>

                        <Link
                          to={postPath(p)}
                          className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>Read Story</span>
                          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {displayCount < filteredPosts.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="px-7 py-2.5 rounded-full bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-[#1e2a38] text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all inline-flex items-center gap-2"
              >
                <span>Load More Articles</span>
                <span className="text-xs text-[#64748b]">({filteredPosts.length - displayCount} remaining)</span>
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR COLUMN (lg:col-span-4) - CODIFY TEMPLATE WIDGETS */}
        <aside className="lg:col-span-4 space-y-6">
          {/* WIDGET 1: ABOUT AUTHOR CARD (.about-author) */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <img
                src="/profile.webp"
                alt="MD. Shinha Sarder"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-md ring-2 ring-blue-500/20"
                onError={(e) => {
                  e.currentTarget.src = "/profile.webp";
                }}
              />
              <div className="absolute bottom-0 right-1 bg-white rounded-full p-0.5 shadow-xs">
                <BadgeCheck size={18} className="text-[#1d9bf0] fill-[#1d9bf0]/20" />
              </div>
            </div>

            <h4 className="text-base font-bold text-[#161619] mb-0.5">MD. Shinha Sarder</h4>
            <p className="text-xs font-semibold text-[#2563eb] uppercase tracking-wider mb-2.5">
              Founder &amp; CEO • Entrepreneur
            </p>

            <p className="text-xs text-[#5e5e5e] leading-relaxed mb-4 px-2">
              Founder &amp; CEO of IT Tech BD and Biostar TV World. Researcher, author, musical artist, and CSE student at Northern University of Business &amp; Technology Khulna.
            </p>

            {/* Social Icons Bar matching brand colors */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-3 border-t border-[#f1f5f9]">
              <a
                href="https://www.facebook.com/md.shinha.sarder"
                target="_blank"
                rel="noreferrer"
                title="Facebook"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#1877f2" }}
              >
                <FaFacebookF size={13} />
              </a>
              <a
                href="https://x.com/mdshinhasarder"
                target="_blank"
                rel="noreferrer"
                title="X / Twitter"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#000000" }}
              >
                <FaXTwitter size={13} />
              </a>
              <a
                href="https://www.youtube.com/@MD-Shinha-Sarder"
                target="_blank"
                rel="noreferrer"
                title="YouTube"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#ff0000" }}
              >
                <FaYoutube size={13} />
              </a>
              <a
                href="https://open.spotify.com/artist/mdshinhasarder"
                target="_blank"
                rel="noreferrer"
                title="Spotify"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#1db954" }}
              >
                <FaSpotify size={13} />
              </a>
              <a
                href="https://www.linkedin.com/in/md-shinha-sarder/"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#0a66c2" }}
              >
                <FaLinkedinIn size={13} />
              </a>
              <a
                href="https://github.com/md-shinha-sarder"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#24292e" }}
              >
                <FaGithub size={13} />
              </a>
              <a
                href="https://www.instagram.com/md_shinha_sarder"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xs"
                style={{ backgroundColor: "#e4405f" }}
              >
                <FaInstagram size={13} />
              </a>
            </div>
          </div>

          {/* WIDGET 2: SEARCH POSTS WIDGET */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0a4275] uppercase tracking-wider pb-2 border-b border-[#f1f5f9] flex items-center gap-1.5">
              <Search size={15} className="text-[#2563eb]" />
              <span>Search Blog</span>
            </h4>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or keyword..."
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#cbd5e1] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none bg-[#f8fafc]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* WIDGET 3: POPULAR / TRENDING POSTS (.popular-posts) */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0a4275] uppercase tracking-wider pb-2 border-b border-[#f1f5f9] flex items-center gap-1.5">
              <TrendingUp size={15} className="text-[#2563eb]" />
              <span>Popular Posts</span>
            </h4>

            <div className="divide-y divide-[#f1f5f9] space-y-3 pt-1">
              {popularPosts.map((p, idx) => (
                <div key={p.id} className="pt-3 first:pt-0 flex items-center gap-3 group">
                  {/* Number Badge (01, 02, 03...) */}
                  <span className="w-6 text-sm font-black text-slate-300 group-hover:text-[#2563eb] transition-colors shrink-0 font-mono">
                    0{idx + 1}
                  </span>

                  {/* Square Thumbnail */}
                  <Link to={postPath(p)} className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-[#e2e8f0] flex items-center justify-center">
                    {resolveMediaUrl(p.image) ? (
                      <img
                        src={resolveMediaUrl(p.image)}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => handleUploadedImageError(e.currentTarget, p.image)}
                      />
                    ) : (
                      <ImageIcon size={16} className="text-slate-400" />
                    )}
                  </Link>

                  {/* Title & Date */}
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-[#161619] group-hover:text-[#2563eb] line-clamp-2 transition-colors leading-snug">
                      <Link to={postPath(p)}>{p.title}</Link>
                    </h5>
                    <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1 font-medium">
                      <span>{fmt(p.published)}</span>
                      <span>•</span>
                      <span>{getViewsCount(p, idx)} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 4: LABELS / CATEGORIES CLOUD (.cloud-label) */}
          {categoriesWithCounts.length > 0 && (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-[#0a4275] uppercase tracking-wider pb-2 border-b border-[#f1f5f9] flex items-center gap-1.5">
                <Tag size={15} className="text-[#2563eb]" />
                <span>Categories &amp; Labels</span>
              </h4>

              <div className="flex flex-wrap gap-2 pt-1">
                {categoriesWithCounts.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedCategory(tag)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                      selectedCategory === tag
                        ? "bg-[#2563eb] text-white border-[#2563eb] font-semibold"
                        : "bg-[#f8fafc] text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e1]"
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WIDGET 5: NEWSLETTER & SUBSCRIBER CARD */}
          <div className="bg-gradient-to-br from-[#050796] to-[#1e40af] text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Mail size={16} className="text-white" />
              </div>
              <h4 className="text-sm font-bold tracking-tight">Stay Updated</h4>
            </div>

            <p className="text-xs text-blue-100 leading-relaxed">
              Get notified when MD. Shinha Sarder publishes new tech essays, music albums, or research books.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <input
                type="email"
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 placeholder-blue-200 text-white outline-none focus:bg-white/20 focus:border-white transition-all"
              />
              <button
                type="submit"
                className="w-full text-xs font-semibold py-2.5 rounded-xl bg-white text-[#050796] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Subscribe Now</span>
                <Send size={13} />
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MainPostsGrid;
