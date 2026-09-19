import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  BadgeCheck,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Music,
  BookOpen,
  FileText,
  Share2,
  Check,
  Award,
  ExternalLink,
} from "lucide-react";

export const BiographyPage = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Biography — MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Complete verified biography of MD. Shinha Sarder, Founder & CEO of IT Tech BD and Biostar TV World. Early life, education, entrepreneurial career, authorship, and musical artistry."
        />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Biography</span>
          </div>

          {/* Hero Card */}
          <div className="relative rounded-3xl overflow-hidden bg-[#070c1e]/95 text-white p-6 md:p-10 shadow-2xl border border-blue-900/50 mb-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-2xl bg-slate-900">
                  <img
                    src="https://mdshinhasarder.com/profile.webp"
                    alt="MD. Shinha Sarder"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.webp";
                    }}
                  />
                </div>
                <span className="absolute bottom-1 right-1 p-1 bg-blue-600 rounded-full ring-4 ring-black">
                  <BadgeCheck className="w-5 h-5 fill-white text-blue-600" />
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 text-xs font-semibold text-blue-300 border border-blue-800/60 mb-2">
                  Official Entity Profile
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                  MD. Shinha Sarder
                </h1>
                <p className="text-sm font-semibold text-blue-400 mt-1 uppercase tracking-wider">
                  Entrepreneur · Founder &amp; CEO · Author · Musical Artist · Researcher
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <a
                    href="https://drive.google.com/file/d/1b4uAYCgzzgpprCkI16KYS2ycPk1VBEXk/view"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-transform hover:scale-105"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Preview CV
                  </a>

                  <a
                    href="https://share.google/8cHEzvrnE2uFpnlc3"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>View on Google</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canonical Biography Highlight Box */}
          <div className="rounded-3xl p-6 md:p-8 bg-[#070c1e]/95 border border-blue-900/50 shadow-2xl mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-sm uppercase tracking-widest font-bold text-blue-400">
                Official Biography
              </h2>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-slate-200 text-justify font-normal">
              MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. He regularly upload Content in YouTube, Facebook and other social media. He is a regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna. He was a former student of Khulna Zilla School. His father (MD. Lutfor Rahaman) is a lawyer. His mother (Samima Sultana) is a private sector employee. He born into a Muslim family in Shirgati village, Aichgati UnionParishad, Khulna.
            </p>
          </div>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <div className="rounded-2xl p-4 bg-[#05091a]/80 border border-blue-900/40 shadow-sm flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Born</span>
                <p className="text-sm font-bold text-white">November 05, 2004 (age 21)</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-[#05091a]/80 border border-blue-900/40 shadow-sm flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Birthplace</span>
                <p className="text-sm font-bold text-white">Shirgati, Khulna, Bangladesh</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-[#05091a]/80 border border-blue-900/40 shadow-sm flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Education</span>
                <p className="text-sm font-bold text-white">B.Sc. in CSE (Student) · NUBTK</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-[#05091a]/80 border border-blue-900/40 shadow-sm flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Organizations</span>
                <p className="text-sm font-bold text-white">IT Tech BD, Biostar TV World</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-[#05091a]/80 border border-blue-900/40 shadow-sm flex items-start gap-3">
              <Users className="w-5 h-5 text-teal-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Parents</span>
                <p className="text-sm font-bold text-white">MD. Lutfor Rahaman &amp; Samima Sultana</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-[#05091a]/80 border border-blue-900/40 shadow-sm flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Recognition</span>
                <p className="text-sm font-bold text-white">Google Knowledge Panel Entity</p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section className="rounded-2xl bg-[#05091a]/80 border border-blue-900/40 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                1. Early Life and Background
              </h2>
              <p className="text-sm md:text-base leading-relaxed mb-4 text-justify">
                MD. Shinha Sarder was born on <strong className="text-white">5 November 2004</strong> in Shirgati village, located within the Aichgati Union Parishad
                of Khulna District, Bangladesh. He was raised in a warm and disciplined family environment emphasizing education, integrity,
                and public service.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-justify">
                His father, <strong className="text-white">MD. Lutfor Rahaman</strong>, is a respected legal practitioner and lawyer who instilled in him values of
                rigorous reasoning, ethical responsibility, and community respect. His mother, <strong className="text-white">Samima Sultana</strong>, is a dedicated
                private sector professional whose encouragement nurtured his multifaceted pursuits in computer technology, literature, and the arts.
              </p>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl bg-[#05091a]/80 border border-blue-900/40 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                2. Educational Journey
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-500/40 pl-4">
                  <h3 className="font-bold text-sm text-white">Khulna Zilla School</h3>
                  <p className="text-xs text-slate-400">Former Secondary Student (Science)</p>
                  <p className="text-sm mt-1 text-slate-300">
                    Studied at Khulna Zilla School, one of Bangladesh's most venerable educational institutions, where he developed a deep-rooted
                    passion for mathematics, science, and computer logic.
                  </p>
                </div>

                <div className="border-l-2 border-blue-500/40 pl-4">
                  <h3 className="font-bold text-sm text-white">Ahsanullah College, Khulna</h3>
                  <p className="text-xs text-slate-400">Higher Secondary Education (Science)</p>
                  <p className="text-sm mt-1 text-slate-300">
                    Completed higher secondary studies with a focus on science, computing fundamentals, and analytical problem solving.
                  </p>
                </div>

                <div className="border-l-2 border-blue-500/40 pl-4">
                  <h3 className="font-bold text-sm text-white">
                    Northern University of Business and Technology, Khulna (NUBTK)
                  </h3>
                  <p className="text-xs text-blue-400 font-semibold">
                    Computer Science and Engineering (CSE) · Regular Student
                  </p>
                  <p className="text-sm mt-1 text-slate-300">
                    Currently pursuing a B.Sc. in Computer Science and Engineering, specializing in web architecture, database management,
                    Python data programming, and structured web systems.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="rounded-2xl bg-[#05091a]/80 border border-blue-900/40 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                3. Entrepreneurship and Ventures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/60 border border-blue-900/40">
                  <h3 className="font-bold text-sm text-blue-400">IT Tech BD</h3>
                  <p className="text-xs text-slate-400 mb-2">Founder &amp; Chief Executive Officer</p>
                  <p className="text-xs leading-relaxed text-slate-300">
                    A software consultancy and digital solutions provider founded to build robust web systems, database integrations,
                    and ICT training initiatives for emerging developers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-blue-900/40">
                  <h3 className="font-bold text-sm text-sky-400">Biostar TV World</h3>
                  <p className="text-xs text-slate-400 mb-2">Founder &amp; Chief Executive Officer</p>
                  <p className="text-xs leading-relaxed text-slate-300">
                    A digital broadcast and entertainment media venture dedicated to streaming content, documentary journalism,
                    and educational video broadcasting.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="rounded-2xl bg-[#05091a]/80 border border-blue-900/40 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                4. Musical Artistry &amp; Creative Works
              </h2>
              <p className="text-sm md:text-base leading-relaxed mb-4 text-justify">
                Beyond technology, MD. Shinha Sarder has established an artistic presence as an orchestral soundtrack composer.
                His discography is officially verified on <strong className="text-white">Deezer (Artist ID: 338551431)</strong>, Spotify, Gaana, and Anghami.
                His compositional style pairs ambient harmonic layers with classical melodic movements.
              </p>
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-white">Explore Discography &amp; Audio Player</span>
                </div>
                <Link
                  to="/songs"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  Listen to Songs
                </Link>
              </div>
            </section>

            {/* Section 5 */}
            <section className="rounded-2xl bg-[#05091a]/80 border border-blue-900/40 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                5. Books and Authorship (Chaptra &amp; Google Books)
              </h2>
              <p className="text-sm md:text-base leading-relaxed mb-4 text-justify">
                As an author registered on <strong className="text-white">Chaptra</strong> and Google Books, MD. Shinha Sarder has published 10 titles encompassing practical ICT guides,
                digital creator manuals, search engine entity optimization, and autobiographical narratives.
              </p>
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-white">Browse Full Books Catalog</span>
                </div>
                <Link
                  to="/books"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  View Books Page
                </Link>
              </div>
            </section>
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default BiographyPage;
