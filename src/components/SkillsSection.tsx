const groups: { title: string; items: { name: string; percent: number; desc?: string }[] }[] = [
  {
    title: "Core Programming Languages",
    items: [
      { name: "Python", percent: 95, desc: "Automation, Web Scraping, Data Processing, AI Scripts" },
      { name: "Node.js", percent: 92, desc: "Server APIs, Express Microservices, Real-Time Runtime" },
      { name: "PHP", percent: 88, desc: "REST Endpoints, CMS Integration, Server-Side Logic" },
      { name: "JavaScript", percent: 90, desc: "ES6+, Async Architecture, Modern DOM" },
    ],
  },
  {
    title: "Web Frameworks & Architecture",
    items: [
      { name: "Next.js", percent: 95, desc: "Direct Web Framework, SSR/SSG, App Router" },
      { name: "React", percent: 92, desc: "Component Architecture, Hooks, State Engines" },
      { name: "Tailwind CSS", percent: 94, desc: "High-Contrast UI/UX, Responsive Design" },
      { name: "HTML5 & CSS3", percent: 95, desc: "Semantic Markup, Responsive Layouts" },
    ],
  },
  {
    title: "Databases & Cloud Storage",
    items: [
      { name: "PostgreSQL & Supabase", percent: 90, desc: "Relational Tables, RLS, SQL Queries, Auth" },
      { name: "MySQL / SQL", percent: 85, desc: "Relational Queries, Schema Design, Data Integrity" },
      { name: "REST APIs & JSON", percent: 92, desc: "API Design, HTTP Endpoints, Webhooks" },
    ],
  },
  {
    title: "Engineering & Digital Marketing",
    items: [
      { name: "Data Structures & Algorithms", percent: 80, desc: "Sorting, Searching, Complexity Analysis" },
      { name: "Facebook & Instagram Management", percent: 88, desc: "Audience Growth, Content Strategy" },
      { name: "YouTube SEO & Optimization", percent: 82, desc: "Keyword Strategy, Video Ranking" },
    ],
  },
];

const SkillsSection = () => (
  <section id="skills" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Technical Mastery</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
          Programming &amp; <span className="text-gradient-blue">Tech Stack</span>
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
          Specialized in Next.js direct web framework, Python automation, Node.js and PHP backend architecture, paired with PostgreSQL &amp; Supabase.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((g) => (
          <div key={g.title} className="bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 border border-blue-500/25 rounded-2xl p-6 sm:p-7 shadow-xl shadow-blue-950/60 hover:border-blue-400/50 transition-all hover:-translate-y-0.5">
            <h3 className="text-lg font-serif font-semibold text-white mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> {g.title}
            </h3>
            <div className="space-y-4">
              {g.items.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <div>
                      <span className="text-white font-medium">{s.name}</span>
                      {s.desc && <span className="hidden sm:inline text-xs text-slate-400 ml-2">({s.desc})</span>}
                    </div>
                    <span className="text-blue-300 font-semibold text-xs sm:text-sm">{s.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#050b1d] border border-blue-500/15 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-400 transition-all duration-1000" style={{ width: `${s.percent}%` }} />
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
