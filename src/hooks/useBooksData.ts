import { useState, useEffect, useCallback } from "react";

export interface Book {
  id: string;
  slug: string;
  title: string;
  publishedDate: string;
  category: string;
  cover: string;
  chaptraUrl: string;
  description: string;
  isbn?: string;
  pages?: string;
}

export const CHAPTRA_AUTHOR_URL = "https://www.chaptra.com/author/md-shinha-sarder";

export const DEFAULT_BOOKS: Book[] = [
  {
    id: "from-khulna-to-the-cloud",
    slug: "from-khulna-cloud-7veEEQAA",
    title: "From Khulna to the Cloud: A Young Creator’s Diary",
    publishedDate: "2025-09-07",
    category: "Memoir & Technology",
    cover: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/from-khulna-cloud-7veEEQAA",
    description:
      "From Khulna to the Cloud: A Young Creator’s Diary is the story of a young dreamer who turned curiosity and determination into creation and influence. Traces the journey of MD. Shinha Sarder navigating tech, digital media, and entrepreneurship.",
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
      "Days of a Dreaming Boy – Edition 2 is an inspiring journey through the life of MD. Shinha Sarder, tracing the path from a curious, ambitious boy in Shirgati village, Khulna, to a visionary leader in computing.",
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
      "A comprehensive exploration of artificial intelligence, machine learning, deep learning paradigms, and future societal impacts written by MD. Shinha Sarder.",
  },
  {
    id: "life-in-lines",
    slug: "life-in-lines-poems-of-hope-heartache-e6uAEQAA",
    title: "Life in Lines: Poems of Hope and Heartache",
    publishedDate: "2025-09-04",
    category: "Poetry & Literature",
    cover: "https://books.google.com/books/content?id=e6uAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/life-in-lines-poems-of-hope-heartache-e6uAEQAA",
    description:
      "An introspective poetic anthology capturing emotions of resilience, nostalgia, quiet solitude, and perseverance amidst modern struggles.",
  },
  {
    id: "whispers-of-tomorrow",
    slug: "whispers-of-tomorrow-y3KAEQAA",
    title: "Whispers of Tomorrow: Reflections of a Young Mind",
    publishedDate: "2025-08-30",
    category: "Philosophy & Essays",
    cover: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/whispers-of-tomorrow-y3KAEQAA",
    description:
      "Philosophical musings and youthful reflections on society, technology, ambition, and personal destiny in the modern digital age.",
  },
  {
    id: "beyond-the-screen",
    slug: "beyond-the-screen-pqd-EQAA",
    title: "Beyond the Screen: Lessons from Life and Tech",
    publishedDate: "2025-08-28",
    category: "Technology & Self-Improvement",
    cover: "https://books.google.com/books/content?id=pqd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/book/beyond-the-screen-pqd-EQAA",
    description:
      "Practical insights and life lessons gleaned from late-night programming, digital content creation, startup building, and personal growth.",
  },
  {
    id: "from-village-to-virtual",
    slug: "from-village-to-virtual",
    title: "From Village to Virtual: The Journey of MD. Shinha Sarder",
    publishedDate: "2025",
    category: "Biography & Memoir",
    cover: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Detailed biographical account of upbringing in Shirgati village, secondary schooling in Khulna, and progression into digital venture creation and entrepreneurial leadership.",
  },
  {
    id: "ict-fundamentals",
    slug: "ict-fundamentals-21st-century",
    title: "ICT Fundamentals for the 21st Century Learn",
    publishedDate: "2025",
    category: "Technology & Education",
    cover: "https://m.media-amazon.com/images/I/31Fx5ANnI9L._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Fundamental computational concepts covering hardware architectures, operating system operations, data communications, and essential 21st century digital literacy.",
  },
  {
    id: "social-media-learner",
    slug: "social-media-learner-simple-guide",
    title: "Social Media Learner: Simple Guide",
    publishedDate: "2025",
    category: "Digital Marketing",
    cover: "https://pbs.twimg.com/profile_images/2091609328210030592/42OjWBAO_400x400.jpg",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "A clear, actionable handbook exploring creator storytelling, personal branding, audience engagement metrics, and organic growth across video streaming platforms.",
  },
  {
    id: "lifestyle-of-md-shinha-sarder",
    slug: "lifestyle-of-md-shinha-sarder",
    title: "Lifestyle of MD. Shinha Sarder",
    publishedDate: "2025",
    category: "Productivity & Lifestyle",
    cover: "https://wikigence.org/images/thumb/f/f0/MD._Shinha_Sarder.png/300px-MD._Shinha_Sarder.png",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Personal routines, daily habits, study disciplines, and productivity frameworks balancing CSE studies at NUBTK with entrepreneurial management and content creation.",
  },
  {
    id: "the-musical-journey-of-md-shinha-sarder",
    slug: "the-musical-journey-of-md-shinha-sarder",
    title: "The Musical Journey of MD. Shinha Sarder",
    publishedDate: "2025",
    category: "Music & Composition",
    cover: "https://blogger.googleusercontent.com/img/a/AVvXsEjUVdjtfSdSBJ_caM3ppA0qOh9ASSCQA7sbOHBIzL0nS-QElPDS0WuJ6ToWG3sRjsNaxm1_fJ2u1PRGD29r4UZYh3Kj5GoXB-oSAmcI7L7MjtF8-BBX0BiOx6Lh2aRDvmmQhPAKvw4qQ8eTHE85MZlj_OfqWBBWItWP-Hl3ITk3vFhG0WXYmWaUxIbOU0SH",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "An exploration into musical creativity, composing ambient melodies, digital synthesizers, and artistic releases on streaming platforms including Spotify and Deezer.",
  },
  {
    id: "mastering-google-knowledge-panel",
    slug: "mastering-google-knowledge-panel",
    title: "Mastering The Google Knowledge Panel",
    publishedDate: "2025",
    category: "SEO & Digital Identity",
    cover: "https://wikialpha.co/images/thumb/6/61/MD._Shinha_Sarder.jpg/600px-MD._Shinha_Sarder.jpg",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Authoritative handbook on entity recognition, Schema.org semantic web standards, Google Knowledge Graph verification, and digital authority for prominent figures.",
  },
  {
    id: "the-musical-artist-as-a-shinha",
    slug: "the-musical-artist-as-a-shinha",
    title: "The Musical Artist As a Shinha",
    publishedDate: "2025",
    category: "Artistic Expression",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQV79hudXoSC3A3-63meKOFFLT-Um2ZMI_i3U65Qo6hitbx9o1eyq9vN6HZUD7NV_dI7ndaPm6l7P4h0crBvneHt4ueHVdP4koqJOMNEoBnvmnIwH7oM4ac_2HnwOvdvrgsz2twPB1mY-c8q5eCkDVCgws_iesMFEk9fnK0o9rdhPou_wyAEsKnbEraNbb/s266/1000020228.jpg",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Reflections on auditory emotion, instrumental composition, song arrangements, and expressive soundscapes in modern instrumental music.",
  },
  {
    id: "the-entrepreneur-as-a-md-shinha-sarder",
    slug: "the-entrepreneur-as-a-md-shinha-sarder",
    title: "The Entrepreneur as a MD. Shinha Sarder",
    publishedDate: "2025",
    category: "Business & Startups",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSCdw5RbTH6ybaehBxCcypBWf4yjoNIRCJ_ypZKPjIqai6nSNvJuvItYuExsxn7PYBag0jGRAcGhZm7hFq-Af2H4RvotQ6FZboVU7xqZXGKcdTrRcNb1I8PIBFt-DodExGBlzJvGnENFykTObfQmm9AdYE4Q15M3QwdKv70dA-Te6B2GFTR4IlwvXzsP0t/w646-h180-rw/Screenshot%202025-07-02%20191141.png",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Insights on founding IT Tech BD, managing Biostar TV World, startup strategy, tech venture leadership, and entrepreneurial growth in digital Bangladesh.",
  },
  {
    id: "computer-and-technology",
    slug: "computer-and-technology",
    title: "Computer and Technology: Mastering Modern Tech",
    publishedDate: "2025",
    category: "Computer Science",
    cover: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Curriculum guide for computer science students detailing practical software architecture, database management systems, and client-server network infrastructure.",
  },
  {
    id: "computer-science-info-communication",
    slug: "computer-science-info-communication",
    title: "Computer Science and Info-Communication",
    publishedDate: "2025",
    category: "Computer Science",
    cover: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "Introductory to intermediate principles of telecommunications, computer networks, protocol stacks, and internet systems tailored for students.",
  },
  {
    id: "graph-theory",
    slug: "graph-theory-engineering",
    title: "Graph Theory with Applications to Engineering",
    publishedDate: "2025",
    category: "Computer Science & Engineering",
    cover: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: "https://www.chaptra.com/author/md-shinha-sarder",
    description:
      "An analytical monograph exploring structural discrete graph algorithms, spanning trees, Hamiltonian cycles, network flows, and modern engineering applications.",
  },
];

const STORAGE_KEY = "md_shinha_books_catalog_v3";

export function useBooksData() {
  const [books, setBooks] = useState<Book[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= DEFAULT_BOOKS.length) return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_BOOKS;
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setBooks(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener("books_updated", handleStorage);
    return () => window.removeEventListener("books_updated", handleStorage);
  }, []);

  const saveBooks = useCallback((updated: Book[]) => {
    setBooks(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("books_updated"));
      } catch (e) {
        console.error("Failed to save books:", e);
      }
    }
  }, []);

  const addBook = useCallback(
    (newBook: Book) => {
      saveBooks([newBook, ...books]);
    },
    [books, saveBooks]
  );

  const updateBook = useCallback(
    (id: string, updatedFields: Partial<Book>) => {
      const next = books.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
      saveBooks(next);
    },
    [books, saveBooks]
  );

  const deleteBook = useCallback(
    (id: string) => {
      const next = books.filter((b) => b.id !== id);
      saveBooks(next);
    },
    [books, saveBooks]
  );

  const resetBooks = useCallback(() => {
    saveBooks(DEFAULT_BOOKS);
  }, [saveBooks]);

  return {
    books,
    addBook,
    updateBook,
    deleteBook,
    resetBooks,
  };
}
