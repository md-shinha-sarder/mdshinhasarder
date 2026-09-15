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

  // 2. RSS
  const rfcDate = new Date().toUTCString();
  const rssLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>MD. Shinha Sarder</title>',
    `    <link>${SITE_URL}</link>`,
    '    <description>Articles, technology insights and publications by MD. Shinha Sarder.</description>',
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

  // Write to public and outDir
  const targets = ["public", outDir];
  for (const dir of targets) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "sitemap.xml"), sitemapXml, "utf-8");
      fs.writeFileSync(path.join(dir, "rss.xml"), rssXml, "utf-8");
    } catch (err) {
      console.warn(`[SEO Script] Could not write to ${dir}:`, err.message);
    }
  }
  console.log(`[SEO Script] Generated sitemap & RSS successfully for targets: ${targets.join(", ")}`);
}

main().catch((err) => {
  console.warn("[SEO Script] Handled error:", err.message);
  process.exit(0); // Never break build
});
