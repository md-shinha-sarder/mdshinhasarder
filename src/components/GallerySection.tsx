import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { buildAlt } from "@/lib/imageSeo";

const CURATED_PHOTOS = [
  {
    src: "/profile.webp",
    title: "MD. Shinha Sarder — Official Portrait",
    tags: ["Portrait", "Entrepreneur", "Founder"],
    idx: 1,
  },
  {
    src: "https://blogger.googleusercontent.com/img/a/AVvXsEhVe_gGSExCjJZ6AokzAVFSm_qcBpo2tF6uxFQKqz6BbhKrwuMTA0snTOrHjioRRvgLHUUKotQbibBP4rnJBstZrjZMgoTEeDgZ7gIbR08FgmyrLulDe-Ol00lp6s1D6tCoaOShpiGTRi3M5ljDe0cOfl_PvY9NQkR3X_Cg-mN54c_M68J1su0jhbrMfHca=w1600",
    title: "MD. Shinha Sarder — 1980-Inspired Portrait",
    tags: ["Vintage", "Portrait", "Photo"],
    idx: 2,
  },
  {
    src: "/hero-portrait.jpg",
    title: "MD. Shinha Sarder — Tech Leadership",
    tags: ["Leadership", "Engineer", "IT Tech BD"],
    idx: 3,
  },
  {
    src: "https://blogger.googleusercontent.com/img/a/AVvXsEiVPVF3oI83rBIALNPYyRryLjaRLguvIEKHTUr3FSuF-5i2PXSbAmhia20Bc-ugj06ZKhCaie4G9QWAjU-6BX27QZIdc48tt_mP0mUQ_FMY3Gsztp6ky3yOoUrcrIvKk47BhZRmBMWW3iJ88OJZcsmwnJ_r4i7vVhpSthL9QNYN7rJiN2S1Q31-GBc23KXg",
    title: "MD. Shinha Sarder — Fedora Linux Development",
    tags: ["Development", "Fedora", "Linux"],
    idx: 4,
  },
  {
    src: "/profile-photo.webp",
    title: "MD. Shinha Sarder — Biostar TV World",
    tags: ["Media", "CEO", "Tech"],
    idx: 5,
  },
  {
    src: "https://blogger.googleusercontent.com/img/a/AVvXsEi1VfBWJHjT60cMLXIhxFzmmxD-_lqvL1UqM46m2BfM9x_bZ_gTzI_4Uj7U1gH26q_eFm9pW8gJ0Z1c0fD3b9l2rM4f6n7_l_e4v",
    title: "MD. Shinha Sarder — Sports & Activities",
    tags: ["Sports", "Moments"],
    idx: 6,
  },
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

    if (out.length === 0) {
      return CURATED_PHOTOS;
    }

    return [...out, ...CURATED_PHOTOS.filter((c) => !set.has(c.src))];
  }, [posts]);

  return (
    <section id="gallery" className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-3">
          Photo <span className="text-gradient-gold">Gallery</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12">Moments captured from articles, events and projects.</p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-card/50 animate-pulse" />)}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.slice(0, 24).map((img, i) => (
              <button key={i} onClick={() => setOpen(img.src)} className="group relative aspect-square overflow-hidden rounded-xl border border-border hover:border-primary/60 transition-colors">
                <img
                  src={img.src}
                  alt={buildAlt(img.title, [...img.tags, `photo ${img.idx}`])}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/profile.webp";
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-xs text-foreground line-clamp-2">{img.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {open && (
          <div onClick={() => setOpen(null)} className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:text-primary hover:border-primary">
              <X size={18} />
            </button>
            <img
              src={open}
              alt="Photo by MD. Shinha Sarder"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/profile.webp";
              }}
              className="max-w-full max-h-full rounded-xl shadow-card"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
