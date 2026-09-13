import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import VideosSection from "@/components/VideosSection";
import ReelsSection from "@/components/ReelsSection";
import MusicSection from "@/components/MusicSection";
import BooksSection from "@/components/BooksSection";
import PublicationsSection from "@/components/PublicationsSection";
import BlogSection from "@/components/BlogSection";
import FooterSection from "@/components/FooterSection";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useHomeSections } from "@/hooks/useHomeSections";

const Index = () => {
  useSiteSettings();
  const { sections } = useHomeSections();
  return (
    <div className="relative min-h-screen bg-[#080b12] text-foreground selection:bg-amber-400/20 selection:text-amber-200">
      <SiteBackground />
      <div className="relative z-10">
        <Navbar />
        {sections.hero && <HeroSection />}
        {sections.about && <AboutSection />}
        {sections.skills && <SkillsSection />}
        {sections.projects && <ProjectsSection />}
        {sections.services && <ServicesSection />}
        {sections.gallery && <GallerySection />}
        {sections.videos && <VideosSection />}
        {sections.reels && <ReelsSection />}
        {sections.music && <MusicSection />}
        {sections.books && <BooksSection />}
        {sections.publications && <PublicationsSection />}
        {sections.blog && <BlogSection />}
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
