#!/usr/bin/env python3
"""
scripts/build_sitemap_rss.py
Python SEO & Content Automation utility for MD. Shinha Sarder's Website.
Runs on Node.js / Cloudflare Pages / CI environments to generate static sitemap & feed assets.
"""
import os
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

SITE_URL = "https://mdshinhasarder.com"
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://hpnndbmyibbgrlskskyt.supabase.co"))
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_1Cio41beIHbD61Vj7AnQMA_6kSM5pI7"))

STATIC_ROUTES = [
    {"loc": "/", "priority": "1.0", "changefreq": "daily"},
    {"loc": "/posts", "priority": "0.9", "changefreq": "daily"},
    {"loc": "/#about", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/#videos", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/#reels", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/#projects", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/#publications", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/#skills", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/#contact", "priority": "0.6", "changefreq": "yearly"},
]

def fetch_published_posts():
    """Fetch all published posts from Supabase REST API."""
    req_url = f"{SUPABASE_URL}/rest/v1/posts?select=slug,title,excerpt,created_at,updated_at&published=eq.true&order=created_at.desc&limit=100"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json"
    }
    try:
        req = urllib.request.Request(req_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return data
    except Exception as err:
        print(f"[Python SEO Script] Warning: Could not fetch posts from Supabase: {err}")
    return []

def generate_sitemap(posts, out_dir):
    """Generate XML sitemap file."""
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    for route in STATIC_ROUTES:
        xml_lines.append(f'  <url>')
        xml_lines.append(f'    <loc>{SITE_URL}{route["loc"]}</loc>')
        xml_lines.append(f'    <lastmod>{now_iso}</lastmod>')
        xml_lines.append(f'    <changefreq>{route["changefreq"]}</changefreq>')
        xml_lines.append(f'    <priority>{route["priority"]}</priority>')
        xml_lines.append(f'  </url>')

    for post in posts:
        slug = post.get("slug")
        if not slug:
            continue
        lastmod = post.get("updated_at") or post.get("created_at") or now_iso
        if "T" in lastmod:
            lastmod = lastmod.split("T")[0]
        xml_lines.append(f'  <url>')
        xml_lines.append(f'    <loc>{SITE_URL}/post/{slug}</loc>')
        xml_lines.append(f'    <lastmod>{lastmod}</lastmod>')
        xml_lines.append(f'    <changefreq>weekly</changefreq>')
        xml_lines.append(f'    <priority>0.8</priority>')
        xml_lines.append(f'  </url>')

    xml_lines.append('</urlset>')
    sitemap_content = "\n".join(xml_lines)

    for target in [os.path.join(out_dir, "sitemap.xml"), os.path.join("public", "sitemap.xml")]:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(sitemap_content)
    print(f"[Python SEO Script] Generated sitemap with {len(STATIC_ROUTES) + len(posts)} URLs.")

def generate_rss(posts, out_dir):
    """Generate RSS 2.0 feed."""
    now_rfc822 = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        '    <title>MD. Shinha Sarder</title>',
        f'    <link>{SITE_URL}</link>',
        '    <description>Articles, technology insights and publications by MD. Shinha Sarder.</description>',
        '    <language>en-US</language>',
        f'    <lastBuildDate>{now_rfc822}</lastBuildDate>',
        f'    <atom:link href="{SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>'
    ]

    for post in posts[:20]:
        title = (post.get("title") or "Article").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        excerpt = (post.get("excerpt") or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        slug = post.get("slug", "")
        xml_lines.append('    <item>')
        xml_lines.append(f'      <title>{title}</title>')
        xml_lines.append(f'      <link>{SITE_URL}/post/{slug}</link>')
        xml_lines.append(f'      <guid>{SITE_URL}/post/{slug}</guid>')
        xml_lines.append(f'      <description>{excerpt}</description>')
        xml_lines.append('    </item>')

    xml_lines.append('  </channel>')
    xml_lines.append('</rss>')
    rss_content = "\n".join(xml_lines)

    for target in [os.path.join(out_dir, "rss.xml"), os.path.join("public", "rss.xml")]:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(rss_content)
    print(f"[Python SEO Script] Generated RSS feed with {min(len(posts), 20)} items.")

def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "dist"
    print(f"[Python SEO Script] Running build script. Target directory: {out_dir}")
    posts = fetch_published_posts()
    generate_sitemap(posts, out_dir)
    generate_rss(posts, out_dir)
    print("[Python SEO Script] Build completed successfully!")

if __name__ == "__main__":
    main()
