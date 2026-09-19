import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X, ZoomIn, Images, ArrowRight } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { buildAlt } from "@/lib/imageSeo";
import profilePhoto from "@/assets/profile-photo.webp";

const defaultGalleryPhotos = [
  { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5WnIBxJxtRbxWSsm5Mg8qkKmoiRamOJk0RKmHAX9kx44ibZ2H93_SC5o3qMS3YvFzBNVbnMUESTibQZ44uIWe92zydV3JgZEXwSR4z_pd5dCa__nPNxVYhHBsX44ZyL8Cj-rIcC0iUAPjW3SzRedFZ1UiT_dfol6iNf0QeOM7QtF5DuECWOWw_OicDiuR/w680/MD.%20Shinha%20Sarder.jpg", title: "MD. Shinha Sarder - Official Portrait", tags: ["portrait", "engineer", "founder"], idx: 1 },
  { src: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg", title: "From Village to Virtual - Book Cover", tags: ["book", "publication"], idx: 2 },
  { src: "https://m.media-amazon.com/images/I/31Fx5ANnI9L._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg", title: "ICT Fundamentals - Academic Publication", tags: ["book", "tech"], idx: 3 },
  { src: "https://pbs.twimg.com/profile_images/2091609328210030592/42OjWBAO_400x400.jpg", title: "Verified Author Profile Picture", tags: ["portrait"], idx: 4 },
  { src: "https://wikigence.org/images/thumb/f/f0/MD._Shinha_Sarder.png/300px-MD._Shinha_Sarder.png", title: "WikiGence Encyclopedia Entity Entry", tags: ["portrait", "knowledge"], idx: 5 },
  { src: "https://wikialpha.co/images/thumb/6/61/MD._Shinha_Sarder.jpg/600px-MD._Shinha_Sarder.jpg", title: "WikiAlpha Biographical Encyclopedia", tags: ["portrait"], idx: 6 },
  { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjodXYtmhZXw3DMzsclnR7QKGj4pB7EtltGEVAKHluF9q43M2xhp48sia0BIiGIyv_Z_8btnrrhXK9-DDcc14tX1UxBrZTEqHN_m99S_Cjn6Y0wrqJtfkQhTq2D4Lw7LFydGoWA-BZrW5I-Z0768jaUWRpxaZ7ODP1xV4a4EntzzE7u7g324MoXW_TLG5fp/w387-h222-rw/biostartvworld%20project.jpg", title: "Biostar TV World Broadcast Infrastructure", tags: ["projects"], idx: 7 },
  { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh66biVepBPyNV_L5eLokiHUwO450kY7h_t_BbaAH77urDmUN5i_WXoRhk-jhuiFbVFtyYcfzPkbvor-AWI1js9QY7H3y30J4gX1lUK6IB0tXioO03Y0RN-ia-a-gsHG1pVjxhTqGDWNlXOHjzOlLaQ2rysMNCHIf1vs8u-08uUnL0xvnq_hn2NH8l8tbiV/s715/IMG_20241129_193927_117.jpg", title: "ICT Foundation Community Empowerment", tags: ["events"], idx: 8 },
];

const GallerySection = () => {
  const { posts, loading } = usePosts();
  const [open, setOpen] = useState<string | null>(null);

  const images = useMemo(() => {
    const set = new Set<string>();
    const out: { src: string; title: string; tags: string[]; idx: number }[] = [];
    posts.forEach((p) => {
      const found = new Set<string>();
      if (p.image) found.add(p.image);
      const re = /<img[^>]+src=["']([^"']+)["']/gi;
      let m;
      while ((m = re.exec(p.content)) !== null) found.add(m[1]);
      let i = 0;
      found.forEach((src) => {
        i += 1;
        if (!set.has(src)) {
          set.add(src);
          out.push({ src, title: p.title, tags: p.tags || [], idx: i });
        }
      });
    });
    // If fewer than default, combine with defaultGalleryPhotos
    if (out.length === 0) {
      return defaultGalleryPhotos;
    }
    return [...out, ...defaultGalleryPhotos.filter((d) => !set.has(d.src))];
  }, [posts]);

  return (
    <section id="gallery" className="py-20 relative transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-400/20 bg-blue-50 dark:bg-blue-500/10">
            Visual Archive
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white mt-3 mb-3">
            Photo <span className="text-gradient-blue">Gallery</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Curated photographs, official portraits, technical events, presentations, and project milestones.
          </p>

          <div className="mt-4 flex justify-center">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-105"
            >
              <Images className="w-4 h-4" />
              View Full Gallery Page (Lightbox &amp; Filters)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading && images.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-slate-100 dark:bg-[#0c183a]/60 border border-slate-200 dark:border-blue-500/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {images.slice(0, 16).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(img.src)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-500/25 hover:border-blue-500 transition-all bg-white dark:bg-[#0c183a]/90 shadow-md dark:shadow-xl dark:shadow-blue-950/60 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <img
                  src={img.src || "/profile.webp"}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== window.location.origin + "/profile.webp") {
                      target.src = "/profile.webp";
                    }
                  }}
                  alt={buildAlt(img.title, [...img.tags, `photo ${img.idx}`])}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-left">
                  <span className="text-blue-300 inline-flex items-center gap-1 text-[11px] font-semibold mb-1">
                    <ZoomIn size={12} /> Click to enlarge
                  </span>
                  <span className="text-xs font-medium text-white line-clamp-2">{img.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {open && (
          <div
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          >
            <button
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute top-6 right-6 w-11 h-11 rounded-xl border border-white/20 bg-black/60 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg"
            >
              <X size={20} />
            </button>
            <div className="max-w-4xl max-h-[85vh] p-2 rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl">
              <img src={open} alt="Enlarged photo" loading="eager" decoding="async" className="max-w-full max-h-[80vh] rounded-xl object-contain mx-auto" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
