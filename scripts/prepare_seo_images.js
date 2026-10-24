#!/usr/bin/env node
/**
 * scripts/prepare_seo_images.js
 * Creates the public/images directory and populates it with all SEO-optimized images
 * matching the canonical format:
 *   https://mdshinhasarder.com/images/${captionName}.${imageFileName}.${ext}
 * Also downloads/copies all book covers, track artworks, and verified portraits
 * so they are physically hosted on https://mdshinhasarder.com/images/ for Google Image Search.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const DIST_IMAGES_DIR = path.join(ROOT_DIR, "dist", "images");

// Ensure directories exist
fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (fs.existsSync(path.join(ROOT_DIR, "dist"))) {
  fs.mkdirSync(DIST_IMAGES_DIR, { recursive: true });
}

function slugify(text) {
  if (!text) return "image";
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
      return resolve(true);
    }
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
        resolve(true);
      });
      stream.on("error", () => resolve(false));
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function prepareImages() {
  console.log("▶ [SEO Images] Preparing and hosting all images under https://mdshinhasarder.com/images/...");

  // 1. Copy local portraits & assets with SEO caption names
  const localAssets = [
    {
      file: "profile.webp",
      caption: "md-shinha-sarder-official-portrait",
      ext: "webp",
    },
    {
      file: "profile-photo.webp",
      caption: "md-shinha-sarder-executive-founder",
      ext: "webp",
    },
    {
      file: "hero-portrait.jpg",
      caption: "md-shinha-sarder-author-researcher",
      ext: "jpg",
    },
    {
      file: "hero-bg.jpg",
      caption: "md-shinha-sarder-creative-tech-studio",
      ext: "jpg",
    },
    {
      file: "favicon.webp",
      caption: "md-shinha-sarder-brand-emblem",
      ext: "webp",
    },
    {
      file: "site-logo.ico",
      caption: "md-shinha-sarder-official-logo",
      ext: "ico",
    },
  ];

  for (const asset of localAssets) {
    const srcPath = path.join(PUBLIC_DIR, asset.file);
    if (fs.existsSync(srcPath)) {
      // Direct raw filename
      fs.copyFileSync(srcPath, path.join(IMAGES_DIR, asset.file));
      // Caption format: [caption].[filename].[ext]
      const captionFileName = `${asset.caption}.${asset.file}`;
      fs.copyFileSync(srcPath, path.join(IMAGES_DIR, captionFileName));
      // Short caption format: [caption].[ext]
      const shortCaptionFileName = `${asset.caption}.${asset.ext}`;
      fs.copyFileSync(srcPath, path.join(IMAGES_DIR, shortCaptionFileName));
    }
  }

  // 2. Books Covers
  const books = [
    { title: "From Khulna to the Cloud A Young Creators Diary", file: "from-khulna-cloud", url: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Days of a Dreaming Boy Edition 2", file: "days-dreaming-boy", url: "https://books.google.com/books/content?id=z_eEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Artificial Intelligence Shaping the Future of Humanity", file: "artificial-intelligence", url: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Life in Lines Poems of Hope and Heartache", file: "life-in-lines", url: "https://books.google.com/books/content?id=e6uAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Whispers of Tomorrow Reflections of a Young Mind", file: "whispers-of-tomorrow", url: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Beyond the Screen Lessons from Life and Tech", file: "beyond-the-screen", url: "https://books.google.com/books/content?id=pqd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "From Village to Virtual The Journey of MD Shinha Sarder", file: "from-village-to-virtual", url: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg" },
    { title: "ICT Fundamentals for the 21st Century Learn", file: "ict-fundamentals", url: "https://m.media-amazon.com/images/I/31Fx5ANnI9L._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg" },
    { title: "Social Media Learner Simple Guide", file: "social-media-learner", url: "https://pbs.twimg.com/profile_images/2091609328210030592/42OjWBAO_400x400.jpg" },
    { title: "Lifestyle of MD Shinha Sarder", file: "lifestyle-of-md-shinha-sarder", url: "https://wikigence.org/images/thumb/f/f0/MD._Shinha_Sarder.png/300px-MD._Shinha_Sarder.png" },
    { title: "Mastering The Google Knowledge Panel", file: "mastering-google-knowledge-panel", url: "https://wikialpha.co/images/thumb/6/61/MD._Shinha_Sarder.jpg/600px-MD._Shinha_Sarder.jpg" },
    { title: "Computer and Technology Mastering Modern Tech", file: "computer-and-technology", url: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Computer Science and Info Communication", file: "computer-science-info-communication", url: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Graph Theory with Applications to Engineering", file: "graph-theory-engineering", url: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Mastering C Plus Plus Programming Language", file: "mastering-cpp-programming", url: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "The Entrepreneur Journey Biography MD Shinha Sarder", file: "entrepreneur-journey-biography", url: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg" },
    { title: "Journey of Koyra To Khulna A Simple Story Guide", file: "journey-of-koyra-to-khulna", url: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { title: "Data Structure Principles and Algorithmic Analysis", file: "data-structure-principles", url: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
  ];

  for (const b of books) {
    const slug = slugify(b.title);
    const captionPath = path.join(IMAGES_DIR, `${slug}.${b.file}.jpg`);
    const shortPath = path.join(IMAGES_DIR, `${slug}.jpg`);
    const directPath = path.join(IMAGES_DIR, `${b.file}.jpg`);

    const ok = await downloadImage(b.url, shortPath);
    if (ok) {
      try {
        fs.copyFileSync(shortPath, captionPath);
        fs.copyFileSync(shortPath, directPath);
      } catch {}
    } else {
      // Fallback copy portrait so the file always exists
      const fallbackSrc = path.join(PUBLIC_DIR, "hero-portrait.jpg");
      if (fs.existsSync(fallbackSrc)) {
        try {
          fs.copyFileSync(fallbackSrc, shortPath);
          fs.copyFileSync(fallbackSrc, captionPath);
          fs.copyFileSync(fallbackSrc, directPath);
        } catch {}
      }
    }
  }

  // 3. Songs & Deezer Covers
  const deezerCoverUrl = "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg";
  const songBaseDest = path.join(IMAGES_DIR, "md-shinha-sarder-musical-artist.deezer.jpg");
  await downloadImage(deezerCoverUrl, songBaseDest);

  const songs = [
    "No Stars Heard Our Pain",
    "Fading Love in Quiet Shadows",
    "Lost Between Love and Pride",
    "Love Whispered but You Left",
    "Pagol Mon Kra",
    "Fajr Azan",
    "Echoes in the Rain",
    "Night Drift in Khulna",
    "Shadows on the Wall",
    "Silent Horizon",
    "Whispers in the Dark",
    "Tears of the Cloud",
    "Midnight Solitude",
    "Breathe in Stillness",
    "Dreamers Journey",
  ];

  for (const s of songs) {
    const slug = slugify(s);
    const captionPath = path.join(IMAGES_DIR, `${slug}.track-art.jpg`);
    const shortPath = path.join(IMAGES_DIR, `${slug}.jpg`);
    if (fs.existsSync(songBaseDest)) {
      try {
        fs.copyFileSync(songBaseDest, captionPath);
        fs.copyFileSync(songBaseDest, shortPath);
      } catch {}
    }
  }

  // 4. Sync everything into dist/images if dist exists
  if (fs.existsSync(path.join(ROOT_DIR, "dist"))) {
    const files = fs.readdirSync(IMAGES_DIR);
    for (const f of files) {
      fs.copyFileSync(path.join(IMAGES_DIR, f), path.join(DIST_IMAGES_DIR, f));
    }
    console.log(`✔ Synced ${files.length} images into dist/images/`);

    const publicMediaDir = path.join(PUBLIC_DIR, "media");
    const distMediaDir = path.join(ROOT_DIR, "dist", "media");
    if (fs.existsSync(publicMediaDir)) {
      fs.cpSync(publicMediaDir, distMediaDir, { recursive: true });
      console.log("✔ Synced public/media/ into dist/media/");
    }
  }

  const allReadyFiles = fs.readdirSync(IMAGES_DIR);
  console.log(`✔ [SEO Images] Generated & prepared ${allReadyFiles.length} canonical image files in public/images/ on domain mdshinhasarder.com`);
}

prepareImages().catch((e) => console.warn("[SEO Images] Warning:", e.message));
