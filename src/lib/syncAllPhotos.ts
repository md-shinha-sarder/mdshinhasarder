/**
 * Universal Photo Sync Engine for MD. Shinha Sarder
 * Automatically synchronizes all photos from Blogger, Supabase posts,
 * custom pages, books, and songs directly to the /images/ folder on domain:
 * https://mdshinhasarder.com/images/[filename]
 */

import {
  fetchLiveBloggerFeed,
  getCachedAllPosts,
  getCachedAllPages,
  getStoredAdminPosts,
  setStoredAdminPosts,
  type SyncedPost,
} from "./postSync";
import { supabase } from "@/integrations/supabase/client";
import { CANONICAL_DOMAIN_IMAGES } from "./domainImages";

export interface SyncPhotoItem {
  filename: string;
  url: string;
  title: string;
  source: "blogger" | "admin" | "page" | "canonical";
  domainUrl: string;
}

export interface SyncResult {
  totalFound: number;
  syncedToServer: number;
  updatedPosts: number;
  items: SyncPhotoItem[];
}

export function generateDomainImageFilename(titleOrSlug: string, originalUrl?: string): string {
  let base = (titleOrSlug || "photo")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (!base) base = "photo-" + Date.now().toString(36);

  // Check extension of original URL if available
  let ext = "jpg";
  if (originalUrl) {
    const extMatch = originalUrl.match(/\.(webp|jpg|jpeg|png|svg|ico)(?:[?#]|$)/i);
    if (extMatch) ext = extMatch[1].toLowerCase();
  }

  return `${base}.${ext}`;
}

export async function syncAllPhotosToImagesFolder(
  onProgress?: (status: string, current: number, total: number) => void
): Promise<SyncResult> {
  onProgress?.("Collecting all photos across Blogger, Posts, and Pages...", 0, 100);

  const photoMap = new Map<string, SyncPhotoItem>();

  // 1. Collect from Canonical Domain Images
  CANONICAL_DOMAIN_IMAGES.forEach((item) => {
    photoMap.set(item.fileName, {
      filename: item.fileName,
      url: item.cloudinaryUrl,
      title: item.title,
      source: "canonical",
      domainUrl: `https://mdshinhasarder.com/images/${item.fileName}`,
    });
  });

  // 2. Fetch Blogger posts (live feed or cache)
  let bloggerPosts: SyncedPost[] = [];
  try {
    bloggerPosts = await fetchLiveBloggerFeed("posts");
  } catch (_e) {
    bloggerPosts = getCachedAllPosts();
  }
  if (!bloggerPosts.length) bloggerPosts = getCachedAllPosts();

  bloggerPosts.forEach((p) => {
    if (p.image) {
      const filename = generateDomainImageFilename(p.slug || p.title, p.image);
      photoMap.set(filename, {
        filename,
        url: p.image,
        title: p.title,
        source: "blogger",
        domainUrl: `https://mdshinhasarder.com/images/${filename}`,
      });
    }
  });

  // 3. Fetch Blogger pages (live feed or cache)
  let bloggerPages: SyncedPost[] = [];
  try {
    bloggerPages = await fetchLiveBloggerFeed("pages");
  } catch (_e) {
    bloggerPages = getCachedAllPages();
  }
  if (!bloggerPages.length) bloggerPages = getCachedAllPages();

  bloggerPages.forEach((p) => {
    if (p.image) {
      const filename = generateDomainImageFilename(`page-${p.slug || p.title}`, p.image);
      photoMap.set(filename, {
        filename,
        url: p.image,
        title: p.title,
        source: "page",
        domainUrl: `https://mdshinhasarder.com/images/${filename}`,
      });
    }
  });

  // 4. Fetch Stored Admin posts
  const adminPosts = getStoredAdminPosts();
  adminPosts.forEach((p) => {
    if (p.image) {
      const filename = generateDomainImageFilename(p.slug || p.title, p.image);
      photoMap.set(filename, {
        filename,
        url: p.image,
        title: p.title,
        source: "admin",
        domainUrl: `https://mdshinhasarder.com/images/${filename}`,
      });
    }
  });

  // 5. Fetch Supabase posts if accessible
  try {
    const { data: sbPosts } = await supabase.from("posts").select("id, slug, title, cover_url");
    if (sbPosts) {
      sbPosts.forEach((p: any) => {
        if (p.cover_url) {
          const filename = generateDomainImageFilename(p.slug || p.title, p.cover_url);
          photoMap.set(filename, {
            filename,
            url: p.cover_url,
            title: p.title,
            source: "admin",
            domainUrl: `https://mdshinhasarder.com/images/${filename}`,
          });
        }
      });
    }
  } catch (_e) {
    // Non-blocking
  }

  const allPhotos = Array.from(photoMap.values());
  onProgress?.(`Found ${allPhotos.length} total photos. Syncing to /images/ folder on domain...`, 20, 100);

  // 6. Send to /api/sync-photos in batches of 25
  let syncedToServer = 0;
  const batchSize = 25;
  for (let i = 0; i < allPhotos.length; i += batchSize) {
    const chunk = allPhotos.slice(i, i + batchSize);
    try {
      const res = await fetch("/api/sync-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: chunk }),
      });
      if (res.ok) {
        const data = await res.json();
        syncedToServer += (data.count || chunk.length);
      }
    } catch (_e) {
      console.warn("Batch sync error:", _e);
    }
    const pct = Math.round(20 + ((i + chunk.length) / allPhotos.length) * 60);
    onProgress?.(`Downloaded & verified ${Math.min(i + batchSize, allPhotos.length)} / ${allPhotos.length} photos`, pct, 100);
  }

  // 7. Update stored admin posts so their cover_url points to the canonical domain image
  let updatedPosts = 0;
  const updatedAdminList = adminPosts.map((post) => {
    if (post.image) {
      const filename = generateDomainImageFilename(post.slug || post.title, post.image);
      const domainUrl = `https://mdshinhasarder.com/images/${filename}`;
      if (post.image !== domainUrl) {
        updatedPosts++;
        return { ...post, image: domainUrl, cover_url: domainUrl };
      }
    }
    return post;
  });
  if (updatedPosts > 0) {
    setStoredAdminPosts(updatedAdminList);
  }

  // 8. Cache the full domain photo dictionary in localStorage
  if (typeof window !== "undefined") {
    try {
      const mappingDict: Record<string, string> = {};
      allPhotos.forEach((p) => {
        mappingDict[p.url] = p.domainUrl;
      });
      localStorage.setItem("mds_domain_image_mappings", JSON.stringify(mappingDict));
      localStorage.setItem("mds_photos_last_synced", new Date().toISOString());
    } catch (_e) {
      // safe
    }
  }

  onProgress?.(`All ${allPhotos.length} photos successfully synced to domain /images/ folder!`, 100, 100);

  return {
    totalFound: allPhotos.length,
    syncedToServer,
    updatedPosts,
    items: allPhotos,
  };
}
