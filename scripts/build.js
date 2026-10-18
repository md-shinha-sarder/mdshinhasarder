#!/usr/bin/env node
/**
 * Universal Production Build Pipeline for Vercel, Cloudflare Pages, and Local Environments
 * Guarantees NODE_ENV=production for Next.js Turbopack, runs Vite build for static dist,
 * pre-generates Blogger-style /p/*.html physical static pages, generates 404.html for Cloudflare Pages,
 * and builds all Sitemaps and RSS Feeds.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

process.env.NODE_ENV = "production";

function run(command, desc) {
  console.log(`\n▶ [Build Pipeline] ${desc} (${command})...`);
  execSync(command, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });
}

try {
  // 1. Build Vite SPA distribution into dist/
  run("npx vite build", "Building Vite SPA bundle");

  // 2. Pre-generate physical static /p/*.html files and 404.html for Cloudflare Pages
  const distDir = path.resolve("dist");
  const publicDir = path.resolve("public");
  const indexPath = path.join(distDir, "index.html");

  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, "utf8");

    // A. Generate dist/404.html so Cloudflare Pages serves our SPA bundle with 404 HTTP status
    const notFoundHtml = indexContent
      .replace(/<title>.*?<\/title>/, "<title>404 - MD. Shinha Sarder</title>")
      .replace(/<meta property="og:title" content=".*?" \/>/, '<meta property="og:title" content="404 - MD. Shinha Sarder" />');

    fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml);
    fs.writeFileSync(path.join(publicDir, "404.html"), notFoundHtml);
    console.log("✔ Created dist/404.html & public/404.html for Cloudflare Pages");

    // B. Generate physical static files for /p/*.html with exact SEO Titles
    const pageTitles = {
      "gallery.html": "Gallery",
      "biography.html": "Biography",
      "about.html": "Biography",
      "skills.html": "Skills",
      "projects.html": "Projects",
      "publication.html": "Publications",
      "publications.html": "Publications",
      "books.html": "Books",
      "songs.html": "Songs",
      "music.html": "Songs",
      "posts.html": "Blog",
      "blog.html": "Blog",
    };

    const distPDir = path.join(distDir, "p");
    const publicPDir = path.join(publicDir, "p");
    fs.mkdirSync(distPDir, { recursive: true });
    fs.mkdirSync(publicPDir, { recursive: true });

    for (const [pageName, titleName] of Object.entries(pageTitles)) {
      const pageTitle = `${titleName} - MD. Shinha Sarder`;
      const customizedHtml = indexContent
        .replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
        .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${pageTitle}" />`);

      fs.writeFileSync(path.join(distPDir, pageName), customizedHtml);
      fs.writeFileSync(path.join(publicPDir, pageName), customizedHtml);
    }
    console.log(`✔ Pre-rendered ${Object.keys(pageTitles).length} physical /p/*.html static files with custom SEO titles into dist/p/ & public/p/`);
  }

  // 3. Build Next.js Pages/SSG distribution into .next/ with NODE_ENV=production
  run("NODE_ENV=production npx next build", "Building Next.js distribution");

  // 4. Generate SEO Sitemaps and Feeds (into both public/ and dist/)
  run("node scripts/build_sitemap_rss.js dist", "Generating SEO Sitemaps and RSS/Atom feeds");

  // 5. Ensure Cloudflare Pages & static host redirect rules exist in dist/
  const pubRedirects = path.join(publicDir, "_redirects");
  const distRedirects = path.join(distDir, "_redirects");
  if (fs.existsSync(pubRedirects)) {
    fs.copyFileSync(pubRedirects, distRedirects);
  }

  const pubHeaders = path.join(publicDir, "_headers");
  const distHeaders = path.join(distDir, "_headers");
  if (fs.existsSync(pubHeaders)) {
    fs.copyFileSync(pubHeaders, distHeaders);
  }

  console.log("\n✔ [Build Pipeline] Full build completed successfully for Cloudflare Pages + Vercel + Next.js!\n");
} catch (err) {
  console.error("\n✖ [Build Pipeline] Build failed:", err.message);
  process.exit(1);
}
