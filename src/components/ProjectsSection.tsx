import { Search, Wallet, Bot, Globe, Terminal, Server } from "lucide-react";

const projects = [
  {
    icon: Globe,
    cat: "Full-Stack Web",
    title: "Next.js High-Performance Web Portal & CMS",
    desc: "A production Next.js architecture featuring dynamic post rendering, lightning-fast SSR/SSG caching, comprehensive SEO schema generation, and seamless Supabase integration.",
    tags: ["Next.js", "React", "Tailwind CSS", "Supabase"],
  },
  {
    icon: Terminal,
    cat: "Automation & Data",
    title: "Python Intelligent Web Automation Engine",
    desc: "Automated data harvesting and sitemap/RSS generation scripts built in Python. Features robust HTTP request pipelines, regex parsing, and multi-threaded content indexing.",
    tags: ["Python", "Automation", "REST APIs", "SEO"],
  },
  {
    icon: Server,
    cat: "Backend Architecture",
    title: "Node.js & PHP Microservices API Suite",
    desc: "Cross-platform API endpoints developed in Node.js and PHP. Handles high-concurrency requests, JSON response serialization, database connectivity, and system diagnostics.",
    tags: ["Node.js", "PHP", "PostgreSQL", "SQL"],
  },
  {
    icon: Search,
    cat: "Software",
    title: "Algorithm Visualization Tool",
    desc: "An interactive tool that visualizes sorting and searching algorithms step-by-step, helping students and developers understand DSA concepts with clear, animated representations.",
    tags: ["Python", "DSA", "Visualization"],
  },
  {
    icon: Wallet,
    cat: "Software",
    title: "Family Expense Management App",
    desc: "A comprehensive application to track household expenses including groceries, utilities and daily spending. Provides budgeting insights and financial organization tools.",
    tags: ["Python", "Database", "Finance"],
  },
  {
    icon: Bot,
    cat: "AI / ML",
    title: "Facial Identification Project",
    desc: "Contributed to a team-based facial recognition system, gaining hands-on experience in computer vision techniques, collaborative development workflows and real-world AI applications.",
    tags: ["Computer Vision", "Team Project", "AI"],
  },
];

const ProjectsSection = () => (
  <section id="projects" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Portfolio Showcase</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
          Featured <span className="text-gradient-blue">Projects</span>
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
          Real-world applications and automated systems engineered in Next.js, Python, Node.js, and PHP.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.title} className="group bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl p-6 sm:p-7 shadow-xl shadow-blue-950/60 border border-blue-500/25 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 group-hover:scale-110 transition-all">
              <p.icon className="text-blue-400" size={22} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-2">{p.cat}</span>
            <h3 className="font-serif font-semibold text-lg text-white mb-3 group-hover:text-blue-300 transition-colors">{p.title}</h3>
            <p className="text-sm text-slate-300 mb-4 text-justify flex-1 leading-relaxed">{p.desc}</p>
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-blue-500/15">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-wider text-blue-200 bg-blue-500/15 border border-blue-400/20 px-2.5 py-0.5 rounded-full font-medium">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProjectsSection;
