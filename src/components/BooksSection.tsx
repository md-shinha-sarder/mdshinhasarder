import { BookOpen } from "lucide-react";

const books = [
  "From Village to Virtual: The Journey of MD. Shinha Sarder",
  "ICT Fundamentals for the 21st Century Learn",
  "Social Media Learner: Simple Guide",
  "Lifestyle of MD. Shinha Sarder",
  "The Musical Journey of MD. Shinha Sarder",
  "Mastering The Google Knowledge Panel",
  "The Musical Artist As a Shinha",
  "The Entrepreneur as a MD. Shinha Sarder",
];

const BooksSection = () => (
  <section id="books" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Literary Works</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
          Books <span className="text-gradient-blue">Collection</span>
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">Published books, guides, and writings authored by MD. Shinha Sarder.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {books.map((b) => (
          <div
            key={b}
            className="group bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl p-5 sm:p-6 border border-blue-500/25 hover:border-blue-400/60 shadow-xl shadow-blue-950/60 transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center mb-3.5 group-hover:bg-blue-500/25 group-hover:scale-110 transition-all">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors">{b}</h4>
            </div>
            <p className="text-xs text-blue-300 font-medium mt-3 pt-2 border-t border-blue-500/15">Author: MD. Shinha Sarder · 2025</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BooksSection;
