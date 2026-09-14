import { NextRequest, NextResponse } from 'next/server';

const YT_HANDLE = "MD-Shinha-Sarder";
const FB_HANDLE = "md.shinha.sarder";

function pickAll(xml: string, tag: string) {
  const out: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function pick(xml: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function getChannelId(handle: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/"channelId":"(UC[\w-]+)"/) || html.match(/channel_id=(UC[\w-]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function getYouTubeLongs(handle: string) {
  try {
    const channelId = await getChannelId(handle);
    if (!channelId) return [];
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return pickAll(xml, "entry").map((e) => {
      const id = pick(e, "yt:videoId");
      const title = pick(e, "title");
      const published = pick(e, "published");
      const thumbMatch = e.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      const thumb = thumbMatch ? thumbMatch[1] : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return {
        id,
        title,
        published,
        thumbnail: thumb,
        url: `https://www.youtube.com/watch?v=${id}`,
        shortUrl: `https://www.youtube.com/shorts/${id}`,
        embed: `https://www.youtube.com/embed/${id}`,
        platform: "youtube" as const,
        kind: "video" as const,
      };
    });
  } catch {
    return [];
  }
}

async function getYouTubeShorts(handle: string) {
  try {
    const res = await fetch(`https://www.youtube.com/@${handle}/shorts`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const ids = new Set<string>();
    const re = /"videoId":"([\w-]{11})"/g;
    let m;
    while ((m = re.exec(html)) !== null) ids.add(m[1]);
    return Array.from(ids).slice(0, 40).map((id) => ({
      id,
      title: "YouTube Short — MD. Shinha Sarder",
      published: new Date().toISOString(),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/shorts/${id}`,
      shortUrl: `https://www.youtube.com/shorts/${id}`,
      embed: `https://www.youtube.com/embed/${id}`,
      platform: "youtube" as const,
      kind: "short" as const,
    }));
  } catch {
    return [];
  }
}

// Fallback known video clips for MD. Shinha Sarder
const DEFAULT_REELS = [
  {
    id: "j44N-z_KxZo",
    title: "MD. Shinha Sarder — Official Short",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/j44N-z_KxZo/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/j44N-z_KxZo",
    shortUrl: "https://www.youtube.com/shorts/j44N-z_KxZo",
    embed: "https://www.youtube.com/embed/j44N-z_KxZo",
    platform: "youtube" as const,
    kind: "short" as const,
  },
  {
    id: "-HOF8TtEh7s",
    title: "MD. Shinha Sarder — Tech Highlights",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/-HOF8TtEh7s/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/-HOF8TtEh7s",
    shortUrl: "https://www.youtube.com/shorts/-HOF8TtEh7s",
    embed: "https://www.youtube.com/embed/-HOF8TtEh7s",
    platform: "youtube" as const,
    kind: "short" as const,
  },
  {
    id: "fLDFXPJf_NA",
    title: "MD. Shinha Sarder — Project Journey",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/fLDFXPJf_NA/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/fLDFXPJf_NA",
    shortUrl: "https://www.youtube.com/shorts/fLDFXPJf_NA",
    embed: "https://www.youtube.com/embed/fLDFXPJf_NA",
    platform: "youtube" as const,
    kind: "short" as const,
  },
  {
    id: "5t9OMumgFd4",
    title: "MD. Shinha Sarder — Behind the scenes",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/5t9OMumgFd4/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/5t9OMumgFd4",
    shortUrl: "https://www.youtube.com/shorts/5t9OMumgFd4",
    embed: "https://www.youtube.com/embed/5t9OMumgFd4",
    platform: "youtube" as const,
    kind: "short" as const,
  },
  {
    id: "oDFzQkTWwUE",
    title: "MD. Shinha Sarder — Keynotes & Talks",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/oDFzQkTWwUE/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/oDFzQkTWwUE",
    shortUrl: "https://www.youtube.com/shorts/oDFzQkTWwUE",
    embed: "https://www.youtube.com/embed/oDFzQkTWwUE",
    platform: "youtube" as const,
    kind: "short" as const,
  },
  {
    id: "tN62GEJz4eM",
    title: "MD. Shinha Sarder — Founder Updates",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/tN62GEJz4eM/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/tN62GEJz4eM",
    shortUrl: "https://www.youtube.com/shorts/tN62GEJz4eM",
    embed: "https://www.youtube.com/embed/tN62GEJz4eM",
    platform: "youtube" as const,
    kind: "short" as const,
  },
];

let cachedVideosData: any = null;
let lastFetchTime = 0;

export async function GET(req: NextRequest) {
  return handleVideos(req);
}

export async function POST(req: NextRequest) {
  return handleVideos(req);
}

async function handleVideos(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let page = parseInt(url.searchParams.get("page") || "1", 10);
    let pageSize = parseInt(url.searchParams.get("pageSize") || "12", 10);

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.page) page = body.page;
        if (body.pageSize) pageSize = body.pageSize;
      } catch {
        // no body or json parsing error
      }
    }

    const now = Date.now();
    if (!cachedVideosData || now - lastFetchTime > 15 * 60 * 1000) {
      const [longs, shorts] = await Promise.all([
        getYouTubeLongs(YT_HANDLE),
        getYouTubeShorts(YT_HANDLE),
      ]);

      const allShorts = shorts.length > 0 ? shorts : DEFAULT_REELS;
      const allVideos = longs.length > 0 ? longs : allShorts;

      cachedVideosData = {
        videos: allVideos,
        reels: allShorts,
      };
      lastFetchTime = now;
    }

    const videos = cachedVideosData.videos || [];
    const reels = cachedVideosData.reels || DEFAULT_REELS;

    const start = (page - 1) * pageSize;
    const pagedVideos = videos.slice(start, start + pageSize);
    const hasMore = videos.length > start + pageSize;

    return NextResponse.json({
      videos: pagedVideos.length > 0 ? pagedVideos : reels.slice(0, pageSize),
      reels,
      allVideos: videos,
      allReels: reels,
      page,
      pageSize,
      total: videos.length,
      hasMore,
    });
  } catch (err) {
    console.error("Error in /api/videos:", err);
    return NextResponse.json({
      videos: DEFAULT_REELS,
      reels: DEFAULT_REELS,
      allVideos: DEFAULT_REELS,
      allReels: DEFAULT_REELS,
      page: 1,
      pageSize: 12,
      total: DEFAULT_REELS.length,
      hasMore: false,
    });
  }
}
