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
  apiSecret:
    (typeof process !== "undefined" && process.env?.CLOUDINARY_API_SECRET) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CLOUDINARY_API_SECRET) ||
    "IgcHwgXierQw1vrKdZvLXaRjUcY",
  canonicalDomain: "https://mdshinhasarder.com",
};

export interface GeneratedImageLinks {
  fileName: string;
  websiteUrl: string;
  domainUrl: string;
  domainMediaUrl: string;
  localhostUrl: string;
  localPath: string;
  cloudinaryCdnUrl: string;
  cloudinaryAutoUrl: string;
  cloudinaryFetchUrl: string;
  cldUrl: string;
  markdownTag: string;
  htmlTag: string;
}

export function registerMediaInRegistry(item: {
  slug: string;
  publicId: string;
  cloudinaryUrl: string;
  domainUrl?: string;
  name?: string;
}) {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("shinha_media_registry");
      const list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((x: any) => x.slug === item.slug || x.publicId === item.publicId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.unshift(item);
      }
      localStorage.setItem("shinha_media_registry", JSON.stringify(list.slice(0, 100)));
    } catch (_err) {
      void _err;
    }

    // Also register on local server if active
    try {
      fetch("/api/register-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).catch(() => {});
    } catch (_err) {
      void _err;
    }
  }
}

export function extractPublicIdOrName(input: string): { publicId: string; fileName: string } {
  const cleaned = (input || "").trim();
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    try {
      const u = new URL(cleaned);
      const parts = u.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1] || "image";
      if (last.includes(".")) {
        const publicId = last.replace(/\.[^/.]+$/, "");
        return { publicId, fileName: last };
      }
      return { publicId: last, fileName: `${last}.jpg` };
    } catch (_e) {
      void _e;
    }
  }
  const publicId = cleaned.replace(/\.[^/.]+$/, "");
  const fileName = cleaned.includes(".") ? cleaned : `${cleaned}.jpg`;
  return { publicId, fileName };
}

export function generateAllImageLinks(nameOrUrl: string, title?: string): GeneratedImageLinks {
  const { publicId, fileName } = extractPublicIdOrName(nameOrUrl);
  const altTitle = title || publicId.replace(/[-_]/g, " ");

  // Official Website Link on the mdshinhasarder.com domain
  const websiteMediaUrl = `https://mdshinhasarder.com/media/${publicId}`;
  const domainUrl = `https://mdshinhasarder.com/images/${fileName}`;
  const cldUrl = `https://mdshinhasarder.com/cld/${publicId}`;

  const currentOrigin = typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost:3000";
  const localhostUrl = `${currentOrigin}/media/${publicId}`;

  const localPath = `/images/${fileName}`;
  const cloudinaryCdnUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`;
  const cloudinaryAutoUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/f_auto,q_auto/${publicId}`;
  const cloudinaryFetchUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/fetch/f_auto,q_auto/${domainUrl}`;

  // Automatically record both publicId and fileName in the media registry
  registerMediaInRegistry({
    slug: publicId,
    publicId,
    cloudinaryUrl: cloudinaryAutoUrl,
    domainUrl: websiteMediaUrl,
    name: altTitle,
  });
  if (fileName !== publicId) {
    registerMediaInRegistry({
      slug: fileName,
      publicId,
      cloudinaryUrl: cloudinaryAutoUrl,
      domainUrl: websiteMediaUrl,
      name: altTitle,
    });
  }

  return {
    fileName,
    websiteUrl: websiteMediaUrl,
    domainUrl,
    domainMediaUrl: websiteMediaUrl,
    localhostUrl,
    localPath,
    cloudinaryCdnUrl,
    cloudinaryAutoUrl,
    cloudinaryFetchUrl,
    cldUrl,
    markdownTag: `![${altTitle}](${websiteMediaUrl})`,
    htmlTag: `<img src="${websiteMediaUrl}" alt="${altTitle}" loading="lazy" />`,
  };
}

async function computeSha1(str: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest("SHA-1", enc.encode(str));
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return "";
}

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
  url: string;
  secure_url: string;
  domain_url: string;
  media_redirect_url: string;
  localhost_url: string;
  cdn_optimized_url: string;
  fetch_url: string;
}

export async function uploadImageToCloudinary(
  file: File | Blob,
  customPublicId?: string,
  folder?: string
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = { timestamp: String(timestamp) };
  if (folder) params.folder = folder;

  let publicIdToUse = customPublicId;
  if (!publicIdToUse && (file as File).name) {
    const rawName = (file as File).name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    if (rawName && rawName.length > 2) {
      publicIdToUse = rawName;
    }
  }
  if (publicIdToUse) params.public_id = publicIdToUse;

  const sortedKeys = Object.keys(params).sort();
  const strToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join("&") + CLOUDINARY_CONFIG.apiSecret;
  const signature = await computeSha1(strToSign);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_CONFIG.apiKey);
  formData.append("timestamp", String(timestamp));
  if (folder) formData.append("folder", folder);
  if (publicIdToUse) formData.append("public_id", publicIdToUse);
  if (signature) formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const returnedPublicId = data.public_id || "image";
  const cleanFilename = `${returnedPublicId.split("/").pop()}.${data.format || "webp"}`;

  // Official Website Link on the mdshinhasarder.com domain
  const media_redirect_url = `https://mdshinhasarder.com/media/${returnedPublicId}`;
  const domain_url = media_redirect_url;

  const currentOrigin = typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost:3000";
  const localhost_url = `${currentOrigin}/media/${returnedPublicId}`;
  const cdn_optimized_url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/f_auto,q_auto/${returnedPublicId}`;
  const fetch_url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/fetch/f_auto,q_auto/${media_redirect_url}`;

  // Register uploaded asset so domain redirect works seamlessly across server and client
  registerMediaInRegistry({
    slug: returnedPublicId,
    publicId: returnedPublicId,
    cloudinaryUrl: cdn_optimized_url,
    domainUrl: media_redirect_url,
    name: cleanFilename,
  });
  registerMediaInRegistry({
    slug: cleanFilename,
    publicId: returnedPublicId,
    cloudinaryUrl: cdn_optimized_url,
    domainUrl: media_redirect_url,
    name: cleanFilename,
  });

  return {
    ...data,
    domain_url,
    media_redirect_url,
    localhost_url,
    cdn_optimized_url,
    fetch_url,
  };
}

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
