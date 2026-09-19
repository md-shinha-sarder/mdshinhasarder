import { Link } from "react-router-dom";
import { Music, Disc, ExternalLink, Play, Radio } from "lucide-react";

const singles = [
  { title: "No Stars Heard Our Pain", type: "Single", year: "2025", genre: "Orchestral / Acoustic" },
  { title: "Fading Love in Quiet Shadows", type: "Single", year: "2025", genre: "Melodic Soundtrack" },
  { title: "Lost Between Love and Pride", type: "Single", year: "2025", genre: "Ambient Emotional" },
  { title: "Love Whispered but You Left", type: "Single", year: "2025", genre: "Soundtrack / Instrumental" },
  { title: "Pagol Mon Kra", type: "Single", year: "2025", genre: "Folk Contemporary" },
];

const MusicSection = () => (
  <section id="music" className="py-20 relative transition-colors duration-300">
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-400/20 bg-blue-50 dark:bg-blue-500/10">
          Deezer Artist Catalog
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white mt-3 mb-3">
          Albums &amp; <span className="text-gradient-blue">Singles</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
          Original compositions and soundtracks composed by MD. Shinha Sarder. Verified on Deezer (Artist ID: 338551431) and Spotify.
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/songs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white" />
            Open Music Player &amp; All Songs Page
          </Link>
          <a
            href="https://www.deezer.com/en/artist/338551431"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-red-500" />
            Deezer Artist Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="space-y-3.5">
        {singles.map((s) => (
          <Link
            key={s.title}
            to="/songs"
            className="flex items-center gap-4 bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/90 dark:via-[#0a1532]/90 dark:to-[#070e24]/95 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-500/25 hover:border-blue-400/60 shadow-md dark:shadow-xl dark:shadow-blue-950/60 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-400/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
              <Disc size={22} className="text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors text-sm sm:text-base truncate">
                {s.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-blue-300/80 mt-0.5">
                MD. Shinha Sarder · {s.type} · {s.year} · <span className="italic">{s.genre}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                Play Song
              </span>
              <Play size={16} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default MusicSection;
