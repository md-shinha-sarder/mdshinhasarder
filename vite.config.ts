import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function dynamicImageSitemapPlugin() {
  return {
    name: "dynamic-image-sitemap-plugin",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split("?")[0];
        if (url === "/sitemap.xml" || url === "/image-sitemap.xml") {
          try {
            const { generateImageSitemap } = await import("./scripts/generate_image_sitemap.js");
            const { unifiedXml, xml } = await generateImageSitemap();
            res.setHeader("Content-Type", "application/xml; charset=utf-8");
            res.setHeader("X-Sitemap-Type", "Google Unified Master Sitemap (URLs + Images Mixed)");
            res.end(unifiedXml || xml);
            return;
          } catch (e: any) {
            console.error("[Dynamic Unified Sitemap Dev Middleware Error]:", e);
            next();
          }
          return;
        }
        if (url === "/api/generate-image-sitemap" || url === "/api/image-sitemap/regenerate") {
          try {
            const { generateImageSitemap } = await import("./scripts/generate_image_sitemap.js");
            const { stats } = await generateImageSitemap();
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ success: true, message: "Dynamic Image Sitemap successfully generated", stats }));
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ success: false, error: e.message }));
            return;
          }
        }

        // Vite dev middleware for /api/save-image
        if (url === "/api/save-image" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => { body += chunk; });
          req.on("end", async () => {
            try {
              const { fileName, base64, dataUrl } = JSON.parse(body);
              if (!fileName) throw new Error("fileName is required");
              const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
              const rawBase64 = base64 || (dataUrl ? dataUrl.split(";base64,").pop() : "");
              if (rawBase64) {
                const fs = await import("fs");
                const path = await import("path");
                const buffer = Buffer.from(rawBase64, "base64");
                const targetPublic = path.resolve(process.cwd(), "public", "images", safeName);
                fs.mkdirSync(path.dirname(targetPublic), { recursive: true });
                fs.writeFileSync(targetPublic, buffer);
              }
              const domainUrl = `https://mdshinhasarder.com/images/${safeName}`;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ success: true, fileName: safeName, domainUrl }));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Vite dev middleware for /api/clear-all
        if (url === "/api/clear-all" && req.method === "POST") {
          try {
            const fs = await import("fs");
            const path = await import("path");
            const regPath = path.resolve(process.cwd(), "public", "media-registry.json");
            fs.writeFileSync(regPath, JSON.stringify([], null, 2), "utf-8");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ success: true, message: "Sync registry cleared" }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        // Vite dev middleware for /api/sync-photos
        if (url === "/api/sync-photos" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => { body += chunk; });
          req.on("end", async () => {
            try {
              const { photos } = JSON.parse(body || "{}");
              if (!Array.isArray(photos)) throw new Error("photos array is required");
              const fs = await import("fs");
              const path = await import("path");
              const imagesDir = path.resolve(process.cwd(), "public", "images");
              fs.mkdirSync(imagesDir, { recursive: true });

              const regPath = path.resolve(process.cwd(), "public", "media-registry.json");
              let regList: any[] = [];
              if (fs.existsSync(regPath)) {
                try { regList = JSON.parse(fs.readFileSync(regPath, "utf-8")); } catch (_e) { void _e; }
              }

              const synced: any[] = [];
              for (const item of photos) {
                if (!item || !item.url) continue;
                const cleanName = (item.filename || item.name || path.basename(item.url.split("?")[0]))
                  .replace(/[^a-zA-Z0-9._-]/g, "-");
                const safeFilename = cleanName.includes(".") ? cleanName : `${cleanName}.jpg`;
                const targetPublic = path.join(imagesDir, safeFilename);

                let downloaded = false;
                if (!fs.existsSync(targetPublic) || fs.statSync(targetPublic).size < 100) {
                  if (item.url && (item.url.startsWith("http://") || item.url.startsWith("https://"))) {
                    try {
                      const fetchRes = await fetch(item.url, { headers: { "User-Agent": "Mozilla/5.0" } });
                      if (fetchRes.ok) {
                        const arrBuf = await fetchRes.arrayBuffer();
                        fs.writeFileSync(targetPublic, Buffer.from(arrBuf));
                        downloaded = true;
                      }
                    } catch (_e) { void _e; }
                  }
                } else {
                  downloaded = true;
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
                const idx = regList.findIndex((r) => r.slug === safeFilename);
                if (idx >= 0) regList[idx] = { ...regList[idx], ...regEntry };
                else regList.push(regEntry);

                synced.push({ filename: safeFilename, domainUrl, downloaded });
              }

              fs.writeFileSync(regPath, JSON.stringify(regList, null, 2), "utf-8");
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ success: true, count: synced.length, synced }));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Vite dev middleware for /api/media-registry and /api/register-media
        if (url === "/api/media-registry" && req.method === "GET") {
          const fs = await import("fs");
          const path = await import("path");
          const regPath = path.resolve(process.cwd(), "public", "media-registry.json");
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(fs.existsSync(regPath) ? fs.readFileSync(regPath, "utf-8") : "[]");
          return;
        }

        if (url === "/api/register-media" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => { body += chunk; });
          req.on("end", async () => {
            try {
              const item = JSON.parse(body);
              const fs = await import("fs");
              const path = await import("path");
              const regPath = path.resolve(process.cwd(), "public", "media-registry.json");
              let list: any[] = [];
              if (fs.existsSync(regPath)) {
                try { list = JSON.parse(fs.readFileSync(regPath, "utf-8")); } catch (_e) { void _e; }
              }
              const cleanSlug = item.slug || item.name || "media";
              const idx = list.findIndex((x) => x.slug === cleanSlug || x.publicId === item.publicId);
              if (idx >= 0) list[idx] = { ...list[idx], ...item };
              else list.unshift(item);
              fs.writeFileSync(regPath, JSON.stringify(list, null, 2), "utf-8");
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ success: true, count: list.length, item }));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), dynamicImageSitemapPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
