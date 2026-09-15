import { Music, Disc } from "lucide-react";

const singles = [
  "No Stars Heard Our Pain",
  "Fading Love in Quiet Shadows",
  "Lost Between Love and Pride",
  "Love Whispered but You Left",
  "Pagol Mon Kra",
];

const MusicSection = () => (
  <section id="music" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Discography</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
          Albums &amp; <span className="text-gradient-blue">Singles</span>
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">Original compositions and soundtracks created by MD. Shinha Sarder.</p>
      </div>

      <div className="space-y-4">
        {singles.map((s) => (
          <div
            key={s}
            className="flex items-center gap-4 bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl p-5 border border-blue-500/25 hover:border-blue-400/60 shadow-xl shadow-blue-950/60 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center group-hover:bg-blue-500/25 group-hover:scale-110 transition-all flex-shrink-0">
              <Disc size={22} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors text-sm sm:text-base truncate">{s}</h4>
              <p className="text-xs text-blue-300/80 mt-0.5">Musical Artist · Single · 2025</p>
            </div>
            <Music size={18} className="text-blue-400/60 group-hover:text-blue-300 group-hover:rotate-12 transition-all flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MusicSection;
