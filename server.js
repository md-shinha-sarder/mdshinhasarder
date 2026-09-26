import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateImageSitemap } from "./scripts/generate_image_sitemap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "dist");
const PUBLIC_DIR = path.resolve(__dirname, "public");
const PORT = process.env.PORT || 3000;

let lastImageSitemapGen = 0;
const SITEMAP_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes cache

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health" || req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    return;
  }

  // Dynamic Image Sitemap Generation & Trigger API
  if (req.url === "/api/generate-image-sitemap" || req.url === "/api/image-sitemap/regenerate") {
    generateImageSitemap()
      .then(({ stats }) => {
        lastImageSitemapGen = Date.now();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Dynamic Image Sitemap successfully generated", stats }));
      })
      .catch((err) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
    return;
  }

  // Dynamic Image Sitemap Serving (with auto-refresh)
  if (req.url?.startsWith("/image-sitemap.xml")) {
    const shouldRefresh = req.url.includes("refresh=1") || (Date.now() - lastImageSitemapGen > SITEMAP_REFRESH_INTERVAL);
    const sitemapPath = path.join(DIST_DIR, "image-sitemap.xml");
    const fallbackPath = path.join(PUBLIC_DIR, "image-sitemap.xml");

    const serveXml = (content) => {
      res.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, must-revalidate",
        "X-Sitemap-Type": "Google Image Sitemap 1.1 Dynamic Service",
        "X-Robots-Tag": "noindex, follow",
      });
      res.end(content);
    };

    if (shouldRefresh || (!fs.existsSync(sitemapPath) && !fs.existsSync(fallbackPath))) {
      generateImageSitemap()
        .then(({ xml }) => {
          lastImageSitemapGen = Date.now();
          serveXml(xml);
        })
        .catch(() => {
          // Serve existing if generation errors
          const target = fs.existsSync(sitemapPath) ? sitemapPath : fallbackPath;
          if (fs.existsSync(target)) {
            serveXml(fs.readFileSync(target, "utf-8"));
          } else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Failed to generate image sitemap");
          }
        });
      return;
    }

    const target = fs.existsSync(sitemapPath) ? sitemapPath : fallbackPath;
    if (fs.existsSync(target)) {
      serveXml(fs.readFileSync(target, "utf-8"));
      return;
    }
  }

  const cleanUrl = (req.url || "/").split("?")[0];
  let filePath = path.join(DIST_DIR, cleanUrl);

  // Check if file exists in dist
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const headers = {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Powered-By": "Next.js/16.2.0, Node.js",
        "Server": "Node.js/22.14.0 (Next.js 16)",
        "X-Nextjs-Version": "16.2.0",
        "X-Framework": "Next.js 16.2.0",
        "X-CMS": "Supabase CMS, Headless Next.js CMS",
        "X-CDN-Delivery": "jsDelivr, cdnjs, Cloudflare",
      };

      if (cleanUrl.startsWith("/assets/")) {
        headers["Cache-Control"] = "public, max-age=31536000, immutable";
      } else {
        headers["Cache-Control"] = "public, max-age=3600, must-revalidate";
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback: Serve index.html for all client-side routes
    const indexPath = path.join(DIST_DIR, "index.html");
    fs.readFile(indexPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("App not built yet. Run 'npm run build' first.");
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "X-Powered-By": "Next.js/16.2.0, Node.js",
        "Server": "Node.js/22.14.0 (Next.js 16)",
        "X-Nextjs-Version": "16.2.0",
        "X-Framework": "Next.js 16.2.0",
        "X-CMS": "Supabase CMS, Headless Next.js CMS",
        "X-CDN-Delivery": "jsDelivr, cdnjs, Cloudflare",
      });
      res.end(content);
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Node.js Production Server running at http://0.0.0.0:${PORT}`);
});
