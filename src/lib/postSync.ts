/**
 * Data Synchronization Engine for MD. Shinha Sarder's Website
 * Ensures posts created or edited in the Admin panel are immediately
 * reflected on all public-facing pages (Home, /posts, /post/:slug, /:year/:month/:slug.html)
 * with real-time cross-tab synchronization and Supabase cloud persistence.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SyncedPost {
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
  status: "published" | "draft";
  source?: "admin" | "supabase" | "blogger";
  synced_to_cloud?: boolean;
}

const STORAGE_ADMIN_POSTS = "mds_admin_posts_v2";
const STORAGE_CACHED_ALL_POSTS = "mds_all_posts_cache_v2";
const SYNC_CHANNEL_NAME = "mds_posts_sync_channel";
const SYNC_EVENT_NAME = "mds:posts:sync";

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Normalizes any post object to ensure strict type safety and avoid runtime exceptions.
 */
export function normalizePost(raw: any, defaultSource: "admin" | "supabase" | "blogger" = "blogger"): SyncedPost {
  if (!raw || typeof raw !== "object") {
    return {
      id: "empty-" + Math.random().toString(36).slice(2),
      title: "Untitled Post",
      slug: "untitled-post",
      url: "",
      image: null,
      excerpt: "",
      content: "",
      published: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: [],
      status: "published",
      source: defaultSource,
    };
  }

  const rawTags = raw.tags || raw.labels || [];
  let tags: string[] = [];
  if (Array.isArray(rawTags)) {
    tags = rawTags.map((t) => String(t || "").trim()).filter(Boolean);
  } else if (typeof rawTags === "string") {
    tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
  }

  const title = String(raw.title || "").trim() || "Untitled Post";
  let slug = String(raw.slug || raw.id || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s/-]/g, "")
    .replace(/[\s_]+/g, "-");

  // Remove trailing or leading dashes/slashes for matching
  if (!slug || slug === "-") {
    slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");
  }

  const nowIso = new Date().toISOString();
  const published = String(raw.published || raw.published_at || raw.created_at || nowIso);
  const updated = String(raw.updated || raw.updated_at || published);
  const image = raw.cover_url || raw.image || null;
  const excerpt = String(raw.excerpt || "").trim();
  const content = String(raw.content || "").trim();
  const id = String(raw.id || slug);

  return {
    id,
    title,
    slug,
    url: String(raw.url || ""),
    image: image ? String(image) : null,
    excerpt,
    content,
    published,
    updated,
    tags,
    seo_title: raw.seo_title ? String(raw.seo_title) : null,
    seo_description: raw.seo_description ? String(raw.seo_description) : null,
    status: (raw.status === "draft" ? "draft" : "published") as "published" | "draft",
    source: raw.source || defaultSource,
    synced_to_cloud: raw.synced_to_cloud ?? false,
  };
}

/**
 * Retrieves custom posts created or updated by Admin in local storage.
 */
export function getStoredAdminPosts(): SyncedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_POSTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => normalizePost(p, "admin"));
  } catch (err) {
    console.warn("[PostSync] Could not read admin posts from localStorage:", err);
    return [];
  }
}

/**
 * Saves or updates custom admin posts in local storage.
 */
export function setStoredAdminPosts(posts: SyncedPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_ADMIN_POSTS, JSON.stringify(posts));
  } catch (err) {
    console.warn("[PostSync] Could not write admin posts to localStorage:", err);
  }
}

/**
 * Retrieves the cached unified post list from local storage for instant 0ms rendering.
 */
export function getCachedAllPosts(): SyncedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CACHED_ALL_POSTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => normalizePost(p));
  } catch {
    return [];
  }
}

/**
 * Caches the unified post list in local storage.
 */
export function setCachedAllPosts(posts: SyncedPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CACHED_ALL_POSTS, JSON.stringify(posts));
  } catch {
    // ignore quota errors
  }
}

/**
 * Broadcasts an update event across the current window and all other browser tabs.
 */
export function broadcastPostsUpdate(posts?: SyncedPost[]): void {
  if (typeof window === "undefined") return;
  try {
    // Dispatch in current tab
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { posts } }));

    // Dispatch across tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "POSTS_UPDATED", timestamp: Date.now() });
    }
  } catch (e) {
    console.warn("[PostSync] Broadcast failed:", e);
  }
}

/**
 * Subscribes to live synchronization updates across tabs and local components.
 */
export function subscribeToPostsUpdates(onUpdate: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = () => onUpdate();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_ADMIN_POSTS || e.key === STORAGE_CACHED_ALL_POSTS) {
      onUpdate();
    }
  };
  const handleChannelMessage = (event: MessageEvent) => {
    if (event.data?.type === "POSTS_UPDATED") {
      onUpdate();
    }
  };

  window.addEventListener(SYNC_EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleChannelMessage);
  }

  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleChannelMessage);
    }
  };
}

/**
 * Saves a post from the Admin Panel:
 * 1. Persists immediately into Admin local synced store (instant UI reflect).
 * 2. Broadcasts cross-tab real-time event.
 * 3. Attempts to save to Supabase public.posts table.
 */
export async function saveAdminPost(
  postInput: Partial<SyncedPost> & { title: string; content: string }
): Promise<{ success: boolean; post: SyncedPost; syncedToCloud: boolean; message: string }> {
  const currentAdminPosts = getStoredAdminPosts();

  const isEditing = Boolean(postInput.id && currentAdminPosts.some((p) => p.id === postInput.id));
  const id = postInput.id || "post-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);

  const title = postInput.title.trim();
  let slug = (postInput.slug || "").trim().toLowerCase();
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");
  }

  const now = new Date().toISOString();
  const normalized: SyncedPost = normalizePost(
    {
      ...postInput,
      id,
      slug,
      title,
      published: postInput.published || (postInput.status === "published" ? now : now),
      updated: now,
      source: "admin",
      synced_to_cloud: false,
    },
    "admin"
  );

  // 1. Immediately store in admin posts
  const updatedAdminPosts = isEditing
    ? currentAdminPosts.map((p) => (p.id === id ? normalized : p))
    : [normalized, ...currentAdminPosts.filter((p) => p.slug !== slug)];

  setStoredAdminPosts(updatedAdminPosts);

  // Update cached all posts immediately
  const currentCached = getCachedAllPosts();
  const mergedCached = [
    normalized,
    ...currentCached.filter((p) => p.id !== id && p.slug !== slug),
  ];
  setCachedAllPosts(mergedCached);

  // Broadcast to all open pages
  broadcastPostsUpdate(mergedCached);

  // 2. Attempt Supabase persistence
  let syncedToCloud = false;
  let message = "Post published and immediately live across the site!";

  try {
    const payload = {
      id: normalized.id,
      slug: normalized.slug,
      title: normalized.title,
      excerpt: normalized.excerpt,
      content: normalized.content,
      cover_url: normalized.image,
      tags: normalized.tags,
      seo_title: normalized.seo_title,
      seo_description: normalized.seo_description,
      status: normalized.status,
      published_at: normalized.status === "published" ? normalized.published : null,
      updated_at: normalized.updated,
    };

    const { error } = await supabase.from("posts").upsert(payload, { onConflict: "slug" });

    if (!error) {
      syncedToCloud = true;
      normalized.synced_to_cloud = true;
      // Mark as cloud synced
      const finalAdminPosts = getStoredAdminPosts().map((p) =>
        p.id === id ? { ...p, synced_to_cloud: true } : p
      );
      setStoredAdminPosts(finalAdminPosts);
      message = "Post saved to Supabase database and synchronized live!";
    } else {
      console.warn("[PostSync] Supabase sync notice:", error.message);
      message = "Post live locally & cross-tabs! (Supabase sync waiting for 'posts' table schema)";
    }
  } catch (err: any) {
    console.warn("[PostSync] Cloud sync failed, continuing locally:", err);
  }

  return {
    success: true,
    post: normalized,
    syncedToCloud,
    message,
  };
}

/**
 * Deletes a post from Admin local store and Supabase.
 */
export async function deleteAdminPost(idOrSlug: string): Promise<{ success: boolean; syncedToCloud: boolean }> {
  const current = getStoredAdminPosts();
  const filtered = current.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  setStoredAdminPosts(filtered);

  // Update all posts cache
  const cached = getCachedAllPosts().filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  setCachedAllPosts(cached);
  broadcastPostsUpdate(cached);

  let syncedToCloud = false;
  try {
    const { error } = await supabase.from("posts").delete().or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    if (!error) syncedToCloud = true;
  } catch {
    // ignore
  }

  return { success: true, syncedToCloud };
}

/**
 * Provides the SQL script to create and setup the Supabase table with RLS and indexing.
 */
export function getSupabaseSetupSql(): string {
  return `-- =========================================================
-- MD. Shinha Sarder - Complete Supabase Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query
-- =========================================================

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
CREATE POLICY "Public can view published posts" ON public.posts
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to manage posts
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.posts;
CREATE POLICY "Authenticated users can manage posts" ON public.posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access on posts" ON public.posts;
CREATE POLICY "Service role full access on posts" ON public.posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
`;
}
