import { useState, useEffect } from "react";

export interface ScholarPublication {
  id: string;
  title: string;
  authors: string;
  publisher: string;
  year: string;
  citations: number;
  type: string;
  scholarUrl: string;
  coverImage: string;
  abstract: string;
}

export const SCHOLAR_PROFILE_URL =
  "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en";

export const defaultScholarPublications: ScholarPublication[] = [
  {
    id: "umama2024salt",
    title: "Temperature and humidity effects on salt crystallization in burnt clay bricks",
    authors: "MA Umama, CZB Zahid, N Sarder, JA Joy, II Ifty",
    publisher: "Results in Materials (Elsevier) 21, 100541",
    year: "2024",
    citations: 11,
    type: "Journal Paper",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:u5HHmVD_uO8C",
    coverImage: "/profile.webp",
    abstract:
      "A peer-reviewed scientific investigation analyzing temperature gradient kinetics, relative humidity swings, and salt crystallization deterioration dynamics in structural burnt clay masonry materials.",
  },
  {
    id: "sarder2024mastitis",
    title: "Prevalence and Risk Factors of Mild Mastitis in Crossbred Dairy Cows in Selected Areas of Bangladesh",
    authors: "MDS Sarder, MK Shikder, MM Hasan, MJU Sarder, SS Jahan, MA Islam",
    publisher: "Livestock Research Today 2 (1), 1-7",
    year: "2024",
    citations: 1,
    type: "Research Paper",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:u-x6o8ySG0sC",
    coverImage: "/hero-portrait.jpg",
    abstract:
      "An epidemiological field study quantifying subclinical and mild bovine mastitis infection rates across regional dairy farms in Bangladesh, evaluating herd management protocols and environmental risk parameters.",
  },
  {
    id: "graph-theory",
    title: "Graph theory with applications to engineering and computer science",
    authors: "MDS Sarder",
    publisher: "Courier Dover Publications",
    year: "2025",
    citations: 0,
    type: "Academic Monograph",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:d1gkVwhDpl0C",
    coverImage: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "An analytical monograph exploring structural discrete graph algorithms, spanning trees, Hamiltonian cycles, network flows, and their critical implementations in modern network topologies.",
  },
  {
    id: "lifestyle-of-md-shinha-sarder",
    title: "Lifestyle of MD. Shinha Sarder",
    authors: "MDS Sarder",
    publisher: "Self-Published / Research Index",
    year: "2025",
    citations: 0,
    type: "Monograph",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:9yKSN-GCB0IC",
    coverImage: "https://books.google.com/books/content?id=e6uAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Philosophical and operational retrospective outlining habits, daily rituals, and multidisciplinary frameworks balancing computer science, authorship, and startup governance.",
  },
  {
    id: "days-of-a-dreaming-boy",
    title: "Days of a Dreaming Boy: The Early Life of MD. Shinha Sarder",
    authors: "MDS Sarder",
    publisher: "University Publisher",
    year: "2025",
    citations: 0,
    type: "Biographical Study",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:qjMakFHDy7sC",
    coverImage: "https://books.google.com/books/content?id=z_eEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Chronological biographical analysis exploring youth development, family lineage, and educational experiences at Khulna Zilla School that shaped a multidisciplinary career.",
  },
  {
    id: "from-khulna-to-the-cloud",
    title: "From Khulna to the Cloud: A Young Creator’s Diary",
    authors: "MDS Sarder",
    publisher: "MD. Shinha Sarder Publishing",
    year: "2025",
    citations: 0,
    type: "Technical Memoir",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:2osOgNQ5qMEC",
    coverImage: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Case studies and diary entries tracing regional computing advancements, web hosting frameworks, cloud deployment pipelines, and digital ecosystem growth in Bangladesh.",
  },
  {
    id: "computer-and-technology",
    title: "Computer and Technology: Mastering Modern Tech",
    authors: "MDS Sarder",
    publisher: "Rafi Publisher Ltd",
    year: "2025",
    citations: 0,
    type: "Technical Manual",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:UeHWp8X0CEIC",
    coverImage: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Curriculum guide for computer science students detailing practical software architecture, database management systems, and client-server network infrastructure.",
  },
  {
    id: "md-shinha-sarder-entity",
    title: "MD. Shinha Sarder: Digital Knowledge Entity & Portfolio Record",
    authors: "MDS Sarder",
    publisher: "mdshinhasarder.com",
    year: "2025",
    citations: 0,
    type: "Web Monograph",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:IjCSPb-OGe4C",
    coverImage: "/profile.webp",
    abstract:
      "Structured documentation of verified entity records, corporate directorship at IT Tech BD, and digital content footprint across search knowledge systems.",
  },
  {
    id: "computer-science-info-communication",
    title: "Computer Science and Info-Communication: By MD. Shinha Sarder",
    authors: "MDS Sarder",
    publisher: "Rafi Publisher Ltd",
    year: "2025",
    citations: 0,
    type: "Academic Coursebook",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:zYLM7Y9cAGgC",
    coverImage: "https://books.google.com/books/content?id=ZGSDEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Introductory to intermediate principles of telecommunications, computer networks, protocol stacks, and internet systems tailored for higher secondary and undergraduate students.",
  },
  {
    id: "social-media-learner",
    title: "Social Media Learner: Simple Guide",
    authors: "MDS Sarder",
    publisher: "Rafi Publisher Ltd",
    year: "2025",
    citations: 0,
    type: "Applied Guide",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:Tyk-4Ss8FVUC",
    coverImage: "https://books.google.com/books/content?id=j6mAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "A pragmatic overview of social media communication, creator storytelling, audience engagement metrics, and organic growth principles on video streaming platforms.",
  },
  {
    id: "ict-fundamentals",
    title: "ICT Fundamentals for the 21st Century Learner",
    authors: "MDS Sarder",
    publisher: "University Publisher",
    year: "2025",
    citations: 0,
    type: "Textbook",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:Y0pCki6q_DkC",
    coverImage: "https://books.google.com/books/content?id=Evd-EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Fundamental computational concepts covering hardware architectures, operating system operations, data structures, and computer safety literacy.",
  },
  {
    id: "from-village-to-virtual",
    title: "From Village to Virtual: The Journey of MD. Shinha Sarder",
    authors: "MDS Sarder",
    publisher: "University Publisher",
    year: "2025",
    citations: 0,
    type: "Biographical Narrative",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:W7OEmFMy1HYC",
    coverImage: "https://books.google.com/books/content?id=y3KAEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Detailed biographical account of upbringing in Shirgati village, secondary schooling in Khulna, and progression into digital venture creation.",
  },
  {
    id: "peoplepill-biography",
    title: "MD. Shinha Sarder - Biography",
    authors: "MDS Sarder",
    publisher: "PeoplePill Encyclopedia / mdshinhasarder.com",
    year: "2025",
    citations: 0,
    type: "Biographical Reference",
    scholarUrl: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=ixspgUAAAAAJ&citation_for_view=ixspgUAAAAAJ:YsMSGLbcyi4C",
    coverImage: "/profile.webp",
    abstract:
      "Indexed biographical overview highlighting corporate milestones, academic affiliations at NUBTK, musical achievements, and bibliography entries.",
  },
  {
    id: "artificial-intelligence-humanity",
    title: "Artificial Intelligence: Shaping the Future of Humanity",
    authors: "MDS Sarder",
    publisher: "Rafi Publisher Ltd / Chaptra",
    year: "2025",
    citations: 0,
    type: "Monograph & Academic Study",
    scholarUrl: "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en",
    coverImage: "https://books.google.com/books/content?id=fjSEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Comprehensive investigation into artificial intelligence architectures, machine learning fundamentals, and computational intelligence in digital Bangladesh.",
  },
  {
    id: "data-structures-algorithmic-principles",
    title: "Data Structure and Algorithmic Analysis in Modern Computing",
    authors: "MDS Sarder",
    publisher: "University Publisher",
    year: "2025",
    citations: 0,
    type: "Textbook & Coursework",
    scholarUrl: "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en",
    coverImage: "https://books.google.com/books/content?id=5kV_EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    abstract:
      "Undergraduate computer science reference detailing linear and nonlinear data structures, asymptotic algorithmic complexity, and structured memory optimization.",
  },
];

export function useScholarPublications() {
  const [publications, setPublications] = useState<ScholarPublication[]>(() => {
    try {
      const cached = localStorage.getItem("scholar_publications_cache_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 15) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return defaultScholarPublications;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep local storage synchronized
    try {
      localStorage.setItem(
        "scholar_publications_cache_v2",
        JSON.stringify(publications)
      );
    } catch {
      // ignore
    }
  }, [publications]);

  return {
    publications,
    totalCitations: 12,
    hIndex: 1,
    i10Index: 1,
    scholarProfileUrl: SCHOLAR_PROFILE_URL,
    loading,
  };
}
