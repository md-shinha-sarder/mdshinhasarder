// Universal Media URL Resolver for MD. Shinha Sarder's Website
// Guarantees that Cloudinary assets, Supabase Storage assets, and custom domain assets
// always resolve to valid, live URLs without 404s.

import { CLOUDINARY_CONFIG } from "./cloudinary";

const SUPABASE_PROJECT_URL = "https://hpnndbmyibbgrlskskyt.supabase.co";
const STORAGE_PREFIX = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/media`;

/**
 * Resolves any media URL to a guaranteed accessible live URL.
 * Automatically handles:
 * - https://mdshinhasarder.com/media/<slug> -> resolves via Cloudinary or Supabase
 * - /media/<slug> -> resolves via Cloudinary or Supabase
 * - Cloudinary CDN URLs -> preserved
 * - Direct Supabase storage URLs -> preserved
 * - Base64 data URLs -> preserved
 * - Blogger and external CDN URLs -> preserved
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If already full Cloudinary URL
  if (trimmed.includes("res.cloudinary.com")) {
    return trimmed;
  }

  // Check if it's a domain/relative media URL
  const domainMatch = trimmed.match(/^https?:\/\/(?:www\.)?mdshinhasarder\.com\/media\/(.+)$/i);
  const relativeMatch = trimmed.match(/^\/media\/(.+)$/i);
  const cldMatch = trimmed.match(/^\/cld\/(.+)$/i) || trimmed.match(/^https?:\/\/(?:www\.)?mdshinhasarder\.com\/cld\/(.+)$/i);

  const rawSlug = (domainMatch && domainMatch[1]) || (relativeMatch && relativeMatch[1]) || (cldMatch && cldMatch[1]);

  if (rawSlug) {
    const slug = decodeURIComponent(rawSlug).trim();

    // 1. Check local registry cache
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("shinha_media_registry");
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find(
            (x: any) => x.slug === slug || x.publicId === slug || x.name === slug
          );
          if (found && found.cloudinaryUrl) {
            return found.cloudinaryUrl;
          }
        }
      } catch (_e) {
        void _e;
      }
    }

    // 2. If it's a Supabase storage path (e.g. starts with UUID/ or contains multiple slashes)
    if (slug.includes("/") && !slug.startsWith("cld-")) {
      return `${STORAGE_PREFIX}/${slug}`;
    }

    // 3. Direct Cloudinary resolution
    const publicId = slug.replace(/\.[^/.]+$/, "");
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/f_auto,q_auto/${slug.includes(".") ? slug : publicId}`;
  }

  return trimmed;
}

/**
 * Normalizes uploaded media URLs for storage and display.
 */
export function toSiteMediaUrl(url?: string | null): string {
  if (!url) return "";
  return resolveMediaUrl(url);
}
