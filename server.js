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

  // Dynamic Master & Image Sitemap Serving (Unified: Main Sitemap & Image Sitemap mixed together)
  if (req.url?.startsWith("/sitemap.xml") || req.url?.startsWith("/image-sitemap.xml")) {
    const isMainSitemap = req.url.startsWith("/sitemap.xml");
    const filename = isMainSitemap ? "sitemap.xml" : "image-sitemap.xml";
    const shouldRefresh = req.url.includes("refresh=1") || (Date.now() - lastImageSitemapGen > SITEMAP_REFRESH_INTERVAL);
    const sitemapPath = path.join(DIST_DIR, filename);
    const fallbackPath = path.join(PUBLIC_DIR, filename);

    const serveXml = (content) => {
      res.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, must-revalidate",
        "X-Sitemap-Type": "Google Unified Master Sitemap (URLs + Images Mixed)",
        "X-Robots-Tag": "noindex, follow",
      });
      res.end(content);
    };

    if (shouldRefresh || (!fs.existsSync(sitemapPath) && !fs.existsSync(fallbackPath))) {
      generateImageSitemap()
        .then(({ unifiedXml, xml }) => {
          lastImageSitemapGen = Date.now();
          serveXml(unifiedXml || xml);
        })
        .catch(() => {
          const target = fs.existsSync(sitemapPath) ? sitemapPath : fallbackPath;
          if (fs.existsSync(target)) {
            serveXml(fs.readFileSync(target, "utf-8"));
          } else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Failed to generate sitemap");
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

  // Media Registry API (GET and POST)
  if (req.url === "/api/media-registry" && req.method === "GET") {
    const regPath = path.join(PUBLIC_DIR, "media-registry.json");
    const distRegPath = path.join(DIST_DIR, "media-registry.json");
    const targetPath = fs.existsSync(regPath) ? regPath : (fs.existsSync(distRegPath) ? distRegPath : null);
    if (targetPath) {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(fs.readFileSync(targetPath, "utf-8"));
    } else {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end("[]");
    }
    return;
  }

  if (req.url === "/api/register-media" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const item = JSON.parse(body);
        const regPath = path.join(PUBLIC_DIR, "media-registry.json");
        const distRegPath = path.join(DIST_DIR, "media-registry.json");
        let list = [];
        if (fs.existsSync(regPath)) {
          try { list = JSON.parse(fs.readFileSync(regPath, "utf-8")); } catch (_) {}
        }
        // Update or add
        const cleanSlug = item.slug || item.name || "media";
        const idx = list.findIndex((x) => x.slug === cleanSlug || x.publicId === item.publicId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...item };
        } else {
          list.unshift(item);
        }
        fs.writeFileSync(regPath, JSON.stringify(list, null, 2), "utf-8");
        if (fs.existsSync(DIST_DIR)) {
          fs.writeFileSync(distRegPath, JSON.stringify(list, null, 2), "utf-8");
        }
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: true, count: list.length, item }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Save uploaded photo directly into public/images/ folder
  if (req.url === "/api/save-image" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const { fileName, base64, dataUrl } = JSON.parse(body);
        if (!fileName) throw new Error("fileName is required");
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const rawBase64 = base64 || (dataUrl ? dataUrl.split(";base64,").pop() : "");
        if (rawBase64) {
          const buffer = Buffer.from(rawBase64, "base64");
          const targetPublic = path.join(PUBLIC_DIR, "images", safeName);
          const targetDist = path.join(DIST_DIR, "images", safeName);
          if (!fs.existsSync(path.join(PUBLIC_DIR, "images"))) {
            fs.mkdirSync(path.join(PUBLIC_DIR, "images"), { recursive: true });
          }
          fs.writeFileSync(targetPublic, buffer);
          if (fs.existsSync(path.join(DIST_DIR, "images"))) {
            fs.writeFileSync(targetDist, buffer);
          }
        }
        const domainUrl = `https://mdshinhasarder.com/images/${safeName}`;
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: true, fileName: safeName, domainUrl }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Clear All sync registry & caches
  if (req.url === "/api/clear-all" && req.method === "POST") {
    try {
      const regPath = path.join(PUBLIC_DIR, "media-registry.json");
      fs.writeFileSync(regPath, JSON.stringify([], null, 2), "utf-8");
      if (fs.existsSync(DIST_DIR)) {
        fs.writeFileSync(path.join(DIST_DIR, "media-registry.json"), JSON.stringify([], null, 2), "utf-8");
      }
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ success: true, message: "Sync registry cleared" }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Batch Sync Photos from Blogger / External to public/images/ folder
  if (req.url === "/api/sync-photos" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { photos } = JSON.parse(body || "{}");
        if (!Array.isArray(photos)) throw new Error("photos array is required");

        const imagesDir = path.join(PUBLIC_DIR, "images");
        const distImagesDir = path.join(DIST_DIR, "images");
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
        if (fs.existsSync(DIST_DIR) && !fs.existsSync(distImagesDir)) fs.mkdirSync(distImagesDir, { recursive: true });

        const regPath = path.join(PUBLIC_DIR, "media-registry.json");
        let regList = [];
        if (fs.existsSync(regPath)) {
          try { regList = JSON.parse(fs.readFileSync(regPath, "utf-8")); } catch (_) {}
        }

        const synced = [];
        for (const item of photos) {
          if (!item || !item.url) continue;
          const cleanName = (item.filename || item.name || path.basename(item.url.split("?")[0]))
            .replace(/[^a-zA-Z0-9._-]/g, "-");
          const safeFilename = cleanName.includes(".") ? cleanName : `${cleanName}.jpg`;
          const targetPublic = path.join(imagesDir, safeFilename);
          const targetDist = path.join(distImagesDir, safeFilename);

          let downloaded = false;
          // Check if already on disk
          if (!fs.existsSync(targetPublic) || fs.statSync(targetPublic).size < 100) {
            if (item.url && (item.url.startsWith("http://") || item.url.startsWith("https://"))) {
              try {
                const fetchRes = await fetch(item.url, { headers: { "User-Agent": "Mozilla/5.0" } });
                if (fetchRes.ok) {
                  const arrBuf = await fetchRes.arrayBuffer();
                  const buf = Buffer.from(arrBuf);
                  fs.writeFileSync(targetPublic, buf);
                  if (fs.existsSync(distImagesDir)) fs.writeFileSync(targetDist, buf);
                  downloaded = true;
                }
              } catch (_err) {
                // skip download error gracefully
              }
            }
          } else {
            downloaded = true;
            if (fs.existsSync(distImagesDir) && !fs.existsSync(targetDist)) {
              fs.copyFileSync(targetPublic, targetDist);
            }
          }

          const domainUrl = `https://mdshinhasarder.com/images/${safeFilename}`;
          const regEntry = {
            slug: safeFilename,
            publicId: safeFilename.replace(/\.[^/.]+$/, ""),
            name: item.title || safeFilename,
            domainUrl,
            sourceUrl: item.url,
            syncedAt: new Date().toISOString(),
          };

          const existingIdx = regList.findIndex((r) => r.slug === safeFilename);
          if (existingIdx >= 0) {
            regList[existingIdx] = { ...regList[existingIdx], ...regEntry };
          } else {
            regList.push(regEntry);
          }

          synced.push({ filename: safeFilename, domainUrl, downloaded });
        }

        fs.writeFileSync(regPath, JSON.stringify(regList, null, 2), "utf-8");
        if (fs.existsSync(DIST_DIR)) {
          fs.writeFileSync(path.join(DIST_DIR, "media-registry.json"), JSON.stringify(regList, null, 2), "utf-8");
        }

        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: true, count: synced.length, synced }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  const cleanUrl = (req.url || "/").split("?")[0];

  // Helper to resolve media slug/publicId to Cloudinary or Registry URL
  const resolveCloudinaryRedirect = (rawSlug) => {
    const slug = decodeURIComponent(rawSlug || "").trim();
    if (!slug) return null;

    // 1. Check media-registry.json
    const regPath = path.join(PUBLIC_DIR, "media-registry.json");
    if (fs.existsSync(regPath)) {
      try {
        const list = JSON.parse(fs.readFileSync(regPath, "utf-8"));
        const found = list.find((x) => x.slug === slug || x.publicId === slug || x.name === slug);
        if (found && (found.cloudinaryUrl || found.sourceUrl)) {
          return found.cloudinaryUrl || found.sourceUrl;
        }
      } catch (_) {}
    }

    // 2. Direct Cloudinary mapping
    const publicId = slug.replace(/\.[^/.]+$/, "");
    return `https://res.cloudinary.com/borle8go/image/upload/f_auto,q_auto/${slug.includes(".") ? slug : publicId}`;
  };

  // Domain Media Redirect: /media/:slug and /cld/:slug automatically 302 redirect to Cloudinary CDN
  if (cleanUrl.startsWith("/media/") || cleanUrl.startsWith("/cld/")) {
    const rawSlug = cleanUrl.replace(/^\/(media|cld)\//, "");
    if (rawSlug) {
      const targetUrl = resolveCloudinaryRedirect(rawSlug);
      if (targetUrl) {
        res.writeHead(302, {
          "Location": targetUrl,
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
          "X-Redirect-By": "MD-Shinha-Sarder-Cloudinary-Router",
        });
        res.end();
        return;
      }
    }
  }

  // Robust /images/* handler: Never 404, serve directly from disk, or proxy-cache on-the-fly
  if (cleanUrl.startsWith("/images/")) {
    const filename = cleanUrl.replace(/^\/images\//, "");
    const targetPublic = path.join(PUBLIC_DIR, "images", filename);
    const targetDist = path.join(DIST_DIR, "images", filename);

    // 1. If exists in public/images/
    if (fs.existsSync(targetPublic) && fs.statSync(targetPublic).isFile()) {
      if (fs.existsSync(path.join(DIST_DIR, "images")) && !fs.existsSync(targetDist)) {
        try { fs.copyFileSync(targetPublic, targetDist); } catch (_) {}
      }
      const ext = path.extname(targetPublic).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "image/jpeg",
        "Cache-Control": "public, max-age=86400, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      });
      fs.createReadStream(targetPublic).pipe(res);
      return;
    }

    // 2. If exists in dist/images/
    if (fs.existsSync(targetDist) && fs.statSync(targetDist).isFile()) {
      const ext = path.extname(targetDist).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "image/jpeg",
        "Cache-Control": "public, max-age=86400, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      });
      fs.createReadStream(targetDist).pipe(res);
      return;
    }

    // 3. File not yet on disk: Fetch from Cloudinary or upstream, stream to client, and save to disk
    const targetUrl = resolveCloudinaryRedirect(filename);
    if (targetUrl) {
      fetch(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } })
        .then(async (upRes) => {
          if (upRes.ok) {
            const cType = upRes.headers.get("content-type") || "image/jpeg";
            const arr = await upRes.arrayBuffer();
            const buf = Buffer.from(arr);
            try {
              if (!fs.existsSync(path.join(PUBLIC_DIR, "images"))) {
                fs.mkdirSync(path.join(PUBLIC_DIR, "images"), { recursive: true });
              }
              fs.writeFileSync(targetPublic, buf);
              if (fs.existsSync(path.join(DIST_DIR, "images"))) {
                fs.writeFileSync(targetDist, buf);
              }
            } catch (_) {}
            res.writeHead(200, {
              "Content-Type": cType,
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*",
              "X-Auto-Saved": "public/images",
            });
            res.end(buf);
          } else {
            // Upstream not 200, redirect to Cloudinary URL or fallback
            res.writeHead(302, {
              "Location": targetUrl,
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*",
            });
            res.end();
          }
        })
        .catch(() => {
          // If network failed, serve hero portrait fallback
          const fallbackPortrait = path.join(PUBLIC_DIR, "hero-portrait.jpg");
          if (fs.existsSync(fallbackPortrait)) {
            res.writeHead(200, { "Content-Type": "image/jpeg", "Access-Control-Allow-Origin": "*" });
            fs.createReadStream(fallbackPortrait).pipe(res);
          } else {
            res.writeHead(302, { "Location": targetUrl });
            res.end();
          }
        });
      return;
    }
  }

  let filePath = path.join(DIST_DIR, cleanUrl);
  let publicFallbackPath = path.join(PUBLIC_DIR, cleanUrl);

  // Check if file exists in dist or public
  let targetFile = null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    targetFile = filePath;
  } else if (fs.existsSync(publicFallbackPath) && fs.statSync(publicFallbackPath).isFile()) {
    targetFile = publicFallbackPath;
  }

  if (targetFile) {
    const ext = path.extname(targetFile).toLowerCase();
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
    fs.createReadStream(targetFile).pipe(res);
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Node.js Production Server running at http://0.0.0.0:${PORT}`);
});
