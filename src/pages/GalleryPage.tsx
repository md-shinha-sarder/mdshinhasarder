import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Check,
  ExternalLink,
  Copy,
  Download,
  Image as ImageIcon,
  Cloud,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { usePosts, usePages } from "@/hooks/usePosts";
import { DEFAULT_BOOKS as chaptraBooksData } from "@/hooks/useBooksData";
import { DEFAULT_SONGS as songsData } from "@/hooks/useSongsData";
import { toDomainImageUrl } from "@/lib/imageSeo";
import { toCloudinaryImageUrl, CLOUDINARY_CONFIG } from "@/lib/cloudinary";
import { getCachedAllPosts, getCachedAllPages, getStoredAdminPosts } from "@/lib/postSync";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  src: string;
  canonicalUrl: string;
  title: string;
  category: "Portraits" | "Posts Photos" | "Pages Photos" | "Site Media" | "Book Covers" | "Music & Media";
  caption: string;
  sourceUrl?: string;
}

export const GalleryPage = () => {
  const { posts } = usePosts();
  const { pages } = usePages();

  const [dbMedia, setDbMedia] = useState<{ id: string; name: string; url: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedImgUrl, setCopiedImgUrl] = useState(false);
  const [copiedCldUrl, setCopiedCldUrl] = useState(false);

  // Load uploaded media from database
  useEffect(() => {
    supabase
      .from("media")
      .select("id, name, url")
      .then(({ data }) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setDbMedia(data);
        }
      })
      .catch(() => {});
  }, []);

  // Automatically aggregate photos from ALL posts, ALL pages, all books, songs, portraits, and uploaded site media
  const allGalleryItems = useMemo(() => {
    const seen = new Set<string>();
    const seenTokens = new Set<string>();
    const items: GalleryItem[] = [];

    const upgradeUrl = (u: string) => {
      if (!u) return "";
      return u.replace(/\/s\d+(-c)?\//, "/s0/").replace(/\/w\d+-h\d+[^/]*\//, "/s0/");
    };

    const extractToken = (url: string) => {
      const clean = url.replace(/https?:\/\//i, "").replace(/\/s\d+(-c)?\//i, "/").replace(/\/w\d+-h\d+[^/]*\//i, "/");
      const parts = clean.split("/").filter(Boolean);
      return parts[parts.length - 1] || clean;
    };

    const addPhoto = (
      src: string,
      title: string,
      category: GalleryItem["category"],
      caption: string,
      sourceUrl?: string
    ) => {
      if (!src || src.trim() === "") return;
      const cleanSrc = upgradeUrl(src.trim());
      const token = extractToken(cleanSrc);
      if (seen.has(cleanSrc) || seenTokens.has(token)) return;
      seen.add(cleanSrc);
      seenTokens.add(token);

      const canonicalUrl = toDomainImageUrl(cleanSrc, `${title} ${caption}`);

      items.push({
        id: `img-${items.length + 1}-${token.slice(-12).replace(/[^a-zA-Z0-9]/g, "")}`,
        src: cleanSrc,
        canonicalUrl,
        title,
        category,
        caption,
        sourceUrl,
      });
    };

    // 1. Official Verified Portraits & Studio Assets
    addPhoto(
      "https://mdshinhasarder.com/images/md-shinha-sarder-official-portrait.profile.png",
      "Official Portrait — MD. Shinha Sarder",
      "Portraits",
      "Official verified portrait of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World."
    );
    addPhoto(
      "https://mdshinhasarder.com/images/site-logo.png",
      "Official Brand Emblem & Site Logo",
      "Site Media",
      "Official brand insignia and profile emblem of MD. Shinha Sarder."
    );
    addPhoto(
      "https://mdshinhasarder.com/images/md-shinha-sarder-official-portrait.profile.webp",
      "Official Portrait (WebP) — MD. Shinha Sarder",
      "Portraits",
      "High-definition portrait photograph of MD. Shinha Sarder."
    );
    addPhoto(
      "https://mdshinhasarder.com/images/md-shinha-sarder-author-researcher.hero-portrait.jpg",
      "Editorial Portrait — ICT Author & Researcher",
      "Portraits",
      "Editorial portrait of MD. Shinha Sarder captured during academic monograph publishing."
    );
    addPhoto(
      "https://mdshinhasarder.com/images/md-shinha-sarder-creative-tech-studio.hero-bg.jpg",
      "Creative Technology Studio & Workspace",
      "Portraits",
      "Digital development studio and high-tech workspace of MD. Shinha Sarder."
    );
    addPhoto(
      "https://mdshinhasarder.com/images/md-shinha-sarder-executive-founder.profile-photo.webp",
      "Executive & Founder Portrait",
      "Portraits",
      "Executive portrait of MD. Shinha Sarder, leader of Biostar TV World and IT Tech BD."
    );

    // 2. Photos from ALL Blogger & Admin Posts (live hook + cached + admin stored)
    const combinedPosts = [...posts];
    const cachedPosts = getCachedAllPosts();
    const adminPosts = getStoredAdminPosts();
    for (const p of [...adminPosts, ...cachedPosts]) {
      if (!combinedPosts.some((cp) => cp.slug === p.slug || cp.id === p.id)) {
        combinedPosts.push(p);
      }
    }

    for (const post of combinedPosts) {
      if (post.image) {
        addPhoto(
          post.image,
          post.title || "Blog Post Photo",
          "Posts Photos",
          `Cover photo from post: ${post.title}`,
          post.slug ? `/posts/${post.slug}` : undefined
        );
      }
      if (post.content) {
        // Extract <img> tags
        const reImg = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        while ((match = reImg.exec(post.content)) !== null) {
          const imgUrl = match[1];
          if (imgUrl && !imgUrl.includes("blank.gif") && !imgUrl.includes("pixel.gif")) {
            addPhoto(
              imgUrl,
              post.title ? `${post.title}` : "Post Photo",
              "Posts Photos",
              `Photo embedded in published post: ${post.title}`,
              post.slug ? `/posts/${post.slug}` : undefined
            );
          }
        }
        // Extract direct <a> image links
        const reLink = /<a[^>]+href=["'](https?:\/\/[^"']*(?:blogger\.googleusercontent\.com\/img\/b\/[^"']+|\.(?:jpg|jpeg|png|webp)))["']/gi;
        let lMatch;
        while ((lMatch = reLink.exec(post.content)) !== null) {
          addPhoto(
            lMatch[1],
            post.title ? `${post.title}` : "Post Photo",
            "Posts Photos",
            `High-resolution photo from post: ${post.title}`,
            post.slug ? `/posts/${post.slug}` : undefined
          );
        }
      }
    }

    // 3. Photos from ALL Blogger Pages (live hook + cached)
    const combinedPages = [...pages];
    const cachedPages = getCachedAllPages();
    for (const pg of cachedPages) {
      if (!combinedPages.some((cpg) => cpg.slug === pg.slug || cpg.id === pg.id)) {
        combinedPages.push(pg);
      }
    }

    for (const page of combinedPages) {
      if (page.image) {
        addPhoto(
          page.image,
          page.title || "Page Photo",
          "Pages Photos",
          `Image featured in page: ${page.title}`,
          page.slug ? `/${page.slug}` : undefined
        );
      }
      if (page.content) {
        const reImg = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        while ((match = reImg.exec(page.content)) !== null) {
          const imgUrl = match[1];
          if (imgUrl && !imgUrl.includes("blank.gif") && !imgUrl.includes("pixel.gif")) {
            addPhoto(
              imgUrl,
              page.title ? `${page.title}` : "Page Photo",
              "Pages Photos",
              `Photo embedded in published page: ${page.title}`,
              page.slug ? `/${page.slug}` : undefined
            );
          }
        }
        const reLink = /<a[^>]+href=["'](https?:\/\/[^"']*(?:blogger\.googleusercontent\.com\/img\/b\/[^"']+|\.(?:jpg|jpeg|png|webp)))["']/gi;
        let lMatch;
        while ((lMatch = reLink.exec(page.content)) !== null) {
          addPhoto(
            lMatch[1],
            page.title ? `${page.title}` : "Page Photo",
            "Pages Photos",
            `High-resolution photo from page: ${page.title}`,
            page.slug ? `/${page.slug}` : undefined
          );
        }
      }
    }

    // 4. Custom Database / Admin Uploaded Media
    if (typeof window !== "undefined") {
      try {
        const rawItems = localStorage.getItem("shinha_media_items");
        if (rawItems) {
          const localList = JSON.parse(rawItems);
          if (Array.isArray(localList)) {
            for (const item of localList) {
              if (item.url) {
                addPhoto(
                  item.localUrl || item.url,
                  item.name || "Uploaded Photo",
                  "Site Media",
                  `Uploaded photo: ${item.name || "Asset"}`
                );
              }
            }
          }
        }
      } catch (_e) {
        void _e;
      }
    }

    for (const media of dbMedia) {
      if (media.url) {
        addPhoto(
          media.url,
          media.name || "Site Media Asset",
          "Site Media",
          `Uploaded site media: ${media.name || "Asset"}`
        );
      }
    }

    // 5. All 20 Book Covers from Chaptra & Google Books
    chaptraBooksData.forEach((b) => {
      addPhoto(
        b.cover,
        `${b.title} (Book Cover)`,
        "Book Covers",
        b.description,
        b.chaptraUrl
      );
    });

    // 6. All 15 Songs & Media Artworks from Deezer
    songsData.forEach((s) => {
      addPhoto(
        s.cover,
        `${s.title} (Track Art)`,
        "Music & Media",
        `Single release cover for "${s.title}" (${s.year}, ${s.genre}) on Deezer.`,
        s.deezerUrl
      );
    });

    return items;
  }, [posts, pages, dbMedia]);

  const categories: (GalleryItem["category"] | "All")[] = [
    "All",
    "Portraits",
    "Posts Photos",
    "Pages Photos",
    "Site Media",
    "Book Covers",
    "Music & Media",
  ];

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return allGalleryItems;
    return allGalleryItems.filter((item) => item.category === selectedCategory);
  }, [allGalleryItems, selectedCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setCopiedImgUrl(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
      setCopiedImgUrl(false);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
      );
      setCopiedImgUrl(false);
    }
  };

  const copyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedImgUrl(true);
    setTimeout(() => setCopiedImgUrl(false), 2000);
  };

  const copyCldUrl = (url: string) => {
    const cldUrl = toCloudinaryImageUrl(url);
    navigator.clipboard.writeText(cldUrl);
    setCopiedCldUrl(true);
    setTimeout(() => setCopiedCldUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
      <Helmet>
        <title>Gallery - MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Visual gallery and official photo media archive of MD. Shinha Sarder."
        />
        <meta property="og:title" content="Gallery - MD. Shinha Sarder" />
        <meta property="og:image" content="https://mdshinhasarder.com/images/md-shinha-sarder-official-portrait.profile.webp" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/gallery.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Clean Page Title Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400">
                <Link to="/" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-semibold">Gallery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gallery
              </h1>
            </div>

            <button
              onClick={copyShare}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{copied ? "Link Copied!" : "Share Gallery"}</span>
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? allGalleryItems.length
                  : allGalleryItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:border-neutral-800"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-blue-500 dark:bg-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-600 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-black relative">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/hero-portrait.jpg";
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white pointer-events-none">
                    <ZoomIn size={14} />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-sky-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal */}
          {lightboxIndex !== null && filteredItems[lightboxIndex] && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700 transition-colors z-10"
                aria-label="Close lightbox"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                onClick={prevLightbox}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 border border-neutral-700 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={nextLightbox}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 border border-neutral-700 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              <div className="max-w-4xl w-full flex flex-col items-center">
                <div className="relative max-h-[70vh] w-auto rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black">
                  <img
                    src={filteredItems[lightboxIndex].src}
                    alt={filteredItems[lightboxIndex].title}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                </div>

                <div className="mt-4 text-center max-w-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 text-sky-400 border border-neutral-800 inline-block mb-1">
                    {filteredItems[lightboxIndex].category}
                  </span>
                  <h2 className="text-base font-bold text-white">
                    {filteredItems[lightboxIndex].title}
                  </h2>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {filteredItems[lightboxIndex].caption}
                  </p>

                  {/* Canonical Image URL on domain mdshinhasarder.com & Cloudinary CDN */}
                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    {/* Domain Canonical URL */}
                    <a
                      href={filteredItems[lightboxIndex].canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors"
                      title="Direct Image URL on mdshinhasarder.com"
                    >
                      <ImageIcon size={12} className="text-sky-400" />
                      <span className="max-w-[200px] sm:max-w-xs truncate">
                        {filteredItems[lightboxIndex].canonicalUrl.replace("https://", "")}
                      </span>
                      <ExternalLink size={11} />
                    </a>

                    <button
                      type="button"
                      onClick={() => copyImageUrl(filteredItems[lightboxIndex].canonicalUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-medium text-neutral-300 hover:text-white transition-colors"
                      title="Copy canonical mdshinhasarder.com URL"
                    >
                      {copiedImgUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedImgUrl ? "Domain Copied!" : "Domain Link"}</span>
                    </button>

                    {/* Cloudinary CDN URL */}
                    <a
                      href={toCloudinaryImageUrl(filteredItems[lightboxIndex].canonicalUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-900/40 bg-blue-950/40 hover:bg-blue-900/60 text-[11px] font-mono text-blue-300 hover:text-white transition-colors"
                      title="Optimized Cloudinary Delivery URL (f_auto, q_auto)"
                    >
                      <Cloud size={12} className="text-cyan-400" />
                      <span>Cloudinary CDN</span>
                      <ExternalLink size={11} />
                    </a>

                    <button
                      type="button"
                      onClick={() => copyCldUrl(filteredItems[lightboxIndex].canonicalUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-900/40 bg-blue-950/40 hover:bg-blue-900/60 text-[11px] font-medium text-blue-300 hover:text-white transition-colors"
                      title="Copy auto-optimized Cloudinary CDN URL"
                    >
                      {copiedCldUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCldUrl ? "Cloudinary Copied!" : "Copy Cloudinary"}</span>
                    </button>

                    {filteredItems[lightboxIndex].sourceUrl && (
                      <a
                        href={filteredItems[lightboxIndex].sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <span>View Source</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default GalleryPage;
