// Universal Media URL Resolver for MD. Shinha Sarder's Website
// Guarantees that ONLY the exact uploaded/assigned photo displays without substituting unrelated photos.

import { CLOUDINARY_CONFIG } from "./cloudinary";

const SUPABASE_PROJECT_URL = "https://hpnndbmyibbgrlskskyt.supabase.co";
const STORAGE_PREFIX = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/media`;

function findUploadedRegistryEntry(slugOrUrl: string): any | null {
  if (typeof window === "undefined" || !slugOrUrl) return null;
  const clean = slugOrUrl.trim();
  const baseName = clean.split("/").pop()?.split("?")[0] || clean;
  const baseNoExt = baseName.replace(/\.[^/.]+$/, "");

  try {
    const rawItems = localStorage.getItem("shinha_media_items");
    if (rawItems) {
      const items = JSON.parse(rawItems);
      if (Array.isArray(items)) {
        const hit = items.find(
          (x: any) =>
            x.url === clean ||
            x.localUrl === clean ||
            x.path === baseName ||
            x.path === baseNoExt ||
            (x.url && x.url.endsWith(`/${baseName}`))
        );
        if (hit) return hit;
      }
    }

    const rawReg = localStorage.getItem("shinha_media_registry");
    if (rawReg) {
      const reg = JSON.parse(rawReg);
      if (Array.isArray(reg)) {
        const hit = reg.find(
          (x: any) =>
            x.domainUrl === clean ||
            x.slug === baseName ||
            x.slug === baseNoExt ||
            x.publicId === baseNoExt ||
            x.name === baseName
        );
        if (hit) return hit;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

/**
 * Resolves any media URL to the exact uploaded/assigned image URL.
 * Never substitutes unrelated fallback photos.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Preserve base64 data URLs and blob URLs directly
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // If already full Cloudinary URL
  if (trimmed.includes("res.cloudinary.com")) {
    return trimmed;
  }

  // Handle https://mdshinhasarder.com/images/[filename] or /images/[filename]
  const domainImagesMatch = trimmed.match(/^https?:\/\/(?:www\.)?mdshinhasarder\.com\/images\/(.+)$/i);
  const localImagesMatch = trimmed.match(/^\/images\/(.+)$/i);
  const imageFile = (domainImagesMatch && domainImagesMatch[1]) || (localImagesMatch && localImagesMatch[1]);

  if (imageFile) {
    // Check if this uploaded photo has an instant local preview / Cloudinary URL stored in browser cache
    const uploaded = findUploadedRegistryEntry(imageFile);
    if (uploaded) {
      // On static/remote hosts where /api/save-image can't write to server disk, prefer Cloudinary or previewDataUrl of THAT exact uploaded file
      const isLocalDev =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      if (!isLocalDev) {
        if (uploaded.cloudinary_url && uploaded.cloudinary_url.includes("res.cloudinary.com")) {
          return uploaded.cloudinary_url;
        }
        if (uploaded.cloudinaryUrl && uploaded.cloudinaryUrl.includes("res.cloudinary.com")) {
          return uploaded.cloudinaryUrl;
        }
        if (uploaded.previewDataUrl) {
          return uploaded.previewDataUrl;
        }
      }
    }
    return `/images/${imageFile}`;
  }

  // Handle raw filenames like "profile.webp", "site-logo.png", "hero-portrait.jpg"
  if (/^[a-zA-Z0-9_.-]+\.(?:webp|jpg|jpeg|png|svg|ico|gif)$/i.test(trimmed)) {
    return `/images/${trimmed}`;
  }

  // Check if it's a domain/relative media URL
  const domainMatch = trimmed.match(/^https?:\/\/(?:www\.)?mdshinhasarder\.com\/media\/(.+)$/i);
  const relativeMatch = trimmed.match(/^\/media\/(.+)$/i);
  const cldMatch =
    trimmed.match(/^\/cld\/(.+)$/i) ||
    trimmed.match(/^https?:\/\/(?:www\.)?mdshinhasarder\.com\/cld\/(.+)$/i);

  const rawSlug =
    (domainMatch && domainMatch[1]) ||
    (relativeMatch && relativeMatch[1]) ||
    (cldMatch && cldMatch[1]);

  if (rawSlug) {
    const slug = decodeURIComponent(rawSlug).trim();
    const found = findUploadedRegistryEntry(slug);
    if (found) {
      if (found.cloudinaryUrl) return found.cloudinaryUrl;
      if (found.cloudinary_url) return found.cloudinary_url;
      if (found.previewDataUrl) return found.previewDataUrl;
    }

    // Supabase storage path
    if (slug.includes("/") && !slug.startsWith("cld-")) {
      return `${STORAGE_PREFIX}/${slug}`;
    }

    // Direct Cloudinary resolution
    const publicId = slug.replace(/\.[^/.]+$/, "");
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/f_auto,q_auto/${slug.includes(".") ? slug : publicId}`;
  }

  return trimmed;
}

/**
 * Returns a backup URL belonging STRICTLY to the same uploaded photo
 * (its previewDataUrl or Cloudinary CDN URL) if /images/<file> fails to load.
 * Never returns another person's or unrelated photo.
 */
export function getUploadedPhotoBackupUrl(url?: string | null): string {
  if (!url) return "";
  const entry = findUploadedRegistryEntry(url);
  if (!entry) return "";
  return entry.previewDataUrl || entry.cloudinary_url || entry.cloudinaryUrl || "";
}

/**
 * Safe image onError handler that checks ONLY this photo's own uploaded backup
 * and hides the broken element if none exists (never swaps to /profile.webp or unrelated photos).
 */
export function handleUploadedImageError(
  img: HTMLImageElement,
  originalUrl?: string | null,
  onUnavailable?: () => void
) {
  if (img.dataset.backupTried === "1") {
    img.style.display = "none";
    onUnavailable?.();
    return;
  }
  img.dataset.backupTried = "1";
  const backup = getUploadedPhotoBackupUrl(originalUrl || img.getAttribute("src"));
  if (backup && backup !== img.src) {
    img.src = backup;
  } else {
    img.style.display = "none";
    onUnavailable?.();
  }
}

/**
 * Normalizes uploaded media URLs for storage and display.
 */
export function toSiteMediaUrl(url?: string | null): string {
  if (!url) return "";
  return resolveMediaUrl(url);
}

/**
 * Converts any Cloudinary URL or asset path into the official website domain link.
 */
export function toWebsiteLink(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.includes("res.cloudinary.com")) {
    const parts = trimmed.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) {
      const publicId = last.replace(/\.[^/.]+$/, "");
      return `https://mdshinhasarder.com/media/${publicId}`;
    }
  }
  if (trimmed.startsWith("/")) {
    return `https://mdshinhasarder.com${trimmed}`;
  }
  return trimmed;
}
