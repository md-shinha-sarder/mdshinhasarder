import { useEffect, useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, Compass, Home, BookOpen, Music, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePosts, usePages } from "@/hooks/usePosts";
import { postPath } from "@/lib/postUrl";
import { buildSeo } from "@/lib/seo";
import { buildAlt, enhanceContentImages } from "@/lib/imageSeo";
import { getStoredAdminPosts, getCachedAllPosts, getCachedAllPages } from "@/lib/postSync";
import { resolveMediaUrl } from "@/lib/mediaUrl";
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

  const { posts, loading: postsLoading } = usePosts();
  const { pages, loading: pagesLoading } = usePages();
  const loading = postsLoading && pagesLoading;

  // Multi-tier slug finder: active hook posts/pages -> admin synced posts -> cached posts & pages
  const post = useMemo(() => {
    if (!targetSlug) return null;

    // 1. Search hook posts and pages
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

    const found = matchInList(posts) || matchInList(pages);
    if (found) return found;

    // 2. Search stored admin posts
    const adminPosts = getStoredAdminPosts();
    const adminFound = matchInList(adminPosts);
    if (adminFound) return adminFound;

    // 3. Search cached all posts & cached pages
    const cachedPosts = getCachedAllPosts();
    const cachedPages = getCachedAllPages();
    return matchInList(cachedPosts) || matchInList(cachedPages) || null;
  }, [posts, pages, targetSlug]);

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

  if (!loading && !post) {
    return (
      <div className="relative min-h-screen bg-white text-slate-900 dark:bg-[#070e24] dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300 flex flex-col">
        <Helmet>
          <title>404 — Post Not Found | MD. Shinha Sarder</title>
          <meta name="description" content="Oops! This post is lost in space. Return home or explore MD. Shinha Sarder portfolio." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>

        <SiteBackground />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center max-w-3xl mx-auto w-full">
            {/* Astronaut in Space Illustration matching uploaded photo */}
            <div className="w-full max-w-[340px] sm:max-w-[420px] mx-auto mb-6 transition-transform hover:scale-105 duration-500">
              <img
                src="/lost-in-space-404.svg"
                alt="404 — Astronaut and dog lost in space"
                className="w-full h-auto drop-shadow-md select-none pointer-events-none"
              />
            </div>

            {/* Large Bold 404 Heading */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-black dark:text-white tracking-tight font-sans leading-none mb-3">
              404
            </h1>

            {/* Subtitle matching uploaded image */}
            <p className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-200 mb-4 tracking-normal">
              Oops! this page is lost in space
            </p>

            {/* Clean Return Home link matching image */}
            <Link
              to="/"
              className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-sky-300 underline underline-offset-4 transition-colors inline-flex items-center gap-1.5 mb-10"
            >
              <Home size={18} />
              <span>Return home</span>
            </Link>

            {/* Quick Verified Portal Directory */}
            <div className="w-full bg-slate-50 border border-slate-200 dark:bg-[#0a1533]/80 dark:border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-sm max-w-xl mx-auto text-left transition-colors">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-blue-500/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Compass size={14} className="text-blue-600 dark:text-blue-400" />
                  Verified Sections
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                  {location.pathname}
                </span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                The post you requested could not be located on this domain. You can browse active articles or verified sections below:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <Link
                  to="/posts"
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-[#0f1f47] dark:border-blue-900/40 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
                >
                  <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>All Posts</span>
                </Link>

                <Link
                  to="/p/gallery.html"
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-[#0f1f47] dark:border-blue-900/40 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
                >
                  <Home size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Gallery</span>
                </Link>

                <Link
                  to="/p/books.html"
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-[#0f1f47] dark:border-blue-900/40 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
                >
                  <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Books</span>
                </Link>

                <Link
                  to="/p/songs.html"
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-[#0f1f47] dark:border-blue-900/40 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
                >
                  <Music size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Music</span>
                </Link>

                <Link
                  to="/p/biography.html"
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-[#0f1f47] dark:border-blue-900/40 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
                >
                  <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Biography</span>
                </Link>

                <Link
                  to="/p/publication.html"
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 dark:bg-[#0f1f47] dark:border-blue-900/40 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all font-medium"
                >
                  <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Publications</span>
                </Link>
              </div>
            </div>
          </main>

          <FooterSection />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-100 transition-colors duration-300">
      <SiteBackground />
      <div className="relative z-10">
        <Navbar />
        {post && seo && (
          <Helmet>
            <title>{`${post.title} - MD. Shinha Sarder`}</title>
            <meta name="description" content={cleanDesc} />
            <link rel="canonical" href={canonical} />
            <meta property="og:title" content={`${post.title} - MD. Shinha Sarder`} />
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
                        className="text-[10px] uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-300 dark:bg-blue-500/15 dark:border-blue-400/20 px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-8">
                  <Calendar size={14} className="text-blue-500 dark:text-blue-400" /> {fmt(post.published)}
                  {post.source === "admin" && (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-300/90 dark:bg-amber-500/10 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                      Live Synced
                    </span>
                  )}
                </div>

                {post.image && (
                  <div className="w-full mb-8 rounded-xl overflow-hidden border border-slate-200 dark:border-blue-500/25 shadow-xl bg-slate-50 dark:bg-[#070e24]/70 flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={resolveMediaUrl(post.image)}
                      alt={buildAlt(post.title, postTags)}
                      loading="eager"
                      decoding="async"
                      {...({ fetchpriority: "high" } as any)}
                      className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.src = "/hero-portrait.jpg";
                      }}
                    />
                  </div>
                )}

                <div
                  className="prose dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto prose-img:object-contain prose-img:mx-auto text-justify [&_p]:text-justify [&_li]:text-justify text-slate-800 dark:text-slate-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: enhanceContentImages(post.content || "", post.title) }}
                />

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-blue-500/20">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Share this post</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={share.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 dark:border-blue-500/30 dark:bg-[#0c183a]/80 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 dark:text-slate-300 dark:hover:text-white dark:hover:border-blue-400 transition-colors shadow-sm dark:shadow-none"
                      title="Share on Facebook"
                    >
                      <Facebook size={16} />
                    </a>
                    <a
                      href={share.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 dark:border-blue-500/30 dark:bg-[#0c183a]/80 flex items-center justify-center text-slate-700 hover:text-sky-500 hover:border-blue-400 dark:text-slate-300 dark:hover:text-white dark:hover:border-blue-400 transition-colors shadow-sm dark:shadow-none"
                      title="Share on Twitter"
                    >
                      <Twitter size={16} />
                    </a>
                    <a
                      href={share.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 dark:border-blue-500/30 dark:bg-[#0c183a]/80 flex items-center justify-center text-slate-700 hover:text-blue-700 hover:border-blue-400 dark:text-slate-300 dark:hover:text-white dark:hover:border-blue-400 transition-colors shadow-sm dark:shadow-none"
                      title="Share on LinkedIn"
                    >
                      <Linkedin size={16} />
                    </a>
                    <a
                      href={share.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 dark:border-blue-500/30 dark:bg-[#0c183a]/80 flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-blue-400 dark:text-slate-300 dark:hover:text-white dark:hover:border-blue-400 transition-colors shadow-sm dark:shadow-none"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <button
                      onClick={copy}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-slate-400 dark:text-neutral-300 dark:hover:text-white dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none"
                      title="Copy link"
                    >
                      <LinkIcon size={16} />
                    </button>
                  </div>
                </div>

                {related.length > 0 && (
                  <div className="mt-16">
                    <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-6">Related Posts</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {related.map((r) => {
                        const rTags = Array.isArray(r.tags) ? r.tags : [];
                        return (
                          <Link
                            key={r.id}
                            to={postPath(r)}
                            className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 dark:bg-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-700 transition-all shadow-sm"
                          >
                            {r.image && (
                              <div className="w-full aspect-video bg-slate-100 dark:bg-black flex items-center justify-center p-1 overflow-hidden">
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
                              <h4 className="text-sm font-serif font-semibold text-slate-900 dark:text-neutral-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
