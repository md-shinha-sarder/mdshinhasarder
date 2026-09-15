import { User, MapPin, Flag, Building, GraduationCap, BookOpen } from "lucide-react";

const info = [
  { icon: User, label: "Full Name", value: "MD. Shinha Sarder" },
  { icon: Flag, label: "Born", value: "5 November 2004" },
  { icon: MapPin, label: "Birth Place", value: "Shirgati Village, Aichgati Union, Khulna" },
  { icon: Flag, label: "Nationality", value: "Bangladeshi" },
  { icon: Building, label: "Known For", value: "Engineer, Developer, Entrepreneur, Musical Artist, Author, Researcher, YouTuber, Content Creator" },
  { icon: Building, label: "Organizations", value: "IT Tech BD, Biostar TV World" },
  { icon: User, label: "Father", value: "MD. Lutfor Rahaman (Lawyer)" },
  { icon: User, label: "Mother", value: "Samima Sultana" },
  { icon: User, label: "Religion", value: "Islam" },
];

const education = [
  "Northern University of Business and Technology, Khulna — B.Sc. in Computer Science & Engineering (CSE)",
  "Khulna Zilla School — Former Student",
];

const AboutSection = () => (
  <section id="about" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6 relative">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-xs text-blue-300 font-semibold tracking-widest uppercase mb-3 px-3.5 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10">
          <BookOpen size={13} className="text-blue-400" /> Personal Story &amp; Profile
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
          Personal <span className="text-gradient-blue">Biography</span>
        </h2>
        <p className="text-slate-200 max-w-3xl mx-auto leading-relaxed text-justify text-sm sm:text-base">
          MD. Shinha Sarder is an Engineer, Developer and Entrepreneur, known as the Founder &amp; CEO of IT Tech BD and Biostar TV World. Born on 5 November 2004 in Khulna, Bangladesh, he specializes in full-stack web applications with <span className="text-blue-300 font-medium">Next.js</span>, backend automation &amp; AI scripting in <span className="text-blue-300 font-medium">Python</span>, server-side APIs in <span className="text-blue-300 font-medium">Node.js</span> and <span className="text-blue-300 font-medium">PHP</span>, and cloud databases with <span className="text-blue-300 font-medium">PostgreSQL &amp; Supabase</span>. He is a regular student in Computer Science and Engineering (CSE) at Northern University of Business and Technology, Khulna, and an alumnus of Khulna Zilla School.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl p-6 sm:p-8 shadow-xl shadow-blue-950/60 border border-blue-500/25 hover:border-blue-400/50 transition-all">
          <h3 className="text-xl font-serif font-semibold mb-6 text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Personal Details
          </h3>
          <div className="space-y-4">
            {info.map((item, i) => (
              <div key={i} className="flex items-start gap-3.5 pb-2.5 border-b border-blue-500/15 last:border-0 last:pb-0">
                <item.icon size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
                  <p className="text-white text-justify text-sm mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 rounded-2xl p-6 sm:p-8 shadow-xl shadow-blue-950/60 border border-blue-500/25 hover:border-blue-400/50 transition-all">
          <h3 className="text-xl font-serif font-semibold mb-6 text-white flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-400" /> Education &amp; Training
          </h3>
          <div className="space-y-4">
            {education.map((e, i) => (
              <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-blue-500/15 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <p className="text-white text-justify text-sm">{e}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-serif font-semibold mt-8 mb-3 text-white">Music &amp; Arts</h3>
          <p className="text-slate-300 text-justify text-sm">Soundtracks, Country, Instrumental &amp; Acoustic Melodies</p>

          <h3 className="text-lg font-serif font-semibold mt-8 mb-3 text-white">Professional Roles</h3>
          <div className="flex flex-wrap gap-2">
            {["Engineer", "Full-Stack Developer", "Next.js Builder", "Python Developer", "Entrepreneur", "Musical Artist", "Author", "Researcher", "Content Creator"].map((r) => (
              <span key={r} className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-200 border border-blue-400/25 font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
