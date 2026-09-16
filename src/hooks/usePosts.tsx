import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizePost,
  getStoredAdminPosts,
  getCachedAllPosts,
  setCachedAllPosts,
  subscribeToPostsUpdates,
  type SyncedPost,
} from "@/lib/postSync";

export type BlogPost = SyncedPost;

const memoryCache: Record<string, BlogPost[]> = {
  posts: typeof window !== "undefined" ? getCachedAllPosts() : [],
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
 * Loads posts from all tiers:
 * 1. Admin local synced storage (highest priority)
 * 2. Supabase DB table `posts` (if exists and reachable)
 * 3. Supabase Edge Function `fetch-posts` / Blogger fallback
 * 4. Static `/posts-sync.json` fallback
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

    // 1. Try Supabase DB
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

    // 2. Try Edge Function / Blogger Fallback
    try {
      let loaded: any[] | null = null;
      try {
        const { data, error } = await supabase.functions.invoke(
          `fetch-posts?type=${type}${force ? `&t=${Date.now()}` : ""}`
        );
        if (!error && data && (data.posts || data.items)) {
          loaded = (data?.posts ?? data?.items ?? []) as any[];
        }
      } catch {
        // ignore
      }

      if (!loaded || loaded.length === 0) {
        const res = await fetch(
          `https://ihegjzwlvthfqwredssj.supabase.co/functions/v1/fetch-posts?type=${type}${force ? `&t=${Date.now()}` : ""}`
        );
        if (res.ok) {
          const data = await res.json();
          loaded = (data?.posts ?? data?.items ?? []) as any[];
        }
      }

      if (loaded && loaded.length > 0) {
        remotePosts = loaded.map((p) => normalizePost(p, "blogger"));
      }
    } catch {
      // ignore
    }

    // 3. Fallback: try static sync file if both DB and remote returned empty
    if (dbPosts.length === 0 && remotePosts.length === 0 && typeof window !== "undefined") {
      try {
        const res = await fetch("/posts-sync.json");
        if (res.ok) {
          const staticPosts = await res.json();
          if (Array.isArray(staticPosts)) {
            remotePosts = staticPosts.map((p) => normalizePost(p, "blogger"));
          }
        }
      } catch {
        // ignore
      }
    }

    // 4. Merge & Deduplicate
    // Priority: Admin custom/edited posts > Supabase DB posts > Remote Blogger posts
    const seenSlugs = new Set<string>();
    const seenIds = new Set<string>();
    const merged: BlogPost[] = [];

    const addPost = (p: BlogPost) => {
      const slugKey = (p.slug || "").toLowerCase();
      const idKey = (p.id || "").toLowerCase();
      if (slugKey && seenSlugs.has(slugKey)) return;
      if (idKey && seenIds.has(idKey)) return;

      if (slugKey) seenSlugs.add(slugKey);
      if (idKey) seenIds.add(idKey);
      merged.push(p);
    };

    // Admin posts first (only published ones for public view)
    adminPosts.filter((p) => p.status === "published").forEach(addPost);
    // Then Supabase database posts
    dbPosts.forEach(addPost);
    // Then Remote Blogger posts
    remotePosts.forEach(addPost);

    // If still empty, fall back to memory cache or admin drafts
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
  const [pages, setPages] = useState<BlogPost[]>(memoryCache.pages || []);
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

  return { pages, loading };
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
