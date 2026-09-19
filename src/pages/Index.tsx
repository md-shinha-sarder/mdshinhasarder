import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import KnowledgePanelWidget from "@/components/KnowledgePanelWidget";
import FooterSection from "@/components/FooterSection";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  useSiteSettings();

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>MD. Shinha Sarder</title>
        <meta
          name="description"
          content="MD. Shinha Sarder is known as the Founder &amp; CEO of IT Tech BD and Biostar TV World. Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator."
        />
        <link rel="canonical" href="https://mdshinhasarder.com/" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Unified Hero & Knowledge Panel Section */}
        <main className="flex-1 container mx-auto px-3 sm:px-6 pt-20 pb-10 max-w-6xl">
          <KnowledgePanelWidget />
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
