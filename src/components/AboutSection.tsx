import { User, MapPin, Flag, Building, GraduationCap, BookOpen, Briefcase } from "lucide-react";

const info = [
  { icon: User, label: "Full Name", value: "MD. Shinha Sarder" },
  { icon: Flag, label: "Born", value: "5 November 2004" },
  { icon: MapPin, label: "Birth Place", value: "Shirgati village, Aichgati UnionParishad, Khulna" },
  { icon: Flag, label: "Nationality", value: "Bangladeshi" },
  { icon: Building, label: "Founder & CEO", value: "IT Tech BD, Biostar TV World" },
  { icon: Briefcase, label: "Known For", value: "Entrepreneur, Musical Artist, Author, Researcher, YouTuber & Content Creator" },
  { icon: User, label: "Father", value: "MD. Lutfor Rahaman (Lawyer)" },
  { icon: User, label: "Mother", value: "Samima Sultana (Private Sector Employee)" },
  { icon: User, label: "Religion / Family", value: "Muslim Family" },
];

const education = [
  "Northern University of Businesses and Technology, Khulna — Regular student, Computer Science and Engineering (CSE)",
  "Khulna Zilla School — Former Student",
];

const AboutSection = () => (
  <section id="about" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6 relative">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-xs text-blue-300 font-semibold tracking-widest uppercase mb-3 px-3.5 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 shadow-sm shadow-blue-500/20 backdrop-blur-md">
          <BookOpen size={13} className="text-blue-400" /> Official Biography &amp; Profile
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 tracking-tight">
          <span className="text-gradient-blue">Biography</span>
        </h2>
        <div className="bg-gradient-to-br from-[#0c183a]/95 via-[#0a1532]/95 to-[#070e24]/98 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto border border-blue-500/35 shadow-2xl shadow-blue-950/80 backdrop-blur-xl transition-all hover:border-blue-400/50">
          <p className="text-slate-100 leading-relaxed sm:leading-loose text-justify text-sm sm:text-base md:text-[17px] font-normal tracking-normal">
            MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. He regularly upload Content in YouTube, Facebook and other social media. He is a regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna. He was a former student of Khulna Zilla School. His father (MD. Lutfor Rahaman) is a lawyer. His mother (Samima Sultana) is a private sector employee. He born into a Muslim family in Shirgati village, Aichgati UnionParishad, Khulna.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#0c183a]/95 via-[#0a1532]/95 to-[#070e24]/98 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/80 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-xl font-serif font-semibold mb-6 text-white flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" /> Personal Details
          </h3>
          <div className="space-y-4">
            {info.map((item, i) => (
              <div key={i} className="flex items-start gap-3.5 pb-3 border-b border-blue-500/15 last:border-0 last:pb-0">
                <item.icon size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-blue-300/80 uppercase tracking-wider font-semibold">{item.label}</p>
                  <p className="text-slate-100 text-justify text-sm mt-0.5 font-medium leading-relaxed">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0c183a]/95 via-[#0a1532]/95 to-[#070e24]/98 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/80 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif font-semibold mb-6 text-white flex items-center gap-2.5">
              <GraduationCap size={20} className="text-blue-400" /> Education &amp; Academic Credentials
            </h3>
            <div className="space-y-4">
              {education.map((e, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-blue-500/15 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0 shadow-sm shadow-blue-400/50" />
                  <p className="text-slate-100 text-justify text-sm font-medium leading-relaxed">{e}</p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-serif font-semibold mt-8 mb-2 text-white">Music &amp; Creative Arts</h3>
            <p className="text-slate-300 text-justify text-sm leading-relaxed mb-6">Soundtracks, Country, Instrumental &amp; Acoustic Melodies, Digital Production</p>
          </div>

          <div>
            <h3 className="text-lg font-serif font-semibold mb-3 text-white">Professional Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {["Founder & CEO", "IT Tech BD", "Biostar TV World", "Entrepreneur", "Musical Artist", "Author", "Researcher", "YouTuber", "Content Creator", "CSE Scholar"].map((r) => (
                <span key={r} className="text-xs px-3.5 py-1.5 rounded-full bg-blue-500/15 text-blue-200 border border-blue-400/30 font-medium hover:border-blue-400/60 hover:bg-blue-500/25 transition-colors">
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
