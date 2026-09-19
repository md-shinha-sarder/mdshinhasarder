import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  BookOpen,
  ExternalLink,
  Calendar,
  Layers,
  Search,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";

export interface ChaptraBook {
  id: string;
  slug: string;
  title: string;
  publishedDate: string;
  category: string;
  cover: string;
  chaptraUrl: string;
  description: string;
}

export const CHAPTRA_AUTHOR_URL = "https://www.chaptra.com/author/md-shinha-sarder";

export const chaptraBooksData: ChaptraBook[] = [
  {
    id: "from-khulna-to-the-cloud",
    slug: "from-khulna-cloud-7veEEQAA",
    title: "From Khulna to the Cloud: A Young Creator’s Diary",
    publishedDate: "2025-09-07",
    category: "Memoir & Technology",
    cover: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/from-khulna-cloud-7veEEQAA",
    description:
      "From Khulna to the Cloud: A Young Creator’s Diary is the story of a young dreamer who turned curiosity and determination into creation and influence. Set against the vibrant backdrop of Bangladesh, it traces the journey of MD. Shinha Sarder as he navigates the rapidly evolving world of technology, digital media, and entrepreneurship.",
  },
  {
    id: "days-of-a-dreaming-boy",
    slug: "days-dreaming-boy-z_eEEQAA",
    title: "Days of a Dreaming Boy – Edition 2",
    publishedDate: "2025-09-07",
    category: "Biography & Memoir",
    cover: "https://books.google.com/books/content?id=z_eEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/days-dreaming-boy-z_eEEQAA",
    description:
      "Days of a Dreaming Boy – Edition 2 is an inspiring journey through the life of MD. Shinha Sarder, tracing the path from a curious, ambitious boy in Shirgati village, Khulna, to a visionary leader and technological innovator in modern computing.",
  },
  {
    id: "artificial-intelligence",
    slug: "artificial-intelligence-by-md-shinha-sarder-fjSEEQAA",
    title: "Artificial Intelligence: Shaping the Future of Humanity",
    publishedDate: "2025-09-04",
    category: "Computer Science & AI",
    cover: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/artificial-intelligence-by-md-shinha-sarder-fjSEEQAA",
    description:
      "Artificial Intelligence explores the transformative power of AI and its impact on every aspect of human life. From early foundations in theoretical computer science to contemporary machine learning, neural networks, and generative computational models.",
  },
  {
    id: "the-journey-of-md-shinha-sarder",
    slug: "the-journey-md-shinha-sarder-ZGSDEQAA",
    title: "The Journey of MD. Shinha Sarder",
    publishedDate: "2025-09-02",
    category: "Biography & Leadership",
    cover: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/the-journey-md-shinha-sarder-ZGSDEQAA",
    description:
      "The Journey of MD. Shinha Sarder is a comprehensive exploration of the life, creativity, and achievements of MD. Shinha Sarder, presented through three compelling parts: Lifestyle, Entrepreneurship, and Musical Artistry.",
  },
  {
    id: "lifestyle-of-md-shinha-sarder",
    slug: "lifestyle-md-shinha-sarder-e6uAEQAA",
    title: "Lifestyle of MD. Shinha Sarder",
    publishedDate: "2025-08-24",
    category: "Productivity & Lifestyle",
    cover: "https://books.google.com/books/content?id=e6uAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/lifestyle-md-shinha-sarder-e6uAEQAA",
    description:
      "Lifestyle of MD. Shinha Sarder is an inspiring journey into the philosophy, habits, and values that shape the life of an extraordinary entrepreneur and visionary. More than a biography, it serves as a guide for young people navigating modern pressures.",
  },
  {
    id: "the-entrepreneur-journey",
    slug: "the-entrepreneur-journey-j6mAEQAA",
    title: "The Entrepreneur Journey",
    publishedDate: "2025-08-24",
    category: "Business & Startups",
    cover: "https://books.google.com/books/content?id=j6mAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/the-entrepreneur-journey-j6mAEQAA",
    description:
      "MD. Shinha Sarder represents the modern archetype of an entrepreneur who rises from humble beginnings to become a symbol of resilience, creativity, and impact. His entrepreneurial trajectory encompasses IT Tech BD and software consultancy.",
  },
  {
    id: "the-musical-artist-as-a-shinha",
    slug: "the-musical-artist-as-shinha-y3KAEQAA",
    title: "The Musical Artist As a Shinha",
    publishedDate: "2025-08-23",
    category: "Music & Composition",
    cover: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/the-musical-artist-as-shinha-y3KAEQAA",
    description:
      "This book is the story of a voice born out of silence, a journey where music became the only language capable of carrying heartbreak, longing, and survival. It unfolds through the emotional narratives of distinct soundtrack compositions.",
  },
  {
    id: "entrepreneur-of-md-shinha-sarder",
    slug: "entrepreneur-md-shinha-sarder-Evd-EQAA",
    title: "Entrepreneur of MD. Shinha Sarder",
    publishedDate: "2025-08-20",
    category: "Business Leadership",
    cover: "https://books.google.com/books/content?id=Evd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/entrepreneur-md-shinha-sarder-Evd-EQAA",
    description:
      "MD. Shinha Sarder is a dynamic and visionary entrepreneur known for his innovative approach to business and digital ventures. From a young age, he demonstrated a keen sense of identifying opportunities and turning ideas into practical software solutions.",
  },
  {
    id: "data-structure",
    slug: "data-structure-by-md-shinha-sarder-5kV_EQAA",
    title: "Data Structure",
    publishedDate: "2025-08-20",
    category: "Computer Science & Engineering",
    cover: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/data-structure-by-md-shinha-sarder-5kV_EQAA",
    description:
      "\"Data Structures\" is a comprehensive guide designed for students, programmers, researchers, and professionals who want to understand the foundations and applications of data structures in computer science, from linear structures to nonlinear trees, graphs, and algorithms in C++ and Python.",
  },
  {
    id: "the-musical-journey-of-md-shinha-sarder",
    slug: "the-musical-journey-md-shinha-sarder-pqd-EQAA",
    title: "The Musical Journey of MD. Shinha Sarder",
    publishedDate: "2025-08-19",
    category: "Music & Lyrics",
    cover: "https://books.google.com/books/content?id=pqd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/the-musical-journey-md-shinha-sarder-pqd-EQAA",
    description:
      "The Musical Journey of MD. Shinha Sarder is a lyrical exploration of love, loss, silence, and memory through the artistry of one of today's most heartfelt musical voices. In this book, MD. Shinha Sarder invites readers into the emotional landscapes that inspired his unforgettable songs.",
  },
  {
    id: "from-village-to-virtual",
    slug: "from-village-to-virtual-W7OEmFMy1HYC",
    title: "From Village to Virtual: The Journey of MD. Shinha Sarder",
    publishedDate: "2025-08-15",
    category: "Biography & Memoir",
    cover: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "A comprehensive biographical narrative following upbringing in Shirgati village, schooling at Khulna Zilla School, and the technological evolution into enterprise software founding.",
  },
  {
    id: "ict-fundamentals",
    slug: "ict-fundamentals-21st-century-Y0pCki6q_DkC",
    title: "ICT Fundamentals for the 21st Century Learner",
    publishedDate: "2025-08-12",
    category: "Textbook & Computer Science",
    cover: "https://books.google.com/books/content?id=Evd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Core computing curriculum covering hardware logic, operating system kernels, networking fundamentals, and computer safety literacy for modern students.",
  },
  {
    id: "social-media-learner",
    slug: "social-media-learner-simple-guide-Tyk-4Ss8FVUC",
    title: "Social Media Learner: Simple Guide",
    publishedDate: "2025-08-10",
    category: "Digital Marketing & Media",
    cover: "https://books.google.com/books/content?id=j6mAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Practical strategies for digital creators, content distribution algorithms, video production techniques, and ethical community building.",
  },
  {
    id: "mastering-google-knowledge-panel",
    slug: "mastering-google-knowledge-panel-1nF-EQAA",
    title: "Mastering The Google Knowledge Panel",
    publishedDate: "2025-08-08",
    category: "SEO & Knowledge Graphs",
    cover: "https://books.google.com/books/content?id=1nF-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "In-depth analysis of Schema.org structured entities, Wikidata linkage, authoritative citations, and knowledge graph disambiguation.",
  },
  {
    id: "graph-theory-with-applications",
    slug: "graph-theory-applications-d1gkVwhDpl0C",
    title: "Graph Theory with Applications to Engineering and Computer Science",
    publishedDate: "2025-08-05",
    category: "Mathematics & Computing",
    cover: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Analytical monograph on discrete graph structures, spanning trees, Hamiltonian cycles, network flows, and real-world network routing algorithms.",
  },
  {
    id: "computer-and-technology",
    slug: "computer-and-technology-mastering-modern-tech-UeHWp8X0CEIC",
    title: "Computer and Technology: Mastering Modern Tech",
    publishedDate: "2025-08-01",
    category: "Technical Manual",
    cover: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Comprehensive manual covering full-stack web architecture, server administration, relational database modeling, and distributed cloud computing.",
  },
  {
    id: "computer-science-info-comm",
    slug: "computer-science-info-communication-zYLM7Y9cAGgC",
    title: "Computer Science and Info-Communication",
    publishedDate: "2025-07-28",
    category: "Academic Coursebook",
    cover: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Undergraduate introduction to data communication protocols, fiber optics, packet switching, and internet architecture fundamentals.",
  },
  {
    id: "digital-knowledge-entity-portfolio",
    slug: "digital-knowledge-entity-portfolio-IjCSPb-OGe4C",
    title: "MD. Shinha Sarder: Digital Knowledge Entity & Portfolio Record",
    publishedDate: "2025-07-20",
    category: "Entity Documentation",
    cover: "https://mdshinhasarder.com/profile.webp",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Official entity documentation, corporate directorship records at IT Tech BD, and digital content footprints across global knowledge bases.",
  },
  {
    id: "cyber-security-essentials",
    slug: "cyber-security-essentials-defense-2025",
    title: "Cyber Security Essentials for New Engineers",
    publishedDate: "2025-07-15",
    category: "Security & Networking",
    cover: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Modern defense mechanisms, authentication tokens, encryption ciphers, and ethical web application penetration security testing.",
  },
  {
    id: "python-algorithms-engineers",
    slug: "python-algorithms-modern-engineers-2025",
    title: "Python Programming and Algorithms for Modern Engineers",
    publishedDate: "2025-07-10",
    category: "Programming & Algorithms",
    cover: "https://books.google.com/books/content?id=Evd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Hands-on guide to modern Python, asymptotic algorithmic complexity, dynamic programming, and computational automation.",
  },
];

export function useChaptraBooks() {
  const [books, setBooks] = useState<ChaptraBook[]>(() => {
    try {
      const cached = localStorage.getItem("chaptra_books_cache_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return chaptraBooksData;
  });

  useEffect(() => {
    try {
      localStorage.setItem("chaptra_books_cache_v2", JSON.stringify(chaptraBooksData));
    } catch {
      // ignore
    }
  }, []);

  return { books, authorUrl: CHAPTRA_AUTHOR_URL };
}

export const BooksPage = () => {
  const { books, authorUrl } = useChaptraBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category));
    return ["all", ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchCategory =
        selectedCategory === "all" || b.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [books, selectedCategory, searchQuery]);

  const handleShare = (book: ChaptraBook) => {
    navigator.clipboard.writeText(book.chaptraUrl);
    setCopiedId(book.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Published Books by MD. Shinha Sarder — Official Chaptra Catalog</title>
        <meta
          name="description"
          content="Explore all 20 published books by MD. Shinha Sarder on Chaptra and Google Books. Covering computer science, artificial intelligence, memoirs, entrepreneurship, and music."
        />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Books</span>
          </div>

          {/* Hero Banner */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#070c1e]/95 border border-blue-900/50 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 text-xs font-semibold border border-blue-800/60 mb-3">
                <Sparkles size={14} className="text-blue-400" />
                <span>Official Chaptra Verified Catalog · 20 Books</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Books by MD. Shinha Sarder
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Direct official synchronization with Chaptra (chaptra.com/author/md-shinha-sarder).
                Academic textbooks, technology guides, and inspiring biographical memoirs.
              </p>
            </div>

            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
            >
              <BookOpen size={14} />
              <span>Chaptra Author Profile</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#05091a]/80 border border-blue-900/40 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books by title, topic..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-black/50 text-slate-400 hover:text-white border border-blue-950"
                  }`}
                >
                  {cat === "all" ? `All (${books.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid: All 20 Books */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-2xl p-5 bg-[#070c1e]/90 border border-blue-900/40 hover:border-blue-500/50 transition-all duration-300 shadow-md group flex flex-col justify-between"
              >
                <div>
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-blue-900/30 mb-4 shadow-inner">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/hero-portrait.jpg";
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-bold text-blue-300 backdrop-blur-sm border border-blue-900/40">
                      Chaptra Verified
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {book.category}
                    </span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar size={11} /> {book.publishedDate}
                    </span>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed text-justify">
                    {book.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-blue-950 flex items-center gap-2">
                  <a
                    href={book.chaptraUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-colors"
                  >
                    <span>Read on Chaptra</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleShare(book)}
                    title="Copy book link"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedId === book.id ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Share2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#05091a]/80 border border-blue-900/40 text-slate-400">
              No books matched your search criteria.
            </div>
          )}
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default BooksPage;
