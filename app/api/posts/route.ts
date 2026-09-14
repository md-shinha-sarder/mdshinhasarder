import { NextRequest, NextResponse } from 'next/server';

const FEEDS = {
  posts: "https://shinhaauthor.blogspot.com/feeds/posts/default?max-results=500",
  pages: "https://shinhaauthor.blogspot.com/feeds/pages/default?max-results=500",
};

function pickAll(xml: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function pick(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1] : null;
}

function decode(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function strip(html: string) {
  return decode(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function slugFromUrl(u: string) {
  try {
    const p = new URL(u).pathname;
    return p.replace(/\/$/, "").split("/").pop()?.replace(/\.html?$/, "") || "post";
  } catch {
    return "post";
  }
}

function upscale(url: string) {
  return url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/=w\d+-h\d+(-c)?$/, "=w1600");
}

function parseEntries(xml: string) {
  return pickAll(xml, "entry").map((e) => {
    const title = strip(pick(e, "title") || "");
    const published = pick(e, "published") || "";
    const updated = pick(e, "updated") || "";
    const contentRaw = pick(e, "content") || pick(e, "summary") || "";
    let content = decode(contentRaw);

    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    const image = imgMatch ? upscale(imgMatch[1]) : null;
    if (imgMatch) {
      content = content.replace(imgMatch[0], "");
      content = content.replace(/<a[^>]*>\s*<\/a>/gi, "");
    }
    content = content.replace(/<img([^>]+)>/gi, (_m, attrs) => {
      const src = attrs.match(/src=["']([^"']+)["']/i);
      return src ? `<img src="${upscale(src[1])}" loading="lazy" />` : "";
    });

    const plain = strip(content)
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\(\s*\)/g, "")
      .replace(/[•·●▪►»]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    let excerpt = plain.slice(0, 200);
    if (plain.length > 200) {
      const cut = excerpt.lastIndexOf(" ");
      if (cut > 80) excerpt = excerpt.slice(0, cut);
      excerpt += "…";
    }
    if (!excerpt || excerpt.length < 30) {
      excerpt = title ? `${title} — Read the full article by MD. Shinha Sarder.` : "Read the full article by MD. Shinha Sarder.";
    }

    const linkRe = /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i;
    const lm = e.match(linkRe);
    const url = lm ? lm[1] : "";
    const tags: string[] = [];
    const catRe = /<category[^>]*term=["']([^"']+)["']/gi;
    let cm;
    while ((cm = catRe.exec(e)) !== null) {
      if (cm[1] !== "Latest") tags.push(cm[1]);
    }
    const id = slugFromUrl(url);
    return { id, title, slug: id, url, image, excerpt, content, published, updated, tags };
  });
}

// Server cache in memory for 10 minutes
let cachedPosts: { time: number; data: any[] } | null = null;
let cachedPages: { time: number; data: any[] } | null = null;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "posts") as "posts" | "pages";
    const force = searchParams.get("force") === "true";

    const cacheEntry = type === "pages" ? cachedPages : cachedPosts;
    const now = Date.now();

    if (!force && cacheEntry && now - cacheEntry.time < 10 * 60 * 1000) {
      return NextResponse.json({ posts: cacheEntry.data, items: cacheEntry.data });
    }

    const feedUrl = FEEDS[type] || FEEDS.posts;
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      throw new Error(`Feed fetch failed with status ${res.status}`);
    }

    const xml = await res.text();
    const items = parseEntries(xml);

    if (type === "pages") {
      cachedPages = { time: now, data: items };
    } else {
      cachedPosts = { time: now, data: items };
    }

    return NextResponse.json(
      { posts: items, items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/posts:", error);
    return NextResponse.json(
      { error: String(error), posts: [], items: [] },
      { status: 200 }
    );
  }
}
