import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Flag,
  GraduationCap,
  BookOpen,
  Briefcase,
  Calendar,
  Sparkles,
  Heart,
  Users,
  School,
  ExternalLink,
  Music,
} from "lucide-react";

const info = [
  { icon: User, label: "Full Name", value: "MD. Shinha Sarder" },
  { icon: Calendar, label: "Born", value: "5 November 2004" },
  { icon: MapPin, label: "Birth Place", value: "Shirgati village, Aichgati Union Parishad, Khulna" },
  { icon: Flag, label: "Nationality", value: "Bangladeshi" },
  { icon: Briefcase, label: "Profession", value: "Entrepreneur" },
  { icon: Sparkles, label: "Known For", value: "Entrepreneur, Musical Artist, Author, Researcher, YouTuber & Content Creator" },
  { icon: Users, label: "Father", value: "MD. Lutfor Rahaman (Lawyer)" },
  { icon: Heart, label: "Mother", value: "Samima Sultana (Private Sector Employee)" },
  { icon: Users, label: "Religion / Family", value: "Muslim Family" },
];

const educationItems = [
  {
    institution: "Northern University of Business & Technology Khulna (NUBTK)",
    degree: "Computer Science & Engineering (CSE) — Regular Student",
    icon: GraduationCap,
  },
  {
    institution: "Khulna Zilla School",
    degree: "Former Secondary Student (SSC)",
    icon: School,
  },
];

const AboutSection = () => (
  <section id="about" className="py-20 relative transition-colors duration-300">
    <div className="container mx-auto px-4 sm:px-6 relative">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300 font-semibold tracking-widest uppercase mb-3 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-400/30 bg-blue-50 dark:bg-blue-500/10 shadow-sm backdrop-blur-md">
          <BookOpen size={13} className="text-blue-600 dark:text-blue-400" /> Official Biography &amp; Profile
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
          <span className="text-gradient-blue">Biography</span>
        </h2>
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/95 dark:via-[#0a1532]/95 dark:to-[#070e24]/98 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto border border-slate-200 dark:border-blue-500/35 shadow-xl dark:shadow-2xl dark:shadow-blue-950/80 backdrop-blur-xl transition-all">
          <p className="text-slate-700 dark:text-slate-100 leading-relaxed sm:leading-loose text-justify text-sm sm:text-base md:text-[17px] font-normal tracking-normal mb-6">
            MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. He regularly upload Content in YouTube, Facebook and other social media. He is a regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna. He was a former student of Khulna Zilla School. His father (MD. Lutfor Rahaman) is a lawyer. His mother (Samima Sultana) is a private sector employee. He born into a Muslim family in Shirgati village, Aichgati UnionParishad, Khulna.
          </p>

          <div className="flex justify-center">
            <Link
              to="/biography"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              Read Full Separate Biography Page
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/95 dark:via-[#0a1532]/95 dark:to-[#070e24]/98 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-2xl dark:shadow-blue-950/80 border border-slate-200 dark:border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-xl font-serif font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm" /> Personal Details
          </h3>
          <div className="space-y-4">
            {info.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3.5 pb-3 border-b border-slate-100 dark:border-blue-500/15 last:border-0 last:pb-0">
                  <Icon size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-blue-600 dark:text-blue-300/80 uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className="text-slate-800 dark:text-slate-100 text-justify text-sm mt-0.5 font-medium leading-relaxed">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education & Academic Card */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c183a]/95 dark:via-[#0a1532]/95 dark:to-[#070e24]/98 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-2xl dark:shadow-blue-950/80 border border-slate-200 dark:border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2.5">
              <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" /> Education &amp; Academic Credentials
            </h3>
            <div className="space-y-4">
              {educationItems.map((e, i) => {
                const EduIcon = e.icon;
                return (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-blue-500/15 last:border-0 last:pb-0">
                    <EduIcon size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{e.institution}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">{e.degree}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="text-lg font-serif font-semibold mt-8 mb-2 text-slate-900 dark:text-white flex items-center gap-2">
              <Music size={18} className="text-blue-600 dark:text-blue-400" />
              Music &amp; Creative Arts
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-justify text-sm leading-relaxed mb-6">
              Soundtracks, Classical Instrumental &amp; Acoustic Melodies, Digital Sound Design. Verified on Deezer (Artist ID: 338551431) and Spotify.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-serif font-semibold mb-3 text-slate-900 dark:text-white">Professional Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {["Founder & CEO", "IT Tech BD", "Biostar TV World", "Entrepreneur", "Musical Artist", "Author", "Researcher", "YouTuber", "Content Creator", "CSE Scholar"].map((r) => (
                <span
                  key={r}
                  className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-400/30 font-medium"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
