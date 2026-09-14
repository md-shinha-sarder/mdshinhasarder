import { useState } from "react";
import { X, Play, Facebook, Youtube, ExternalLink } from "lucide-react";
import { useVideos, VideoItem } from "@/hooks/useVideos";

function getSafeEmbedUrl(urlOrEmbed: string): string {
  if (!urlOrEmbed) return "";
  const ytMatch = urlOrEmbed.match(/(?:youtube\.com\/(?:embed\/|shorts\/|watch\?v=)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://mdshinhasarder.com";
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  }
  return urlOrEmbed;
}

const ReelsSection = () => {
  const { videos, reels, loading } = useVideos(12);
  const [activeReel, setActiveReel] = useState<VideoItem | null>(null);

  const fromReels = reels.slice(0, 16);
  const fromTitles = videos.filter((v) => /shorts|#short/i.test(v.title));
  const items = fromReels.length > 0 ? fromReels : (fromTitles.length > 0 ? fromTitles.slice(0, 12) : videos.slice(0, 12));

  return (
    <section id="reels" className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-3">
          Reels & <span className="text-gradient-gold">Shorts</span>
        </h2>
        <p className="text-center text-muted-foreground mb-8">Quick clips from YouTube Shorts and Facebook Reels.</p>

        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <a href="https://www.youtube.com/@MD-Shinha-Sarder/shorts" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors">
            <Youtube size={16} /> YouTube Shorts
          </a>
          <a href="https://www.facebook.com/md.shinha.sarder/reels/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors">
            <Facebook size={16} /> Facebook Reels
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[9/16] rounded-xl bg-card/50 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground">No reels available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveReel(v)}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-border hover:border-primary/60 transition-colors bg-card text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-card flex items-center justify-center text-xs text-muted-foreground">{v.platform === "facebook" ? "Facebook Reel" : "Short"}</div>
                )}
                <span className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <Play size={20} className="ml-0.5" />
                  </span>
                </span>
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-2 text-left">
                  <span className="text-[11px] font-medium text-foreground line-clamp-2">{v.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {activeReel && (
          <div onClick={() => setActiveReel(null)} className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
              {activeReel.url && (
                <a
                  href={activeReel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-full border border-border bg-card/80 text-xs font-medium flex items-center gap-1.5 hover:border-primary hover:text-primary transition-colors text-foreground"
                >
                  <ExternalLink size={13} /> Open Original
                </a>
              )}
              <button
                onClick={() => setActiveReel(null)}
                aria-label="Close"
                className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:text-primary hover:border-primary"
              >
                <X size={18} />
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="w-[90vw] max-w-sm aspect-[9/16] rounded-xl overflow-hidden border border-border shadow-2xl bg-black">
              <iframe
                src={getSafeEmbedUrl(activeReel.embed)}
                title={activeReel.title || "Reel player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReelsSection;

