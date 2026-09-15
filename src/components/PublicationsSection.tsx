import { BookCheck } from "lucide-react";

const pubs = [
  {
    title: "Graph theory with applications to engineering and computer science",
    publisher: "Courier Dover Publications, 2025",
  },
  {
    title: "Days of a Dreaming Boy: The Early Life of MD. Shinha Sarder",
    publisher: "University Publisher, 2025",
  },
  {
    title: "From Khulna to the Cloud: A Young Creator's Diary",
    publisher: "MD. Shinha Sarder, 2025",
  },
  {
    title: "Computer and Technology: Mastering Modern Tech",
    publisher: "Rafi Publisher Ltd, 2025",
  },
  {
    title: "MD. Shinha Sarder - Biography",
    publisher: "PeoplePill, 2025",
  },
];

const PublicationsSection = () => (
  <section id="publications" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Academic &amp; Biographical</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
          Research &amp; <span className="text-gradient-blue">Publications</span>
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">Documented monographs, articles, and biographies by and about MD. Shinha Sarder.</p>
      </div>

      <div className="space-y-4">
        {pubs.map((p) => (
          <div
            key={p.title}
            className="flex items-start gap-4 bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl p-5 sm:p-6 border border-blue-500/25 hover:border-blue-400/60 shadow-xl shadow-blue-950/60 transition-all hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookCheck size={18} className="text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1 leading-snug">{p.title}</h4>
              <p className="text-xs sm:text-sm text-blue-300/80">Author: MDS Sarder · {p.publisher}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PublicationsSection;
