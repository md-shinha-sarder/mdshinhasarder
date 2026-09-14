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

    return {
      videos: (result?.videos ?? []) as VideoItem[],
      reels: (result?.reels ?? []) as VideoItem[],
      page: result?.page ?? page,
      pageSize: result?.pageSize ?? pageSize,
      total: result?.total ?? 0,
      hasMore: !!result?.hasMore,
    };
  } catch {
    return {
      videos: [],
      reels: [],
      page,
      pageSize,
      total: 0,
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
