import { useEffect, useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePosts } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { buildSeo } from "@/lib/seo";
import { buildAlt, enhanceContentImages } from "@/lib/imageSeo";
import { getStoredAdminPosts, getCachedAllPosts } from "@/lib/postSync";
import { toast } from "sonner";

const fmt = (d?: string | null) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
};

const PostDetailContent = () => {
  const params = useParams();
  const location = useLocation();

  // Extract raw slug safely from either :slug parameter or url path
  let targetSlug = (params.slug || "").replace(/\.html?$/, "");
  if (!targetSlug && location.pathname) {
    const parts = location.pathname.split("/").filter(Boolean);
    targetSlug = (parts[parts.length - 1] || "").replace(/\.html?$/, "");
  }
  try {
    targetSlug = decodeURIComponent(targetSlug).toLowerCase().trim();
  } catch {
    targetSlug = targetSlug.toLowerCase().trim();
  }

  const { posts, loading } = usePosts();

  // Multi-tier slug finder: active hook posts -> admin synced posts -> cached posts
  const post = useMemo(() => {
    if (!targetSlug) return null;

    // 1. Search hook posts
    const matchInList = (list: any[]) =>
      list.find((p) => {
        if (!p) return false;
        const s = String(p.slug || "").replace(/\.html?$/, "").toLowerCase().trim();
        const id = String(p.id || "").toLowerCase().trim();
        if (s === targetSlug || id === targetSlug) return true;
        if (s.endsWith("/" + targetSlug) || targetSlug.endsWith("/" + s)) return true;
        if (p.url) {
          const uSlug = p.url.split("/").pop()?.replace(/\.html?$/, "").toLowerCase().trim();
          if (uSlug === targetSlug) return true;
        }
        return false;
      });

    const found = matchInList(posts);
    if (found) return found;

    // 2. Search stored admin posts
    const adminPosts = getStoredAdminPosts();
    const adminFound = matchInList(adminPosts);
    if (adminFound) return adminFound;

    // 3. Search cached all posts
    const cachedPosts = getCachedAllPosts();
    return matchInList(cachedPosts) || null;
  }, [posts, targetSlug]);

  const slug = targetSlug;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const postTags = useMemo(() => (Array.isArray(post?.tags) ? post.tags : []), [post]);

  const related = useMemo(() => {
    return posts
      .filter((p) => p && p.slug !== slug && p.id !== post?.id)
      .slice(0, 3);
  }, [posts, slug, post]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

  // Extract embedded YouTube video IDs for VideoObject schema safely
  const videoIds = useMemo(() => {
    if (!post?.content) return [];
    const matches = post.content.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/g) || [];
    return matches.map((m) => (m.match(/([\w-]{11})$/) || [])[1]).filter(Boolean) as string[];
  }, [post?.content]);

  // Collect every image URL in the post (featured + inline) safely
  const allImages = useMemo(() => {
    if (!post) return [];
    const contentImages = [...((post.content || "").matchAll(/<img[^>]+src=["']([^"']+)["']/gi))].map((m) => m[1]);
    return [post.image, ...contentImages].filter(Boolean) as string[];
  }, [post]);

  // Ping search engines for new indexing once post is loaded
  useEffect(() => {
    if (!post || !url || typeof window === "undefined") return;
    const key = `pinged:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`https://ihegjzwlvthfqwredssj.supabase.co/functions/v1/ping-indexing?url=${encodeURIComponent(url)}`).catch(() => {});
  }, [post, slug, url]);

  const share = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post?.title || "")}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent((post?.title || "") + " " + url)}`,
  };

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const seo = post ? buildSeo(post) : null;
  const cleanDesc = seo?.metaDescription || "";
  const canonical = seo?.canonical || url;

  return (
    <div className="relative min-h-screen bg-[#070e24] text-foreground selection:bg-blue-500/30 selection:text-blue-100">
      <SiteBackground />
      <div className="relative z-10">
        <Navbar />
        {post && seo && (
          <Helmet>
            <title>{seo.metaTitle}</title>
            <meta name="description" content={cleanDesc} />
            <link rel="canonical" href={canonical} />
            <meta property="og:title" content={seo.ogTitle} />
            <meta property="og:description" content={cleanDesc} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={canonical} />
            {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
            <meta property="og:image:alt" content={post.title} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="MD. Shinha Sarder" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@mdshinhasarder" />
            <meta name="twitter:creator" content="@mdshinhasarder" />
            <meta name="twitter:title" content={seo.twitterTitle} />
            <meta name="twitter:description" content={cleanDesc} />
            {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}
            <meta name="twitter:image:alt" content={post.title} />
            {post.published && <meta property="article:published_time" content={post.published} />}
            {post.updated && <meta property="article:modified_time" content={post.updated} />}
            <meta property="article:author" content="MD. Shinha Sarder" />
            {postTags.map((t) => (
              <meta key={t} property="article:tag" content={t} />
            ))}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
                headline: (post.title || "").slice(0, 110),
                description: cleanDesc,
                image: allImages.length
                  ? allImages.map((u) => ({ "@type": "ImageObject", url: u, width: 1200, height: 800, caption: post.title }))
                  : undefined,
                datePublished: post.published,
                dateModified: post.updated || post.published,
                author: { "@type": "Person", name: "MD. Shinha Sarder", url: "https://mdshinhasarder.com/" },
                publisher: {
                  "@type": "Organization",
                  name: "MD. Shinha Sarder",
                  logo: { "@type": "ImageObject", url: "https://mdshinhasarder.com/favicon.ico" },
                },
                isPartOf: { "@type": "Product", productID: "CAowrcq9DA:openaccess" },
                isAccessibleForFree: true,
                keywords: postTags.join(", "),
              })}
            </script>
            {videoIds.map((vid) => (
              <script key={vid} type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "VideoObject",
                  name: post.title,
                  description: cleanDesc,
                  thumbnailUrl: [
                    `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
                    `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
                  ],
                  uploadDate: post.published,
                  contentUrl: `https://www.youtube.com/watch?v=${vid}`,
                  embedUrl: `https://www.youtube.com/embed/${vid}`,
                  publisher: {
                    "@type": "Organization",
                    name: "MD. Shinha Sarder",
                    logo: { "@type": "ImageObject", url: "https://mdshinhasarder.com/favicon.ico" },
                  },
                })}
              </script>
            ))}
            {allImages.slice(0, 10).map((u) => (
              <script key={u} type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ImageObject",
                  contentUrl: u,
                  url: u,
                  width: 1200,
                  height: 800,
                  caption: post.title,
                  name: post.title,
                  description: cleanDesc,
                  author: { "@type": "Person", name: "MD. Shinha Sarder" },
                  creditText: "MD. Shinha Sarder",
                  license: canonical,
                  acquireLicensePage: canonical,
                })}
              </script>
            ))}
          </Helmet>
        )}

        <article className="pt-32 pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <Link
              to="/#blog"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 mb-8 transition-colors"
            >
              <ArrowLeft size={16} /> Back to posts
            </Link>

            {loading && !post && (
              <div className="space-y-4">
                <div className="h-12 bg-card/60 animate-pulse rounded-xl" />
                <div className="h-80 bg-card/60 animate-pulse rounded-xl" />
              </div>
            )}

            {!loading && !post && (
              <div className="text-center py-20 bg-card/40 border border-blue-500/20 rounded-2xl p-8">
                <h1 className="text-2xl font-serif text-white mb-4">Post Not Found</h1>
                <p className="text-slate-400 text-sm mb-6">
                  The requested post could not be located. It might have been updated or moved.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    to="/posts"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                  >
                    Browse All Posts
                  </Link>
                  <Link
                    to="/"
                    className="px-5 py-2.5 rounded-xl border border-blue-400/30 text-blue-300 hover:bg-blue-600/20 text-sm font-medium transition-colors"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            )}

            {post && (
              <>
                {postTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {postTags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-400/20 px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400 mb-8">
                  <Calendar size={14} className="text-blue-400" /> {fmt(post.published)}
                  {post.source === "admin" && (
                    <span className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Live Synced
                    </span>
                  )}
                </div>

                {post.image && (
                  <div className="w-full mb-8 rounded-xl overflow-hidden border border-blue-500/25 shadow-2xl bg-[#070e24]/70 flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={post.image}
                      alt={buildAlt(post.title, postTags)}
                      loading="eager"
                      decoding="async"
                      {...({ fetchpriority: "high" } as any)}
                      className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg mx-auto"
                    />
                  </div>
                )}

                <div
                  className="prose prose-invert max-w-none prose-headings:font-serif prose-a:text-blue-400 prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto prose-img:object-contain prose-img:mx-auto text-justify [&_p]:text-justify [&_li]:text-justify text-slate-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: enhanceContentImages(post.content || "", post.title) }}
                />

                <div className="mt-12 pt-8 border-t border-blue-500/20">
                  <p className="text-sm text-slate-400 mb-3">Share this post</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={share.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-blue-500/30 bg-[#0c183a]/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-400 transition-colors"
                      title="Share on Facebook"
                    >
                      <Facebook size={16} />
                    </a>
                    <a
                      href={share.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-blue-500/30 bg-[#0c183a]/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-400 transition-colors"
                      title="Share on Twitter"
                    >
                      <Twitter size={16} />
                    </a>
                    <a
                      href={share.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-blue-500/30 bg-[#0c183a]/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-400 transition-colors"
                      title="Share on LinkedIn"
                    >
                      <Linkedin size={16} />
                    </a>
                    <a
                      href={share.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-blue-500/30 bg-[#0c183a]/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-400 transition-colors"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <button
                      onClick={copy}
                      className="w-10 h-10 rounded-full border border-blue-500/30 bg-[#0c183a]/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-400 transition-colors"
                      title="Copy link"
                    >
                      <LinkIcon size={16} />
                    </button>
                  </div>
                </div>

                {related.length > 0 && (
                  <div className="mt-16">
                    <h3 className="font-serif text-2xl text-white mb-6">Related Posts</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {related.map((r) => {
                        const rTags = Array.isArray(r.tags) ? r.tags : [];
                        return (
                          <Link
                            key={r.id}
                            to={postPath(r)}
                            className="group bg-[#0c183a]/90 rounded-xl overflow-hidden border border-blue-500/20 hover:border-blue-400/50 transition-all"
                          >
                            {r.image && (
                              <div className="w-full aspect-video bg-[#070e24] flex items-center justify-center p-1 overflow-hidden">
                                <img
                                  src={r.image}
                                  alt={buildAlt(r.title, rTags)}
                                  loading="lazy"
                                  decoding="async"
                                  className="max-w-full max-h-full w-auto h-auto object-contain"
                                />
                              </div>
                            )}
                            <div className="p-3">
                              <h4 className="text-sm font-serif font-semibold text-slate-200 line-clamp-2 group-hover:text-blue-300 transition-colors">
                                {r.title}
                              </h4>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </article>
        <FooterSection />
      </div>
    </div>
  );
};

export default function PostDetail() {
  return (
    <ErrorBoundary>
      <PostDetailContent />
    </ErrorBoundary>
  );
}
