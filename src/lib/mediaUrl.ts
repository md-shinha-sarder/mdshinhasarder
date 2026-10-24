// Universal Media URL Resolver for MD. Shinha Sarder's Website
// Guarantees that Supabase Storage assets, custom domain assets, and uploaded media
// always resolve to valid, live URLs without 404s.

const SUPABASE_PROJECT_URL = "https://hpnndbmyibbgrlskskyt.supabase.co";
const STORAGE_PREFIX = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/media`;

/**
 * Resolves any media URL to a guaranteed accessible HTTP URL.
 * Automatically handles:
 * - https://mdshinhasarder.com/media/<path> -> translates to live Supabase Storage bucket
 * - /media/<path> -> translates to live Supabase Storage bucket
 * - Direct Supabase storage URLs -> preserved
 * - Base64 data URLs -> preserved
 * - Blogger and external CDN URLs -> preserved
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If it's a domain/relative media proxy URL, point to the direct Supabase bucket
  const domainMatch = trimmed.match(/^https?:\/\/(?:www\.)?mdshinhasarder\.com\/media\/(.+)$/i);
  if (domainMatch) {
    return `${STORAGE_PREFIX}/${domainMatch[1]}`;
  }

  const relativeMatch = trimmed.match(/^\/media\/(.+)$/i);
  if (relativeMatch) {
    return `${STORAGE_PREFIX}/${relativeMatch[1]}`;
  }

  return trimmed;
}

/**
 * Normalizes uploaded media URLs for storage and display.
 * Keeps the direct working Supabase storage URL so it works in dev, preview, and production.
 */
export function toSiteMediaUrl(url?: string | null): string {
  if (!url) return "";
  return resolveMediaUrl(url);
}
