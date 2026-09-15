import { Facebook, Instagram, MessageCircle, Palette, Youtube, Megaphone } from "lucide-react";

const services = [
  { icon: Facebook, title: "Facebook Page Management", desc: "Complete Facebook page setup, branding, content creation, scheduling and audience engagement to grow your brand presence." },
  { icon: Instagram, title: "Instagram Management", desc: "Instagram account strategy, content curation, story management, hashtag optimization and follower growth." },
  { icon: MessageCircle, title: "WhatsApp Business Handling", desc: "Professional WhatsApp Business setup, automated replies, catalog management and customer communication handling." },
  { icon: Palette, title: "Canva-Based Designs", desc: "Eye-catching thumbnails, logos, social media posts, banners and marketing collateral using Canva's design tools." },
  { icon: Youtube, title: "YouTube SEO & Strategy", desc: "Channel optimization, keyword research, video title/description SEO, thumbnail design and content strategy planning." },
  { icon: Megaphone, title: "Facebook Ads", desc: "Facebook advertising campaigns including ad creative, audience targeting and budget management to drive results." },
];

const ServicesSection = () => (
  <section id="services" className="py-24 relative">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10">Services &amp; Capabilities</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-3">
          What I <span className="text-gradient-blue">Offer</span>
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">Digital marketing, media management, and software solutions designed to expand your digital footprint.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.title} className="group bg-gradient-to-br from-[#0c183a]/90 via-[#0a1532]/90 to-[#070e24]/95 border border-blue-500/25 rounded-2xl p-6 sm:p-7 shadow-xl shadow-blue-950/60 hover:border-blue-400/50 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 group-hover:scale-110 transition-all">
              <s.icon className="text-blue-400" size={22} />
            </div>
            <h3 className="font-serif font-semibold text-lg text-white mb-2 group-hover:text-blue-300 transition-colors">{s.title}</h3>
            <p className="text-sm text-slate-300 text-justify leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
