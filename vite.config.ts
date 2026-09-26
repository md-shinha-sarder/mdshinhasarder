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
        if (url === "/image-sitemap.xml") {
          try {
            const { generateImageSitemap } = await import("./scripts/generate_image_sitemap.js");
            const { xml } = await generateImageSitemap();
            res.setHeader("Content-Type", "application/xml; charset=utf-8");
            res.setHeader("X-Sitemap-Type", "Google Image Sitemap 1.1 Dynamic Service");
            res.end(xml);
            return;
          } catch (e: any) {
            console.error("[Dynamic Image Sitemap Dev Middleware Error]:", e);
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
