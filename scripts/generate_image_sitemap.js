/**
 * scripts/generate_image_sitemap.js
 * Dynamic Google Image Search Sitemap Generation Service
 * Automatically crawls and indexes ALL image assets across the entire application:
 * - High-resolution verified portraits & studio workspace assets
 * - All published book covers (Chaptra, Google Books, Amazon, Blogger CDN)
 * - All music album artwork & YouTube HD video thumbnails
 * - All Blogger & Supabase post featured covers & in-content embedded <img> photos
 * - Entity recognition images (WikiAlpha, WikiGence)
 * Designed for Rank #1 Google Image Search indexing with full Schema 1.1 specs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SITE_URL = "https://mdshinhasarder.com";
const GEO_LOCATION = "Khulna, Bangladesh";
const LICENSE_URL = "https://mdshinhasarder.com/copyright";

function xmlEscape(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanUrl(url) {
  if (!url) return "";
  let u = String(url).trim();
  if (u.startsWith("/")) {
    u = `${SITE_URL}${u}`;
  }
  return u.replace(/&amp;/g, "&");
}

// 1. Author Books Catalog
const BOOK_CATALOG = [
  {
    title: "From Khulna to the Cloud: A Young Creator’s Diary",
    cover: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "from-khulna-cloud-7veEEQAA",
    category: "Memoir & Technology",
    description: "From Khulna to the Cloud: A Young Creator’s Diary by MD. Shinha Sarder navigating tech, digital media, and entrepreneurship.",
  },
  {
    title: "Days of a Dreaming Boy – Edition 2",
    cover: "https://books.google.com/books/content?id=z_eEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "days-dreaming-boy-z_eEEQAA",
    category: "Biography & Memoir",
    description: "Inspiring journey through the life of MD. Shinha Sarder from Shirgati village, Khulna, to a visionary leader in computing.",
  },
  {
    title: "Artificial Intelligence: Shaping the Future of Humanity",
    cover: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "artificial-intelligence-by-md-shinha-sarder-fjSEEQAA",
    category: "Computer Science & AI",
    description: "Comprehensive exploration of artificial intelligence, machine learning, deep learning paradigms by author MD. Shinha Sarder.",
  },
  {
    title: "Life in Lines: Poems of Hope and Heartache",
    cover: "https://books.google.com/books/content?id=e6uAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "life-in-lines-poems-of-hope-heartache-e6uAEQAA",
    category: "Poetry & Literature",
    description: "Poetic anthology capturing emotions of resilience, nostalgia, quiet solitude, and perseverance by MD. Shinha Sarder.",
  },
  {
    title: "Whispers of Tomorrow: Reflections of a Young Mind",
    cover: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "whispers-of-tomorrow-y3KAEQAA",
    category: "Philosophy & Essays",
    description: "Philosophical musings and youthful reflections on society, technology, ambition, and personal destiny by MD. Shinha Sarder.",
  },
  {
    title: "Beyond the Screen: Lessons from Life and Tech",
    cover: "https://books.google.com/books/content?id=pqd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "beyond-the-screen-pqd-EQAA",
    category: "Technology & Self-Improvement",
    description: "Practical insights and life lessons from late-night programming, digital content creation, startup building by MD. Shinha Sarder.",
  },
  {
    title: "From Village to Virtual: The Journey of MD. Shinha Sarder",
    cover: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
    slug: "from-village-to-virtual",
    category: "Biography & Memoir",
    description: "Biographical account of upbringing in Shirgati village, secondary schooling in Khulna, and progression into digital venture creation.",
  },
  {
    title: "ICT Fundamentals for the 21st Century Learn",
    cover: "https://m.media-amazon.com/images/I/31Fx5ANnI9L._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
    slug: "ict-fundamentals-21st-century",
    category: "Technology & Education",
    description: "Fundamental computational concepts covering hardware architectures, operating system operations, data communications by MD. Shinha Sarder.",
  },
  {
    title: "Social Media Learner: Simple Guide",
    cover: "https://pbs.twimg.com/profile_images/2091609328210030592/42OjWBAO_400x400.jpg",
    slug: "social-media-learner-simple-guide",
    category: "Digital Marketing",
    description: "Creator storytelling, personal branding, audience engagement metrics, and organic growth across video streaming platforms.",
  },
  {
    title: "Lifestyle of MD. Shinha Sarder",
    cover: "https://wikigence.org/images/thumb/f/f0/MD._Shinha_Sarder.png/300px-MD._Shinha_Sarder.png",
    slug: "lifestyle-of-md-shinha-sarder",
    category: "Productivity & Lifestyle",
    description: "Personal routines, daily habits, study disciplines, and productivity frameworks balancing CSE studies at NUBTK with entrepreneurial management.",
  },
  {
    title: "The Musical Journey of MD. Shinha Sarder",
    cover: "https://blogger.googleusercontent.com/img/a/AVvXsEjUVdjtfSdSBJ_caM3ppA0qOh9ASSCQA7sbOHBIzL0nS-QElPDS0WuJ6ToWG3sRjsNaxm1_fJ2u1PRGD29r4UZYh3Kj5GoXB-oSAmcI7L7MjtF8-BBX0BiOx6Lh2aRDvmmQhPAKvw4qQ8eTHE85MZlj_OfqWBBWItWP-Hl3ITk3vFhG0WXYmWaUxIbOU0SH",
    slug: "the-musical-journey-of-md-shinha-sarder",
    category: "Music & Composition",
    description: "Exploration into musical creativity, composing ambient melodies, digital synthesizers, and artistic releases on Spotify and Deezer.",
  },
  {
    title: "Mastering The Google Knowledge Panel",
    cover: "https://wikialpha.co/images/thumb/6/61/MD._Shinha_Sarder.jpg/600px-MD._Shinha_Sarder.jpg",
    slug: "mastering-google-knowledge-panel",
    category: "SEO & Digital Identity",
    description: "Authoritative handbook on entity recognition, Schema.org semantic web standards, Google Knowledge Graph verification by MD. Shinha Sarder.",
  },
  {
    title: "The Musical Artist As a Shinha",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQV79hudXoSC3A3-63meKOFFLT-Um2ZMI_i3U65Qo6hitbx9o1eyq9vN6HZUD7NV_dI7ndaPm6l7P4h0crBvneHt4ueHVdP4koqJOMNEoBnvmnIwH7oM4ac_2HnwOvdvrgsz2twPB1mY-c8q5eCkDVCgws_iesMFEk9fnK0o9rdhPou_wyAEsKnbEraNbb/s266/1000020228.jpg",
    slug: "the-musical-artist-as-a-shinha",
    category: "Artistic Expression",
    description: "Reflections on auditory emotion, instrumental composition, song arrangements, and expressive soundscapes in modern instrumental music.",
  },
  {
    title: "The Entrepreneur as a MD. Shinha Sarder",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSCdw5RbTH6ybaehBxCcypBWf4yjoNIRCJ_ypZKPjIqai6nSNvJuvItYuExsxn7PYBag0jGRAcGhZm7hFq-Af2H4RvotQ6FZboVU7xqZXGKcdTrRcNb1I8PIBFt-DodExGBlzJvGnENFykTObfQmm9AdYE4Q15M3QwdKv70dA-Te6B2GFTR4IlwvXzsP0t/w646-h180-rw/Screenshot%202025-07-02%20191141.png",
    slug: "the-entrepreneur-as-a-md-shinha-sarder",
    category: "Business & Startups",
    description: "Insights on founding IT Tech BD, managing Biostar TV World, startup strategy, tech venture leadership by MD. Shinha Sarder.",
  },
  {
    title: "Computer and Technology: Mastering Modern Tech",
    cover: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "computer-and-technology",
    category: "Computer Science",
    description: "Curriculum guide for computer science students detailing practical software architecture, database management systems, and network infrastructure.",
  },
  {
    title: "Computer Science and Info-Communication",
    cover: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "computer-science-info-communication",
    category: "Computer Science",
    description: "Introductory to intermediate principles of telecommunications, computer networks, protocol stacks, and internet systems.",
  },
  {
    title: "Graph Theory with Applications to Engineering",
    cover: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "graph-theory-engineering",
    category: "Computer Science & Engineering",
    description: "Analytical monograph exploring structural discrete graph algorithms, spanning trees, Hamiltonian cycles, network flows by MD. Shinha Sarder.",
  },
  {
    title: "Python Programming Analysis and Review Explained by Developer MD. Shinha Sarder",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQV79hudXoSC3A3-63meKOFFLT-Um2ZMI_i3U65Qo6hitbx9o1eyq9vN6HZUD7NV_dI7ndaPm6l7P4h0crBvneHt4ueHVdP4koqJOMNEoBnvmnIwH7oM4ac_2HnwOvdvrgsz2twPB1mY-c8q5eCkDVCgws_iesMFEk9fnK0o9rdhPou_wyAEsKnbEraNbb/s266/1000020228.jpg",
    slug: "python-programming-analysis-review",
    category: "Computer Science & Python",
    description: "Technical analysis and developer review of Python in modern computing, exploring automated data pipelines and software design principles.",
  },
  {
    title: "Mastering C++ Programming Language: Professional C++ Development",
    cover: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "mastering-cpp-programming-language",
    category: "Programming & Software Engineering",
    description: "Professional developer handbook exploring modern C++20/C++23 standards, memory management, pointer safety, and high-performance algorithms.",
  },
  {
    title: "The Entrepreneur Journey: Biography - MD. Shinha Sarder",
    cover: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
    slug: "the-entrepreneur-journey-biography",
    category: "Biography & Entrepreneurship",
    description: "Chronicles the entrepreneurial journey of MD. Shinha Sarder from Shirgati village and Khulna to founding IT Tech BD and Biostar TV World.",
  },
  {
    title: "Journey of Koyra To Khulna: A Simple Story Guide",
    cover: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "journey-of-koyra-to-khulna",
    category: "Memoir & Regional History",
    description: "A personal narrative and descriptive story guide capturing the journey from coastal Koyra to the city of Khulna by MD. Shinha Sarder.",
  },
  {
    title: "Data Structure: Principles & Algorithmic Analysis",
    cover: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    slug: "data-structure-cse-principles",
    category: "Computer Science & Engineering",
    description: "Foundational computer science reference detailing linear and non-linear data structures, trees, graphs, sorting mechanisms.",
  },
];

// 2. Songs & Musical Works Catalog
const SONG_CATALOG = [
  {
    title: "No Stars Heard Our Pain",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "dQMyeL9CDks",
    genre: "Orchestral / Ambient",
    year: "2025",
    description: "Poignant orchestral reflection capturing solitary quietude and emotional depth with strings and piano by musical artist MD. Shinha Sarder.",
  },
  {
    title: "Fading Love in Quiet Shadows",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "torYsa30kik",
    genre: "Ambient / Classical",
    year: "2025",
    description: "Introspective cinematic composition weaving ambient reverberations with gentle classical chord progressions by MD. Shinha Sarder.",
  },
  {
    title: "Lost Between Love and Pride",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "c8P76CI9ZJY",
    genre: "Cinematic Pop",
    year: "2025",
    description: "Atmospheric textures blend with dramatic piano cadences exploring personal conflict and resolution by MD. Shinha Sarder.",
  },
  {
    title: "Love Whispered but You Left",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "gbtwQC2c71c",
    genre: "Neo-Classical",
    year: "2025",
    description: "Evocative string ensembles and subtle wind harmonies depicting lingering memories by musical artist MD. Shinha Sarder.",
  },
  {
    title: "Pagol Mon Kra",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "ogzm5SsMc18",
    genre: "Folk Fusion",
    year: "2025",
    description: "Bengali folk melody traditions reimagined through acoustic modern arrangement by MD. Shinha Sarder.",
  },
  {
    title: "Fajr Azan",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "URXjye9UIHk",
    genre: "Spiritual / Ambient",
    year: "2025",
    description: "Serene spiritual soundscape inspired by the tranquil dawn call to prayer with delicate harmonic layers by MD. Shinha Sarder.",
  },
  {
    title: "Echoes in the Rain",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "dQMyeL9CDks",
    genre: "Lo-Fi / Ambient",
    year: "2025",
    description: "Raindrop textures paired with warm electric piano chords evoking rainy afternoons in Khulna by MD. Shinha Sarder.",
  },
  {
    title: "Night Drift in Khulna",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "torYsa30kik",
    genre: "Synthwave / Chill",
    year: "2025",
    description: "Nocturnal synthesizer journey reflecting neon city reflections along the Rupsha river by MD. Shinha Sarder.",
  },
  {
    title: "Shadows on the Wall",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "c8P76CI9ZJY",
    genre: "Acoustic Minimal",
    year: "2025",
    description: "Sparse fingerstyle acoustic guitar progression exploring quiet late night study spaces and introspection by MD. Shinha Sarder.",
  },
  {
    title: "Silent Horizon",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "gbtwQC2c71c",
    genre: "Post-Rock / Ambient",
    year: "2025",
    description: "Building swell of distorted guitars and ethereal synth pads depicting distant ocean horizons of the Sundarbans.",
  },
  {
    title: "Whispers in the Dark",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "dQMyeL9CDks",
    genre: "Dark Ambient",
    year: "2025",
    description: "Subtle sub-bass pulses with distant choir echoes creating suspenseful atmosphere by MD. Shinha Sarder.",
  },
  {
    title: "Tears of the Cloud",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "torYsa30kik",
    genre: "Cinematic Strings",
    year: "2025",
    description: "Grand cello solo accompanied by orchestral brass exploring dramatic emotional peaks by MD. Shinha Sarder.",
  },
  {
    title: "Midnight Solitude",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "c8P76CI9ZJY",
    genre: "Solo Piano",
    year: "2025",
    description: "Intimate upright piano recording with felt hammer noise exploring stillness after midnight programming sessions.",
  },
  {
    title: "Breathe in Stillness",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "gbtwQC2c71c",
    genre: "Meditation / Drone",
    year: "2025",
    description: "Continuous harmonic drone designed for deep focus, creative coding, and stress relief by MD. Shinha Sarder.",
  },
  {
    title: "Dreamer's Journey",
    cover: "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg",
    youtubeId: "URXjye9UIHk",
    genre: "Uplifting Cinematic",
    year: "2025",
    description: "Triumphant electronic orchestral fusion capturing the journey from rural roots to digital entrepreneurship.",
  },
];

// 3. Local Static Assets in public/
const LOCAL_ASSET_METADATA = [
  {
    file: "profile.webp",
    title: "MD. Shinha Sarder — Official Portrait Photograph",
    caption: "MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World, Author, Musical Artist and Researcher in Khulna, Bangladesh.",
    landingPath: "/",
  },
  {
    file: "profile-photo.webp",
    title: "MD. Shinha Sarder — Executive & Founder Photo",
    caption: "Official executive portrait of MD. Shinha Sarder, tech entrepreneur and visionary leader of Biostar TV World and IT Tech BD.",
    landingPath: "/biography",
  },
  {
    file: "hero-portrait.jpg",
    title: "MD. Shinha Sarder — Author, Musical Artist & Researcher",
    caption: "Editorial portrait of MD. Shinha Sarder representing creative writing, software engineering research, and digital publications.",
    landingPath: "/publications",
  },
  {
    file: "hero-bg.jpg",
    title: "MD. Shinha Sarder — Creative Studio & Digital Lab",
    caption: "Official high-tech development studio and creative workspace of MD. Shinha Sarder in Bangladesh.",
    landingPath: "/projects",
  },
  {
    file: "favicon.webp",
    title: "MD. Shinha Sarder — Official Brand Emblem & Logo",
    caption: "Official brand identity logo and digital seal of MD. Shinha Sarder verified entity.",
    landingPath: "/",
  },
  {
    file: "site-bg-circuit.svg",
    title: "MD. Shinha Sarder — Official Cyber Gold Tech Wallpaper & Studio Canvas",
    caption: "High-tech cybernetic gold circuit board wallpaper and technological backdrop designed for MD. Shinha Sarder official website.",
    landingPath: "/",
  },
  {
    file: "site-logo.ico",
    title: "MD. Shinha Sarder — Entity Verification Icon",
    caption: "Official identity favicon and verified favicon entity icon for MD. Shinha Sarder.",
    landingPath: "/",
  },
];

// 4. Core Static Site Routes (with Priorities and Update Frequencies)
const CORE_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/posts", priority: "0.9", changefreq: "daily" },
  { path: "/books", priority: "0.9", changefreq: "weekly" },
  { path: "/songs", priority: "0.9", changefreq: "weekly" },
  { path: "/gallery", priority: "0.9", changefreq: "daily" },
  { path: "/biography", priority: "0.9", changefreq: "monthly" },
  { path: "/projects", priority: "0.8", changefreq: "monthly" },
  { path: "/publications", priority: "0.8", changefreq: "monthly" },
  { path: "/skills", priority: "0.7", changefreq: "monthly" },
  { path: "/#about", priority: "0.8", changefreq: "monthly" },
  { path: "/#videos", priority: "0.8", changefreq: "weekly" },
  { path: "/#reels", priority: "0.8", changefreq: "weekly" },
  { path: "/#contact", priority: "0.6", changefreq: "yearly" },
];

/**
 * Crawl posts from public/posts-sync.json
 * Extracts featured covers AND all embedded <img src="..."> in the post content HTML.
 */
function crawlPosts() {
  const postItems = [];
  const syncFile = path.join(ROOT_DIR, "public", "posts-sync.json");

  if (!fs.existsSync(syncFile)) {
    console.warn("[Image Sitemap Service] posts-sync.json not found, skipping posts crawl");
    return postItems;
  }

  try {
    const raw = fs.readFileSync(syncFile, "utf-8");
    const posts = JSON.parse(raw);
    if (!Array.isArray(posts)) return postItems;

    for (const post of posts) {
      if (!post.slug) continue;
      const postUrl = `${SITE_URL}/post/${post.slug}`;
      const postTitle = post.title || "MD. Shinha Sarder Article";
      const postImages = [];
      const seenImgs = new Set();

      // Featured Cover Image
      if (post.image && typeof post.image === "string" && post.image.trim()) {
        const cover = cleanUrl(post.image);
        if (!seenImgs.has(cover)) {
          seenImgs.add(cover);
          postImages.push({
            loc: cover,
            title: `${postTitle} — Featured Image | MD. Shinha Sarder`,
            caption: `${post.excerpt || postTitle}. Official article and publication by MD. Shinha Sarder.`,
            geo_location: GEO_LOCATION,
            license: LICENSE_URL,
          });
        }
      }

      // Embedded Images inside Content HTML
      if (post.content && typeof post.content === "string") {
        const imgRegex = /<img\b([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
        let match;
        let imgIndex = 1;
        while ((match = imgRegex.exec(post.content)) !== null) {
          const rawSrc = match[2];
          if (!rawSrc) continue;

          // Filter out tracking pixels / blank gifs
          if (rawSrc.includes("blank.gif") || rawSrc.includes("pixel.gif") || rawSrc.includes("spacer.gif")) {
            continue;
          }

          const fullImgUrl = cleanUrl(rawSrc);
          if (seenImgs.has(fullImgUrl)) continue;
          seenImgs.add(fullImgUrl);

          // Extract alt or title if present in tag attributes
          const fullTag = match[0];
          const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
          const titleMatch = fullTag.match(/title=["']([^"']*)["']/i);
          const explicitAlt = altMatch ? altMatch[1].trim() : "";
          const explicitTitle = titleMatch ? titleMatch[1].trim() : "";

          const imgTitle = explicitTitle || explicitAlt || `${postTitle} (Photo ${imgIndex}) — MD. Shinha Sarder`;
          const imgCaption = explicitAlt || `Editorial photo published in "${postTitle}" by MD. Shinha Sarder.`;

          postImages.push({
            loc: fullImgUrl,
            title: imgTitle,
            caption: imgCaption,
            geo_location: GEO_LOCATION,
            license: LICENSE_URL,
          });
          imgIndex++;
        }
      }

      if (postImages.length > 0) {
        postItems.push({
          loc: postUrl,
          images: postImages,
          lastmod: (post.updated || post.published || new Date().toISOString()).split("T")[0],
        });
      }
    }
  } catch (err) {
    console.error("[Image Sitemap Service] Error reading posts-sync.json:", err.message);
  }

  return postItems;
}

/**
 * Crawl local filesystem images in public/
 */
function crawlLocalAssets() {
  const publicDir = path.join(ROOT_DIR, "public");
  const localImages = [];

  for (const item of LOCAL_ASSET_METADATA) {
    const fullPath = path.join(publicDir, item.file);
    if (fs.existsSync(fullPath)) {
      localImages.push({
        loc: `${SITE_URL}/${item.file}`,
        title: item.title,
        caption: item.caption,
        geo_location: GEO_LOCATION,
        license: LICENSE_URL,
        landingPath: item.landingPath,
      });
    }
  }

  return localImages;
}

/**
 * Main Crawler & Generator Engine
 * Merges the Main Sitemap and Image Sitemap together into a Unified Google Search Sitemap
 */
export async function generateImageSitemap(options = {}) {
  const nowIso = new Date().toISOString().split("T")[0];
  const urlMap = new Map(); // loc -> { loc, images: [], lastmod, priority, changefreq, seenImgs }

  const ensureUrlEntry = (pageLoc, lastmod = nowIso, priority = "0.8", changefreq = "weekly") => {
    if (!urlMap.has(pageLoc)) {
      // Check if matches known core route
      let p = priority;
      let c = changefreq;
      for (const cr of CORE_ROUTES) {
        if (`${SITE_URL}${cr.path}` === pageLoc) {
          p = cr.priority;
          c = cr.changefreq;
          break;
        }
      }

      urlMap.set(pageLoc, {
        loc: pageLoc,
        images: [],
        lastmod,
        priority: p,
        changefreq: c,
        seenImgs: new Set(),
      });
    }
    const entry = urlMap.get(pageLoc);
    if (lastmod && (!entry.lastmod || lastmod > entry.lastmod)) {
      entry.lastmod = lastmod;
    }
    return entry;
  };

  // Pre-seed all core routes so the main sitemap pages are fully represented
  for (const r of CORE_ROUTES) {
    ensureUrlEntry(`${SITE_URL}${r.path}`, nowIso, r.priority, r.changefreq);
  }

  const addImageToUrl = (pageLoc, imgObj, lastmod = nowIso) => {
    if (!imgObj || !imgObj.loc) return;
    const entry = ensureUrlEntry(pageLoc, lastmod);
    const cleanImgLoc = cleanUrl(imgObj.loc);
    if (entry.seenImgs.has(cleanImgLoc)) return;
    entry.seenImgs.add(cleanImgLoc);
    entry.images.push({
      loc: cleanImgLoc,
      title: imgObj.title || "MD. Shinha Sarder Official Photograph",
      caption: imgObj.caption || "Photograph and media asset of MD. Shinha Sarder",
      geo_location: imgObj.geo_location || GEO_LOCATION,
      license: imgObj.license || LICENSE_URL,
    });
  };

  // 1. Index Local Verified Portrait & Workspace Assets
  const localAssets = crawlLocalAssets();
  for (const asset of localAssets) {
    // Primary landing URL
    addImageToUrl(`${SITE_URL}${asset.landingPath}`, asset);
    // Also include in root and gallery for high discoverability
    addImageToUrl(`${SITE_URL}/`, asset);
    addImageToUrl(`${SITE_URL}/gallery`, asset);
  }

  // 2. Index Authoritative Wiki Alpha & Wiki Gence Profiles
  const wikiImages = [
    {
      loc: "https://wikialpha.co/images/thumb/6/61/MD._Shinha_Sarder.jpg/600px-MD._Shinha_Sarder.jpg",
      title: "MD. Shinha Sarder — Official WikiAlpha Encyclopedia Photograph",
      caption: "Biographical portrait photograph of MD. Shinha Sarder documented on WikiAlpha encyclopedia.",
      geo_location: GEO_LOCATION,
      license: LICENSE_URL,
    },
    {
      loc: "https://wikigence.org/images/thumb/f/f0/MD._Shinha_Sarder.png/300px-MD._Shinha_Sarder.png",
      title: "MD. Shinha Sarder — WikiGence Official Biography Photograph",
      caption: "Verified entity portrait of MD. Shinha Sarder recorded in WikiGence biographical registry.",
      geo_location: GEO_LOCATION,
      license: LICENSE_URL,
    },
  ];
  for (const wiki of wikiImages) {
    addImageToUrl(`${SITE_URL}/biography`, wiki);
    addImageToUrl(`${SITE_URL}/`, wiki);
    addImageToUrl(`${SITE_URL}/gallery`, wiki);
  }

  // 3. Index All Published Book Covers (Chaptra, Google Books, Amazon, Blogger)
  for (const book of BOOK_CATALOG) {
    const bookImg = {
      loc: book.cover,
      title: `${book.title} — Book Cover by MD. Shinha Sarder`,
      caption: `${book.description} Published under ${book.category} by author MD. Shinha Sarder.`,
      geo_location: GEO_LOCATION,
      license: LICENSE_URL,
    };
    addImageToUrl(`${SITE_URL}/books`, bookImg);
    addImageToUrl(`${SITE_URL}/`, bookImg);
    addImageToUrl(`${SITE_URL}/gallery`, bookImg);
  }

  // 4. Index All Musical Works, Soundtracks & YouTube Video Thumbnails
  for (const song of SONG_CATALOG) {
    // Deezer 1000x1000 Cover
    const songImg = {
      loc: song.cover,
      title: `${song.title} — Single Artwork | MD. Shinha Sarder`,
      caption: `${song.description} (${song.year}, ${song.genre}) released by musical artist MD. Shinha Sarder on Deezer and Spotify.`,
      geo_location: GEO_LOCATION,
      license: LICENSE_URL,
    };
    addImageToUrl(`${SITE_URL}/songs`, songImg);
    addImageToUrl(`${SITE_URL}/gallery`, songImg);

    // YouTube Maxres & HQ Thumbnails
    if (song.youtubeId) {
      const ytThumbMax = {
        loc: `https://i.ytimg.com/vi/${song.youtubeId}/maxresdefault.jpg`,
        title: `${song.title} — Official YouTube HD Video Thumbnail | MD. Shinha Sarder`,
        caption: `Official video release and audio streaming visual for "${song.title}" on YouTube by MD. Shinha Sarder.`,
        geo_location: GEO_LOCATION,
        license: LICENSE_URL,
      };
      const ytThumbHq = {
        loc: `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`,
        title: `${song.title} — Video Visual Artwork | MD. Shinha Sarder`,
        caption: `HQ video frame and release thumbnail for "${song.title}" by MD. Shinha Sarder.`,
        geo_location: GEO_LOCATION,
        license: LICENSE_URL,
      };
      addImageToUrl(`${SITE_URL}/#videos`, ytThumbMax);
      addImageToUrl(`${SITE_URL}/#videos`, ytThumbHq);
      addImageToUrl(`${SITE_URL}/songs`, ytThumbHq);
    }
  }

  // 5. Crawl & Index All Post Covers + In-Content Embedded Images
  const postItems = crawlPosts();
  for (const post of postItems) {
    ensureUrlEntry(post.loc, post.lastmod, "0.8", "weekly");
    for (const img of post.images) {
      addImageToUrl(post.loc, img, post.lastmod);
      // Also aggregate in gallery
      addImageToUrl(`${SITE_URL}/gallery`, img, post.lastmod);
    }
  }

  // Build Unified Master XML (Main Sitemap + Image Sitemap Mixed Together)
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];

  let totalImagesCount = 0;
  for (const [, entry] of urlMap.entries()) {
    totalImagesCount += entry.images.length;
    lines.push("  <url>");
    lines.push(`    <loc>${xmlEscape(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
    if (entry.changefreq) {
      lines.push(`    <changefreq>${xmlEscape(entry.changefreq)}</changefreq>`);
    }
    if (entry.priority) {
      lines.push(`    <priority>${xmlEscape(entry.priority)}</priority>`);
    }

    for (const img of entry.images) {
      lines.push("    <image:image>");
      lines.push(`      <image:loc>${xmlEscape(img.loc)}</image:loc>`);
      if (img.title) {
        lines.push(`      <image:title>${xmlEscape(img.title)}</image:title>`);
      }
      if (img.caption) {
        lines.push(`      <image:caption>${xmlEscape(img.caption)}</image:caption>`);
      }
      if (img.geo_location) {
        lines.push(`      <image:geo_location>${xmlEscape(img.geo_location)}</image:geo_location>`);
      }
      if (img.license) {
        lines.push(`      <image:license>${xmlEscape(img.license)}</image:license>`);
      }
      lines.push("    </image:image>");
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  const xmlContent = lines.join("\n");

  // Output targets: write unified mixed sitemap to BOTH sitemap.xml and image-sitemap.xml
  const writeTargets = [
    path.join(ROOT_DIR, "public", "sitemap.xml"),
    path.join(ROOT_DIR, "public", "image-sitemap.xml"),
    path.join(ROOT_DIR, "dist", "sitemap.xml"),
    path.join(ROOT_DIR, "dist", "image-sitemap.xml"),
  ];

  for (const targetFile of writeTargets) {
    try {
      const parentDir = path.dirname(targetFile);
      if (fs.existsSync(parentDir)) {
        fs.writeFileSync(targetFile, xmlContent, "utf-8");
      }
    } catch (err) {
      console.warn(`[Image Sitemap Service] Could not write to ${targetFile}:`, err.message);
    }
  }

  const stats = {
    totalUrls: urlMap.size,
    totalImages: totalImagesCount,
    generatedAt: new Date().toISOString(),
    categories: {
      portraits: localAssets.length + wikiImages.length,
      books: BOOK_CATALOG.length,
      songs: SONG_CATALOG.length * 2, // Cover + YouTube thumbnails
      postsWithImages: postItems.length,
    },
  };

  console.log(`[Image Sitemap Service] Successfully generated unified master sitemap (main + image mixed): ${totalImagesCount} image assets across ${urlMap.size} URLs.`);
  return { xml: xmlContent, unifiedXml: xmlContent, stats };
}

// Direct CLI Execution: node scripts/generate_image_sitemap.js
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateImageSitemap()
    .then(({ stats }) => {
      console.log("[Image Sitemap Service] Result:", JSON.stringify(stats, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Image Sitemap Service] Fatal error:", err);
      process.exit(1);
    });
}
