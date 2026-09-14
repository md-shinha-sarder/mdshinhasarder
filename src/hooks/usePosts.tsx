import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  url: string;
  image: string | null;
  excerpt: string;
  content: string;
  published: string;
  updated: string;
  tags: string[];
  seo_title?: string | null;
  seo_description?: string | null;
}

const cache: Record<string, BlogPost[]> = {};
const inflight: Record<string, Promise<BlogPost[]>> = {};
const subs: Record<string, Set<(p: BlogPost[]) => void>> = {};

async function load(type: "posts" | "pages", force = false): Promise<BlogPost[]> {
  if (!force && cache[type]) return cache[type];
  if (!force && inflight[type]) return inflight[type];
  inflight[type] = (async () => {
    let loaded: BlogPost[] | null = null;

    // 1. Try local Next.js /api/posts route (fast, server-cached, zero CORS)
    try {
      const res = await fetch(`/api/posts?type=${type}${force ? `&force=true&t=${Date.now()}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.posts || data.items) && (data.posts?.length > 0 || data.items?.length > 0)) {
          loaded = (data?.posts ?? data?.items) as BlogPost[];
        }
      }
    } catch (_err) {
      console.warn("Local /api/posts fetch error:", _err);
    }

    // 2. Try Supabase database table if configured
    if (!loaded || loaded.length === 0) {
      try {
        const table = type === "posts" ? "posts" : "pages";
        const select = type === "posts"
          ? "id, slug, title, excerpt, content, cover_url, tags, seo_title, seo_description, status, published_at, created_at, updated_at"
          : "id, slug, title, content, seo_title, seo_description, status, created_at, updated_at";
        const { data: dbItems, error: dbError } = await (supabase.from as any)(table)
          .select(select)
          .eq("status", "published")
          .order(type === "posts" ? "published_at" : "created_at", { ascending: false });

        if (!dbError && dbItems && dbItems.length > 0) {
          loaded = dbItems.map((item: any) => ({
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
          })) as BlogPost[];
        }
      } catch (_e) {
        void _e;
      }
    }

    // 3. Fallback to Supabase edge function or direct URL if still empty
    if (!loaded || loaded.length === 0) {
      try {
        const res = await fetch(`https://ihegjzwlvthfqwredssj.supabase.co/functions/v1/fetch-posts?type=${type}${force ? `&t=${Date.now()}` : ""}`);
        if (res.ok) {
          const data = await res.json();
          loaded = (data?.posts ?? data?.items ?? []) as BlogPost[];
        }
      } catch (_e) {
        void _e;
      }
    }

    // 4. Fallback directly to Blogger public JSON feed (works anywhere, including Cloudflare Pages static hosting)
    if (!loaded || loaded.length === 0) {
      try {
        const feedPath = type === "posts" ? "posts" : "pages";
        const res = await fetch(`https://shinhaauthor.blogspot.com/feeds/${feedPath}/default?alt=json&max-results=500`);
        if (res.ok) {
          const json = await res.json();
          const entries = json.feed?.entry || [];
          if (entries.length > 0) {
            loaded = entries.map((e: any) => {
              const title = e.title?.$t || "";
              const content = e.content?.$t || e.summary?.$t || "";
              const published = e.published?.$t || "";
              const updated = e.updated?.$t || published;
              const link = (e.link || []).find((l: any) => l.rel === "alternate")?.href || "";
              const tags = (e.category || []).map((c: any) => c.term).filter((t: string) => t !== "Latest");
              const imgM = content.match(/<img[^>]+src=["']([^"']+)["']/i);
              const image = imgM ? imgM[1].replace(/\/s\d+(-c)?\//, "/s1600/").replace(/=w\d+-h\d+(-c)?$/, "=w1600") : null;
              const slug = link ? (link.split("/").pop()?.replace(/\.html?$/, "") || "post") : "post";
              const plain = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
              const excerpt = plain.slice(0, 180) + (plain.length > 180 ? "…" : "");
              return {
                id: slug,
                slug,
                title,
                url: link,
                image,
                excerpt: excerpt || title,
                content,
                published,
                updated,
                tags,
              };
            }) as BlogPost[];
          }
        }
      } catch (_err) {
        console.warn("Direct Blogger feed fetch fallback error:", _err);
      }
    }

    cache[type] = loaded ?? cache[type] ?? [];
    (subs[type] ||= new Set()).forEach((fn) => fn(cache[type]));
    return cache[type];
  })();
  try { return await inflight[type]; } finally { delete inflight[type]; }
}

export const usePosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(cache.posts ?? []);
  const [loading, setLoading] = useState(!cache.posts);
  useEffect(() => {
    (subs.posts ||= new Set()).add(setPosts);
    load("posts").then((p) => { setPosts(p); setLoading(false); }).catch(() => setLoading(false));
    return () => { subs.posts?.delete(setPosts); };
  }, []);
  const refetch = async () => { setLoading(true); try { const p = await load("posts", true); setPosts(p); } finally { setLoading(false); } };
  return { posts, loading, refetch };
};

export const usePages = () => {
  const [pages, setPages] = useState<BlogPost[]>(cache.pages ?? []);
  const [loading, setLoading] = useState(!cache.pages);
  useEffect(() => {
    load("pages").then((p) => { setPages(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return { pages, loading };
};

export const usePost = (slug?: string) => {
  const { posts, loading } = usePosts();
  const { pages } = usePages();
  const post = posts.find((p) => p.slug === slug) || pages.find((p) => p.slug === slug);
  return { post, loading };
};
