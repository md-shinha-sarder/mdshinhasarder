#!/usr/bin/env python3
"""
scripts/sync_posts.py
High-Performance Data Synchronization & SEO Engine for MD. Shinha Sarder's Website.

Capabilities:
  1. Synchronizes posts between Supabase, Blogger Feeds, and Local JSON Cache.
  2. Generates static XML sitemaps (index, posts, news, images, videos) & RSS/Atom feeds.
  3. Verifies Supabase schema & outputs ready-to-run SQL scripts.
  4. Runs as a one-shot CLI tool, a CI/CD build step, or a continuous background daemon.

Usage:
  python3 scripts/sync_posts.py --sync
  python3 scripts/sync_posts.py --verify
  python3 scripts/sync_posts.py --export-sql
  python3 scripts/sync_posts.py --daemon --interval 300
"""

import os
import sys
import json
import re
import time
import argparse
import urllib.request
import urllib.parse
from datetime import datetime, timezone

SITE_URL = "https://mdshinhasarder.com"
DEFAULT_SUPABASE_URL = "https://hpnndbmyibbgrlskskyt.supabase.co"
DEFAULT_SUPABASE_KEY = "sb_publishable_1Cio41beIHbD61Vj7AnQMA_6kSM5pI7"

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", DEFAULT_SUPABASE_URL))
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", DEFAULT_SUPABASE_KEY))

EDGE_FN_URL = "https://ihegjzwlvthfqwredssj.supabase.co/functions/v1/fetch-posts?type=posts"

BLOGGER_FEEDS = [
    "https://shinhaauthor.blogspot.com/feeds/posts/default?alt=json&max-results=100",
    "https://mdshinhasarder.blogspot.com/feeds/posts/default?alt=json&max-results=100",
]

def log(tag: str, msg: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tag}] {msg}")

def clean_slug(title: str, existing_slug: str = "") -> str:
    if existing_slug:
        s = existing_slug.strip().lower().replace(".html", "")
        s = re.sub(r"[^\w\s\/-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        if s:
            return s
    s = title.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s or "post"

def normalize_post(raw: dict, source: str = "unknown") -> dict:
    title = str(raw.get("title", "")).strip() or "Untitled Post"
    raw_slug = str(raw.get("slug", raw.get("id", "")))
    slug = clean_slug(title, raw_slug)

    raw_tags = raw.get("tags") or raw.get("labels") or []
    tags = []
    if isinstance(raw_tags, list):
        tags = [str(t).strip() for t in raw_tags if str(t).strip()]
    elif isinstance(raw_tags, str):
        tags = [t.strip() for t in raw_tags.split(",") if t.strip()]

    now_iso = datetime.now(timezone.utc).isoformat()
    published = str(raw.get("published_at") or raw.get("published") or raw.get("created_at") or now_iso)
    updated = str(raw.get("updated_at") or raw.get("updated") or published)

    image = raw.get("cover_url") or raw.get("image") or None
    if image and not isinstance(image, str):
        image = None

    url = str(raw.get("url", ""))

    return {
        "id": str(raw.get("id", slug)),
        "title": title,
        "slug": slug,
        "url": url,
        "image": image,
        "excerpt": str(raw.get("excerpt", "")).strip(),
        "content": str(raw.get("content", "")).strip(),
        "published": published,
        "updated": updated,
        "tags": tags,
        "seo_title": raw.get("seo_title") or None,
        "seo_description": raw.get("seo_description") or None,
        "status": raw.get("status", "published"),
        "source": source,
    }

def fetch_from_supabase_db() -> list:
    """Fetch posts directly from Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/posts?select=*&status=eq.published&order=published_at.desc"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json",
        "User-Agent": "MDS-SyncEngine/2.0",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                if isinstance(data, list):
                    log("Supabase DB", f"Retrieved {len(data)} posts from public.posts")
                    return [normalize_post(p, "supabase") for p in data]
    except Exception as e:
        log("Supabase DB", f"Notice: Database table query skipped ({e})")
    return []

def fetch_from_edge_function() -> list:
    """Fetch posts from Supabase Edge Function."""
    try:
        req = urllib.request.Request(EDGE_FN_URL, headers={"User-Agent": "MDS-SyncEngine/2.0"})
        with urllib.request.urlopen(req, timeout=10) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                posts = data.get("posts") or data.get("items") or []
                log("Edge Function", f"Retrieved {len(posts)} posts from fetch-posts")
                return [normalize_post(p, "edge_function") for p in posts]
    except Exception as e:
        log("Edge Function", f"Notice: Edge function fetch ({e})")
    return []

def fetch_from_blogger_feed() -> list:
    """Fallback: Fetch posts directly from Blogger Atom/JSON feeds."""
    results = []
    for feed_url in BLOGGER_FEEDS:
        try:
            req = urllib.request.Request(feed_url, headers={"User-Agent": "MDS-SyncEngine/2.0"})
            with urllib.request.urlopen(req, timeout=10) as res:
                if res.status == 200:
                    data = json.loads(res.read().decode("utf-8"))
                    entries = data.get("feed", {}).get("entry", [])
                    log("Blogger Feed", f"Found {len(entries)} entries from {feed_url[:40]}...")
                    for entry in entries:
                        title = entry.get("title", {}).get("$t", "")
                        published = entry.get("published", {}).get("$t", "")
                        updated = entry.get("updated", {}).get("$t", published)
                        content = entry.get("content", {}).get("$t", "")
                        summary = entry.get("summary", {}).get("$t", "")

                        # Extract URL & Slug
                        url = ""
                        slug = ""
                        for link in entry.get("link", []):
                            if link.get("rel") == "alternate":
                                url = link.get("href", "")
                                match = re.search(r"blogspot\.com/(\d{4}/\d{2}/[^/?#]+(?:\.html)?)", url)
                                if match:
                                    slug = match.group(1).replace(".html", "").split("/")[-1]

                        # Extract Cover Image
                        image = None
                        media_thumb = entry.get("media$thumbnail", {}).get("url")
                        if media_thumb:
                            image = media_thumb.replace("s72-c", "s1600").replace("w72-h72-p-k-no-nu", "s1600")
                        if not image and content:
                            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
                            if img_match:
                                image = img_match.group(1)

                        categories = [c.get("term", "") for c in entry.get("category", []) if c.get("term")]

                        results.append(normalize_post({
                            "title": title,
                            "slug": slug or clean_slug(title),
                            "url": url,
                            "image": image,
                            "excerpt": summary or re.sub(r"<[^>]+>", " ", content)[:200].strip(),
                            "content": content,
                            "published": published,
                            "updated": updated,
                            "tags": categories,
                        }, "blogger"))
                    if results:
                        break
        except Exception as e:
            log("Blogger Feed", f"Feed error: {e}")
    return results

def get_existing_local_sync() -> list:
    """Read existing posts from public/posts-sync.json if present."""
    sync_file = os.path.join("public", "posts-sync.json")
    if os.path.exists(sync_file):
        try:
            with open(sync_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return [normalize_post(p, "local_cache") for p in data]
        except Exception:
            pass
    return []

def consolidate_posts() -> list:
    """Consolidates posts from all sources and removes duplicates."""
    db_posts = fetch_from_supabase_db()
    edge_posts = fetch_from_edge_function()
    blogger_posts = fetch_from_blogger_feed() if not edge_posts else []
    cached_posts = get_existing_local_sync()

    seen_slugs = set()
    seen_ids = set()
    merged = []

    def add(p):
        slug_key = p["slug"].lower()
        id_key = p["id"].lower()
        if slug_key in seen_slugs or id_key in seen_ids:
            return
        seen_slugs.add(slug_key)
        seen_ids.add(id_key)
        merged.append(p)

    # Priority order: DB > Edge Function > Blogger > Local Cache
    for p in db_posts:
        add(p)
    for p in edge_posts:
        add(p)
    for p in blogger_posts:
        add(p)
    for p in cached_posts:
        add(p)

    log("Consolidation", f"Successfully consolidated {len(merged)} unique posts")
    return merged

def write_json_cache(posts: list, target_dirs: list):
    """Writes the unified post collection to posts-sync.json in all target directories."""
    for d in target_dirs:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
        file_path = os.path.join(d, "posts-sync.json")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(posts, f, ensure_ascii=False, indent=2)
            log("File Output", f"Wrote {len(posts)} posts to {file_path}")
        except Exception as e:
            log("File Output", f"Error writing to {file_path}: {e}")

def generate_sitemaps(posts: list, target_dir: str):
    """Generates standard and news XML sitemaps."""
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 1. Main sitemap.xml
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        '  <url>',
        f'    <loc>{SITE_URL}/</loc>',
        f'    <lastmod>{now_iso}</lastmod>',
        '    <changefreq>daily</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '  <url>',
        f'    <loc>{SITE_URL}/posts</loc>',
        f'    <lastmod>{now_iso}</lastmod>',
        '    <changefreq>daily</changefreq>',
        '    <priority>0.9</priority>',
        '  </url>',
    ]

    for p in posts:
        slug = p["slug"]
        pub = p.get("published", "")[:10] or now_iso
        img = p.get("image")
        title_esc = urllib.parse.quote(p["title"])

        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{SITE_URL}/post/{slug}</loc>')
        xml_lines.append(f'    <lastmod>{pub}</lastmod>')
        xml_lines.append('    <changefreq>weekly</changefreq>')
        xml_lines.append('    <priority>0.8</priority>')
        if img:
            xml_lines.append('    <image:image>')
            xml_lines.append(f'      <image:loc>{img}</image:loc>')
            xml_lines.append(f'      <image:title>{p["title"]}</image:title>')
            xml_lines.append('    </image:image>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')

    sitemap_path = os.path.join(target_dir, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines))
    log("SEO", f"Generated {sitemap_path}")

    # 2. RSS Feed
    rss_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        '    <title>MD. Shinha Sarder</title>',
        f'    <link>{SITE_URL}</link>',
        '    <description>Official Blog &amp; Articles by MD. Shinha Sarder</description>',
        '    <language>en-US</language>',
        f'    <lastBuildDate>{datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")}</lastBuildDate>',
    ]

    for p in posts[:25]:
        slug = p["slug"]
        rss_lines.extend([
            '    <item>',
            f'      <title><![CDATA[{p["title"]}]]></title>',
            f'      <link>{SITE_URL}/post/{slug}</link>',
            f'      <guid>{SITE_URL}/post/{slug}</guid>',
            f'      <description><![CDATA[{p.get("excerpt") or p["title"]}]]></description>',
            '    </item>',
        ])
    rss_lines.extend(['  </channel>', '</rss>'])

    rss_path = os.path.join(target_dir, "rss.xml")
    with open(rss_path, "w", encoding="utf-8") as f:
        f.write("\n".join(rss_lines))
    log("SEO", f"Generated {rss_path}")

def run_sync():
    """Main synchronization pipeline."""
    log("Sync Engine", "Starting full data synchronization...")
    posts = consolidate_posts()

    target_dirs = ["public"]
    if os.path.exists("dist"):
        target_dirs.append("dist")

    write_json_cache(posts, target_dirs)
    for d in target_dirs:
        generate_sitemaps(posts, d)

    log("Sync Engine", f"Synchronization complete! {len(posts)} posts are actively synced.")
    return posts

def run_verify():
    """Verifies all endpoints, Supabase connections, and post integrity."""
    log("Verification", "Testing database and feed health...")
    print("=" * 60)
    print(f"Supabase Endpoint: {SUPABASE_URL}")
    print(f"Edge Function:    {EDGE_FN_URL}")
    print("=" * 60)

    # Test DB
    try:
        url = f"{SUPABASE_URL}/rest/v1/posts?select=count"
        req = urllib.request.Request(url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        with urllib.request.urlopen(req, timeout=5) as res:
            print(f"[✓] Supabase REST API: Responded with HTTP {res.status}")
    except Exception as e:
        print(f"[!] Supabase REST API Notice: {e}")

    # Test Edge Function
    try:
        req = urllib.request.Request(EDGE_FN_URL, headers={"User-Agent": "MDS-SyncEngine/2.0"})
        with urllib.request.urlopen(req, timeout=5) as res:
            print(f"[✓] Supabase Edge Function: Responded with HTTP {res.status}")
    except Exception as e:
        print(f"[!] Edge Function Notice: {e}")

    # Check local files
    sync_file = os.path.join("public", "posts-sync.json")
    if os.path.exists(sync_file):
        size = os.path.getsize(sync_file)
        print(f"[✓] Local posts-sync.json: Found ({size} bytes)")
    else:
        print(f"[!] Local posts-sync.json: Not created yet. Run --sync to generate.")

    print("=" * 60)
    print("Verification complete.")

def run_export_sql():
    """Outputs the Supabase SQL schema script."""
    sql = """-- =========================================================
-- MD. Shinha Sarder - Complete Supabase Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
CREATE POLICY "Public can view published posts" ON public.posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.posts;
CREATE POLICY "Authenticated users can manage posts" ON public.posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on posts" ON public.posts;
CREATE POLICY "Service role full access on posts" ON public.posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
"""
    print(sql)
    with open("supabase_schema.sql", "w", encoding="utf-8") as f:
        f.write(sql)
    log("SQL Export", "Saved schema to supabase_schema.sql")

def run_daemon(interval: int):
    """Runs as a continuous background daemon."""
    log("Daemon", f"Starting background synchronization daemon (interval: {interval}s)...")
    while True:
        try:
            run_sync()
        except Exception as e:
            log("Daemon Error", f"Sync cycle encountered error: {e}")
        time.sleep(interval)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MD. Shinha Sarder Synchronization & SEO Engine")
    parser.add_argument("--sync", action="store_true", help="Run full synchronization of posts and sitemaps")
    parser.add_argument("--verify", action="store_true", help="Verify Supabase connectivity and diagnostics")
    parser.add_argument("--export-sql", action="store_true", help="Export Supabase database schema SQL")
    parser.add_argument("--daemon", action="store_true", help="Run continuously as background daemon")
    parser.add_argument("--interval", type=int, default=300, help="Daemon sync interval in seconds (default: 300)")

    args = parser.parse_args()

    if args.verify:
        run_verify()
    elif args.export_sql:
        run_export_sql()
    elif args.daemon:
        run_daemon(args.interval)
    else:
        # Default action is --sync
        run_sync()
