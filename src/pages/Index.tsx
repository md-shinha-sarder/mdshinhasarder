import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeaderIntroSection from "@/components/HeaderIntroSection";
import InfoBoxesSection from "@/components/InfoBoxesSection";
import DetailedCredentialsSection from "@/components/DetailedCredentialsSection";
import LiveClockWidget from "@/components/LiveClockWidget";
import MainPostsGrid from "@/components/MainPostsGrid";
import FooterSection from "@/components/FooterSection";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  useSiteSettings();

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-[#5e5e5e] font-['Poppins','Karla',sans-serif] selection:bg-[#2563eb]/20 selection:text-[#2563eb]">
      <Helmet>
        <title>MD. Shinha Sarder - Official Website &amp; Blog</title>
        <meta
          name="description"
          content="MD. Shinha Sarder is the Founder &amp; CEO of IT Tech BD and Biostar TV World, born on 5 November 2004. Engineer, developer, entrepreneur, musical artist, author, researcher, YouTuber and content creator."
        />
        <link rel="canonical" href="https://mdshinhasarder.com/" />
        <meta property="og:title" content="MD. Shinha Sarder - Official Website &amp; Blog" />
        <meta
          property="og:description"
          content="Explore articles, engineering publications, music releases, and creative tech monographs by MD. Shinha Sarder."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mdshinhasarder.com/" />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
        <meta property="og:image:alt" content="MD. Shinha Sarder Official Portrait" />
        <meta property="og:site_name" content="MD. Shinha Sarder" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MD. Shinha Sarder - Official Website &amp; Blog" />
        <meta
          name="twitter:description"
          content="Founder &amp; CEO of IT Tech BD and Biostar TV World. Entrepreneur, Musical Artist, Author, and Researcher."
        />
        <meta name="twitter:image" content="https://mdshinhasarder.com/profile.webp" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": "https://mdshinhasarder.com/#blog",
            name: "MD. Shinha Sarder Blog",
            url: "https://mdshinhasarder.com/",
            description:
              "Official publication stream of developer, researcher, entrepreneur and musical artist MD. Shinha Sarder.",
            author: {
              "@type": "Person",
              name: "MD. Shinha Sarder",
              url: "https://mdshinhasarder.com/",
            },
            publisher: {
              "@type": "Organization",
              name: "IT Tech BD",
              logo: {
                "@type": "ImageObject",
                url: "https://mdshinhasarder.com/images/site-logo.png",
              },
            },
          })}
        </script>
      </Helmet>

      {/* Sticky Top Header Navigation */}
      <Navbar />

      {/* Main Profile Header matching .hib in XML */}
      <div className="pt-16 sm:pt-20">
        <HeaderIntroSection />
      </div>

      {/* Main Content Area in Blogger Codify magazine width */}
      <main className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8">
        {/* Info Boxes (Personal / Education / Skill / Projects) */}
        <InfoBoxesSection />

        {/* Detailed Credentials & Resume */}
        <DetailedCredentialsSection />

        {/* Live Clock & Calendar Widget (100% English) */}
        <LiveClockWidget />

        {/* Codify Template Featured Banner + Main Posts Grid + Sidebar */}
        <MainPostsGrid />
      </main>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
};

export default Index;
