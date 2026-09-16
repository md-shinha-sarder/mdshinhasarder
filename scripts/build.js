#!/usr/bin/env node
/**
 * Universal Production Build Pipeline for Vercel, Cloudflare Pages, and Local Environments
 * Guarantees NODE_ENV=production for Next.js Turbopack, runs Vite build for static dist,
 * and generates all Sitemaps and RSS Feeds.
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

  // 2. Build Next.js Pages/SSG distribution into .next/
  run("npx next build", "Building Next.js distribution");

  // 3. Generate SEO Sitemaps and Feeds (into both public/ and dist/)
  run("node scripts/build_sitemap_rss.js dist", "Generating SEO Sitemaps and RSS/Atom feeds");

  // 4. Ensure Cloudflare Pages & static host redirect rules exist in dist/
  const distDir = path.resolve("dist");
  const pubRedirects = path.resolve("public", "_redirects");
  const distRedirects = path.join(distDir, "_redirects");
  if (fs.existsSync(pubRedirects) && !fs.existsSync(distRedirects)) {
    fs.copyFileSync(pubRedirects, distRedirects);
  }

  const pubHeaders = path.resolve("public", "_headers");
  const distHeaders = path.join(distDir, "_headers");
  if (fs.existsSync(pubHeaders) && !fs.existsSync(distHeaders)) {
    fs.copyFileSync(pubHeaders, distHeaders);
  }

  console.log("\n✔ [Build Pipeline] Full build completed successfully for Cloudflare + Vercel + Next.js!\n");
} catch (err) {
  console.error("\n✖ [Build Pipeline] Build failed:", err.message);
  process.exit(1);
}
