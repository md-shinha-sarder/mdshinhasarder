import { useMemo, useState } from "react";
import { X, Play, ExternalLink } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useVideos } from "@/hooks/useVideos";

interface VideoEntry {
  embed: string;
  url?: string;
  thumbnail: string;
  title: string;
  source: string;
}

function getSafeEmbedUrl(urlOrEmbed: string): string {
  if (!urlOrEmbed) return "";
  const ytMatch = urlOrEmbed.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  }
  return urlOrEmbed;
}

const extractFromPosts = (content: string, title: string): VideoEntry[] => {
  const out: VideoEntry[] = [];
  const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = iframeRe.exec(content)) !== null) {
    const src = m[1];
    const yt = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]+)/);
    if (yt) {
      out.push({
        embed: `https://www.youtube.com/embed/${yt[1]}`,
        url: `https://www.youtube.com/watch?v=${yt[1]}`,
        thumbnail: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
        title,
        source: "youtube",
      });
    } else if (/facebook\.com/.test(src)) {
      out.push({ embed: src, url: src, thumbnail: "", title, source: "facebook" });
    }
  }
  const linkRe = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/gi;
  while ((m = linkRe.exec(content)) !== null) {
    out.push({
      embed: `https://www.youtube.com/embed/${m[1]}`,
      url: `https://www.youtube.com/watch?v=${m[1]}`,
      thumbnail: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`,
      title,
      source: "youtube",
    });
  }
  return out;
};

const VideosSection = () => {
  const { posts } = usePosts();
  const { videos: ytVideos, hasMore, loading, loadMore } = useVideos(12);
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);

  const videos = useMemo(() => {
    const seen = new Set<string>();
    const all: VideoEntry[] = [];
    ytVideos
      .filter((v) => !/shorts/i.test(v.title))
      .forEach((v) => {
        if (seen.has(v.id || v.embed)) return;
        seen.add(v.id || v.embed);
        all.push({
          embed: v.embed,
          url: v.url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : undefined),
          thumbnail: v.thumbnail,
          title: v.title,
          source: "youtube",
        });
      });
    posts.forEach((p) => {
      extractFromPosts(p.content, p.title).forEach((v) => {
        if (seen.has(v.embed)) return;
        seen.add(v.embed);
        all.push(v);
      });
    });
    return all;
  }, [posts, ytVideos]);

  if (videos.length === 0) return null;

  return (
    <section id="videos" className="py-24 bg-secondary/20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-3">
          Video <span className="text-gradient-gold">Library</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12">Long-form videos from YouTube and articles.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveVideo(v)}
              className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary/60 transition-colors bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 text-left cursor-pointer"
            >
              {v.thumbnail ? (
                <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-card" />
              )}
              <span className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play size={22} className="ml-1" />
                </span>
              </span>
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-3 text-left">
                <span className="text-xs font-medium text-foreground line-clamp-2">{v.title}</span>
              </span>
            </button>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load more videos"}
            </button>
          </div>
        )}

        {activeVideo && (
          <div
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
              {activeVideo.url && (
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-full border border-border bg-card/80 text-xs font-medium flex items-center gap-1.5 hover:border-primary hover:text-primary transition-colors text-foreground"
                >
                  <ExternalLink size={13} /> Open on YouTube
                </a>
              )}
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close"
                className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:text-primary hover:border-primary"
              >
                <X size={18} />
              </button>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border border-border shadow-2xl bg-black"
            >
              <iframe
                src={getSafeEmbedUrl(activeVideo.embed)}
                title={activeVideo.title || "Video player"}
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

export default VideosSection;

