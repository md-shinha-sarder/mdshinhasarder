/**
 * Cloudinary Integration for MD. Shinha Sarder
 * Cloud Name: borle8go
 * API Key: 936238538312159
 * Canonical Domain: https://mdshinhasarder.com
 */

export const CLOUDINARY_CONFIG = {
  cloudName:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME) ||
    "borle8go",
  apiKey:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_API_KEY) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CLOUDINARY_API_KEY) ||
    "936238538312159",
  canonicalDomain: "https://mdshinhasarder.com",
};

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "scale" | "fit" | "limit" | "thumb" | "auto";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  gravity?: "auto" | "face" | "center";
}

/**
 * Builds standard Cloudinary transformation string
 */
export function buildTransformString(options?: CloudinaryTransformOptions): string {
  const parts: string[] = [];

  const format = options?.format || "auto";
  const quality = options?.quality || "auto";
  parts.push(`f_${format}`, `q_${quality}`);

  if (options?.crop) {
    parts.push(`c_${options.crop}`);
  }
  if (options?.width) {
    parts.push(`w_${options.width}`);
  }
  if (options?.height) {
    parts.push(`h_${options.height}`);
  }
  if (options?.gravity) {
    parts.push(`g_${options.gravity}`);
  }

  return parts.join(",");
}

/**
 * Returns a direct Cloudinary delivery URL for an uploaded public ID
 * Example: https://res.cloudinary.com/borle8go/image/upload/f_auto,q_auto/cld-sample-5
 */
export function getCloudinaryUploadUrl(
  publicId: string,
  options?: CloudinaryTransformOptions
): string {
  const cleanId = publicId.replace(/^\/+/, "");
  const transforms = buildTransformString(options);
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transforms}/${cleanId}`;
}

/**
 * Returns an auto-optimizing Cloudinary fetch delivery URL for any remote or domain image
 * Example: https://res.cloudinary.com/borle8go/image/fetch/f_auto,q_auto/https://mdshinhasarder.com/images/...
 */
export function getCloudinaryFetchUrl(
  sourceUrl: string,
  options?: CloudinaryTransformOptions
): string {
  if (!sourceUrl) return "";
  let absoluteUrl = sourceUrl.trim();

  // If relative path like /images/profile.webp, expand to canonical domain
  if (absoluteUrl.startsWith("/")) {
    absoluteUrl = `${CLOUDINARY_CONFIG.canonicalDomain}${absoluteUrl}`;
  }

  // If already a Cloudinary fetch URL, return it
  if (absoluteUrl.includes(`res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/fetch/`)) {
    return absoluteUrl;
  }

  const transforms = buildTransformString(options);
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/fetch/${transforms}/${encodeURI(absoluteUrl)}`;
}

/**
 * Transforms any image to an optimized Cloudinary URL while preserving canonical SEO domain mapping
 */
export function toCloudinaryImageUrl(
  src?: string | null,
  options?: CloudinaryTransformOptions
): string {
  if (!src) return "";
  const trimmed = src.trim();

  // If public ID (doesn't start with http or /)
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    return getCloudinaryUploadUrl(trimmed, options);
  }

  // If it's already an upload URL on our cloud
  if (trimmed.includes(`res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/`)) {
    return trimmed;
  }

  // For domain URLs or remote images, use Cloudinary fetch proxy
  return getCloudinaryFetchUrl(trimmed, options);
}

/**
 * Pre-defined canonical Cloudinary mappings for MD. Shinha Sarder website assets
 */
export const CANONICAL_CLOUDINARY_ASSETS = {
  profile: {
    domainUrl: "https://mdshinhasarder.com/profile.webp",
    localPath: "/images/md-shinha-sarder-official-portrait.profile.webp",
    publicId: "md-shinha-sarder-official-portrait",
    title: "MD. Shinha Sarder - Official Portrait",
  },
  heroPortrait: {
    domainUrl: "https://mdshinhasarder.com/hero-portrait.jpg",
    localPath: "/images/hero-portrait.jpg",
    publicId: "md-shinha-sarder-author-researcher",
    title: "MD. Shinha Sarder - Author & Researcher",
  },
  heroBg: {
    domainUrl: "https://mdshinhasarder.com/hero-bg.jpg",
    localPath: "/images/hero-bg.jpg",
    publicId: "md-shinha-sarder-creative-tech-studio",
    title: "Creative Tech Studio Background",
  },
  favicon: {
    domainUrl: "https://mdshinhasarder.com/favicon.webp",
    localPath: "/images/favicon.webp",
    publicId: "md-shinha-sarder-brand-emblem",
    title: "Brand Emblem Favicon",
  },
  sample5: {
    domainUrl: "https://res.cloudinary.com/borle8go/image/upload/cld-sample-5",
    localPath: "/images/md-shinha-sarder-official-portrait.profile.webp",
    publicId: "cld-sample-5",
    title: "Cloudinary Sample Asset 5",
  },
};
