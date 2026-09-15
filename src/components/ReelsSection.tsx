import { useState } from "react";
import { X, Play, Facebook, Youtube, ExternalLink } from "lucide-react";
import { useVideos, VideoItem } from "@/hooks/useVideos";

function getSafeEmbedUrl(urlOrEmbed: string): string {
  if (!urlOrEmbed) return "";
  const ytMatch = urlOrEmbed.match(/(?:youtube\.com\/(?:embed\/|shorts\/|watch\?v=)|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
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
    <section id="reels" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Short Videos</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
            Reels &amp; <span className="text-gradient-blue">Shorts</span>
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">Quick clips, tech tips, and highlights from YouTube Shorts and Facebook Reels.</p>
        </div>

        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <a href="https://www.youtube.com/@MD-Shinha-Sarder/shorts" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-[#0c183a]/80 text-sm font-medium text-white hover:border-blue-400 hover:bg-blue-600/20 transition-all">
            <Youtube size={16} className="text-red-400" /> YouTube Shorts
          </a>
          <a href="https://www.facebook.com/md.shinha.sarder/reels/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-[#0c183a]/80 text-sm font-medium text-white hover:border-blue-400 hover:bg-blue-600/20 transition-all">
            <Facebook size={16} className="text-blue-400" /> Facebook Reels
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[9/16] rounded-2xl bg-[#0c183a]/60 border border-blue-500/20 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-slate-400">No reels available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {items.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveReel(v)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-blue-500/25 hover:border-blue-400/70 transition-all bg-[#0c183a]/90 shadow-xl shadow-blue-950/60 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:-translate-y-1"
              >
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#0c183a] to-[#070e24] flex items-center justify-center text-xs text-slate-300 font-medium">{v.platform === "facebook" ? "Facebook Reel" : "Short"}</div>
                )}
                <span className="absolute inset-0 bg-[#070e24]/30 group-hover:bg-[#070e24]/10 transition-colors flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/50">
                    <Play size={20} className="ml-0.5 fill-white" />
                  </span>
                </span>
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#070e24]/95 via-[#070e24]/75 to-transparent p-3 text-left">
                  <span className="text-xs font-medium text-white line-clamp-2 drop-shadow-sm">{v.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {activeReel && (
          <div onClick={() => setActiveReel(null)} className="fixed inset-0 z-[70] bg-[#070e24]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
              {activeReel.url && (
                <a
                  href={activeReel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 rounded-xl border border-blue-400/40 bg-[#0c183a]/90 text-xs font-semibold flex items-center gap-1.5 hover:border-blue-400 hover:bg-blue-600/25 transition-all text-white shadow-lg"
                >
                  <ExternalLink size={13} className="text-blue-400" /> Open Original
                </a>
              )}
              <button
                onClick={() => setActiveReel(null)}
                aria-label="Close"
                className="w-10 h-10 rounded-xl border border-blue-400/40 bg-[#0c183a]/90 text-white flex items-center justify-center hover:bg-blue-600 hover:border-blue-400 transition-all shadow-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="w-[90vw] max-w-sm aspect-[9/16] rounded-2xl overflow-hidden border border-blue-500/50 shadow-2xl shadow-blue-950 bg-black">
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

