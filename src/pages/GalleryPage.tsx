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
  Sparkles,
} from "lucide-react";
import { usePosts, usePages } from "@/hooks/usePosts";
import { chaptraBooksData } from "@/pages/BooksPage";
import { songsData } from "@/pages/SongsPage";

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: "Portraits" | "Posts Photos" | "Pages Photos" | "Book Covers" | "Music & Media";
  caption: string;
  sourceUrl?: string;
}

export const GalleryPage = () => {
  const { posts } = usePosts();
  const { pages } = usePages();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Automatically aggregate photos from ALL posts, ALL pages, all books, songs, and portraits
  const allGalleryItems = useMemo(() => {
    const seen = new Set<string>();
    const items: GalleryItem[] = [];

    const addPhoto = (
      src: string,
      title: string,
      category: GalleryItem["category"],
      caption: string,
      sourceUrl?: string
    ) => {
      if (!src || src.trim() === "") return;
      const cleanSrc = src.trim();
      if (seen.has(cleanSrc)) return;
      seen.add(cleanSrc);
      items.push({
        id: `img-${items.length + 1}-${cleanSrc.slice(-12).replace(/[^a-zA-Z0-9]/g, "")}`,
        src: cleanSrc,
        title,
        category,
        caption,
        sourceUrl,
      });
    };

    // 1. Official Verified Portraits & Studio Assets
    addPhoto(
      "https://mdshinhasarder.com/profile.webp",
      "Official Portrait — MD. Shinha Sarder",
      "Portraits",
      "Official verified portrait of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World."
    );
    addPhoto(
      "https://mdshinhasarder.com/hero-portrait.jpg",
      "Editorial Portrait — ICT Author & Researcher",
      "Portraits",
      "Editorial portrait of MD. Shinha Sarder captured during academic monograph publishing."
    );
    addPhoto(
      "https://mdshinhasarder.com/hero-bg.jpg",
      "Creative Technology Studio & Workspace",
      "Portraits",
      "Digital development studio and high-tech workspace of MD. Shinha Sarder."
    );

    // 2. Photos from ALL Blogger Posts (Featured image + all embedded <img> inside post content)
    for (const post of posts) {
      if (post.image) {
        addPhoto(
          post.image,
          post.title || "Blog Post Photo",
          "Posts Photos",
          `Cover image from post: ${post.title}`,
          post.slug ? `/posts/${post.slug}` : undefined
        );
      }
      if (post.content) {
        const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        while ((match = re.exec(post.content)) !== null) {
          const imgUrl = match[1];
          if (imgUrl && !imgUrl.includes("blank.gif") && !imgUrl.includes("pixel.gif")) {
            addPhoto(
              imgUrl,
              post.title ? `${post.title} (Embedded)` : "Post Photo",
              "Posts Photos",
              `Photo embedded in published post: ${post.title}`,
              post.slug ? `/posts/${post.slug}` : undefined
            );
          }
        }
      }
    }

    // 3. Photos from ALL Blogger Pages (Featured image + all embedded <img> inside page content)
    for (const page of pages) {
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
        const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        while ((match = re.exec(page.content)) !== null) {
          const imgUrl = match[1];
          if (imgUrl && !imgUrl.includes("blank.gif") && !imgUrl.includes("pixel.gif")) {
            addPhoto(
              imgUrl,
              page.title ? `${page.title} (Embedded)` : "Page Photo",
              "Pages Photos",
              `Photo embedded in published page: ${page.title}`,
              page.slug ? `/${page.slug}` : undefined
            );
          }
        }
      }
    }

    // 4. All 20 Book Covers from Chaptra & Google Books
    chaptraBooksData.forEach((b) => {
      addPhoto(
        b.cover,
        `${b.title} (Book Cover)`,
        "Book Covers",
        b.description,
        b.chaptraUrl
      );
    });

    // 5. All 15 Songs & Media Artworks from Deezer
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
  }, [posts, pages]);

  const categories = [
    "All",
    "Portraits",
    "Posts Photos",
    "Pages Photos",
    "Book Covers",
    "Music & Media",
  ];

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return allGalleryItems;
    return allGalleryItems.filter((item) => item.category === selectedCategory);
  }, [allGalleryItems, selectedCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  const copyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Visual Media &amp; Photo Gallery — MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Complete visual gallery automatically aggregating all photos from all posts, all pages, book covers, songs, and official verified portraits of MD. Shinha Sarder."
        />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Gallery</span>
          </div>

          {/* Hero Banner */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#070c1e]/95 border border-blue-900/50 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 text-xs font-semibold border border-blue-800/60 mb-3">
                <Sparkles size={14} className="text-blue-400" />
                <span>Auto-Synced Media Archive · {allGalleryItems.length} Photos</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                <span>Photo &amp; Media Gallery</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Automatically aggregate and display all photography and visual assets across all posts, all pages, 20 books, 15 songs, and official portrait collections.
              </p>
            </div>

            <button
              type="button"
              onClick={copyShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-blue-900/60 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? "Link Copied!" : "Share Gallery"}</span>
            </button>
          </div>

          {/* Category Filter Pills */}
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
                      : "bg-[#070c1e]/90 text-slate-400 hover:text-white border border-blue-900/40 hover:border-blue-700/60"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Photos Masonry / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-blue-900/40 hover:border-blue-500/60 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-black/60 relative">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/hero-portrait.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <ZoomIn size={16} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#070c1e]">
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
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
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700 transition-colors z-10"
                aria-label="Close lightbox"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                onClick={prevLightbox}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={nextLightbox}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              <div className="max-w-4xl w-full flex flex-col items-center">
                <div className="relative max-h-[75vh] w-auto rounded-2xl overflow-hidden border border-blue-900/50 shadow-2xl bg-black">
                  <img
                    src={filteredItems[lightboxIndex].src}
                    alt={filteredItems[lightboxIndex].title}
                    className="max-h-[75vh] w-auto object-contain"
                  />
                </div>

                <div className="mt-4 text-center max-w-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50 inline-block mb-1">
                    {filteredItems[lightboxIndex].category}
                  </span>
                  <h2 className="text-base font-bold text-white">
                    {filteredItems[lightboxIndex].title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {filteredItems[lightboxIndex].caption}
                  </p>
                  {filteredItems[lightboxIndex].sourceUrl && (
                    <a
                      href={filteredItems[lightboxIndex].sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2"
                    >
                      <span>View Source Page</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
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
