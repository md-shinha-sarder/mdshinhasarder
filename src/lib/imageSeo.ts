// Image SEO helpers: descriptive alt text, canonical domain URLs, and proper sizing/loading attributes.

export const SITE_DOMAIN = "https://mdshinhasarder.com";
const BRAND = "MD. Shinha Sarder";

export function slugify(text?: string | null): string {
  if (!text) return "image";
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/**
 * Transforms any image URL to the canonical SEO format on domain https://mdshinhasarder.com/images/...
 * Pattern: https://mdshinhasarder.com/images/{captionSlug}.{imageFileName}.{ext}
 */
export function toDomainImageUrl(src?: string | null, caption?: string | null): string {
  if (!src) return `${SITE_DOMAIN}/images/md-shinha-sarder-official-portrait.profile.webp`;

  const trimmed = src.trim();

  // If already full canonical domain URL
  if (trimmed.startsWith(`${SITE_DOMAIN}/images/`)) {
    return trimmed;
  }

  // Detect extension
  const extMatch = trimmed.match(/\.(webp|jpg|jpeg|png|svg|ico)(?:[?#]|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";

  // Extract base filename from path
  const lastSegment = trimmed.split("/").pop()?.split("?")[0] || "image";
  const rawBase = lastSegment.replace(/\.[^/.]+$/, "");
  const cleanBase = slugify(rawBase) || "asset";

  if (caption && caption.trim()) {
    const captionSlug = slugify(caption);
    return `${SITE_DOMAIN}/images/${captionSlug}.${cleanBase}.${ext}`;
  }

  return `${SITE_DOMAIN}/images/${cleanBase}.${ext}`;
}

export function buildAlt(title?: string | null, extra?: string | string[] | null): string {
  const t = (title || "").trim();
  const tags = Array.isArray(extra) ? extra.filter(Boolean).join(", ") : (extra || "");
  const parts = [t, tags, BRAND].filter(Boolean);
  // De-duplicate words while preserving order; cap length for SEO.
  const seen = new Set<string>();
  const words: string[] = [];
  for (const w of parts.join(" - ").split(/\s+/)) {
    const k = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!k || seen.has(k)) continue;
    seen.add(k);
    words.push(w);
  }
  return words.join(" ").slice(0, 125);
}

/**
 * Upgrades any Blogger or Google User Content image URL to its 100% original,
 * uncompressed, full-resolution upload size (/s0/).
 */
export function toFullResolutionImageUrl(url?: string | null): string {
  if (!url) return "";
  let clean = url.trim();
  // Upgrade Blogger/Google User Content to full original upload (/s0/)
  if (/googleusercontent\.com|blogspot\.com/i.test(clean)) {
    clean = clean.replace(/\/(s\d+(-c)?|w\d+-h\d+[^/]*)\//i, "/s0/");
  }
  return clean;
}

/**
 * Rewrites <img> and <a> tags inside post HTML so photos are displayed
 * in crystal-clear full resolution (upgraded to /s0/), stripping Blogger's
 * tiny inline width/height constraints and adding proper SEO alt tags.
 */
export function enhanceContentImages(html: string, title?: string | null): string {
  if (!html) return html;
  let i = 0;

  // 1. Upgrade <a> links wrapping images to full original resolution (/s0/)
  let processed = html.replace(/<a\b([^>]*?href=["'])(https?:\/\/[^"']*?)\/(s\d+(-c)?|w\d+-h\d+[^/]*)\/([^"']+["'][^>]*>)/gi, '$1$2/s0/$5');

  // 2. Upgrade <img> tags: change src to /s0/, strip tiny width/height, inject SEO alt
  processed = processed.replace(/<img\b([^>]*?)\/?>(?!\s*<\/img>)/gi, (_m, attrs: string) => {
    i += 1;
    let out = attrs.trim();

    // Upgrade Google/Blogger image src to /s0/ (original uploaded resolution)
    out = out.replace(/(src=["']https?:\/\/[^"']*?)\/(s\d+(-c)?|w\d+-h\d+[^/]*)\//gi, '$1/s0/');

    // Strip hardcoded Blogger thumbnail attributes that compress images (e.g. width="213" height="320")
    out = out.replace(/\b(width|height)\s*=\s*["']\d+["']/gi, '');

    const hasAlt = /\balt\s*=/i.test(out);
    const hasLoading = /\bloading\s*=/i.test(out);
    const hasDecoding = /\bdecoding\s*=/i.test(out);
    const hasPriority = /\bfetchpriority\s*=/i.test(out);

    if (!hasAlt) out += ` alt="${escapeAttr(buildAlt(title, `photo ${i}`))}"`;
    else out = out.replace(/\balt\s*=\s*(["'])\s*\1/i, ` alt="${escapeAttr(buildAlt(title, `photo ${i}`))}"`);
    if (!hasLoading) out += ` loading="lazy"`;
    if (!hasDecoding) out += ` decoding="async"`;
    if (!hasPriority) out += ` fetchpriority="low"`;

    return `<img ${out.trim()} class="w-full max-w-full h-auto object-contain rounded-xl my-4 mx-auto" />`;
  });

  return processed;
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
