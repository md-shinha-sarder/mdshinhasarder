#!/usr/bin/env node
/**
 * scripts/build_sitemap_rss.js
 * Universal Node.js SEO & Feed builder for Vercel, Next.js, and Vite deployments.
 * Runs in any environment without requiring Python.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const SITE_URL = "https://mdshinhasarder.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hpnndbmyibbgrlskskyt.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_1Cio41beIHbD61Vj7AnQMA_6kSM5pI7";

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/posts", priority: "0.9", changefreq: "daily" },
  { loc: "/#about", priority: "0.8", changefreq: "monthly" },
  { loc: "/#videos", priority: "0.8", changefreq: "weekly" },
  { loc: "/#reels", priority: "0.8", changefreq: "weekly" },
  { loc: "/#projects", priority: "0.7", changefreq: "monthly" },
  { loc: "/#publications", priority: "0.7", changefreq: "monthly" },
  { loc: "/#skills", priority: "0.7", changefreq: "monthly" },
  { loc: "/#contact", priority: "0.6", changefreq: "yearly" },
];

function fetchJson(url, headers = {}) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, { headers, timeout: 8000 }, (res) => {
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(null);
          }
        });
      });
      req.on("error", () => resolve(null));
      req.on("timeout", () => { req.destroy(); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

async function getPosts() {
  const supabaseUrl = `${SUPABASE_URL}/rest/v1/posts?select=slug,title,excerpt,published_at,created_at,cover_url&status=eq.published&order=published_at.desc&limit=100`;
  const res = await fetchJson(supabaseUrl, {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: "application/json",
  });
  if (Array.isArray(res) && res.length > 0) {
    return res;
  }

  // Blogger fallback
  const bloggerUrl = "https://mdshinhasarder.blogspot.com/feeds/posts/default?alt=json&max-results=50";
  const bRes = await fetchJson(bloggerUrl);
  if (bRes?.feed?.entry) {
    return bRes.feed.entry.map((e) => {
      const title = e?.title?.$t || "";
      const published = e?.published?.$t || "";
      let slug = "";
      for (const l of e?.link || []) {
        if (l?.rel === "alternate") {
          const m = (l.href || "").match(/blogspot\.com\/(\d{4}\/\d{2}\/[^/?#]+(?:\.html)?)/);
          slug = m ? m[1].replace(".html", "") : (l.href || "").split("/").pop().replace(".html", "");
          break;
        }
      }
      return {
        slug,
        title,
        excerpt: (e?.summary?.$t || title).slice(0, 200),
        published_at: published,
        created_at: published,
      };
    }).filter((p) => p.slug && p.title);
  }

  return [];
}

async function main() {
  const outDir = process.argv[2] || "dist";
  const posts = await getPosts();
  const nowIso = new Date().toISOString().split("T")[0];

  // 1. Sitemap
  const sitemapLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const r of STATIC_ROUTES) {
    sitemapLines.push(
      `  <url>\n    <loc>${SITE_URL}${r.loc}</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    );
  }

  for (const p of posts) {
    if (!p.slug) continue;
    const lastmod = (p.updated_at || p.published_at || nowIso).split("T")[0];
    sitemapLines.push(
      `  <url>\n    <loc>${SITE_URL}/post/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );
  }
  sitemapLines.push("</urlset>");
  const sitemapXml = sitemapLines.join("\n");

  // 2. News Sitemap (Google News)
  const newsLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
  ];
  for (const p of posts.slice(0, 50)) {
    if (!p.slug) continue;
    const pubDate = (p.published_at || nowIso).split("T")[0];
    const title = (p.title || "News Article").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    newsLines.push(
      `  <url>\n    <loc>${SITE_URL}/post/${p.slug}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>MD. Shinha Sarder</news:name>\n        <news:language>en</news:language>\n      </news:publication>\n      <news:publication_date>${pubDate}</news:publication_date>\n      <news:title>${title}</news:title>\n    </news:news>\n  </url>`
    );
  }
  newsLines.push("</urlset>");
  const newsXml = newsLines.join("\n");

  // 3. Image Sitemap
  const imageLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <image:image>\n      <image:loc>${SITE_URL}/profile.webp</image:loc>\n      <image:title>MD. Shinha Sarder — Entrepreneur</image:title>\n      <image:caption>MD. Shinha Sarder portrait photograph</image:caption>\n    </image:image>\n  </url>`,
  ];
  for (const p of posts) {
    if (!p.slug || !p.cover_url) continue;
    const cleanImg = p.cover_url.replace(/&/g, "&amp;");
    const cleanTitle = (p.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    imageLines.push(
      `  <url>\n    <loc>${SITE_URL}/post/${p.slug}</loc>\n    <image:image>\n      <image:loc>${cleanImg}</image:loc>\n      <image:title>${cleanTitle}</image:title>\n    </image:image>\n  </url>`
    );
  }
  imageLines.push("</urlset>");
  const imageXml = imageLines.join("\n");

  // 4. Video Sitemap
  const videoLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    `  <url>\n    <loc>${SITE_URL}/#videos</loc>\n    <video:video>\n      <video:thumbnail_loc>${SITE_URL}/profile.webp</video:thumbnail_loc>\n      <video:title>MD. Shinha Sarder - Official Videos &amp; Content</video:title>\n      <video:description>Official video releases, tech reviews and content by MD. Shinha Sarder</video:description>\n      <video:player_loc>https://www.youtube.com/@MD-Shinha-Sarder</video:player_loc>\n    </video:video>\n  </url>`,
    '</urlset>',
  ];
  const videoXml = videoLines.join("\n");

  // 5. Sitemap Index
  const sitemapIndex = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${SITE_URL}/sitemap.xml</loc><lastmod>${nowIso}</lastmod></sitemap>`,
    `  <sitemap><loc>${SITE_URL}/news-sitemap.xml</loc><lastmod>${nowIso}</lastmod></sitemap>`,
    `  <sitemap><loc>${SITE_URL}/image-sitemap.xml</loc><lastmod>${nowIso}</lastmod></sitemap>`,
    `  <sitemap><loc>${SITE_URL}/video-sitemap.xml</loc><lastmod>${nowIso}</lastmod></sitemap>`,
    '</sitemapindex>',
  ].join("\n");

  // 6. RSS & Atom
  const rfcDate = new Date().toUTCString();
  const rssLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>MD. Shinha Sarder</title>',
    `    <link>${SITE_URL}</link>`,
    '    <description>Founder &amp; CEO of IT Tech BD and Biostar TV World. Articles, technology insights and publications by MD. Shinha Sarder.</description>',
    '    <language>en-US</language>',
    `    <lastBuildDate>${rfcDate}</lastBuildDate>`,
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`,
  ];

  for (const p of posts.slice(0, 20)) {
    const title = (p.title || "Article").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const desc = (p.excerpt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    rssLines.push(
      `    <item>\n      <title>${title}</title>\n      <link>${SITE_URL}/post/${p.slug}</link>\n      <guid>${SITE_URL}/post/${p.slug}</guid>\n      <description>${desc}</description>\n    </item>`
    );
  }
  rssLines.push("  </channel>\n</rss>");
  const rssXml = rssLines.join("\n");

  // Atom Feed
  const atomLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    '  <title>MD. Shinha Sarder</title>',
    `  <link href="${SITE_URL}/" />`,
    `  <link href="${SITE_URL}/atom.xml" rel="self" />`,
    `  <updated>${new Date().toISOString()}</updated>`,
    '  <id>https://mdshinhasarder.com/</id>',
    '  <author><name>MD. Shinha Sarder</name></author>',
  ];
  for (const p of posts.slice(0, 15)) {
    const title = (p.title || "Article").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const desc = (p.excerpt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const updated = (p.updated_at || p.published_at || new Date().toISOString());
    atomLines.push(
      `  <entry>\n    <title>${title}</title>\n    <link href="${SITE_URL}/post/${p.slug}" />\n    <id>${SITE_URL}/post/${p.slug}</id>\n    <updated>${updated}</updated>\n    <summary>${desc}</summary>\n  </entry>`
    );
  }
  atomLines.push('</feed>');
  const atomXml = atomLines.join("\n");

  // Write to public and outDir
  const targets = ["public", outDir];
  for (const dir of targets) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "sitemap.xml"), sitemapXml, "utf-8");
      fs.writeFileSync(path.join(dir, "sitemap-index.xml"), sitemapIndex, "utf-8");
      fs.writeFileSync(path.join(dir, "news-sitemap.xml"), newsXml, "utf-8");
      fs.writeFileSync(path.join(dir, "image-sitemap.xml"), imageXml, "utf-8");
      fs.writeFileSync(path.join(dir, "video-sitemap.xml"), videoXml, "utf-8");
      fs.writeFileSync(path.join(dir, "rss.xml"), rssXml, "utf-8");
      fs.writeFileSync(path.join(dir, "atom.xml"), atomXml, "utf-8");
    } catch (err) {
      console.warn(`[SEO Script] Could not write to ${dir}:`, err.message);
    }
  }
  console.log(`[SEO Script] Generated all Sitemaps (main, news, image, video, index) & Feeds (RSS, Atom) for targets: ${targets.join(", ")}`);
}

main().catch((err) => {
  console.warn("[SEO Script] Handled error:", err.message);
  process.exit(0); // Never break build
});
