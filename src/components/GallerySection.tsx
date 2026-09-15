import { useMemo, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { buildAlt } from "@/lib/imageSeo";
import profilePhoto from "@/assets/profile-photo.webp";

const defaultGalleryPhotos = [
  { src: profilePhoto, title: "MD. Shinha Sarder - Official Portrait", tags: ["portrait", "engineer", "founder"], idx: 1 },
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
    // Add default photo if list is empty
    if (out.length === 0) {
      return defaultGalleryPhotos;
    }
    return out;
  }, [posts]);

  return (
    <section id="gallery" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Visual Archive</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
            Photo <span className="text-gradient-blue">Gallery</span>
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">Moments captured from articles, technical events, presentations, and projects.</p>
        </div>

        {loading && images.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-[#0c183a]/60 border border-blue-500/20 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {images.slice(0, 24).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(img.src)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-blue-500/25 hover:border-blue-400/70 transition-all bg-[#0c183a]/90 shadow-xl shadow-blue-950/60 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#070e24]/95 via-[#070e24]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-left">
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
          <div onClick={() => setOpen(null)} className="fixed inset-0 z-[70] bg-[#070e24]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <button
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute top-6 right-6 w-11 h-11 rounded-xl border border-blue-400/40 bg-[#0c183a]/90 text-white flex items-center justify-center hover:bg-blue-600 hover:border-blue-400 transition-all shadow-lg"
            >
              <X size={20} />
            </button>
            <div className="max-w-4xl max-h-[85vh] p-2 rounded-2xl border border-blue-500/40 bg-[#0c183a]/95 shadow-2xl shadow-blue-950">
              <img src={open} alt="Enlarged photo" loading="eager" decoding="async" className="max-w-full max-h-[80vh] rounded-xl object-contain mx-auto" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
