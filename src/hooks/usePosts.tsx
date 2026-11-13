import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizePost,
  getStoredAdminPosts,
  getStoredAdminPages,
  getCachedAllPosts,
  setCachedAllPosts,
  getCachedAllPages,
  setCachedAllPages,
  getDeletedPostKeys,
  fetchLiveBloggerFeed,
  subscribeToPostsUpdates,
  type SyncedPost,
} from "@/lib/postSync";

export type BlogPost = SyncedPost;

const memoryCache: Record<"posts" | "pages", BlogPost[]> = {
  posts: typeof window !== "undefined" ? getCachedAllPosts() : [],
  pages: typeof window !== "undefined" ? getCachedAllPages() : [],
};

const hasFetchedRemote: Record<"posts" | "pages", boolean> = {
  posts: false,
  pages: false,
};

const inflight: Record<string, Promise<BlogPost[]> | undefined> = {};
const subscribers: Record<"posts" | "pages", Set<(posts: BlogPost[]) => void>> = {
  posts: new Set(),
  pages: new Set(),
};

function sortByNewest(list: BlogPost[]): BlogPost[] {
  return [...list].sort((a, b) => {
    const tA = a.published ? Date.parse(a.published) : 0;
    const tB = b.published ? Date.parse(b.published) : 0;
    return (Number.isFinite(tB) ? tB : 0) - (Number.isFinite(tA) ? tA : 0);
  });
}

function mergePublicTiers(
  type: "posts" | "pages",
  adminItems: BlogPost[],
  dbItems: BlogPost[],
  liveItems: BlogPost[],
  staticItems: BlogPost[]
): BlogPost[] {
  const deleted = getDeletedPostKeys();
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const merged: BlogPost[] = [];

  const isDeleted = (p: BlogPost) => {
    const s = (p.slug || "").toLowerCase().trim();
    const id = (p.id || "").toLowerCase().trim();
    return (s && deleted.has(s)) || (id && deleted.has(id));
  };

  const trackSeen = (p: BlogPost) => {
    const slugKey = (p.slug || "").toLowerCase().trim();
    const idKey = (p.id || "").toLowerCase().trim();
    const titleKey = (p.title || "").toLowerCase().trim();
    if (slugKey) seenSlugs.add(slugKey);
    if (idKey) seenIds.add(idKey);
    if (titleKey) seenTitles.add(titleKey);
  };

  const addIfUnique = (p: BlogPost) => {
    if (isDeleted(p)) return;
    if (p.status === "draft") {
      // Reserve slug/id so draft overrides lower-tier published copies
      trackSeen(p);
      return;
    }
    const slugKey = (p.slug || "").toLowerCase().trim();
    const idKey = (p.id || "").toLowerCase().trim();
    const titleKey = (p.title || "").toLowerCase().trim();

    if (slugKey && seenSlugs.has(slugKey)) return;
    if (idKey && seenIds.has(idKey)) return;
    if (titleKey && seenTitles.has(titleKey)) return;

    trackSeen(p);
    merged.push(p);
  };

  // Priority order: Admin custom/edited > Supabase DB > Live Blogger Feed > Static JSON
  adminItems.forEach(addIfUnique);
  dbItems.forEach(addIfUnique);
  liveItems.forEach(addIfUnique);
  staticItems.forEach(addIfUnique);

  return type === "posts" ? sortByNewest(merged) : merged;
}

function notify(type: "posts" | "pages", data: BlogPost[]) {
  memoryCache[type] = data;
  if (type === "posts") {
    setCachedAllPosts(data);
  } else {
    setCachedAllPages(data);
  }
  subscribers[type]?.forEach((callback) => {
    try {
      callback(data);
    } catch {
      // ignore subscriber error
    }
  });
}

function computeInstantSyncState(type: "posts" | "pages"): BlogPost[] {
  const adminItems = type === "posts" ? getStoredAdminPosts() : getStoredAdminPages();
  const cachedItems = type === "posts" ? getCachedAllPosts() : getCachedAllPages();
  const currentMem = memoryCache[type] || [];
  const base = cachedItems.length > 0 ? cachedItems : currentMem;
  return mergePublicTiers(type, adminItems, [], [], base);
}

/**
 * Loads posts or pages progressively across all tiers:
 * Phase 1 (instant ~5-20ms): Admin local + Static `/posts-sync.json` / `/pages-sync.json`
 * Phase 2 (background): Supabase DB + Live Blogger JSONP (timeout 3.5s)
 */
async function load(type: "posts" | "pages", force = false): Promise<BlogPost[]> {
  if (!force && hasFetchedRemote[type] && memoryCache[type] && memoryCache[type].length > 0) {
    return memoryCache[type];
  }
  if (!force && inflight[type]) {
    return inflight[type]!;
  }

  inflight[type] = (async () => {
    const adminItems = type === "posts" ? getStoredAdminPosts() : getStoredAdminPages();
    let dbItems: BlogPost[] = [];
    let staticItems: BlogPost[] = [];
    let liveItems: BlogPost[] = [];

    const syncFile = type === "posts" ? "/posts-sync.json" : "/pages-sync.json";

    const fetchStatic = async () => {
      if (typeof window === "undefined") return [];
      try {
        const res = await fetch(syncFile);
        if (res.ok) {
          const staticData = await res.json();
          if (Array.isArray(staticData) && staticData.length > 0) {
            return staticData.map((p) => normalizePost(p, "blogger"));
          }
        }
      } catch (_err) {
        void _err;
      }
      return [];
    };

    const fetchSupabase = async () => {
      try {
        const table = type === "posts" ? "posts" : "pages";
        const select =
          type === "posts"
            ? "id, slug, title, excerpt, content, cover_url, tags, seo_title, seo_description, status, published_at, created_at, updated_at"
            : "id, slug, title, content, cover_url, images, seo_title, seo_description, status, created_at, updated_at";

        const { data, error } = await (supabase.from as any)(table)
          .select(select)
          .eq("status", "published")
          .order(type === "posts" ? "published_at" : "created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) =>
            normalizePost(
              {
                id: item.id,
                title: item.title,
                slug: item.slug,
                url: "",
                image: item.cover_url ?? null,
                excerpt: item.excerpt || item.seo_description || item.title,
                content: item.content || "",
                published: item.published_at || item.created_at,
                updated: item.updated_at || item.published_at || item.created_at,
                tags: item.tags || [],
                seo_title: item.seo_title || null,
                seo_description: item.seo_description || null,
                status: "published",
                synced_to_cloud: true,
              },
              "supabase"
            )
          );
        }
      } catch (_err) {
        void _err;
      }
      return [];
    };

    const fetchLive = async () => {
      try {
        const live = await fetchLiveBloggerFeed(type);
        if (live && live.length > 0) return live;
      } catch (_err) {
        void _err;
      }
      return [];
    };

    // Start all 3 sources in parallel
    const staticPromise = fetchStatic();
    const dbPromise = fetchSupabase();
    const livePromise = fetchLive();

    // Phase 1: Emit immediately as soon as local static JSON finishes (~10ms)
    try {
      staticItems = await staticPromise;
      const latestAdmin1 = type === "posts" ? getStoredAdminPosts() : getStoredAdminPages();
      const fastMerged = mergePublicTiers(type, latestAdmin1, [], [], staticItems);
      if (fastMerged.length > 0) {
        notify(type, fastMerged);
      }
    } catch {
      // continue to phase 2
    }

    // Phase 2: Merge Supabase + Live Blogger JSONP when they settle
    const [dbRes, liveRes] = await Promise.allSettled([dbPromise, livePromise]);
    if (dbRes.status === "fulfilled") dbItems = dbRes.value;
    if (liveRes.status === "fulfilled") liveItems = liveRes.value;

    const latestAdmin2 = type === "posts" ? getStoredAdminPosts() : getStoredAdminPages();
    const merged = mergePublicTiers(type, latestAdmin2, dbItems, liveItems, staticItems);
    const result = merged.length > 0 ? merged : computeInstantSyncState(type);

    hasFetchedRemote[type] = true;
    notify(type, result);
    return result;
  })();

  try {
    return await inflight[type]!;
  } finally {
    delete inflight[type];
  }
}

export const usePosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    if (typeof window !== "undefined") {
      const instant = computeInstantSyncState("posts");
      if (instant.length > 0) return instant;
    }
    return memoryCache.posts || [];
  });

  const [loading, setLoading] = useState<boolean>(posts.length === 0);

  useEffect(() => {
    const handleUpdate = (updated: BlogPost[]) => {
      setPosts(updated);
      setLoading(false);
    };

    subscribers.posts.add(handleUpdate);

    // 0ms immediate update whenever Admin publishes, drafts, edits, deletes, or clears cache
    const unsubscribeSync = subscribeToPostsUpdates((detail) => {
      if (detail?.reset) {
        memoryCache.posts = [];
        hasFetchedRemote.posts = false;
      }
      const instant = computeInstantSyncState("posts");
      memoryCache.posts = instant;
      setPosts(instant);
      setLoading(false);
    });

    // Always kick off background refresh on mount until remote tiers are synced
    load("posts")
      .then((p) => {
        setPosts(p);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      subscribers.posts.delete(handleUpdate);
      unsubscribeSync();
    };
  }, []);

  const refetch = useCallback(async () => {
    hasFetchedRemote.posts = false;
    try {
      const p = await load("posts", true);
      setPosts(p);
      setLoading(false);
      return p;
    } catch {
      setLoading(false);
      return computeInstantSyncState("posts");
    }
  }, []);

  return { posts, loading, refetch };
};

export const usePages = () => {
  const [pages, setPages] = useState<BlogPost[]>(() => {
    if (typeof window !== "undefined") {
      const instant = computeInstantSyncState("pages");
      if (instant.length > 0) return instant;
    }
    return memoryCache.pages || [];
  });
  const [loading, setLoading] = useState<boolean>(pages.length === 0);

  useEffect(() => {
    const handleUpdate = (updated: BlogPost[]) => {
      setPages(updated);
      setLoading(false);
    };

    subscribers.pages.add(handleUpdate);

    const unsubscribeSync = subscribeToPostsUpdates((detail) => {
      if (detail?.reset) {
        memoryCache.pages = [];
        hasFetchedRemote.pages = false;
      }
      const instant = computeInstantSyncState("pages");
      memoryCache.pages = instant;
      setPages(instant);
      setLoading(false);
    });

    load("pages")
      .then((p) => {
        setPages(p);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      subscribers.pages.delete(handleUpdate);
      unsubscribeSync();
    };
  }, []);

  const refetch = useCallback(async () => {
    hasFetchedRemote.pages = false;
    try {
      const p = await load("pages", true);
      setPages(p);
      setLoading(false);
      return p;
    } catch {
      setLoading(false);
      return computeInstantSyncState("pages");
    }
  }, []);

  return { pages, loading, refetch };
};

export const usePost = (slug?: string) => {
  const { posts, loading } = usePosts();
  const { pages } = usePages();

  const cleanSlug = (slug || "").replace(/\.html?$/, "").toLowerCase();

  const post =
    posts.find((p) => {
      const s = (p.slug || "").replace(/\.html?$/, "").toLowerCase();
      return s === cleanSlug || s.endsWith("/" + cleanSlug) || cleanSlug.endsWith(s) || p.id === cleanSlug;
    }) ||
    pages.find((p) => {
      const s = (p.slug || "").replace(/\.html?$/, "").toLowerCase();
      return s === cleanSlug || p.id === cleanSlug;
    });

  return { post, loading };
};
