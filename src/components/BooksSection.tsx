import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, ArrowRight } from "lucide-react";

const books = [
  {
    title: "From Village to Virtual: The Journey of MD. Shinha Sarder",
    category: "Biography & Memoir",
    cover: "https://m.media-amazon.com/images/I/41NRQbBcsoL._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
  },
  {
    title: "ICT Fundamentals for the 21st Century Learn",
    category: "Technology & Education",
    cover: "https://m.media-amazon.com/images/I/31Fx5ANnI9L._SX354_SY354_BL0_QL100__UX716_FMwebp_QL85_.jpg",
  },
  {
    title: "Social Media Learner: Simple Guide",
    category: "Digital Marketing",
    cover: "https://pbs.twimg.com/profile_images/2091609328210030592/42OjWBAO_400x400.jpg",
  },
  {
    title: "Lifestyle of MD. Shinha Sarder",
    category: "Productivity & Lifestyle",
    cover: "https://wikigence.org/images/thumb/f/f0/MD._Shinha_Sarder.png/300px-MD._Shinha_Sarder.png",
  },
  {
    title: "The Musical Journey of MD. Shinha Sarder",
    category: "Music & Composition",
    cover: "https://blogger.googleusercontent.com/img/a/AVvXsEjUVdjtfSdSBJ_caM3ppA0qOh9ASSCQA7sbOHBIzL0nS-QElPDS0WuJ6ToWG3sRjsNaxm1_fJ2u1PRGD29r4UZYh3Kj5GoXB-oSAmcI7L7MjtF8-BBX0BiOx6Lh2aRDvmmQhPAKvw4qQ8eTHE85MZlj_OfqWBBWItWP-Hl3ITk3vFhG0WXYmWaUxIbOU0SH",
  },
  {
    title: "Mastering The Google Knowledge Panel",
    category: "SEO & Digital Identity",
    cover: "https://wikialpha.co/images/thumb/6/61/MD._Shinha_Sarder.jpg/600px-MD._Shinha_Sarder.jpg",
  },
  {
    title: "The Musical Artist As a Shinha",
    category: "Artistic Expression",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQV79hudXoSC3A3-63meKOFFLT-Um2ZMI_i3U65Qo6hitbx9o1eyq9vN6HZUD7NV_dI7ndaPm6l7P4h0crBvneHt4ueHVdP4koqJOMNEoBnvmnIwH7oM4ac_2HnwOvdvrgsz2twPB1mY-c8q5eCkDVCgws_iesMFEk9fnK0o9rdhPou_wyAEsKnbEraNbb/s266/1000020228.jpg",
  },
  {
    title: "The Entrepreneur as a MD. Shinha Sarder",
    category: "Business & Startups",
    cover: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSCdw5RbTH6ybaehBxCcypBWf4yjoNIRCJ_ypZKPjIqai6nSNvJuvItYuExsxn7PYBag0jGRAcGhZm7hFq-Af2H4RvotQ6FZboVU7xqZXGKcdTrRcNb1I8PIBFt-DodExGBlzJvGnENFykTObfQmm9AdYE4Q15M3QwdKv70dA-Te6B2GFTR4IlwvXzsP0t/w646-h180-rw/Screenshot%202025-07-02%20191141.png",
  },
];

const BooksSection = () => (
  <section id="books" className="py-20 relative transition-colors duration-300">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-400/20 bg-blue-50 dark:bg-blue-500/10">
          Chaptra &amp; Google Books
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white mt-3 mb-3">
          Books <span className="text-gradient-blue">Collection</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
          Published books, technical guides, and writings authored by MD. Shinha Sarder detected on Chaptra and Google Books.
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            View Dedicated Books Page with Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://www.chaptra.com/author/md-shinha-sarder"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Chaptra Author Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {books.map((b) => (
          <Link
            key={b.title}
            to="/books"
            className="group bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/90 dark:via-[#0a1532]/90 dark:to-[#070e24]/95 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-500/25 hover:border-blue-400/60 shadow-md dark:shadow-xl dark:shadow-blue-950/60 transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-950 border border-slate-200 dark:border-slate-700">
                <img
                  src={b.cover}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/profile.webp";
                  }}
                />
                <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded bg-black/75 text-amber-300">
                  {b.category}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                {b.title}
              </h4>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mt-3 pt-2 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between">
              <span>MD. Shinha Sarder · 2025</span>
              <span className="text-[11px] underline group-hover:text-amber-500">Read details</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default BooksSection;
