import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import {
  FolderKanban,
  ExternalLink,
  Github,
  Globe,
  Tv,
  Terminal,
  Server,
  Search,
  Wallet,
  Bot,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: "venture" | "web" | "automation" | "ai";
  role: string;
  period: string;
  desc: string;
  features: string[];
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

const allProjects: Project[] = [
  {
    id: "it-tech-bd",
    title: "IT Tech BD — Technology & Software Solutions",
    category: "venture",
    role: "Founder & CEO",
    period: "2020 – Present",
    desc: "A premier digital technology firm delivering enterprise software development, cloud infrastructure setup, website engineering, and digital marketing transformation across Bangladesh and global markets.",
    features: [
      "Custom full-stack web and mobile application development",
      "Enterprise cloud hosting and database migrations",
      "Search Engine Optimization (SEO) & Knowledge Graph architecture",
      "Client training and technical consulting for regional enterprises",
    ],
    tags: ["Next.js", "Node.js", "Python", "PostgreSQL", "Cloud Computing", "SEO"],
    liveUrl: "https://mdshinhasarder.com/",
    featured: true,
  },
  {
    id: "biostar-tv-world",
    title: "Biostar TV World — Digital Media & Broadcast Network",
    category: "venture",
    role: "Founder & CEO",
    period: "2021 – Present",
    desc: "A multimedia digital television and streaming network providing news, educational documentaries, entertainment shows, and creator spotlights to audiences across digital platforms.",
    features: [
      "Multi-platform video syndication across YouTube, Facebook, and Web",
      "Live streaming infrastructure and real-time audio-video routing",
      "Content creation studio producing youth education and tech programming",
      "Audience reach exceeding hundreds of thousands of digital impressions",
    ],
    tags: ["Digital Broadcasting", "Streaming Video", "YouTube API", "Media Studio"],
    liveUrl: "https://www.youtube.com/@MD-Shinha-Sarder",
    featured: true,
  },
  {
    id: "knowledge-panel-arch",
    title: "Google Knowledge Panel Architecture System",
    category: "web",
    role: "Lead Architect & Author",
    period: "2024 – 2025",
    desc: "A specialized entity recognition and digital schema optimization system that builds verified Google Knowledge Graph connections using JSON-LD, RDFa, SameAs attributes, and Wikidata disambiguation.",
    features: [
      "Dynamic Schema.org Person & Organization structured graph generation",
      "Automated SameAs social profile verification and link parity checks",
      "Disambiguation engine for multi-disciplinary entrepreneurs and artists",
      "Documented in published handbook 'Mastering The Google Knowledge Panel'",
    ],
    tags: ["Knowledge Graph", "JSON-LD", "Semantic Web", "Schema.org", "Entity SEO"],
    liveUrl: "https://www.mdshinhasarder.com/2025/07/httpswww.mdshinhasarder.com202507GoogleKnowledgePanelReviewforMDShinhaSarder.html",
    featured: true,
  },
  {
    id: "nextjs-web-portal",
    title: "Next.js High-Performance Portal & Headless CMS",
    category: "web",
    role: "Full-Stack Engineer",
    period: "2024 – 2025",
    desc: "Modern web architecture featuring dynamic post rendering, lightning-fast SSR/SSG caching, comprehensive schema generation, and seamless Supabase PostgreSQL integration.",
    features: [
      "Hybrid Server and Client component separation for optimal performance",
      "Full RSS, Atom, News, and Video XML sitemaps auto-generation",
      "Supabase PostgreSQL backend with Row Level Security (RLS)",
      "Tailwind CSS responsive design with zero layout shift",
    ],
    tags: ["Next.js", "React", "Tailwind CSS", "Supabase", "PostgreSQL", "TypeScript"],
    liveUrl: "https://mdshinhasarder.com/",
  },
  {
    id: "python-automation-engine",
    title: "Python Intelligent Web Automation & Scraper Suite",
    category: "automation",
    role: "Developer",
    period: "2023 – 2024",
    desc: "Automated data harvesting, link validation, and sitemap/RSS syndication scripts built in Python. Features robust HTTP request pipelines, regex parsing, and multi-threaded content indexing.",
    features: [
      "Automated extraction of authoritative entity data and academic citations",
      "XML and JSON feed parsing with automatic sanitization and transformation",
      "Rate-limited asynchronous request dispatching with error recovery",
      "Command-line scheduling for periodic web health verification",
    ],
    tags: ["Python", "Automation", "REST APIs", "Data Scraping", "AsyncIO"],
    githubUrl: "https://github.com/md-shinha-sarder",
  },
  {
    id: "microservices-api-suite",
    title: "Node.js & PHP Microservices API Suite",
    category: "automation",
    role: "Backend Architect",
    period: "2023 – 2024",
    desc: "Cross-platform API endpoints developed in Node.js and PHP. Handles high-concurrency requests, JSON response serialization, database connectivity, and system diagnostics.",
    features: [
      "RESTful API design with strict status codes and schema validation",
      "Secure database transaction management for client interactions",
      "Token-based authorization and rate limiting middlewares",
      "High performance JSON endpoints with minimal memory footprint",
    ],
    tags: ["Node.js", "PHP", "PostgreSQL", "REST APIs", "Microservices"],
    githubUrl: "https://github.com/md-shinha-sarder",
  },
  {
    id: "algorithm-visualizer",
    title: "Algorithm & Data Structure Visualization Tool",
    category: "ai",
    role: "Creator & CSE Researcher",
    period: "2024",
    desc: "An interactive educational software tool that visualizes sorting, graph traversal (BFS/DFS), and shortest-path algorithms step-by-step, helping CSE students comprehend complex computational flows.",
    features: [
      "Step-by-step animation of QuickSort, MergeSort, and Dijkstra's algorithm",
      "Time and space complexity indicators updated in real-time during execution",
      "Custom graph and array generator with edge weight editing",
      "Built to accompany university lectures at NUBTK CSE",
    ],
    tags: ["Python", "Algorithms", "DSA", "Computational Theory", "Graph Theory"],
    githubUrl: "https://github.com/md-shinha-sarder",
  },
  {
    id: "expense-management-app",
    title: "Smart Budget & Family Expense Management App",
    category: "automation",
    role: "Full-Stack Developer",
    period: "2023",
    desc: "A comprehensive financial application to track household and personal expenses including utilities, groceries, educational fees, and investment budgets with intuitive monthly breakdowns.",
    features: [
      "Categorized expense logging with receipt attachment support",
      "Monthly balance sheets with dynamic visual bar graphs",
      "Currency conversion and historical expense comparison",
      "Local offline data caching with optional cloud sync",
    ],
    tags: ["Python", "SQL", "Database Design", "Finance"],
    githubUrl: "https://github.com/md-shinha-sarder",
  },
  {
    id: "face-id-system",
    title: "Facial Identification & Computer Vision Project",
    category: "ai",
    role: "Team Contributor & Researcher",
    period: "2023",
    desc: "Collaborative biometric facial identification system built using OpenCV and machine learning classifiers to accurately detect and match facial landmarks in varying lighting conditions.",
    features: [
      "Real-time webcam video stream processing and face boundary detection",
      "Feature vector extraction and nearest neighbor recognition",
      "Trained on custom facial datasets with noise tolerance filters",
      "Interactive desktop GUI displaying recognition confidence metrics",
    ],
    tags: ["Python", "OpenCV", "Computer Vision", "Machine Learning", "AI"],
    githubUrl: "https://github.com/md-shinha-sarder",
  },
  {
    id: "ict-foundation-bd",
    title: "ICT Foundation Bangladesh — Youth Empowerment Initiative",
    category: "venture",
    role: "Founder & Community Lead",
    period: "2022 – Present",
    desc: "A grassroots social initiative designed to empower youth in Khulna and rural Bangladesh with foundational computer literacy, web development skills, and digital safety education.",
    features: [
      "Free workshop sessions for school students introducing coding in Python",
      "Distribution of educational books such as 'ICT Fundamentals for the 21st Century Learn'",
      "Mentorship for aspiring tech creators and digital entrepreneurs",
      "Community partnerships supporting digital inclusion in regional schools",
    ],
    tags: ["Community", "Education", "Youth Tech", "Non-Profit", "Leadership"],
    liveUrl: "https://www.chaptra.com/author/md-shinha-sarder",
  },
];

const ProjectsPage = () => {
  const [selectedCat, setSelectedCat] = useState<"all" | "venture" | "web" | "automation" | "ai">("all");

  const filtered = selectedCat === "all" ? allProjects : allProjects.filter((p) => p.category === selectedCat);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
      <Helmet>
        <title>Projects - MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Enterprises, software systems, web applications, and innovations engineered by MD. Shinha Sarder."
        />
        <meta property="og:title" content="Projects - MD. Shinha Sarder" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/projects.html" />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-neutral-800 pb-5">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-neutral-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Projects</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Projects
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "all", label: "All Projects & Ventures" },
            { id: "venture", label: "Startups & Ventures" },
            { id: "web", label: "Web & Architecture" },
            { id: "automation", label: "Automation & Backend" },
            { id: "ai", label: "AI & Algorithms" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCat(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCat === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-500"
                  : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white dark:border-blue-900/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className={`bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/90 dark:via-[#0a1532]/90 dark:to-[#070e24]/95 border ${
                proj.featured ? "border-blue-400 dark:border-blue-500/50" : "border-slate-200 dark:border-blue-500/20"
              } hover:border-blue-500 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                      {proj.role} · {proj.period}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {proj.title}
                    </h2>
                  </div>
                  {proj.featured && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30 flex-shrink-0">
                      Flagship
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                  {proj.desc}
                </p>

                {/* Key Features Bullet List */}
                <div className="mb-5 bg-slate-50 dark:bg-[#050b1f]/60 rounded-2xl p-4 border border-slate-200 dark:border-blue-900/40">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300 block mb-2">
                    Key Architectural Highlights:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {proj.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-200 dark:bg-blue-950/80 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-blue-900/40 flex items-center gap-3">
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
                    >
                      <span>Visit Live Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 text-xs font-semibold dark:border-blue-900/50 transition-colors"
                    >
                      <Github size={13} />
                      <span>Source / Profile</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-slate-50 dark:bg-gradient-to-r dark:from-blue-950/80 dark:via-[#0a1532]/90 dark:to-blue-950/80 border border-slate-200 dark:border-blue-500/30 rounded-3xl p-8 text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Have a project or partnership in mind?</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-6">
            MD. Shinha Sarder collaborates with technology companies, publishers, educational institutions, and research groups worldwide.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="mailto:Shinhasarder2343@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
            >
              Get in Touch (Email)
            </a>
            <Link
              to="/p/skills.html"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-blue-900/50 transition-colors"
            >
              Review Technical Skills
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default ProjectsPage;
