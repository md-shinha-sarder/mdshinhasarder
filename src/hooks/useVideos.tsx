import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VideoItem {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  url: string;
  shortUrl: string;
  embed: string;
  platform: "youtube" | "facebook";
  kind?: "video" | "short" | "reel";
}

interface Cache {
  videos: VideoItem[];
  reels: VideoItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

const DEFAULT_FALLBACK_REELS: VideoItem[] = [
  {
    id: "j44N-z_KxZo",
    title: "MD. Shinha Sarder — Official Short",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/j44N-z_KxZo/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/j44N-z_KxZo",
    shortUrl: "https://www.youtube.com/shorts/j44N-z_KxZo",
    embed: "https://www.youtube.com/embed/j44N-z_KxZo",
    platform: "youtube",
    kind: "short",
  },
  {
    id: "-HOF8TtEh7s",
    title: "MD. Shinha Sarder — Tech Highlights",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/-HOF8TtEh7s/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/-HOF8TtEh7s",
    shortUrl: "https://www.youtube.com/shorts/-HOF8TtEh7s",
    embed: "https://www.youtube.com/embed/-HOF8TtEh7s",
    platform: "youtube",
    kind: "short",
  },
  {
    id: "fLDFXPJf_NA",
    title: "MD. Shinha Sarder — Project Journey",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/fLDFXPJf_NA/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/fLDFXPJf_NA",
    shortUrl: "https://www.youtube.com/shorts/fLDFXPJf_NA",
    embed: "https://www.youtube.com/embed/fLDFXPJf_NA",
    platform: "youtube",
    kind: "short",
  },
  {
    id: "5t9OMumgFd4",
    title: "MD. Shinha Sarder — Behind the Scenes",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/5t9OMumgFd4/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/5t9OMumgFd4",
    shortUrl: "https://www.youtube.com/shorts/5t9OMumgFd4",
    embed: "https://www.youtube.com/embed/5t9OMumgFd4",
    platform: "youtube",
    kind: "short",
  },
  {
    id: "oDFzQkTWwUE",
    title: "MD. Shinha Sarder — Keynotes & Talks",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/oDFzQkTWwUE/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/oDFzQkTWwUE",
    shortUrl: "https://www.youtube.com/shorts/oDFzQkTWwUE",
    embed: "https://www.youtube.com/embed/oDFzQkTWwUE",
    platform: "youtube",
    kind: "short",
  },
  {
    id: "tN62GEJz4eM",
    title: "MD. Shinha Sarder — Founder Updates",
    published: new Date().toISOString(),
    thumbnail: "https://i.ytimg.com/vi/tN62GEJz4eM/hqdefault.jpg",
    url: "https://www.youtube.com/shorts/tN62GEJz4eM",
    shortUrl: "https://www.youtube.com/shorts/tN62GEJz4eM",
    embed: "https://www.youtube.com/embed/tN62GEJz4eM",
    platform: "youtube",
    kind: "short",
  },
];

let cache: Cache | null = null;
let inflight: Promise<Cache> | null = null;

async function fetchPage(page: number, pageSize: number): Promise<Cache> {
  try {
    let result: any = null;

    // 1. Try local Next.js /api/videos route
    try {
      const res = await fetch(`/api/videos?page=${page}&pageSize=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.videos?.length > 0 || data.reels?.length > 0)) {
          result = data;
        }
      }
    } catch (_err) {
      console.warn("Local /api/videos fetch error:", _err);
    }

    // 2. Fallback to Supabase function invoke if not returned
    if (!result) {
      try {
        const { data, error } = await supabase.functions.invoke("fetch-videos", {
          body: { page, pageSize },
        });
        if (!error && data && (data.videos || data.reels)) {
          result = data;
        }
      } catch (_e) {
        void _e;
      }
    }

    // 3. Fallback to external endpoint if still not returned
    if (!result) {
      try {
        const res = await fetch("https://ihegjzwlvthfqwredssj.supabase.co/functions/v1/fetch-videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page, pageSize }),
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (_e) {
        void _e;
      }
    }

    const rawReels: VideoItem[] = (result?.reels ?? result?.allReels ?? []) as VideoItem[];
    const rawVideos: VideoItem[] = (result?.videos ?? result?.allVideos ?? []) as VideoItem[];

    const finalReels = rawReels.length > 0 ? rawReels : (rawVideos.length > 0 ? rawVideos : DEFAULT_FALLBACK_REELS);
    const finalVideos = rawVideos.length > 0 ? rawVideos : finalReels;

    return {
      videos: finalVideos,
      reels: finalReels,
      page: result?.page ?? page,
      pageSize: result?.pageSize ?? pageSize,
      total: result?.total || finalVideos.length,
      hasMore: !!result?.hasMore,
    };
  } catch {
    return {
      videos: DEFAULT_FALLBACK_REELS,
      reels: DEFAULT_FALLBACK_REELS,
      page,
      pageSize,
      total: DEFAULT_FALLBACK_REELS.length,
      hasMore: false,
    };
  }
}

export const useVideos = (initialPageSize = 12) => {
  const [state, setState] = useState<Cache>(cache ?? { videos: [], reels: [], page: 1, pageSize: initialPageSize, total: 0, hasMore: false });
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    if (!inflight) inflight = fetchPage(1, initialPageSize).then((c) => (cache = c));
    inflight.then((c) => { setState(c); setLoading(false); }).catch(() => setLoading(false));
  }, [initialPageSize]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || loading) return;
    setLoading(true);
    const next = await fetchPage(state.page + 1, state.pageSize);
    const merged: Cache = {
      ...next,
      videos: [...state.videos, ...next.videos],
      reels: state.reels.length ? state.reels : next.reels,
    };
    cache = merged;
    setState(merged);
    setLoading(false);
  }, [state, loading]);

  return { videos: state.videos, reels: state.reels, loading, hasMore: state.hasMore, loadMore };
};
