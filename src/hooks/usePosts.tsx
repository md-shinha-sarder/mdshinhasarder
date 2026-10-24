import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizePost,
  getStoredAdminPosts,
  getCachedAllPosts,
  setCachedAllPosts,
  getCachedAllPages,
  setCachedAllPages,
  fetchLiveBloggerFeed,
  subscribeToPostsUpdates,
  type SyncedPost,
} from "@/lib/postSync";

export type BlogPost = SyncedPost;

const memoryCache: Record<string, BlogPost[]> = {
  posts: typeof window !== "undefined" ? getCachedAllPosts() : [],
  pages: typeof window !== "undefined" ? getCachedAllPages() : [],
};

const inflight: Record<string, Promise<BlogPost[]>> = {};
const subscribers: Record<string, Set<(posts: BlogPost[]) => void>> = {
  posts: new Set(),
  pages: new Set(),
};

function notify(type: "posts" | "pages", data: BlogPost[]) {
  memoryCache[type] = data;
  if (type === "posts") {
    setCachedAllPosts(data);
  } else if (type === "pages") {
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

/**
 * Loads posts or pages from all tiers:
 * 1. Admin local synced storage (highest priority)
 * 2. Supabase DB table `posts` / `pages` (if exists and reachable)
 * 3. Static `/posts-sync.json` or `/pages-sync.json` cache
 * 4. Live direct Blogger feed auto-sync (shinhaauthor.blogspot.com)
 */
async function load(type: "posts" | "pages", force = false): Promise<BlogPost[]> {
  if (!force && memoryCache[type] && memoryCache[type].length > 0) {
    return memoryCache[type];
  }
  if (!force && inflight[type]) {
    return inflight[type];
  }

  inflight[type] = (async () => {
    const adminPosts = type === "posts" ? getStoredAdminPosts() : [];
    let dbPosts: BlogPost[] = [];
    let remotePosts: BlogPost[] = [];
    let liveBloggerPosts: BlogPost[] = [];

    // 1. Try static sync file immediately for rapid offline-first render
    const syncFile = type === "posts" ? "/posts-sync.json" : "/pages-sync.json";
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(syncFile);
        if (res.ok) {
          const staticData = await res.json();
          if (Array.isArray(staticData) && staticData.length > 0) {
            remotePosts = staticData.map((p) => normalizePost(p, "blogger"));
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Try Supabase DB
    try {
      const table = type === "posts" ? "posts" : "pages";
      const select =
        type === "posts"
          ? "id, slug, title, excerpt, content, cover_url, tags, seo_title, seo_description, status, published_at, created_at, updated_at"
          : "id, slug, title, content, seo_title, seo_description, status, created_at, updated_at";

      const { data, error } = await (supabase.from as any)(table)
        .select(select)
        .eq("status", "published")
        .order(type === "posts" ? "published_at" : "created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        dbPosts = data.map((item: any) =>
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
    } catch {
      // Supabase table not created yet or connection error
    }

    // 3. Try direct live Blogger Feed Auto-Sync (shinhaauthor.blogspot.com)
    try {
      const live = await fetchLiveBloggerFeed(type);
      if (live && live.length > 0) {
        liveBloggerPosts = live;
      }
    } catch {
      // ignore
    }

    // 4. Merge & Deduplicate
    // Priority: Admin custom/edited posts > Supabase DB posts > Live Blogger Posts > Static Cache
    const seenSlugs = new Set<string>();
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const merged: BlogPost[] = [];

    const addPost = (p: BlogPost) => {
      const slugKey = (p.slug || "").toLowerCase().trim();
      const idKey = (p.id || "").toLowerCase().trim();
      const titleKey = (p.title || "").toLowerCase().trim();

      if (slugKey && seenSlugs.has(slugKey)) return;
      if (idKey && seenIds.has(idKey)) return;
      if (titleKey && seenTitles.has(titleKey)) return;

      if (slugKey) seenSlugs.add(slugKey);
      if (idKey) seenIds.add(idKey);
      if (titleKey) seenTitles.add(titleKey);
      merged.push(p);
    };

    // Admin posts first (only published ones for public view)
    adminPosts.filter((p) => p.status === "published").forEach(addPost);
    // Then Supabase database posts
    dbPosts.forEach(addPost);
    // Then Live Blogger auto-synced posts
    liveBloggerPosts.forEach(addPost);
    // Then Static Cached posts
    remotePosts.forEach(addPost);

    // If still empty, fall back to memory cache
    const result = merged.length > 0 ? merged : memoryCache[type] || [];

    notify(type, result);
    return result;
  })();

  try {
    return await inflight[type];
  } finally {
    delete inflight[type];
  }
}

export const usePosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    if (memoryCache.posts && memoryCache.posts.length > 0) {
      return memoryCache.posts;
    }
    if (typeof window !== "undefined") {
      const cached = getCachedAllPosts();
      if (cached.length > 0) return cached;
      const admin = getStoredAdminPosts().filter((p) => p.status === "published");
      if (admin.length > 0) return admin;
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(posts.length === 0);

  useEffect(() => {
    const handleUpdate = (updated: BlogPost[]) => {
      setPosts(updated);
    };

    subscribers.posts.add(handleUpdate);

    // Listen to cross-tab & local sync events
    const unsubscribeSync = subscribeToPostsUpdates(() => {
      const admin = getStoredAdminPosts().filter((p) => p.status === "published");
      const current = memoryCache.posts || [];
      const merged = [...admin, ...current.filter((c) => !admin.some((a) => a.slug === c.slug || a.id === c.id))];
      setPosts(merged);
    });

    // Background fetch to ensure newest content
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
    setLoading(true);
    try {
      const p = await load("posts", true);
      setPosts(p);
      return p;
    } finally {
      setLoading(false);
    }
  }, []);

  return { posts, loading, refetch };
};

export const usePages = () => {
  const [pages, setPages] = useState<BlogPost[]>(() => {
    if (memoryCache.pages && memoryCache.pages.length > 0) {
      return memoryCache.pages;
    }
    if (typeof window !== "undefined") {
      const cached = getCachedAllPages();
      if (cached.length > 0) return cached;
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(pages.length === 0);

  useEffect(() => {
    const handleUpdate = (updated: BlogPost[]) => {
      setPages(updated);
    };

    subscribers.pages.add(handleUpdate);

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
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = await load("pages", true);
      setPages(p);
      return p;
    } finally {
      setLoading(false);
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
