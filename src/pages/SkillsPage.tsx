import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SkillCircleGraph from "@/components/SkillCircleGraph";
import PageInfobox from "@/components/PageInfobox";
import {
  Cpu,
  Zap,
  Terminal,
  Server,
  Database,
  Code2,
  Layers,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
  GitBranch,
  Search,
} from "lucide-react";

interface SkillItem {
  name: string;
  percent: number;
  level: string;
  category: "languages" | "frameworks" | "databases" | "cse";
  desc: string;
  useCase: string;
  highlight?: boolean;
}

const allSkills: SkillItem[] = [
  {
    name: "Python",
    percent: 96,
    level: "Advanced / Production",
    category: "languages",
    desc: "Fast automation, web scrapers, data pipelines, and AI scripting.",
    useCase: "Powers automated data harvesting engines, knowledge scrapers, and algorithmic research prototypes.",
    highlight: true,
  },
  {
    name: "Next.js (v16)",
    percent: 98,
    level: "Expert / Direct Meta-Framework",
    category: "frameworks",
    desc: "Next.js 16 App Router, Turbopack compiler, SSR/SSG hybrid caching, and edge rendering.",
    useCase: "Primary web framework across all modern ventures, delivering sub-second page loads and automated SEO.",
    highlight: true,
  },
  {
    name: "React",
    percent: 96,
    level: "Expert",
    category: "frameworks",
    desc: "Declarative UI component architecture, custom hooks, and reactive state management.",
    useCase: "Building modular interfaces, real-time dashboards, and complex audio/visual players.",
    highlight: true,
  },
  {
    name: "Java",
    percent: 92,
    level: "Advanced / Academic CSE",
    category: "languages",
    desc: "Object-oriented design, multithreading, concurrency, and high-throughput systems.",
    useCase: "Core academic foundation at NUBTK CSE, computational graph algorithms, and robust enterprise logic.",
    highlight: true,
  },
  {
    name: "Node.js",
    percent: 94,
    level: "Advanced / Server Runtime",
    category: "languages",
    desc: "Asynchronous I/O, RESTful microservices, event loops, and streaming servers.",
    useCase: "Powers high-concurrency API backends, feed syndication endpoints, and real-time socket connections.",
    highlight: true,
  },
  {
    name: "PHP",
    percent: 88,
    level: "Proficient",
    category: "languages",
    desc: "Server-side scripting, dynamic CMS integrations, and relational database bridges.",
    useCase: "Deploying rapid microservices, legacy backend integrations, and server-rendered data pipelines.",
  },
  {
    name: "PostgreSQL & Supabase",
    percent: 92,
    level: "Advanced",
    category: "databases",
    desc: "Relational modeling, Row Level Security (RLS), real-time subscriptions, and indexing.",
    useCase: "Central data storage for dynamic articles, user comments, knowledge nodes, and media catalogs.",
    highlight: true,
  },
  {
    name: "Tailwind CSS",
    percent: 95,
    level: "Expert",
    category: "frameworks",
    desc: "Utility-first design system, fluid responsive scaling, and high-contrast dark modes.",
    useCase: "Zero CSS bloat, mathematical spacing, and seamless visual consistency across all screen viewports.",
  },
  {
    name: "Data Structures & Algorithms",
    percent: 90,
    level: "Advanced / CSE Core",
    category: "cse",
    desc: "Time/space complexity analysis (Big-O), trees, graphs, sorting, and dynamic programming.",
    useCase: "Underpins all algorithmic optimizations, efficient query structures, and published monographs.",
  },
  {
    name: "Computational Graph Theory",
    percent: 92,
    level: "Research Specialization",
    category: "cse",
    desc: "Shortest-path algorithms, topological sorting, network flows, and entity graph linkages.",
    useCase: "Subject of formal publication 'Graph Theory with Applications to Engineering and Computer Science'.",
  },
  {
    name: "MySQL & Relational Queries",
    percent: 88,
    level: "Proficient",
    category: "databases",
    desc: "ACID transactions, foreign key constraints, query optimization, and schema migrations.",
    useCase: "Structured data storage for web content management systems and educational portals.",
  },
  {
    name: "Google Knowledge Graph & SEO",
    percent: 95,
    level: "Expert / Authoritative",
    category: "cse",
    desc: "Entity recognition, Schema.org JSON-LD, RDFa, SameAs optimization, and entity disambiguation.",
    useCase: "Author of 'Mastering The Google Knowledge Panel', architecting structured digital identity ecosystems.",
  },
];

const SkillsPage = () => {
  const [selectedCat, setSelectedCat] = useState<"all" | "languages" | "frameworks" | "databases" | "cse">("all");

  const filtered = selectedCat === "all" ? allSkills : allSkills.filter((s) => s.category === selectedCat);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
      <Helmet>
        <title>Skills - MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Technical skills, programming proficiencies, and software architecture of MD. Shinha Sarder."
        />
        <meta property="og:title" content="Skills - MD. Shinha Sarder" />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/skills.html" />
      </Helmet>

      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-20 container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-neutral-800 pb-5">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-neutral-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Skills</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skills
          </h1>
        </div>

        {/* Circular Graph Interactive Visualizer */}
        <div className="mb-14 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              Core Architectural Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-xl mx-auto">
              Visual representation of primary execution weight across production languages and direct application frameworks.
            </p>
          </div>
          <SkillCircleGraph />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "all", label: "All Technologies" },
            { id: "languages", label: "Languages" },
            { id: "frameworks", label: "Web Frameworks" },
            { id: "databases", label: "Databases & Cloud" },
            { id: "cse", label: "CSE & Theory" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCat(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCat === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-500"
                  : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white dark:border-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((skill) => (
            <div
              key={skill.name}
              className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-700 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {skill.name}
                      {skill.highlight && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30">
                          Core
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400/90 font-medium">{skill.level}</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{skill.percent}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-slate-100 dark:bg-[#050b1d] border border-slate-200 dark:border-blue-500/20 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-400 transition-all duration-700"
                    style={{ width: `${skill.percent}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {skill.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-blue-900/40 mt-2">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1">
                  Practical Application
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {skill.useCase}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Engineering Principles Card */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/95 dark:via-[#0a1532]/95 dark:to-[#070e24]/98 border border-slate-200 dark:border-blue-500/30 rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-2xl mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/15 dark:border-blue-400/30 dark:text-blue-400 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Performance-First Architecture</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Prioritizing direct execution speed, minimal runtime bundle overhead, and sub-second Largest Contentful Paint (LCP) across all devices.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/15 dark:border-blue-400/30 dark:text-blue-400 flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Academic Rigor &amp; DSA</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Built upon rigorous CSE coursework at NUBTK Khulna, with deep focus on asymptotic analysis, distributed memory graphs, and algorithm efficiency.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/15 dark:border-blue-400/30 dark:text-blue-400 flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Entity SEO &amp; Schema Integrity</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Engineering structured data architectures that allow search engines and AI knowledge graphs to interpret entities with 100% precision.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Explore how these skills are deployed into real-world systems and startups:
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/p/projects.html"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
              >
                View Featured Projects
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/p/biography.html"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold dark:border-blue-900/50 transition-colors"
              >
                Academic Background
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default SkillsPage;
