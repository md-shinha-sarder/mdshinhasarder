/**
 * Directory of all canonical domain images for MD. Shinha Sarder
 * Domain: https://mdshinhasarder.com
 * Cloudinary: https://res.cloudinary.com/borle8go/
 */

export interface DomainImageItem {
  id: string;
  name: string;
  title: string;
  category: "Identity & Profile" | "Books & Publications" | "Music & Songs" | "Tech & Articles" | "Logos & Emblems";
  fileName: string;
  domainUrl: string;
  localPath: string;
  cloudinaryUrl: string;
  cloudinaryFetchUrl: string;
}

const DOMAIN = "https://mdshinhasarder.com";
const CLOUD_NAME = "borle8go";

function createItem(
  id: string,
  fileName: string,
  title: string,
  category: DomainImageItem["category"]
): DomainImageItem {
  const domainUrl = `${DOMAIN}/images/${fileName}`;
  const localPath = `/images/${fileName}`;
  const publicId = fileName.replace(/\.[^/.]+$/, "");
  const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
  const cloudinaryFetchUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${domainUrl}`;

  return {
    id,
    name: fileName,
    title,
    category,
    fileName,
    domainUrl,
    localPath,
    cloudinaryUrl,
    cloudinaryFetchUrl,
  };
}

export const CANONICAL_DOMAIN_IMAGES: DomainImageItem[] = [
  // Identity & Profile
  createItem("profile-portrait", "md-shinha-sarder-official-portrait.profile.webp", "MD. Shinha Sarder - Official Portrait", "Identity & Profile"),
  createItem("profile-clean", "profile.webp", "MD. Shinha Sarder Profile (Clean Canonical)", "Identity & Profile"),
  createItem("hero-portrait", "hero-portrait.jpg", "MD. Shinha Sarder - Author & Researcher", "Identity & Profile"),
  createItem("founder-ceo", "md-shinha-sarder-executive-founder.profile-photo.webp", "MD. Shinha Sarder - Executive Founder", "Identity & Profile"),
  createItem("hero-bg", "hero-bg.jpg", "Creative Tech Studio Background", "Identity & Profile"),
  createItem("profile-header", "md-shinha-sarder-profile-header.webp", "Profile Header Official", "Identity & Profile"),
  createItem("coding-journey", "md-shinha-sarder-highlights-the-journey-from-coding-to-success.png", "Coding to Success Through IT Company", "Tech & Articles"),

  // Logos & Emblems
  createItem("site-logo-png", "site-logo.png", "Official Site Logo (High Res)", "Logos & Emblems"),
  createItem("brand-emblem", "md-shinha-sarder-brand-emblem.webp", "Brand Emblem Verified", "Logos & Emblems"),
  createItem("favicon-webp", "favicon.webp", "Favicon WebP Vector-Clear", "Logos & Emblems"),
  createItem("deezer-logo", "md-shinha-sarder-musical-artist.deezer.jpg", "Deezer Musical Artist Verified", "Logos & Emblems"),

  // Books
  createItem("book-ai", "artificial-intelligence-shaping-the-future-of-humanity.jpg", "Artificial Intelligence: Shaping the Future of Humanity", "Books & Publications"),
  createItem("book-beyond", "beyond-the-screen-lessons-from-life-and-tech.jpg", "Beyond the Screen: Lessons from Life and Tech", "Books & Publications"),
  createItem("book-comp-tech", "computer-and-technology-mastering-modern-tech.jpg", "Computer and Technology: Mastering Modern Tech", "Books & Publications"),
  createItem("book-cs", "computer-science-and-info-communication.jpg", "Computer Science & Info Communication", "Books & Publications"),
  createItem("book-ds", "data-structure-principles-and-algorithmic-analysis.jpg", "Data Structure Principles and Algorithmic Analysis", "Books & Publications"),
  createItem("book-dreaming-boy", "days-of-a-dreaming-boy-edition-2.jpg", "Days of a Dreaming Boy (Edition 2)", "Books & Publications"),
  createItem("book-khulna-cloud", "from-khulna-to-the-cloud-a-young-creators-diary.jpg", "From Khulna to the Cloud: Creator's Diary", "Books & Publications"),
  createItem("book-village-virtual", "from-village-to-virtual-the-journey-of-md-shinha-sarder.jpg", "From Village to Virtual: The Journey of MD. Shinha Sarder", "Books & Publications"),
  createItem("book-graph-theory", "graph-theory-with-applications-to-engineering.jpg", "Graph Theory with Applications to Engineering", "Books & Publications"),
  createItem("book-ict", "ict-fundamentals-for-the-21st-century-learn.jpg", "ICT Fundamentals for the 21st Century Learner", "Books & Publications"),
  createItem("book-koyra", "journey-of-koyra-to-khulna-a-simple-story-guide.jpg", "Journey of Koyra to Khulna: A Simple Story Guide", "Books & Publications"),
  createItem("book-life-lines", "life-in-lines-poems-of-hope-and-heartache.jpg", "Life in Lines: Poems of Hope and Heartache", "Books & Publications"),
  createItem("book-cpp", "mastering-c-plus-plus-programming-language.jpg", "Mastering C++ Programming Language", "Books & Publications"),
  createItem("book-knowledge-panel", "mastering-the-google-knowledge-panel.jpg", "Mastering the Google Knowledge Panel", "Books & Publications"),
  createItem("book-entrepreneur", "the-entrepreneur-journey-biography-md-shinha-sarder.jpg", "The Entrepreneur Journey Biography", "Books & Publications"),
  createItem("book-whispers", "whispers-of-tomorrow-reflections-of-a-young-mind.jpg", "Whispers of Tomorrow: Reflections of a Young Mind", "Books & Publications"),

  // Music & Songs
  createItem("song-breathe", "breathe-in-stillness.track-art.jpg", "Breathe in Stillness (Track Art)", "Music & Songs"),
  createItem("song-dreamers", "dreamers-journey.track-art.jpg", "Dreamer's Journey (Track Art)", "Music & Songs"),
  createItem("song-echoes", "echoes-in-the-rain.track-art.jpg", "Echoes in the Rain (Track Art)", "Music & Songs"),
  createItem("song-fading", "fading-love-in-quiet-shadows.track-art.jpg", "Fading Love in Quiet Shadows (Track Art)", "Music & Songs"),
  createItem("song-fajr", "fajr-azan.track-art.jpg", "Fajr Azan (Track Art)", "Music & Songs"),
  createItem("song-lost", "lost-between-love-and-pride.track-art.jpg", "Lost Between Love and Pride (Track Art)", "Music & Songs"),
  createItem("song-love-whispered", "love-whispered-but-you-left.track-art.jpg", "Love Whispered But You Left (Track Art)", "Music & Songs"),
  createItem("song-midnight", "midnight-solitude.track-art.jpg", "Midnight Solitude (Track Art)", "Music & Songs"),
  createItem("song-night-drift", "night-drift-in-khulna.track-art.jpg", "Night Drift in Khulna (Track Art)", "Music & Songs"),
  createItem("song-no-stars", "no-stars-heard-our-pain.track-art.jpg", "No Stars Heard Our Pain (Track Art)", "Music & Songs"),
  createItem("song-pagol-mon", "pagol-mon-kra.track-art.jpg", "Pagol Mon KRA (Track Art)", "Music & Songs"),
  createItem("song-shadows", "shadows-on-the-wall.track-art.jpg", "Shadows on the Wall (Track Art)", "Music & Songs"),
  createItem("song-silent-horizon", "silent-horizon.track-art.jpg", "Silent Horizon (Track Art)", "Music & Songs"),
  createItem("song-tears", "tears-of-the-cloud.track-art.jpg", "Tears of the Cloud (Track Art)", "Music & Songs"),
  createItem("song-whispers-dark", "whispers-in-the-dark.track-art.jpg", "Whispers in the Dark (Track Art)", "Music & Songs"),
];
