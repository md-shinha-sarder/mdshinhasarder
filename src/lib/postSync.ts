/**
 * Data Synchronization Engine for MD. Shinha Sarder's Website
 * Ensures posts created or edited in the Admin panel are immediately
 * reflected on all public-facing pages (Home, /posts, /post/:slug, /:year/:month/:slug.html)
 * with real-time cross-tab synchronization and Supabase cloud persistence.
 */

import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { toFullResolutionImageUrl } from "@/lib/imageSeo";

export interface SyncedPost {
  id: string;
  title: string;
  slug: string;
  url: string;
  image: string | null;
  cover_url?: string | null;
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
  views?: number;
}

const STORAGE_ADMIN_POSTS = "mds_admin_posts_v2";
const STORAGE_CACHED_ALL_POSTS = "mds_all_posts_cache_v2";
const STORAGE_ADMIN_PAGES = "mds_admin_pages_v1";
const STORAGE_DELETED_KEYS = "mds_deleted_post_keys_v1";
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
  const rawImg = raw.cover_url || raw.image || null;
  let image: string | null = null;
  if (rawImg) {
    const rawStr = String(rawImg).trim();
    // Resolves /images/ paths, Blogger full-res links, and canonical images safely
    const resolved = resolveMediaUrl(rawStr);
    image = toFullResolutionImageUrl(resolved);
  }
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

const STORAGE_CACHED_ALL_PAGES = "mds_all_pages_cache_v2";

/**
 * Deletion blocklist so deleted Blogger/Supabase/static posts never reappear.
 */
export function getDeletedPostKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_KEYS);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((k) => String(k || "").toLowerCase().trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function addDeletedPostKeys(keys: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDeletedPostKeys();
    keys.forEach((k) => {
      const clean = String(k || "").toLowerCase().trim();
      if (clean) current.add(clean);
    });
    localStorage.setItem(STORAGE_DELETED_KEYS, JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
}

export function removeDeletedPostKeys(keys: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDeletedPostKeys();
    let changed = false;
    keys.forEach((k) => {
      const clean = String(k || "").toLowerCase().trim();
      if (clean && current.delete(clean)) changed = true;
    });
    if (changed) {
      localStorage.setItem(STORAGE_DELETED_KEYS, JSON.stringify(Array.from(current)));
    }
  } catch {
    // ignore
  }
}

/**
 * Retrieves custom pages created or updated by Admin in local storage.
 */
export function getStoredAdminPages(): SyncedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_PAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => normalizePost(p, "admin"));
  } catch {
    return [];
  }
}

export function setStoredAdminPages(pages: SyncedPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_ADMIN_PAGES, JSON.stringify(pages));
  } catch {
    // ignore
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
 * Retrieves the cached unified page list from local storage for instant 0ms rendering.
 */
export function getCachedAllPages(): SyncedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CACHED_ALL_PAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => normalizePost(p));
  } catch {
    return [];
  }
}

/**
 * Caches the unified page list in local storage.
 */
export function setCachedAllPages(pages: SyncedPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CACHED_ALL_PAGES, JSON.stringify(pages));
  } catch {
    // ignore quota errors
  }
}

/**
 * Dynamically fetches live entries from Blogger (shinhaauthor.blogspot.com)
 * using JSONP without any CORS obstacles or proxy requirements.
 */
export function fetchLiveBloggerFeed(type: "posts" | "pages"): Promise<SyncedPost[]> {
  if (typeof window === "undefined") return Promise.resolve([]);

  return new Promise((resolve) => {
    const callbackName = `__blogger_cb_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const feedType = type === "posts" ? "posts" : "pages";
    const maxResults = type === "posts" ? "500" : "100";
    const script = document.createElement("script");
    script.src = `https://shinhaauthor.blogspot.com/feeds/${feedType}/default?alt=json-in-script&callback=${callbackName}&max-results=${maxResults}`;
    script.async = true;

    const cleanup = () => {
      try {
        if (script.parentNode) script.parentNode.removeChild(script);
        delete (window as any)[callbackName];
      } catch {
        // ignore cleanup error
      }
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve([]);
    }, 3500);

    (window as any)[callbackName] = (data: any) => {
      clearTimeout(timeout);
      cleanup();
      try {
        const entries = data?.feed?.entry || [];
        const isPage = type === "pages";
        const parsed: SyncedPost[] = entries.map((entry: any) => {
          const title = String(entry.title?.$t || "").trim() || (isPage ? "Untitled Page" : "Untitled Post");
          const published = String(entry.published?.$t || new Date().toISOString());
          const updated = String(entry.updated?.$t || published);
          const content = String(entry.content?.$t || entry.summary?.$t || "");
          const summary = String(entry.summary?.$t || "");

          let url = "";
          let slug = "";
          const links = entry.link || [];
          for (const l of links) {
            if (l.rel === "alternate") {
              url = l.href || "";
              if (isPage) {
                const match = url.match(/\/p\/([^/?#]+(?:\.html)?)/);
                if (match) slug = match[1].replace(".html", "");
              } else {
                const match = url.match(/blogspot\.com\/(\d{4}\/\d{2}\/[^/?#]+(?:\.html)?)/);
                if (match) slug = match[1].replace(".html", "").split("/").pop() || "";
              }
            }
          }

          if (!slug) {
            slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
          }

          let image: string | null = null;
          // Prefer link wrapping image if available (often has full original upload URL)
          if (content) {
            const linkMatch = content.match(/<a[^>]+href=["'](https?:\/\/[^"']*?(?:blogger\.googleusercontent\.com\/img\/b\/[^"']+|\.(?:jpg|jpeg|png|webp)))["']/i);
            if (linkMatch) {
              image = toFullResolutionImageUrl(linkMatch[1]);
            }
          }
          if (!image) {
            const mediaThumb = entry.media$thumbnail?.url;
            if (mediaThumb) {
              image = toFullResolutionImageUrl(String(mediaThumb));
            }
          }
          if (!image && content) {
            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) {
              image = toFullResolutionImageUrl(String(imgMatch[1]));
            }
          }

          const tags = (entry.category || []).map((c: any) => String(c.term || "")).filter(Boolean);

          return normalizePost({
            id: slug,
            title,
            slug,
            url,
            image,
            excerpt: summary || content.replace(/<[^>]+>/g, " ").slice(0, 220).trim(),
            content,
            published,
            updated,
            tags,
            status: "published",
            source: "blogger"
          }, "blogger");
        });

        resolve(parsed);
      } catch (err) {
        console.warn("[PostSync] Failed parsing Blogger feed:", err);
        resolve([]);
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve([]);
    };

    document.head.appendChild(script);
  });
}


/**
 * Broadcasts an update event across the current window and all other browser tabs.
 */
export function broadcastPostsUpdate(posts?: SyncedPost[], reset = false): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { posts, reset } }));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "POSTS_UPDATED", reset, timestamp: Date.now() });
    }
  } catch (e) {
    console.warn("[PostSync] Broadcast failed:", e);
  }
}

/**
 * Subscribes to live synchronization updates across tabs and local components.
 */
export function subscribeToPostsUpdates(
  onUpdate: (detail?: { posts?: SyncedPost[]; reset?: boolean }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent)?.detail as { posts?: SyncedPost[]; reset?: boolean } | undefined;
    onUpdate(detail);
  };
  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key === STORAGE_ADMIN_POSTS ||
      e.key === STORAGE_CACHED_ALL_POSTS ||
      e.key === STORAGE_ADMIN_PAGES ||
      e.key === STORAGE_CACHED_ALL_PAGES ||
      e.key === STORAGE_DELETED_KEYS
    ) {
      onUpdate({ reset: e.newValue === null });
    }
  };
  const handleChannelMessage = (event: MessageEvent) => {
    if (event.data?.type === "POSTS_UPDATED") {
      onUpdate({ reset: Boolean(event.data?.reset) });
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
 * 1. Persists immediately into Admin local synced store + public cache (0ms live UI reflection).
 * 2. Broadcasts cross-tab real-time event right away.
 * 3. Persists to Supabase public.posts table without stalling the UI.
 */
export async function saveAdminPost(
  postInput: Partial<SyncedPost> & { title: string; content: string }
): Promise<{ success: boolean; post: SyncedPost; syncedToCloud: boolean; message: string }> {
  const currentAdminPosts = getStoredAdminPosts();

  const title = postInput.title.trim();
  let slug = (postInput.slug || "").trim().toLowerCase();
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const existingMatch = currentAdminPosts.find(
    (p) => (postInput.id && p.id === postInput.id) || (slug && p.slug === slug)
  );
  const id = postInput.id || existingMatch?.id || "post-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);

  // Unblock slug & id in case this post had been deleted earlier
  removeDeletedPostKeys([id, slug]);

  const now = new Date().toISOString();
  const normalized: SyncedPost = normalizePost(
    {
      ...postInput,
      id,
      slug,
      title,
      published: postInput.published || existingMatch?.published || now,
      updated: now,
      source: "admin",
      synced_to_cloud: false,
    },
    "admin"
  );

  // 1. Immediately store in admin posts (newest first)
  const updatedAdminPosts = [
    normalized,
    ...currentAdminPosts.filter((p) => p.id !== id && p.slug !== slug),
  ];
  setStoredAdminPosts(updatedAdminPosts);

  // 2. Update public cached posts immediately: include ONLY if published, remove if draft
  const currentCached = getCachedAllPosts().filter(
    (p) => p.id !== id && p.slug !== slug && !getDeletedPostKeys().has((p.slug || p.id).toLowerCase())
  );
  const mergedCached =
    normalized.status === "published" ? [normalized, ...currentCached] : currentCached;
  setCachedAllPosts(mergedCached);

  // 3. Broadcast immediately to all open components & tabs
  broadcastPostsUpdate(mergedCached);

  // 4. Attempt Supabase persistence cleanly (best-effort with fast timeout fallback)
  let syncedToCloud = false;
  let message =
    normalized.status === "published"
      ? "Post published and live immediately across the site!"
      : "Post saved as Draft (hidden from public site).";

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
      const finalAdminPosts = getStoredAdminPosts().map((p) =>
        p.id === id ? { ...p, synced_to_cloud: true } : p
      );
      setStoredAdminPosts(finalAdminPosts);
      if (normalized.status === "published") {
        message = "Post published and synced live to database & site!";
      }
    }
  } catch (err: any) {
    console.warn("[PostSync] Cloud sync skipped, saved locally:", err?.message || err);
  }

  return {
    success: true,
    post: normalized,
    syncedToCloud,
    message,
  };
}

/**
 * Deletes a post from Admin local store, adds to deletion blocklist, and removes from Supabase.
 */
export async function deleteAdminPost(
  idOrSlug: string,
  extraSlug?: string
): Promise<{ success: boolean; syncedToCloud: boolean }> {
  const keys = [idOrSlug, extraSlug].filter((k): k is string => Boolean(k && k.trim()));
  const lowerKeys = new Set(keys.map((k) => k.toLowerCase().trim()));

  addDeletedPostKeys(keys);

  const current = getStoredAdminPosts();
  const filtered = current.filter(
    (p) => !lowerKeys.has((p.id || "").toLowerCase()) && !lowerKeys.has((p.slug || "").toLowerCase())
  );
  setStoredAdminPosts(filtered);

  const cached = getCachedAllPosts().filter(
    (p) => !lowerKeys.has((p.id || "").toLowerCase()) && !lowerKeys.has((p.slug || "").toLowerCase())
  );
  setCachedAllPosts(cached);
  broadcastPostsUpdate(cached);

  let syncedToCloud = false;
  try {
    const cleanId = idOrSlug.trim();
    const { error: err1 } = await supabase.from("posts").delete().eq("id", cleanId);
    const cleanSlug = (extraSlug || idOrSlug).trim();
    const { error: err2 } = await supabase.from("posts").delete().eq("slug", cleanSlug);
    if (!err1 || !err2) syncedToCloud = true;
  } catch {
    // ignore
  }

  return { success: true, syncedToCloud };
}

/**
 * Bulk updates post status (published/draft) for Manage Mode in Admin.
 */
export async function bulkUpdateAdminPosts(
  postsList: Array<Partial<SyncedPost> & { title: string; content: string }>,
  status: "published" | "draft"
): Promise<void> {
  const currentAdmin = getStoredAdminPosts();
  const now = new Date().toISOString();
  const deleted = getDeletedPostKeys();

  const updatedMap = new Map<string, SyncedPost>();
  currentAdmin.forEach((p) => updatedMap.set((p.slug || p.id).toLowerCase(), p));

  for (const raw of postsList) {
    const slug = (raw.slug || raw.id || "").toLowerCase().trim();
    if (!slug) continue;
    removeDeletedPostKeys([raw.id || "", slug]);
    const normalized = normalizePost(
      {
        ...raw,
        status,
        published: raw.published || now,
        updated: now,
        source: "admin",
      },
      "admin"
    );
    updatedMap.set(slug, normalized);
  }

  const nextAdmin = Array.from(updatedMap.values());
  setStoredAdminPosts(nextAdmin);

  const nextPublic = getCachedAllPosts().filter((p) => {
    const s = (p.slug || p.id).toLowerCase();
    if (deleted.has(s)) return false;
    const override = updatedMap.get(s);
    if (override && override.status === "draft") return false;
    return true;
  });

  for (const p of nextAdmin) {
    if (p.status === "published" && !nextPublic.some((c) => c.slug === p.slug || c.id === p.id)) {
      nextPublic.unshift(p);
    }
  }

  setCachedAllPosts(nextPublic);
  broadcastPostsUpdate(nextPublic);

  // Best-effort Supabase sync in parallel
  await Promise.allSettled(
    postsList.map((raw) => {
      const slug = (raw.slug || raw.id || "").toLowerCase().trim();
      if (!slug) return Promise.resolve();
      return supabase.from("posts").upsert(
        {
          id: raw.id || slug,
          slug,
          title: raw.title,
          excerpt: raw.excerpt || "",
          content: raw.content || "",
          cover_url: raw.image || null,
          tags: raw.tags || [],
          status,
          published_at: status === "published" ? raw.published || now : null,
          updated_at: now,
        },
        { onConflict: "slug" }
      );
    })
  );
}

/**
 * Bulk deletes posts for Manage Mode in Admin.
 */
export async function bulkDeleteAdminPosts(
  postsList: Array<{ id: string; slug: string }>
): Promise<void> {
  const keysToDelete: string[] = [];
  postsList.forEach((p) => {
    if (p.id) keysToDelete.push(p.id);
    if (p.slug) keysToDelete.push(p.slug);
  });
  addDeletedPostKeys(keysToDelete);
  const lowerSet = new Set(keysToDelete.map((k) => k.toLowerCase()));

  const filteredAdmin = getStoredAdminPosts().filter(
    (p) => !lowerSet.has((p.id || "").toLowerCase()) && !lowerSet.has((p.slug || "").toLowerCase())
  );
  setStoredAdminPosts(filteredAdmin);

  const filteredCache = getCachedAllPosts().filter(
    (p) => !lowerSet.has((p.id || "").toLowerCase()) && !lowerSet.has((p.slug || "").toLowerCase())
  );
  setCachedAllPosts(filteredCache);
  broadcastPostsUpdate(filteredCache);

  await Promise.allSettled(
    postsList.map((p) =>
      Promise.all([
        supabase.from("posts").delete().eq("id", p.id),
        supabase.from("posts").delete().eq("slug", p.slug),
      ])
    )
  );
}

/**
 * Saves or updates a Page from Admin (persists locally immediately + syncs to Supabase).
 */
export async function saveAdminPage(pageInput: {
  id?: string;
  slug: string;
  title: string;
  content: string;
  cover_url?: string | null;
  images?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  status: string;
}): Promise<{ success: boolean; page: SyncedPost; syncedToCloud: boolean; message: string }> {
  const current = getStoredAdminPages();
  const slug = pageInput.slug.trim().toLowerCase();
  const id = pageInput.id || "page-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  removeDeletedPostKeys([id, slug]);

  const normalized = normalizePost(
    {
      ...pageInput,
      id,
      slug,
      image: pageInput.cover_url || null,
      status: pageInput.status === "draft" ? "draft" : "published",
      published: now,
      updated: now,
      source: "admin",
    },
    "admin"
  );

  const nextAdmin = [normalized, ...current.filter((p) => p.id !== id && p.slug !== slug)];
  setStoredAdminPages(nextAdmin);

  const currentCached = getCachedAllPages().filter((p) => p.id !== id && p.slug !== slug);
  const nextCached = normalized.status === "published" ? [normalized, ...currentCached] : currentCached;
  setCachedAllPages(nextCached);
  broadcastPostsUpdate();

  let syncedToCloud = false;
  let message = "Page saved and published live across the site!";

  try {
    const payload = {
      slug,
      title: pageInput.title.trim(),
      content: pageInput.content || "",
      cover_url: pageInput.cover_url || null,
      images: pageInput.images || [],
      seo_title: pageInput.seo_title || null,
      seo_description: pageInput.seo_description || null,
      status: pageInput.status,
    };

    const { error } = pageInput.id && !pageInput.id.startsWith("page-")
      ? await supabase.from("pages").update(payload).eq("id", pageInput.id)
      : await supabase.from("pages").upsert(payload, { onConflict: "slug" });

    if (!error) {
      syncedToCloud = true;
      message = "Page saved to database and live on site!";
    }
  } catch {
    // local storage persists cleanly
  }

  return { success: true, page: normalized, syncedToCloud, message };
}

export async function deleteAdminPage(idOrSlug: string, extraSlug?: string): Promise<void> {
  const keys = [idOrSlug, extraSlug].filter((k): k is string => Boolean(k && k.trim()));
  addDeletedPostKeys(keys);
  const lower = new Set(keys.map((k) => k.toLowerCase()));

  setStoredAdminPages(
    getStoredAdminPages().filter(
      (p) => !lower.has((p.id || "").toLowerCase()) && !lower.has((p.slug || "").toLowerCase())
    )
  );
  setCachedAllPages(
    getCachedAllPages().filter(
      (p) => !lower.has((p.id || "").toLowerCase()) && !lower.has((p.slug || "").toLowerCase())
    )
  );
  broadcastPostsUpdate();

  try {
    await supabase.from("pages").delete().eq("id", idOrSlug);
    if (extraSlug) await supabase.from("pages").delete().eq("slug", extraSlug);
  } catch {
    // ignore
  }
}

/**
 * Completely purges all local storage caches, sync registries,
 * and resets all posts & pages back to their clean source data.
 */
export async function clearAllSyncData(): Promise<{ success: boolean; clearedCount: number }> {
  const keysToPurge = [
    "mds_domain_image_mappings",
    "mds_admin_posts_v2",
    "mds_admin_pages_v1",
    "mds_deleted_post_keys_v1",
    "mds_all_posts_cache_v2",
    "mds_all_pages_cache_v2",
    "shinha_media_items",
    "shinha_media_registry",
    "md_shinha_uploaded_media",
    "mds_photos_last_synced",
    "mds_admin_posts",
    "mds_all_posts_cache",
  ];

  let clearedCount = 0;
  if (typeof window !== "undefined") {
    keysToPurge.forEach((k) => {
      try {
        if (localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
          clearedCount++;
        }
        sessionStorage.removeItem(k);
      } catch (_e) {
        // ignore
      }
    });
  }

  // Immediately invalidate in-memory caches across hooks/tabs
  broadcastPostsUpdate(undefined, true);

  // Clear server sync registry & caches if server endpoint is available
  try {
    await fetch("/api/clear-all", { method: "POST" });
  } catch (_e) {
    // non-blocking
  }

  let cleanPostsLoaded: SyncedPost[] | undefined;

  // Refetch static clean posts
  try {
    const res = await fetch("/posts-sync.json?t=" + Date.now());
    if (res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts) && posts.length > 0) {
        cleanPostsLoaded = posts.map((p: any) => normalizePost(p, "blogger"));
        setCachedAllPosts(cleanPostsLoaded);
      }
    }
  } catch (_e) {
    // non-blocking
  }

  // Refetch static clean pages
  try {
    const res = await fetch("/pages-sync.json?t=" + Date.now());
    if (res.ok) {
      const pages = await res.json();
      if (Array.isArray(pages) && pages.length > 0) {
        const cleanPages = pages.map((p: any) => normalizePost(p, "blogger"));
        setCachedAllPages(cleanPages);
      }
    }
  } catch (_e) {
    // non-blocking
  }

  broadcastPostsUpdate(cleanPostsLoaded, true);

  return { success: true, clearedCount };
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
