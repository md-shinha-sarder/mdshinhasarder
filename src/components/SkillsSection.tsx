import { Cpu, Zap, Layers, Sparkles } from "lucide-react";

const groups: { title: string; icon?: string; items: { name: string; percent: number; desc?: string; badge?: string }[] }[] = [
  {
    title: "Core Powerhouse Languages (Primary Stack)",
    items: [
      { name: "Python", percent: 96, desc: "Fast Automation, AI Scripting, Web Scraping, Microservices & Data Pipelines", badge: "Core" },
      { name: "Java", percent: 92, desc: "Enterprise Concurrency, Algorithms, System Logic & High-Throughput APIs", badge: "Core" },
      { name: "Node.js", percent: 94, desc: "High-Performance Server Runtime, REST Microservices, Real-Time Streams", badge: "Core" },
      { name: "PHP", percent: 88, desc: "REST Endpoints, Dynamic CMS Integrations & Server-Side Logic" },
    ],
  },
  {
    title: "Direct Web Frameworks & Meta-Architecture",
    items: [
      { name: "Next.js", percent: 98, desc: "Direct Full-Stack Web Framework, Turbopack, App Router & SSR/SSG", badge: "Primary" },
      { name: "React", percent: 96, desc: "Declarative Component Architecture, Custom Hooks & State Engines", badge: "Primary" },
      { name: "Tailwind CSS", percent: 95, desc: "High-Contrast UI/UX Design, Zero-Clash Responsive Layouts" },
      { name: "TypeScript (Compile-Only)", percent: 65, desc: "Zero runtime weight — types stripped at build time for max performance" },
    ],
  },
  {
    title: "Databases, Cloud & CMS Integrations",
    items: [
      { name: "PostgreSQL & Supabase CMS", percent: 92, desc: "Relational Tables, Real-Time Data, RLS Security, Automated Backups" },
      { name: "SQL & MySQL", percent: 88, desc: "Optimized Relational Queries, Schema Architecture & Indexing" },
      { name: "REST APIs & JSON Feeds", percent: 94, desc: "Ultra-Fast API Design, Webhooks & Automated Syndication" },
    ],
  },
  {
    title: "CSE Engineering & High-Growth Strategy",
    items: [
      { name: "Data Structures & Algorithms", percent: 90, desc: "Computational Complexity, Algorithmic Optimization" },
      { name: "YouTube SEO & Content Growth", percent: 92, desc: "Targeted Keyword Ranking, Audience Scaling" },
      { name: "Digital Media Strategy", percent: 90, desc: "Multi-Platform Syndication & Social Tech Delivery" },
    ],
  },
];

const SkillsSection = () => (
  <section id="skills" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 shadow-sm shadow-blue-500/20 backdrop-blur-md">
          <Cpu size={14} className="text-blue-400" /> Technical Mastery &amp; Stack
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mt-4 mb-4 tracking-tight">
          Programming &amp; <span className="text-gradient-blue">Tech Stack</span>
        </h2>
        <p className="text-slate-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-justify sm:text-center">
          Engineered with a high-performance stack combining <strong className="text-white font-semibold">Next.js + React + Java + Python + Node.js</strong> exceeding 85% execution weight, backed by PostgreSQL/Supabase and optimized for ultra-fast, zero-friction page speeds.
        </p>

        {/* Stack Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 max-w-3xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
            <Zap size={13} /> Next.js (Direct Framework)
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-400/30">
            React (Declarative UI)
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/30">
            Python (AI &amp; Automation)
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-400/30">
            Java (CSE Systems)
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            Node.js (High-Speed Runtime)
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-300 border border-slate-500/20">
            TypeScript (Lightweight compile-only)
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((g) => (
          <div key={g.title} className="bg-gradient-to-br from-[#0c183a]/95 via-[#0a1532]/95 to-[#070e24]/98 border border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-950/80 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-serif font-semibold text-white mb-5 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" /> {g.title}
            </h3>
            <div className="space-y-4">
              {g.items.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between items-center mb-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{s.name}</span>
                      {s.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {s.badge}
                        </span>
                      )}
                      {s.desc && <span className="hidden sm:inline text-xs text-slate-400">({s.desc})</span>}
                    </div>
                    <span className="text-blue-300 font-semibold text-xs sm:text-sm font-mono">{s.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#050b1d] border border-blue-500/15 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-400 transition-all duration-1000 shadow-sm shadow-blue-400/40" style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SkillsSection;
