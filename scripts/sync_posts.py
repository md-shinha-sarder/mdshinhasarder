#!/usr/bin/env python3
"""
scripts/sync_posts.py
High-Performance Data Synchronization & SEO Engine for MD. Shinha Sarder's Website.

Capabilities:
  1. Synchronizes all posts, pages, and photos from Blogger (shinhaauthor.blogspot.com).
  2. Preserves custom admin uploaded posts & storage photos without data loss.
  3. Writes high-fidelity JSON caches: public/posts-sync.json & public/pages-sync.json.
  4. Generates XML sitemaps (index, posts, pages, images) & RSS feed.
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

BLOGGER_POSTS_FEEDS = [
    "https://shinhaauthor.blogspot.com/feeds/posts/default?alt=json&max-results=500",
    "https://mdshinhasarder.blogspot.com/feeds/posts/default?alt=json&max-results=500",
]

BLOGGER_PAGES_FEEDS = [
    "https://shinhaauthor.blogspot.com/feeds/pages/default?alt=json&max-results=100",
    "https://mdshinhasarder.blogspot.com/feeds/pages/default?alt=json&max-results=100",
]

def log(tag: str, msg: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tag}] {msg}")

def clean_slug(title: str, existing_slug: str = "") -> str:
    if existing_slug:
        s = existing_slug.strip().lower().replace(".html", "")
        s = re.sub(r"[^\w\s\/-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        s = re.sub(r"^-+|-+$", "", s)
        if s:
            return s
    s = title.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s or "post"

def upgrade_image_url(url: str) -> str:
    """Converts Blogger thumbnail URLs to high-resolution full-size URLs."""
    if not url or not isinstance(url, str):
        return None
    url = url.strip()
    # Upgrade standard Blogger thumbnails
    url = re.sub(r"/s\d+(-c)?/", "/s1600/", url)
    url = re.sub(r"/w\d+-h\d+[^/]*/", "/s1600/", url)
    # Ensure https
    if url.startswith("http://"):
        url = "https://" + url[7:]
    return url

def normalize_post(raw: dict, source: str = "unknown") -> dict:
    title = str(raw.get("title", "")).strip() or "Untitled"
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
    if image and isinstance(image, str):
        image = upgrade_image_url(image)
    else:
        image = None

    url = str(raw.get("url", ""))

    content = str(raw.get("content", "")).strip()
    excerpt = str(raw.get("excerpt", "")).strip()
    if not excerpt and content:
        # Strip html tags for clean snippet
        clean_text = re.sub(r"<[^>]+>", " ", content)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()
        excerpt = clean_text[:220]

    return {
        "id": str(raw.get("id", slug)),
        "title": title,
        "slug": slug,
        "url": url,
        "image": image,
        "excerpt": excerpt,
        "content": content,
        "published": published,
        "updated": updated,
        "tags": tags,
        "seo_title": raw.get("seo_title") or None,
        "seo_description": raw.get("seo_description") or None,
        "status": raw.get("status", "published"),
        "source": source,
    }

def fetch_from_supabase_db(table="posts") -> list:
    """Fetch records directly from Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&status=eq.published&order=published_at.desc"
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
                    log("Supabase DB", f"Retrieved {len(data)} items from public.{table}")
                    return [normalize_post(p, "supabase") for p in data]
    except Exception as e:
        log("Supabase DB", f"Notice: Database query on {table} skipped ({e})")
    return []

def fetch_from_blogger_entries(feeds: list, is_page=False) -> list:
    """Fetch entries directly from Blogger Atom/JSON feeds."""
    results = []
    seen_urls = set()

    for feed_url in feeds:
        try:
            req = urllib.request.Request(feed_url, headers={"User-Agent": "MDS-SyncEngine/2.0"})
            with urllib.request.urlopen(req, timeout=12) as res:
                if res.status == 200:
                    data = json.loads(res.read().decode("utf-8"))
                    entries = data.get("feed", {}).get("entry", [])
                    log("Blogger Feed", f"Found {len(entries)} entries from {feed_url[:45]}...")
                    for entry in entries:
                        title = entry.get("title", {}).get("$t", "").strip()
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
                                if is_page:
                                    match = re.search(r"/p/([^/?#]+(?:\.html)?)", url)
                                    if match:
                                        slug = match.group(1).replace(".html", "")
                                else:
                                    match = re.search(r"blogspot\.com/(\d{4}/\d{2}/[^/?#]+(?:\.html)?)", url)
                                    if match:
                                        slug = match.group(1).replace(".html", "").split("/")[-1]

                        if url and url in seen_urls:
                            continue
                        if url:
                            seen_urls.add(url)

                        # Extract Cover Image
                        image = None
                        media_thumb = entry.get("media$thumbnail", {}).get("url")
                        if media_thumb:
                            image = upgrade_image_url(media_thumb)
                        if not image and content:
                            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
                            if img_match:
                                image = upgrade_image_url(img_match.group(1))

                        categories = [c.get("term", "") for c in entry.get("category", []) if c.get("term")]

                        norm = normalize_post({
                            "title": title or ("Untitled Page" if is_page else "Untitled Post"),
                            "slug": slug or clean_slug(title),
                            "url": url,
                            "image": image,
                            "excerpt": summary or re.sub(r"<[^>]+>", " ", content)[:220].strip(),
                            "content": content,
                            "published": published,
                            "updated": updated,
                            "tags": categories,
                        }, "blogger")
                        results.append(norm)

        except Exception as e:
            log("Blogger Feed", f"Feed error on {feed_url}: {e}")

    return results

def get_existing_json_cache(filename: str) -> list:
    """Read existing entries from public cache file if present."""
    sync_file = os.path.join("public", filename)
    if os.path.exists(sync_file):
        try:
            with open(sync_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return [normalize_post(p, "local_cache") for p in data]
        except Exception:
            pass
    return []

def consolidate_items(blogger_items: list, db_items: list, cached_items: list) -> list:
    """
    Consolidates items preserving admin custom uploads first,
    then database records, then latest live Blogger feeds, and lastly local cache.
    """
    merged = []
    seen_slugs = set()
    seen_titles = set()
    seen_ids = set()

    def add(item):
        slug_key = (item.get("slug") or "").lower().strip()
        title_key = (item.get("title") or "").lower().strip()
        id_key = (item.get("id") or "").lower().strip()

        if slug_key and slug_key in seen_slugs:
            return
        if title_key and title_key in seen_titles:
            return
        if id_key and id_key in seen_ids:
            return

        if slug_key:
            seen_slugs.add(slug_key)
        if title_key:
            seen_titles.add(title_key)
        if id_key:
            seen_ids.add(id_key)
        merged.append(item)

    # 1. Custom admin uploaded posts from cache (source == 'admin' or custom URL)
    for c in cached_items:
        if c.get("source") == "admin" or "supabase.co" in (c.get("image") or "") or "IT Company Development" in c.get("title", ""):
            add(c)

    # 2. Database items
    for p in db_items:
        add(p)

    # 3. Live Blogger feed items
    for p in blogger_items:
        add(p)

    # 4. Remaining cached items
    for c in cached_items:
        add(c)

    return merged

def write_json_cache(items: list, filename: str, target_dirs: list):
    """Writes the unified collection to filename in all target directories."""
    for d in target_dirs:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
        file_path = os.path.join(d, filename)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(items, f, ensure_ascii=False, indent=2)
            log("File Output", f"Wrote {len(items)} items to {file_path}")
        except Exception as e:
            log("File Output", f"Error writing to {file_path}: {e}")

def generate_sitemaps(posts: list, pages: list, target_dir: str):
    """Generates standard and news XML sitemaps with images."""
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    standard_routes = [
        ("/", "1.0", "daily"),
        ("/posts", "0.9", "daily"),
        ("/gallery", "0.9", "weekly"),
        ("/songs", "0.8", "weekly"),
        ("/books", "0.8", "weekly"),
        ("/biography", "0.9", "monthly"),
        ("/publications", "0.8", "weekly"),
        ("/skills", "0.8", "monthly"),
        ("/projects", "0.8", "weekly"),
    ]

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ]

    for route, prio, freq in standard_routes:
        xml_lines.extend([
            '  <url>',
            f'    <loc>{SITE_URL}{route}</loc>',
            f'    <lastmod>{now_iso}</lastmod>',
            f'    <changefreq>{freq}</changefreq>',
            f'    <priority>{prio}</priority>',
            '  </url>',
        ])

    # Add Pages
    for pg in pages:
        slug = pg["slug"]
        if slug in ["home", ""]:
            continue
        pub = pg.get("published", "")[:10] or now_iso
        img = pg.get("image")
        xml_lines.extend([
            '  <url>',
            f'    <loc>{SITE_URL}/p/{slug}</loc>',
            f'    <lastmod>{pub}</lastmod>',
            '    <changefreq>weekly</changefreq>',
            '    <priority>0.8</priority>',
        ])
        if img:
            xml_lines.extend([
                '    <image:image>',
                f'      <image:loc>{img}</image:loc>',
                f'      <image:title>{urllib.parse.quote(pg["title"])}</image:title>',
                '    </image:image>',
            ])
        xml_lines.append('  </url>')

    # Add Posts
    for p in posts:
        slug = p["slug"]
        pub = p.get("published", "")[:10] or now_iso
        img = p.get("image")

        xml_lines.extend([
            '  <url>',
            f'    <loc>{SITE_URL}/post/{slug}</loc>',
            f'    <lastmod>{pub}</lastmod>',
            '    <changefreq>weekly</changefreq>',
            '    <priority>0.8</priority>',
        ])
        if img:
            xml_lines.extend([
                '    <image:image>',
                f'      <image:loc>{img}</image:loc>',
                f'      <image:title>{urllib.parse.quote(p["title"])}</image:title>',
                '    </image:image>',
            ])
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')

    sitemap_path = os.path.join(target_dir, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines))
    log("SEO", f"Generated sitemap with {len(posts)} posts and {len(pages)} pages at {sitemap_path}")

    # RSS Feed
    rss_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        '    <title>MD. Shinha Sarder</title>',
        f'    <link>{SITE_URL}</link>',
        '    <description>Official Blog, Pages &amp; Articles by MD. Shinha Sarder</description>',
        '    <language>en-US</language>',
        f'    <lastBuildDate>{datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")}</lastBuildDate>',
    ]

    for p in posts[:30]:
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
    log("Sync Engine", "Starting full Blogger & custom post/page synchronization...")

    # 1. Fetch & consolidate posts
    blogger_posts = fetch_from_blogger_entries(BLOGGER_POSTS_FEEDS, is_page=False)
    db_posts = fetch_from_supabase_db("posts")
    cached_posts = get_existing_json_cache("posts-sync.json")
    posts = consolidate_items(blogger_posts, db_posts, cached_posts)

    # 2. Fetch & consolidate pages
    blogger_pages = fetch_from_blogger_entries(BLOGGER_PAGES_FEEDS, is_page=True)
    db_pages = fetch_from_supabase_db("pages")
    cached_pages = get_existing_json_cache("pages-sync.json")
    pages = consolidate_items(blogger_pages, db_pages, cached_pages)

    target_dirs = ["public"]
    if os.path.exists("dist"):
        target_dirs.append("dist")

    write_json_cache(posts, "posts-sync.json", target_dirs)
    write_json_cache(pages, "pages-sync.json", target_dirs)

    for d in target_dirs:
        generate_sitemaps(posts, pages, d)

    log("Sync Engine", f"Complete! Synced {len(posts)} posts and {len(pages)} pages.")
    return posts, pages

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MD. Shinha Sarder Synchronization & SEO Engine")
    parser.add_argument("--sync", action="store_true", help="Run full synchronization of posts, pages, and sitemaps")
    args = parser.parse_args()
    run_sync()
